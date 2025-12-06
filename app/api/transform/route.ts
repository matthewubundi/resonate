import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { TRANSFORMATION_SYSTEM_PROMPT, EVALUATION_SYSTEM_PROMPT } from '@/lib/prompts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  // 1. Auth Check - support both Authorization header and cookies
  const authHeader = req.headers.get('authorization');
  let user;
  let supabase;

  if (authHeader?.startsWith('Bearer ')) {
    // Client-side session: use token from Authorization header
    const token = authHeader.substring(7);
    const cookieSupabase = await createClient();

    // Verify the user first
    const { data: { user: tokenUser }, error } = await cookieSupabase.auth.getUser(token);
    if (error || !tokenUser) {
      console.error('Auth error with Bearer token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    user = tokenUser;

    // Create a client with service role for server-side queries (bypasses RLS)
    // We've already verified the user, so this is safe
    supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  } else {
    // Server-side session: use cookies
    supabase = await createClient();
    const { data: { user: cookieUser } } = await supabase.auth.getUser();
    if (!cookieUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    user = cookieUser;
  }

  try {
    const { inputText, temperature } = await req.json();

    if (!inputText || !inputText.trim()) {
      return NextResponse.json({ error: 'Input text is required' }, { status: 400 });
    }

    const sanitizedTemp = typeof temperature === 'number'
      ? Math.min(1.5, Math.max(0, temperature))
      : 0.7;

    // 2. Fetch the Active Identity
    const { data: identityRecord, error: idError } = await supabase
      .from('identities')
      .select('identity_json')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (idError) {
      console.error('Identity query error:', idError);
      return NextResponse.json({
        error: 'No active identity found',
        details: idError.message
      }, { status: 404 });
    }

    if (!identityRecord) {
      return NextResponse.json({
        error: 'No active identity found. Please complete onboarding first.'
      }, { status: 404 });
    }

    // ---------------------------------------------------------
    // 2. NEW: MEMORY RETRIEVAL LAYER
    // ---------------------------------------------------------
    let memoryContext = "No relevant memories found.";
    let memories: any[] = [];

    try {
      // A. Create an embedding for the INPUT text to find related facts
      const embeddingResp = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: inputText.replace(/\n/g, ' ')
      });
      const embedding = embeddingResp.data[0].embedding;

      // B. Search Supabase for similar memories (Threshold 0.5 ensures relevance)
      const { data: memoryData, error: memoryError } = await supabase.rpc('match_memories', {
        query_embedding: embedding,
        match_threshold: 0.0,
        match_count: 3, // Only get top 3 most relevant facts
        p_user_id: user.id
      });

      if (!memoryError && memoryData && memoryData.length > 0) {
        memories = memoryData;
        memoryContext = memories.map((m: any) => `- ${m.content}`).join('\n');
        console.log("Context Injected:", memoryContext); // For debugging
      }
    } catch (memoryErr) {
      console.error('Memory retrieval error:', memoryErr);
      // Continue without memory if retrieval fails
    }
    // ---------------------------------------------------------

    // 3. Transformation with Self-Healing Loop
    const startTime = Date.now();
    let currentText = inputText;
    let finalScore = 0;
    let attempts = 0;
    const MAX_RETRIES = 2; // Prevent infinite loops
    let evalData: any = {};

    // Initialize history with System Prompt and User Input (including Identity and Memory)
    let conversationHistory: any[] = [
      { role: "system", content: TRANSFORMATION_SYSTEM_PROMPT },
      { 
        role: "user", 
        content: `IDENTITY_PROFILE:\n${JSON.stringify(identityRecord.identity_json)}\n\nRELEVANT_MEMORIES:\n${memoryContext}\n\nINPUT_TEXT:\n${inputText}` 
      }
    ];

    // --- THE CORRECTION LOOP ---
    while (attempts <= MAX_RETRIES) {
      attempts++;

      // A. Generate Rewrite
      const rewriteResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Fast & Cheap
        messages: conversationHistory,
        temperature: sanitizedTemp,
      });
      currentText = rewriteResponse.choices[0].message.content || "";

      // B. Audit (Evaluate)
      try {
        const evalResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: EVALUATION_SYSTEM_PROMPT },
            { role: "user", content: `IDENTITY:\n${JSON.stringify(identityRecord.identity_json)}\n\nTEXT_TO_AUDIT:\n${currentText}` }
          ],
          response_format: { type: "json_object" }
        });

        evalData = JSON.parse(evalResponse.choices[0].message.content || "{}");
        finalScore = typeof evalData.score === 'number' ? evalData.score : 0;
      } catch (evalError) {
        console.error('Evaluation error:', evalError);
        evalData = { score: 0, reasoning: "Evaluation failed", suggestions: "" };
        finalScore = 0;
      }

      // C. Check Threshold (PRD Goal: >= 8.0)
      if (finalScore >= 8.0) {
        break; // Success!
      }

      // D. Prepare for Retry (Feedback Injection)
      if (attempts <= MAX_RETRIES) {
        console.log(`Attempt ${attempts}: Score ${finalScore}. Retrying with feedback: ${evalData.suggestions}`);

        // Add the AI's own output to history
        conversationHistory.push({ role: "assistant", content: currentText });
        // Add the Auditor's complaints to history
        conversationHistory.push({
          role: "user",
          content: `CRITICAL FEEDBACK: The alignment score was only ${finalScore}/10. Reasoning: ${evalData.reasoning}. \n\nFix the text specifically to address: ${evalData.suggestions}.`
        });
      }
    }

    const processingTime = Date.now() - startTime;

    // 4. Log Final Result to Supabase
    // Note: We use the final attempt's output and score.
    const { error: logError } = await supabase.from('transformations').insert({
      user_id: user.id,
      input_text: inputText,
      final_output: currentText,
      model_used: 'gpt-4o-mini',
      alignment_score: finalScore,
      processing_time_ms: processingTime,
      // We log raw output as the final text since we aren't enforcing JSON output anymore
      raw_llm_output: currentText
    });

    if (logError) {
      console.error('Logging error:', logError);
    }

    return NextResponse.json({
      output: currentText,
      evaluation: evalData,
      attempts: attempts,
      used_memory: memories.length > 0 // Let frontend know if we used memory
    });

  } catch (error: any) {
    console.error('Transformation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


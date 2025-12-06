import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuthenticatedClient } from '@/utils/supabase/server';
import { TRANSFORMATION_SYSTEM_PROMPT, EVALUATION_SYSTEM_PROMPT } from '@/lib/prompts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    // Auth Check - supports both Bearer token and cookie auth with RLS
    const { supabase, user } = await getAuthenticatedClient(req);

    const { inputText, temperature } = await req.json();

    if (!inputText || !inputText.trim()) {
      return NextResponse.json({ error: 'Input text is required' }, { status: 400 });
    }

    const sanitizedTemp = typeof temperature === 'number'
      ? Math.min(1.5, Math.max(0, temperature))
      : 0.7;

    // Fetch the Active Identity (RLS ensures user can only see their own)
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

    // Memory Retrieval Layer
    let memoryContext = "No relevant memories found.";
    let memories: any[] = [];

    try {
      // Create an embedding for the INPUT text to find related facts
      const embeddingResp = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: inputText.replace(/\n/g, ' ')
      });
      const embedding = embeddingResp.data[0].embedding;

      // Search Supabase for similar memories using RPC function
      const { data: memoryData, error: memoryError } = await supabase.rpc('match_memories', {
        query_embedding: embedding,
        match_threshold: 0.0,
        match_count: 3,
        p_user_id: user.id
      });

      if (!memoryError && memoryData && memoryData.length > 0) {
        memories = memoryData;
        memoryContext = memories.map((m: any) => `- ${m.content}`).join('\n');
        console.log("Context Injected:", memoryContext);
      }
    } catch (memoryErr) {
      console.error('Memory retrieval error:', memoryErr);
      // Continue without memory if retrieval fails
    }

    // Transformation with Self-Healing Loop
    const startTime = Date.now();
    let currentText = inputText;
    let finalScore = 0;
    let attempts = 0;
    const MAX_RETRIES = 2;
    let evalData: any = {};

    // Initialize history with System Prompt and User Input
    let conversationHistory: any[] = [
      { role: "system", content: TRANSFORMATION_SYSTEM_PROMPT },
      { 
        role: "user", 
        content: `IDENTITY_PROFILE:\n${JSON.stringify(identityRecord.identity_json)}\n\nRELEVANT_MEMORIES:\n${memoryContext}\n\nINPUT_TEXT:\n${inputText}` 
      }
    ];

    // The Correction Loop
    while (attempts <= MAX_RETRIES) {
      attempts++;

      // Generate Rewrite
      const rewriteResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversationHistory,
        temperature: sanitizedTemp,
      });
      currentText = rewriteResponse.choices[0].message.content || "";

      // Audit (Evaluate)
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

      // Check Threshold (Goal: >= 8.0)
      if (finalScore >= 8.0) {
        break;
      }

      // Prepare for Retry (Feedback Injection)
      if (attempts <= MAX_RETRIES) {
        console.log(`Attempt ${attempts}: Score ${finalScore}. Retrying with feedback: ${evalData.suggestions}`);
        conversationHistory.push({ role: "assistant", content: currentText });
        conversationHistory.push({
          role: "user",
          content: `CRITICAL FEEDBACK: The alignment score was only ${finalScore}/10. Reasoning: ${evalData.reasoning}. \n\nFix the text specifically to address: ${evalData.suggestions}.`
        });
      }
    }

    const processingTime = Date.now() - startTime;

    // Log Final Result to Supabase (RLS ensures user can only insert their own)
    const { error: logError } = await supabase.from('transformations').insert({
      user_id: user.id,
      input_text: inputText,
      final_output: currentText,
      model_used: 'gpt-4o-mini',
      alignment_score: finalScore,
      processing_time_ms: processingTime,
      raw_llm_output: currentText
    });

    if (logError) {
      console.error('Logging error:', logError);
    }

    return NextResponse.json({
      output: currentText,
      evaluation: evalData,
      attempts: attempts,
      used_memory: memories.length > 0
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Transformation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

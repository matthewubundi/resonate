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
      console.error('User ID:', user.id);
      return NextResponse.json({ 
        error: 'No active identity found', 
        details: idError.message 
      }, { status: 404 });
    }

    if (!identityRecord) {
      console.error('No identity record found for user:', user.id);
      return NextResponse.json({ 
        error: 'No active identity found. Please complete onboarding first.' 
      }, { status: 404 });
    }

    // 3. Perform Transformation
    const startTime = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for speed/cost as per PRD [cite: 227]
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${TRANSFORMATION_SYSTEM_PROMPT}\n\nReturn a JSON object with:\n- "output": rewritten text as a string\n- "reasoning": an array of 3-5 short bullet reasons describing how the identity was applied.\nDo not include any additional fields.` },
        { 
          role: "user", 
          content: `IDENTITY_PROFILE:\n${JSON.stringify(identityRecord.identity_json)}\n\nINPUT_TEXT:\n${inputText}` 
        }
      ],
      temperature: sanitizedTemp,
    });

    const rawContent = completion.choices[0].message.content || '';
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.warn('Failed to parse LLM JSON output, falling back to raw string.', e);
      parsed = { output: rawContent, reasoning: [] };
    }

    const transformedText = parsed.output || parsed.transformed_text || rawContent;
    const reasoning = Array.isArray(parsed.reasoning) ? parsed.reasoning.filter(Boolean) : [];
    const processingTime = Date.now() - startTime;

    // 4. STAGE 2: EVALUATE (The Auditor)
    // We check if the Author did a good job
    let evaluationData: any = null;
    let alignmentScore: number | null = null;

    try {
      const evalResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: EVALUATION_SYSTEM_PROMPT },
          { 
            role: "user", 
            content: `IDENTITY:\n${JSON.stringify(identityRecord.identity_json)}\n\nTEXT_TO_AUDIT:\n${transformedText}` 
          }
        ],
        response_format: { type: "json_object" }
      });

      const evalContent = evalResponse.choices[0].message.content || '{}';
      try {
        evaluationData = JSON.parse(evalContent);
        alignmentScore = typeof evaluationData.score === 'number' 
          ? Math.min(10, Math.max(0, evaluationData.score)) 
          : null;
      } catch (e) {
        console.warn('Failed to parse evaluation JSON output', e);
        evaluationData = { score: null, reasoning: 'Evaluation parsing failed', suggestions: '' };
      }
    } catch (evalError: any) {
      console.error('Evaluation error:', evalError);
      // Don't fail the request if evaluation fails, just log the error
      evaluationData = { score: null, reasoning: 'Evaluation failed', suggestions: '' };
    }

    // 5. Log to Database (PRD Requirement 6.5)
    const { error: logError } = await supabase
      .from('transformations')
      .insert({
        user_id: user.id,
        input_text: inputText,
        raw_llm_output: rawContent,
        final_output: transformedText,
        alignment_score: alignmentScore,
        model_used: 'gpt-4o-mini',
        processing_time_ms: processingTime
      });

    if (logError) {
      console.error('Logging error:', logError);
      // Don't fail the request if logging fails, just log the error
    }

    return NextResponse.json({ 
      output: transformedText, 
      reasoning,
      evaluation: evaluationData 
    });

  } catch (error: any) {
    console.error('Transformation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to transform text' }, { status: 500 });
  }
}


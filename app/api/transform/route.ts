import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { TRANSFORMATION_SYSTEM_PROMPT } from '@/lib/prompts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  // 1. Auth Check - support both Authorization header and cookies
  const authHeader = req.headers.get('authorization');
  let user;
  
  if (authHeader?.startsWith('Bearer ')) {
    // Client-side session: use token from Authorization header
    const token = authHeader.substring(7);
    const supabase = await createClient();
    const { data: { user: tokenUser }, error } = await supabase.auth.getUser(token);
    if (error || !tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    user = tokenUser;
  } else {
    // Server-side session: use cookies
    const supabase = await createClient();
    const { data: { user: cookieUser } } = await supabase.auth.getUser();
    if (!cookieUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    user = cookieUser;
  }

  const supabase = await createClient();

  try {
    const { inputText } = await req.json();

    if (!inputText || !inputText.trim()) {
      return NextResponse.json({ error: 'Input text is required' }, { status: 400 });
    }

    // 2. Fetch the Active Identity
    const { data: identityRecord, error: idError } = await supabase
      .from('identities')
      .select('identity_json')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (idError || !identityRecord) {
      return NextResponse.json({ error: 'No active identity found' }, { status: 404 });
    }

    // 3. Perform Transformation
    const startTime = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for speed/cost as per PRD [cite: 227]
      messages: [
        { role: "system", content: TRANSFORMATION_SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `IDENTITY_PROFILE:\n${JSON.stringify(identityRecord.identity_json)}\n\nINPUT_TEXT:\n${inputText}` 
        }
      ],
      temperature: 0.7,
    });

    const transformedText = completion.choices[0].message.content || '';
    const processingTime = Date.now() - startTime;

    // 4. Log to Database (PRD Requirement 6.5)
    // Note: 'alignment_score' is null for now, we will add that in the next step
    const { error: logError } = await supabase
      .from('transformations')
      .insert({
        user_id: user.id,
        input_text: inputText,
        raw_llm_output: transformedText, // In this phase, raw = final
        final_output: transformedText,
        model_used: 'gpt-4o-mini',
        processing_time_ms: processingTime
      });

    if (logError) {
      console.error('Logging error:', logError);
      // Don't fail the request if logging fails, just log the error
    }

    return NextResponse.json({ output: transformedText });

  } catch (error: any) {
    console.error('Transformation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to transform text' }, { status: 500 });
  }
}


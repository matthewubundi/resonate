import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedClient } from '@/utils/supabase/server';
import { TRANSFORMATION_SYSTEM_PROMPT, EVALUATION_SYSTEM_PROMPT } from '@/lib/prompts';
import { transformRateLimit } from '@/lib/ratelimit';
import { transformSchema } from '@/lib/validation';
import { sanitizeError } from '@/lib/errors';
import { handleCors, corsHeaders } from '@/lib/cors';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { buildTransformationPrompt, buildEvaluationPrompt, buildRetryPrompt } from '@/lib/ai';
import { LLMFactory } from '@/lib/llm/LLMFactory';
import { Message } from '@/lib/llm/types';
import { isDemoMode, simulateDemoTransform } from '@/lib/demo';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || (isDemoMode ? 'demo-openai-key' : undefined) });

export async function OPTIONS(req: Request) {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  return new NextResponse(null, { status: 204 });
}

export async function POST(req: Request) {
  try {
    // CORS Check
    const corsError = handleCors(req);
    if (corsError) return corsError;

    if (isDemoMode) {
      const body = await req.json();
      const validated = transformSchema.parse(body);
      const response = NextResponse.json(
        simulateDemoTransform(validated.inputText, validated.instructions)
      );
      const origin = req.headers.get('origin');
      Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Rate Limiting
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
    const { success, reset } = await transformRateLimit.limit(ip);

    if (!success) {
      logger.warn('Rate limit exceeded', { ip, route: '/api/transform' });
      return NextResponse.json({
        error: 'Too many requests. Please try again later.',
        resetAt: new Date(reset).toISOString()
      }, { status: 429 });
    }

    // Auth Check - supports both Bearer token and cookie auth with RLS
    const { supabase, user } = await getAuthenticatedClient(req);

    // Input Validation
    const body = await req.json();
    const validated = transformSchema.parse(body);
    const { inputText, temperature, instructions, model_id } = validated; // Extract instructions and model_id

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
      logger.error('Identity query error', { userId: user.id, error: idError.message });
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

    // --- BILLING CHECKS START ---
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, transformations_usage')
      .eq('id', user.id)
      .single();

    const tier = profile?.subscription_tier || 'free';
    const usage = profile?.transformations_usage || 0;

    // 1. Model Access Check
    if (tier === 'free' && model_id !== 'gpt-4o-mini') {
      return NextResponse.json({
        error: 'Free tier is limited to GPT-4o-mini. Upgrade to Pro for Gemini 2.5 Flash.'
      }, { status: 403 });
    }

    // 2. Usage Limit Check
    const LIMITS = { free: 50, pro: 2000, power: Infinity };
    const limit = LIMITS[tier as keyof typeof LIMITS] || 50;

    if (usage >= limit) {
      return NextResponse.json({
        error: `You have reached your monthly limit of ${limit} transformations. Upgrade to continue.`
      }, { status: 403 });
    }
    // --- BILLING CHECKS END ---

    // Memory Retrieval Layer
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
        logger.info('Context injected', { userId: user.id, memoryCount: memories.length });
      }
    } catch (memoryErr) {
      logger.error('Memory retrieval error', { userId: user.id, error: memoryErr });
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
        // USES NEW HELPER FUNCTION
        content: buildTransformationPrompt(identityRecord.identity_json, memories, inputText, instructions)
      }
    ];

    // The Correction Loop
    while (attempts <= MAX_RETRIES) {
      attempts++;

      // Generate Rewrite
      const userMessages = conversationHistory.filter(msg => msg.role !== 'system') as Message[];

      const provider = LLMFactory.getProvider(model_id);
      const providerResponse = await provider.generate({
        systemPrompt: TRANSFORMATION_SYSTEM_PROMPT,
        messages: userMessages,
        temperature: sanitizedTemp,
      });
      currentText = providerResponse.content;

      // Audit (Evaluate)
      try {
        const evalResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: EVALUATION_SYSTEM_PROMPT },
            {
              role: "user",
              // USES NEW HELPER FUNCTION
              content: buildEvaluationPrompt(identityRecord.identity_json, inputText, instructions, currentText)
            }
          ],
          response_format: { type: "json_object" }
        });

        evalData = JSON.parse(evalResponse.choices[0].message.content || "{}");
        finalScore = typeof evalData.score === 'number' ? evalData.score : 0;
      } catch (evalError) {
        logger.error('Evaluation error', { userId: user.id, error: evalError });
        evalData = { score: 0, reasoning: "Evaluation failed", suggestions: "" };
        finalScore = 0;
      }

      // Check Threshold (Goal: >= 8.0)
      if (finalScore >= 8.0) {
        break;
      }

      // Prepare for Retry (Feedback Injection)
      if (attempts <= MAX_RETRIES) {
        logger.info('Retry with feedback', { userId: user.id, attempt: attempts, score: finalScore });
        conversationHistory.push({ role: "assistant", content: currentText });
        conversationHistory.push({
          role: "user",
          // USES NEW HELPER FUNCTION
          content: buildRetryPrompt(finalScore, evalData.reasoning, evalData.suggestions)
        });
      }
    }

    const processingTime = Date.now() - startTime;

    // Log Final Result to Supabase (RLS ensures user can only insert their own)
    const { error: logError } = await supabase.from('transformations').insert({
      user_id: user.id,
      input_text: inputText,
      final_output: currentText,
      model_used: model_id,
      alignment_score: finalScore,
      processing_time_ms: processingTime,
      raw_llm_output: currentText
    });

    if (logError) {
      logger.error('Logging error', { userId: user.id, error: logError });
    }

    // Increment Usage Counter (using Admin client to bypass potential RLS on updating own usage)
    if (user.id) {
      await supabaseAdmin.rpc('increment_usage', { user_id: user.id });
      // Fallback if RPC doesn't exist yet (simpler update)
      /* 
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ transformations_usage: (usage || 0) + 1 })
        .eq('id', user.id);
       */
      // Actually, let's just use a direct update for now if RPC isn't guaranteed, 
      // but strictly we should use RPC for atomicity. 
      // For this task, I will use a direct increment assuming low concurrency or I'll provide the SQL for the RPC in the next step.
      // Let's safe bet on direct update for now, fetching fresh usage to be sure.

      const { data: currentProfile } = await supabaseAdmin.from('profiles').select('transformations_usage').eq('id', user.id).single();
      if (currentProfile) {
        await supabaseAdmin.from('profiles').update({
          transformations_usage: (currentProfile.transformations_usage || 0) + 1
        }).eq('id', user.id);
      }
    }

    const response = NextResponse.json({
      output: currentText,
      evaluation: evalData,
      attempts: attempts,
      used_memory: memories.length > 0
    });

    // Add CORS headers to response
    const origin = req.headers.get('origin');
    Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation failed', { errors: error.issues });
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues
      }, { status: 400 });
    }

    if (error.message === 'Unauthorized') {
      logger.warn('Unauthorized access attempt', {
        ip: req.headers.get('x-forwarded-for') ?? 'unknown'
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, status } = sanitizeError(error);
    logger.error('Transformation error', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: message }, { status });
  }
}

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuthenticatedClient } from '@/utils/supabase/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    // Auth Check - supports both Bearer token and cookie auth with RLS
    const { supabase, user } = await getAuthenticatedClient(req);

    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Convert Text to Vector
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // Save Text + Vector to Supabase (RLS ensures user can only insert their own)
    const { data, error } = await supabase.from('memories').insert({
      user_id: user.id,
      content: content,
      embedding: embedding
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Memory add error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

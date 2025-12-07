import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
    'https://resonate-phi.vercel.app',
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null,
    'http://localhost:3000',
].filter(Boolean) as string[];

export function corsHeaders(origin: string | null): Record<string, string> {
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
        return {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };
    }

    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    };
}

export function handleCors(req: Request) {
    const origin = req.headers.get('origin');

    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: corsHeaders(origin),
        });
    }

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
        return NextResponse.json(
            { error: 'Origin not allowed' },
            { status: 403 }
        );
    }

    return null;
}

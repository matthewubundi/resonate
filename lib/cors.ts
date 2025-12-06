import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
];

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

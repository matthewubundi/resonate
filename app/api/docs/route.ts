import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const docsDir = path.join(process.cwd(), 'docs');

        if (!fs.existsSync(docsDir)) {
            return NextResponse.json({ error: 'Documentation directory not found' }, { status: 404 });
        }

        const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.md'));

        const docs = files.map(file => {
            const filePath = path.join(docsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');

            // Extract title from markdown (first # heading)
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : file.replace('.md', '').replace(/_/g, ' ');

            // Determine category based on filename
            let category: 'architecture' | 'auth' | 'product' | 'general' = 'general';
            const fileName = file.toLowerCase();

            if (fileName.includes('architecture') || fileName.includes('system')) {
                category = 'architecture';
            } else if (fileName.includes('auth') || fileName.includes('supabase')) {
                category = 'auth';
            } else if (fileName.includes('product') || fileName.includes('requirement')) {
                category = 'product';
            }

            return {
                name: file.replace('.md', ''),
                title,
                content,
                category,
            };
        });

        return NextResponse.json(docs);
    } catch (error) {
        console.error('Error reading documentation:', error);
        return NextResponse.json({ error: 'Failed to read documentation' }, { status: 500 });
    }
}

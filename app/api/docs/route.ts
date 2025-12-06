import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the valid categories based on the directory structure
type DocCategory = 'architecture' | 'api' | 'ai-logic' | 'design' | 'planning' | 'general';

interface DocFile {
    name: string;
    title: string;
    content: string;
    category: DocCategory;
}

export async function GET() {
    try {
        const docsDir = path.join(process.cwd(), 'docs');

        if (!fs.existsSync(docsDir)) {
            return NextResponse.json({ error: 'Documentation directory not found' }, { status: 404 });
        }

        const docs: DocFile[] = [];

        // Helper to process files in a directory
        const processDirectory = (dirPath: string, category: DocCategory) => {
            if (!fs.existsSync(dirPath)) return;

            const files = fs.readdirSync(dirPath);

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    // Recursive call if needed, but for now we basically have flat categories
                    // mapped to folders. If we found a folder inside a category folder, 
                    // we might want to recurse or ignore.
                    // For the top-level scan, we will handle recursion via the main loop below.
                    continue;
                }

                if (file.endsWith('.md')) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    // Extract title from markdown (first # heading)
                    const titleMatch = content.match(/^#\s+(.+)$/m);
                    const title = titleMatch ? titleMatch[1] : file.replace('.md', '').replace(/_/g, ' ');

                    docs.push({
                        name: file.replace('.md', ''),
                        title,
                        content,
                        category
                    });
                }
            }
        };

        // 1. Scan root for general docs (e.g., README.md)
        processDirectory(docsDir, 'general');

        // 2. Scan specific subdirectories
        const categories: Record<string, DocCategory> = {
            'architecture': 'architecture',
            'api': 'api',
            'ai-logic': 'ai-logic',
            'design': 'design',
            'planning': 'planning'
        };

        for (const [dirName, category] of Object.entries(categories)) {
            processDirectory(path.join(docsDir, dirName), category);
        }

        return NextResponse.json(docs);

    } catch (error) {
        console.error('Error reading documentation:', error);
        return NextResponse.json({ error: 'Failed to read documentation' }, { status: 500 });
    }
}

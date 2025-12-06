import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';

export async function generateStaticParams() {
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) return [];
    const files = fs.readdirSync(docsDir).filter((file) => file.endsWith('.md'));
    return files.map((file) => ({
        slug: file.replace('.md', ''),
    }));
}

export default async function DocumentationPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const filePath = path.join(process.cwd(), 'docs', `${slug}.md`);

    if (!fs.existsSync(filePath)) {
        notFound();
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-all">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/documentation" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors group">
                        <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        Back to Docs
                    </Link>
                    <span className="text-sm font-semibold text-slate-400 hidden sm:block">
                        {slug.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <article className="prose prose-slate prose-lg max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 
                prose-h1:text-4xl prose-h1:mb-8 
                prose-p:text-slate-600 prose-p:leading-relaxed 
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline 
                prose-strong:text-slate-900 prose-strong:font-bold
                prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:rounded-xl prose-pre:shadow-lg
                prose-img:rounded-xl prose-img:shadow-md
                prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                prose-li:text-slate-600
                ">
                    <ReactMarkdown>{fileContent}</ReactMarkdown>
                </article>
            </main>
        </div>
    );
}

import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft, FileText, ArrowRight } from 'lucide-react';

export default function DocumentationPage() {
    const docsDir = path.join(process.cwd(), 'docs');
    const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.md'));

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">R</div>
                        <span className="font-bold text-lg">Resonate Docs</span>
                    </div>
                    <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
                        <ArrowLeft size={16} /> Back to App
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="max-w-2xl mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Documentation</h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Explore the architectural decisions, technical specifications, and implementation details of the Resonate identity preservation layer.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {files.map((file) => (
                        <Link href={`/documentation/${file.replace('.md', '')}`} key={file} className="block group">
                            <div className="h-full bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all duration-200 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 group-hover:-translate-y-1">
                                <div className="flex flex-col h-full justify-between gap-4">
                                    <div>
                                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors mb-4 shadow-sm">
                                            <FileText size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-2">
                                            {file.replace('.md', '').replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2">
                                            View detailed documentation and specifications for this module.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                        Read Guide <ArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}

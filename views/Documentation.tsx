import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Book, FileText, ChevronRight, Home, Menu, X, Terminal, Database, Palette, Brain, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocFile {
    name: string;
    title: string;
    content: string;
    category: 'architecture' | 'api' | 'ai-logic' | 'design' | 'planning' | 'general';
}

const Documentation: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const [selectedDoc, setSelectedDoc] = useState<string>('README');
    const [docs, setDocs] = useState<DocFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Load all documentation files from API
        const loadDocs = async () => {
            try {
                const response = await fetch('/api/docs');

                if (!response.ok) {
                    throw new Error('Failed to fetch documentation');
                }

                const loadedDocs = await response.json();
                setDocs(loadedDocs);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load documentation:', error);
                setLoading(false);
            }
        };

        loadDocs();
    }, []);

    const currentDoc = docs.find(doc => doc.name === selectedDoc);

    const categories = {
        general: { label: 'General', icon: Book },
        architecture: { label: 'Architecture', icon: FileText },
        api: { label: 'API Reference', icon: Terminal },
        'ai-logic': { label: 'AI Logic', icon: Brain },
        design: { label: 'Design System', icon: Palette },
        planning: { label: 'Planning', icon: Calendar },
    };

    const groupedDocs = docs.reduce((acc, doc) => {
        if (!acc[doc.category]) {
            acc[doc.category] = [];
        }
        acc[doc.category].push(doc);
        return acc;
    }, {} as Record<string, DocFile[]>);

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                <Home size={18} />
                                <span className="hidden sm:inline">Back to Home</span>
                            </button>
                            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <Book size={20} className="text-blue-600" />
                                <h1 className="text-xl font-bold text-slate-900">Documentation</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Navigation - Desktop */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <nav className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto pb-10 pr-2">
                            {Object.entries(categories).map(([key, { label, icon: Icon }]) => {
                                const categoryDocs = groupedDocs[key] || [];
                                if (categoryDocs.length === 0) return null;

                                return (
                                    <div key={key}>
                                        <div className="flex items-center gap-2 mb-3 px-3">
                                            <Icon size={16} className="text-slate-400" />
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                {label}
                                            </h3>
                                        </div>
                                        <ul className="space-y-1">
                                            {categoryDocs.map((doc) => (
                                                <li key={doc.name}>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDoc(doc.name);
                                                            setMobileMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedDoc === doc.name
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                            }`}
                                                    >
                                                        {doc.title}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Mobile Sidebar */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="lg:hidden fixed inset-0 z-50 bg-black/50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <motion.aside
                                    initial={{ x: -300 }}
                                    animate={{ x: 0 }}
                                    exit={{ x: -300 }}
                                    transition={{ type: 'spring', damping: 25 }}
                                    className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="p-6 border-b border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-bold text-slate-900">Navigation</h2>
                                            <button
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="p-2 rounded-lg hover:bg-slate-100"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <nav className="p-6 space-y-6">
                                        {Object.entries(categories).map(([key, { label, icon: Icon }]) => {
                                            const categoryDocs = groupedDocs[key] || [];
                                            if (categoryDocs.length === 0) return null;

                                            return (
                                                <div key={key}>
                                                    <div className="flex items-center gap-2 mb-3 px-3">
                                                        <Icon size={16} className="text-slate-400" />
                                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                            {label}
                                                        </h3>
                                                    </div>
                                                    <ul className="space-y-1">
                                                        {categoryDocs.map((doc) => (
                                                            <li key={doc.name}>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedDoc(doc.name);
                                                                        setMobileMenuOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedDoc === doc.name
                                                                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                                        }`}
                                                                >
                                                                    {doc.title}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </nav>
                                </motion.aside>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-pulse space-y-4 w-full max-w-3xl">
                                    <div className="h-8 bg-slate-200 rounded w-3/4" />
                                    <div className="h-4 bg-slate-200 rounded w-full" />
                                    <div className="h-4 bg-slate-200 rounded w-5/6" />
                                    <div className="h-4 bg-slate-200 rounded w-4/6" />
                                </div>
                            </div>
                        ) : currentDoc ? (
                            <article className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-4xl prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-800 prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-600 prose-strong:text-slate-900 prose-strong:font-semibold prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r prose-table:border-collapse prose-th:bg-slate-100 prose-th:border prose-th:border-slate-200 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-slate-200 prose-td:px-4 prose-td:py-2">
                                <ReactMarkdown
                                    components={{
                                        // Add smooth scroll to anchor links
                                        a: ({ node, children, href, ...props }: any) => {
                                            if (href?.startsWith('#')) {
                                                return (
                                                    <a
                                                        href={href}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const element = document.getElementById(href.slice(1));
                                                            element?.scrollIntoView({ behavior: 'smooth' });
                                                        }}
                                                        {...props}
                                                    >
                                                        {children}
                                                    </a>
                                                );
                                            }
                                            return (
                                                <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                                                    {children}
                                                </a>
                                            );
                                        },
                                    }}
                                >
                                    {currentDoc.content}
                                </ReactMarkdown>
                            </article>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <FileText size={48} className="text-slate-300 mb-4" />
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">No Documentation Selected</h2>
                                <p className="text-slate-600">Please select a document from the sidebar to view its contents.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Documentation;

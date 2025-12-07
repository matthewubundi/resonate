import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsOfService: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" />
                            <h1 className="text-xl font-bold text-slate-900">Terms of Service</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <article className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600">
                    <p className="text-slate-500 text-sm mb-8">Last updated: December 7, 2025</p>

                    <h2>1. Agreement to Terms</h2>
                    <p>
                        By accessing or using Resonate, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                    </p>

                    <h2>2. Use License</h2>
                    <p>
                        Permission is granted to temporarily download one copy of the materials (information or software) on Resonate's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul>
                        <li>modify or copy the materials;</li>
                        <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                        <li>attempt to decompile or reverse engineer any software contained on Resonate's website;</li>
                        <li>remove any copyright or other proprietary notations from the materials; or</li>
                        <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                    </ul>

                    <h2>3. Disclaimer</h2>
                    <p>
                        The materials on Resonate's website are provided on an 'as is' basis. Resonate makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>

                    <h2>4. Limitations</h2>
                    <p>
                        In no event shall Resonate or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Resonate's website, even if Resonate or a Resonate authorized representative has been notified orally or in writing of the possibility of such damage.
                    </p>

                    <h2>5. Accuracy of Materials</h2>
                    <p>
                        The materials appearing on Resonate's website could include technical, typographical, or photographic errors. Resonate does not warrant that any of the materials on its website are accurate, complete or current. Resonate may make changes to the materials contained on its website at any time without notice. However Resonate does not make any commitment to update the materials.
                    </p>

                    <h2>6. Links</h2>
                    <p>
                        Resonate has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Resonate of the site. Use of any such linked website is at the user's own risk.
                    </p>

                    <h2>7. Modifications</h2>
                    <p>
                        Resonate may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                    </p>

                    <h2>8. Governing Law</h2>
                    <p>
                        These terms and conditions are governed by and construed in accordance with the laws of California and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                    </p>
                </article>
            </main>
        </div>
    );
};

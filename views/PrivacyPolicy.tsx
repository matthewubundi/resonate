import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
                            <Shield size={20} className="text-blue-600" />
                            <h1 className="text-xl font-bold text-slate-900">Privacy Policy</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <article className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600">
                    <p className="text-slate-500 text-sm mb-8">Last updated: December 7, 2025</p>

                    <h2>1. Introduction</h2>
                    <p>
                        At Resonate, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2>2. Data We Collect</h2>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul>
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data</strong> includes email address.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                        <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                    </ul>

                    <h2>3. How We Use Your Data</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul>
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal or regulatory obligation.</li>
                    </ul>

                    <h2>4. Data Security</h2>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                    </p>

                    <h2>5. Your Legal Rights</h2>
                    <p>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
                    </p>

                    <h2>6. Third-Party Links</h2>
                    <p>
                        This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
                    </p>

                    <h2>7. Contact Us</h2>
                    <p>
                        If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@resonate.com.
                    </p>
                </article>
            </main>
        </div>
    );
};

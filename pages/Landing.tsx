import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Fingerprint,
  Shield,
  Zap,
  Cpu,
  Code2,
  CheckCircle2,
  Users,
  PenTool,
  Building2,
  ChevronRight,
  Sparkles,
  ToggleRight,
  ToggleLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Shared Framer Motion Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  })
};

const springHover = {
  hover: { y: -5, transition: { type: "spring", stiffness: 300 } }
};

export const Landing: React.FC<{ onLogin: () => void; onSignup: () => void }> = ({ onLogin, onSignup }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden">

      {/* --- Sticky Navbar --- */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-4' : 'bg-transparent py-6'
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Cpu className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Identity<span className="text-blue-600">Preserver</span></span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#comparison" className="hover:text-blue-600 transition-colors">Difference</a>
            </div>
            <div className="flex gap-3">
              <button onClick={onLogin} className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2">Log In</button>
              <button
                onClick={onSignup}
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="absolute top-20 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl opacity-50 -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Hero Content */}
          <div className="max-w-2xl">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              System Online
            </motion.div>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6"
            >
              Your Voice, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Preserved.</span>
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg"
            >
              The ultimate identity layer for generative AI. Preserve your linguistic fingerprint and protect your personal brand against generic model output.
            </motion.p>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={onSignup}
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-8 font-semibold text-white transition-all hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <span className="mr-2">Start Identity Setup</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-8 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
              >
                View Documentation
              </button>
            </motion.div>

            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mt-10 flex items-center gap-4 text-sm text-slate-500"
            >
              <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-blue-600" /> Free to start</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-blue-600" /> Local storage</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-blue-600" /> No training</span>
            </motion.div>
          </div>

          {/* Hero Visual - Abstract Identity Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-50 rounded-full blur-[100px] opacity-60" />

            <div className="relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-blue-900/5 rotate-[-3deg] hover:rotate-0 transition-all duration-500 z-10 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white flex items-center justify-center">
                    <span className="text-xl">👨‍💻</span>
                  </div>
                  <div>
                    <div className="h-3 w-32 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-2 w-20 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                  99% Match
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-red-400"></span>
                    <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                    <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                    <div className="h-2 w-5/6 bg-slate-100 rounded-full"></div>
                    <div className="h-2 w-4/6 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-24 rounded-xl bg-blue-600/5 border border-blue-100 flex flex-col items-center justify-center gap-2">
                    <Fingerprint className="text-blue-600" size={24} />
                    <span className="text-[10px] font-bold text-blue-900 uppercase">Fingerprint</span>
                  </div>
                  <div className="flex-1 h-24 rounded-xl bg-purple-600/5 border border-purple-100 flex flex-col items-center justify-center gap-2">
                    <Sparkles className="text-purple-600" size={24} />
                    <span className="text-[10px] font-bold text-purple-900 uppercase">Tone</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-200/50">
                <span className="text-xs font-mono text-slate-400">ID: 882-1X-ALP</span>
                <span className="text-xs font-bold text-slate-900">Verified</span>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-700">Vocabulary Synced</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- Logos Section --- */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-400 mb-8 uppercase tracking-widest">Seamlessly Integrates With</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['OpenAI', 'Anthropic', 'Mistral AI', 'Meta Llama', 'Cohere'].map((brand) => (
              <span key={brand} className="text-xl font-bold text-slate-800 hover:text-blue-600 cursor-default transition-colors">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* --- Interactive Comparison Section --- */}
      <InteractiveComparison />

      {/* --- Bento Grid Features --- */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Architecture of Identity</h2>
            <p className="text-lg text-slate-600">Built for precision, privacy, and performance. Our engine deconstructs your linguistic style and reconstructs it on demand.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Large */}
            <motion.div
              whileHover="hover"
              variants={springHover}
              className="md:col-span-2 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Fingerprint size={200} className="text-blue-600" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                <Fingerprint size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Digital Fingerprint</h3>
              <p className="text-slate-600 leading-relaxed max-w-md">
                We don't just "prompt" the AI. We encapsulate your vocabulary, sentence structure, and tone into a portable JSON identity file that acts as a distinct layer between you and the model.
              </p>
            </motion.div>

            {/* Card 2: Medium */}
            <motion.div
              whileHover="hover"
              variants={springHover}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all"
            >
              <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Zero Latency</h3>
              <p className="text-slate-600 text-sm">Real-time styling injection with under 15ms overhead. Your workflow remains uninterrupted.</p>
            </motion.div>

            {/* Card 3: Medium */}
            <motion.div
              whileHover="hover"
              variants={springHover}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all"
            >
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Local Privacy</h3>
              <p className="text-slate-600 text-sm">Your writing samples never leave your device for training. The identity definition is yours alone.</p>
            </motion.div>

            {/* Card 4: Wide Code Block */}
            <motion.div
              whileHover="hover"
              variants={springHover}
              className="md:col-span-2 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="h-12 w-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 mb-6">
                    <Code2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Developer API</h3>
                  <p className="text-slate-400 text-sm mb-6">Integrate identity preservation into your own apps with a few lines of code.</p>
                  <button className="text-xs font-bold text-blue-400 hover:text-white flex items-center gap-1 transition-colors">
                    Read the Docs <ChevronRight size={12} />
                  </button>
                </div>
                <div className="w-full md:w-1/2 bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs shadow-inner">
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <p><span className="text-purple-400">const</span> identity = <span className="text-blue-400">await</span> Preserver.<span className="text-yellow-300">load</span>(<span className="text-green-400">'user_id'</span>);</p>
                    <p className="text-slate-600">// Inject identity into generic draft</p>
                    <p><span className="text-purple-400">const</span> result = <span className="text-blue-400">await</span> identity.<span className="text-yellow-300">transform</span>(draft);</p>
                    <p><span className="text-blue-400">console</span>.<span className="text-yellow-300">log</span>(result.score); <span className="text-slate-600">// 99.8</span></p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- Use Cases Section --- */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Who is IdentityPreserver for?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center px-4">
              <div className="h-16 w-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Founders & Leaders</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Scale your thought leadership on LinkedIn and X without sounding like a generic bot. Maintain your unique authority.</p>
            </div>
            <div className="text-center px-4">
              <div className="h-16 w-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-6">
                <PenTool size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Content Creators</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Automate your newsletter and blog drafts while keeping 100% of your stylistic flair and wit.</p>
            </div>
            <div className="text-center px-4">
              <div className="h-16 w-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6">
                <Building2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Support Teams</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Unify your brand voice across thousands of support tickets. Make every automated reply feel personal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center">
              <Cpu className="text-white" size={12} />
            </div>
            <span className="font-bold text-slate-900">IdentityPreserver</span>
          </div>

          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900">Product</a>
            <a href="#" className="hover:text-slate-900">Company</a>
            <a href="#" className="hover:text-slate-900">Resources</a>
            <a href="#" className="hover:text-slate-900">Legal</a>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-700">System Online</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 text-center text-xs text-slate-400">
          © 2024 Identity Preserver Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

// --- Sub-Component: Interactive Comparison ---
const InteractiveComparison = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <section id="comparison" className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">The Difference is You</h2>
            <p className="text-slate-600">Toggle Identity Preserver to see the transformation.</p>
          </div>

          <div
            onClick={() => setIsActive(!isActive)}
            className="cursor-pointer flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-inner hover:bg-slate-100 transition-colors"
          >
            <span className={`text-sm font-bold ${!isActive ? 'text-slate-900' : 'text-slate-400'}`}>Generic AI</span>
            <div className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${isActive ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
            <span className={`text-sm font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>Preserved</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Output Card */}
          <div className="relative md:col-span-2">
            <AnimatePresence mode="wait">
              {isActive ? (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl p-8 border-2 border-blue-100 shadow-2xl shadow-blue-200/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Your Identity</h4>
                      <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">High Alignment (98%)</span>
                    </div>
                  </div>
                  <p className="text-lg text-slate-800 leading-relaxed font-medium">
                    "Hey team, quick heads-up on the Q3 synergy goals. We really need to double down on the cross-functional stuff if we want to ship this by October. Let's not overcomplicate the process—keep it lean."
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="inactive"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-inner"
                >
                  <div className="flex items-center gap-3 mb-6 opacity-50">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <Cpu size={20} className="text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700">Generic Model</h4>
                      <span className="text-xs text-slate-500 font-semibold bg-slate-200 px-2 py-0.5 rounded-full">Zero Alignment</span>
                    </div>
                  </div>
                  <p className="text-lg text-slate-500 leading-relaxed font-normal">
                    "It is imperative that the team aligns on the strategic objectives for the third quarter. To ensure successful delivery by October, we must leverage cross-functional collaboration and optimize our workflows for efficiency."
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
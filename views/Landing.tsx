import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Shield,
  Cpu,
  Code2,
  CheckCircle2,
  Users,
  PenTool,
  Building2,
  ChevronRight,
  Sparkles,
  ToggleRight,
  ToggleLeft,
  Image as ImageIcon,
  FileJson,
  Activity,
  Server,
  Copy,
  GitBranch,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/src/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';



import { NavItem, PageView } from '../types';
import { User } from '@supabase/supabase-js';

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



// --- Sub-Component: Transformation Visual ---
const TransformationVisual = () => {
  const t = useTranslations('Landing');
  const [stage, setStage] = useState<'input' | 'processing' | 'output'>('input');

  // Note: Specific strings in this visual component are not yet fully keyed in the message files provided (like "RAW", "PROCESSING"). 
  // We can leave them as is or try to use generic keys if available.
  // For "Detecting Style..." and "Voice Match", we will leave them hardcoded for now or use placeholders if desired, 
  // but better to keep the visual integrity until keys are explicitly added. 
  // However, the user asked to tranlsate "more", so we will focus on the main content sections first.

  useEffect(() => {
    const cycle = () => {
      setStage('input');
      setTimeout(() => setStage('processing'), 2500);
      setTimeout(() => setStage('output'), 4000);
    };
    cycle();
    const interval = setInterval(cycle, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-sm lg:max-w-md mx-auto perspective-1000">
      {/* Glass Card */}
      <motion.div
        className="absolute inset-0 bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden"
        initial={{ rotateX: 5, rotateY: -5 }}
        animate={{ rotateX: 0, rotateY: 0 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="h-12 border-b border-slate-100 bg-white/50 flex items-center px-6 gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
          <div className="ml-auto flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full transition-colors ${stage === 'processing' ? 'bg-yellow-400' : 'bg-slate-200'}`}></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {stage === 'input' ? t('hero.visual.raw') : stage === 'processing' ? t('hero.visual.processing') : t('hero.visual.preserved')}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 relative">
          <AnimatePresence mode="wait">
            {stage === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-serif text-2xl text-slate-300 leading-relaxed"
              >
                "It is imperative that we leverage synergy to optimize outcomes."
              </motion.div>
            )}

            {stage === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-blue-600 tracking-widest uppercase animate-pulse">{t('hero.visual.detectingStyle')}</span>
                </div>
              </motion.div>
            )}

            {stage === 'output' && (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-sans text-2xl font-medium text-slate-900 leading-relaxed"
              >
                "We need to <span className="bg-yellow-100/80 text-yellow-700 px-1 rounded mx-0.5">work together</span> to get the <span className="bg-yellow-100/80 text-yellow-700 px-1 rounded mx-0.5">best results</span>."
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Badge */}
        {stage === 'output' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute bottom-6 right-6 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2"
          >
            <Sparkles size={12} className="text-blue-200" />
            {t('hero.visual.voiceMatch')}
          </motion.div>
        )}
      </motion.div>

      {/* Decorative Blur behind */}
      <div className="absolute top-10 left-10 w-full h-full bg-blue-400/20 blur-3xl rounded-full -z-10 opacity-50"></div>
    </div>
  );
};

// --- Sub-Component: Schematic Diagram (The Glass Blueprint) ---
const SchematicDiagram = () => {
  const t = useTranslations('Landing');

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 p-6 md:p-12 mb-12 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>

      <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">

        {/* Node 1: The Source */}
        <div className="flex flex-col items-center gap-4 z-10 w-full md:w-auto">
          <div className="w-full max-w-[160px] h-20 md:h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">LLM {t('architecture.output')}</span>
          </div>
        </div>

        {/* Connector 1 (Desktop: Horizontal) */}
        <div className="hidden md:block w-16 h-[2px] bg-slate-200 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300"></div>
        </div>

        {/* Connector 1 (Mobile: Vertical) */}
        <div className="md:hidden h-8 w-[2px] bg-slate-200 relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-300"></div>
        </div>

        {/* Node 2: The Core (Resonate Engine) */}
        <div className="relative z-10 my-4 md:my-0">
          {/* Top Label */}
          <div className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/80 backdrop-blur px-2 rounded-full">{t('architecture.resonateEngine')}</span>
          </div>

          <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border border-slate-200 bg-paleslate/30 backdrop-blur-sm flex flex-col items-center justify-center gap-2 md:gap-3 relative shadow-inner">

            {/* Identity File Injection */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-2 md:-left-16 top-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2 scale-75 md:scale-100 origin-right z-30"
            >
              <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center justify-center text-blue-600">
                <FileJson size={20} />
              </div>
              <div className="w-4 md:w-8 h-[2px] bg-blue-400/50"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </motion.div>

            {/* Internal Chips */}
            <div className="w-32 md:w-40 py-1.5 md:py-2 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-2">
              <Activity size={12} className="text-slate-400" />
              <span className="text-[10px] md:text-xs font-bold text-slate-600">{t('architecture.analysis')}</span>
            </div>
            <div className="w-32 md:w-40 py-1.5 md:py-2 rounded-lg bg-white border border-blue-200 shadow-sm flex items-center justify-center gap-2 ring-2 ring-blue-50">
              <FileJson size={12} className="text-blue-500" />
              <span className="text-[10px] md:text-xs font-bold text-slate-900">{t('architecture.injection')}</span>
            </div>
            <div className="w-32 md:w-40 py-1.5 md:py-2 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-2">
              <CheckCircle2 size={12} className="text-slate-400" />
              <span className="text-[10px] md:text-xs font-bold text-slate-600">{t('architecture.reranking')}</span>
            </div>
          </div>
        </div>

        {/* Connector 2 (Desktop: Horizontal) */}
        <div className="hidden md:block w-16 h-[2px] bg-blue-500 relative overflow-hidden">
          <motion.div
            animate={{ x: [-20, 64] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          ></motion.div>
        </div>

        {/* Connector 2 (Mobile: Vertical) */}
        <div className="md:hidden h-8 w-[2px] bg-blue-500 relative overflow-hidden">
          <motion.div
            animate={{ y: [-20, 32] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-8 bg-gradient-to-b from-transparent via-white/50 to-transparent"
          ></motion.div>
        </div>

        {/* Node 3: The Output */}
        <div className="flex flex-col items-center gap-4 z-10 w-full md:w-auto">
          <motion.div
            whileHover={{ y: -5 }}
            className="w-full max-w-[160px] h-20 md:h-24 rounded-xl bg-white border border-blue-100 shadow-[0_10px_30px_-5px_rgba(37,99,235,0.15)] flex items-center justify-center"
          >
            <span className="font-bold text-sm text-blue-600 flex items-center gap-2">
              <Sparkles size={14} /> {t('architecture.preserved')}
            </span>
          </motion.div>
        </div>

      </div>
    </div>
  )
}

// --- Sub-Component: BentoGridFeatures ---
const BentoGridFeatures = () => {
  const t = useTranslations('Landing');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Box 1: Local Privacy (Large - Top Left) */}
      <div className="md:col-span-1 p-8 rounded-3xl bg-white border border-slate-200 relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <Shield size={120} />
        </div>
        <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 mb-6 group-hover:scale-110 transition-transform">
          <Shield size={24} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{t('privacy.localPrivacy')}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          {t('privacy.localPrivacyDescription')}
        </p>
      </div>

      {/* Box 2: Developer API (Wide - Top Right) */}
      <div className="md:col-span-2 p-8 rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden group">
        <div className="flex flex-col md:flex-row gap-8 items-center h-full">
          <div className="flex-1 relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 mb-6">
              <Server size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('developerApi.developerApiTitle')}</h3>
            <p className="text-slate-400 text-sm mb-6">
              {t('developerApi.developerApiDescription')}
            </p>
          </div>

          {/* Code Snippet */}
          <div className="w-full md:w-3/5 bg-[#0F172A] rounded-xl border border-slate-700/50 p-5 font-mono text-xs shadow-2xl transform md:translate-x-4 md:group-hover:translate-x-0 transition-transform duration-500">
            <div className="flex gap-1.5 mb-4 border-b border-slate-800 pb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            </div>
            <div className="space-y-2 text-slate-300">
              <p><span className="text-purple-400">const</span> <span className="text-blue-300">engine</span> = <span className="text-purple-400">new</span> <span className="text-yellow-300">Resonate</span>();</p>
              <p><span className="text-purple-400">await</span> engine.<span className="text-blue-400">loadIdentity</span>(<span className="text-green-400">'./my-voice.json'</span>);</p>
              <p className="text-slate-600">// &lt; 15ms injection</p>
              <p><span className="text-purple-400">return</span> engine.<span className="text-blue-400">process</span>(draft);</p>
            </div>
          </div>
        </div>
      </div>

      {/* Box 3: Zero Latency (Full Width - Bottom) */}
      <div className="md:col-span-3 p-8 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row items-center gap-12 group hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-extrabold text-[#111111] tracking-tighter">&lt; 15ms</span>
            <span className="text-slate-500 font-medium">{t('developerApi.overhead')}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">{t('developerApi.zeroLatency')}</h3>
          <p className="text-slate-600 text-sm leading-relaxed max-w-lg">
            {t('developerApi.zeroLatencyDescription')}
          </p>
        </div>

        {/* Minimalist Chart */}
        <div className="w-full md:w-1/2 h-40 relative flex items-end justify-between px-4 pb-4 border-l border-b border-slate-200">
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>

          {/* Data Points / Lines */}
          {/* Line 1: Resonate (Flat) */}
          <div className="absolute left-0 right-0 bottom-8 h-[2px] bg-blue-500">
            <div className="absolute right-0 -top-6 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Resonate</div>
          </div>

          {/* Line 2: Traditional (Spike) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <path d="M0,150 L100,150 L150,50 L200,100 L300,150 L400,150" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
          <div className="absolute left-[40%] top-[20%] text-xs font-bold text-slate-400">{t('developerApi.traditionalHook')}</div>
        </div>
      </div>

    </div>
  )
}




// --- Sub-Component: Interactive Comparison ---
const InteractiveComparison = () => {
  const t = useTranslations('Landing');

  return (
    <section id="comparison" className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{t('differenceSection.differenceTitle')}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('differenceSection.differenceSubtitle')}
          </p>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-stretch">

          {/* Connector Arrow (Desktop) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-white p-3 rounded-full shadow-lg border border-slate-100 text-azure ring-4 ring-white">
              <ArrowRight size={24} strokeWidth={3} />
            </div>
          </div>

          {/* Left Side: Generic */}
          <div className="bg-paleslate rounded-3xl p-8 lg:p-10 border border-slate-200/60 flex flex-col">
            <div className="flex items-center gap-3 mb-8 opacity-60">
              <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center">
                <Cpu size={20} className="text-slate-600" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('differenceSection.standardOutput')}</span>
            </div>
            <p className="font-mono text-slate-500 text-lg leading-loose flex-grow">
              "{t('differenceSection.standardOutputExample')}"
            </p>
          </div>

          {/* Right Side: Resonate */}
          <div className="bg-paper rounded-3xl p-8 lg:p-10 border border-slate-200 shadow-2xl shadow-blue-900/5 relative overflow-hidden flex flex-col ring-1 ring-slate-900/5">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-azure-light to-azure"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-azure-light flex items-center justify-center">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="You" className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-xs font-bold text-azure uppercase tracking-widest mb-0.5">{t('differenceSection.yourVoice')}</div>
                  <div className="text-[10px] font-semibold text-slate-400">{t('differenceSection.preservedIdentity')}</div>
                </div>
              </div>
              <div className="px-3 py-1 bg-azure-faint rounded-full border border-blue-100">
                <span className="text-xs font-bold text-azure flex items-center gap-1.5">
                  <Sparkles size={12} fill="currentColor" /> {t('differenceSection.match')}
                </span>
              </div>
            </div>

            <p className="font-sans text-slate-900 text-lg leading-loose font-medium">
              "{t('differenceSection.yourVoiceExample')}"
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};


// --- Sub-Component: Three-Step Onboarding ---
const ThreeStepOnboarding: React.FC<{ onSignup: () => void }> = ({ onSignup }) => {
  const t = useTranslations('Landing');

  return (
    <section className="py-24 bg-slate-100 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className="px-3 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider">{t('pipeline.engineeringPipeline')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {t('pipeline.howItWorks')}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('pipeline.howItWorksDescription')}
          </p>
        </div>

        {/* Process Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

          {/* Step 1: The Interview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group">
              <div className="p-8 pb-0">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-blue-200 shadow-lg">1</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('pipeline.interviewTitle')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">
                  {t('pipeline.interviewDescription')}
                </p>
              </div>

              {/* Mini-UI: Chat Interface */}
              <div className="mt-auto bg-slate-50 border-t border-slate-100 p-6 min-h-[160px] relative overflow-hidden">
                <div className="space-y-3">
                  {/* AI Bubble */}
                  <div className="flex gap-2 max-w-[90%]">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex-shrink-0"></div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm">
                      <div className="h-2 w-32 bg-slate-200 rounded mb-2"></div>
                      <div className="h-2 w-20 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  {/* User Bubble */}
                  <div className="flex gap-2 max-w-[90%] ml-auto justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3 shadow-sm">
                      <p className="text-[10px] font-medium leading-relaxed opacity-90">"I prefer direct, punchy sentences. No fluff."</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex-shrink-0"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Desktop Connector Arrow 1 */}
          <div className="hidden md:flex absolute top-1/2 left-[31%] w-8 text-slate-300 items-center justify-center -translate-y-1/2 z-10">
            <ChevronRight size={32} />
          </div>

          {/* Step 2: The Extraction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group">
              <div className="p-8 pb-0">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-slate-200 shadow-lg">2</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('pipeline.extractionTitle')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">
                  {t('pipeline.extractionDescription')}
                </p>
              </div>

              {/* Mini-UI: Code Snippet */}
              <div className="mt-auto bg-slate-900 border-t border-slate-800 p-6 min-h-[160px] font-mono text-xs overflow-hidden relative group-hover:bg-slate-950 transition-colors">
                <div className="absolute top-0 right-0 p-2 opacity-50">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  </div>
                </div>
                <div className="text-slate-400 space-y-1.5">
                  <p><span className="text-purple-400">export const</span> Identity = {'{'}</p>
                  <p className="pl-4"><span className="text-blue-400">"tone"</span>: <span className="text-green-400">"direct"</span>,</p>
                  <p className="pl-4"><span className="text-blue-400">"complexity"</span>: <span className="text-orange-400">0.3</span>,</p>
                  <p className="pl-4"><span className="text-blue-400">"emojis"</span>: <span className="text-purple-400">false</span>,</p>
                  <p className="pl-4"><span className="text-blue-400">"vocabulary"</span>: [...]</p>
                  <p>{'}'};</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Desktop Connector Arrow 2 */}
          <div className="hidden md:flex absolute top-1/2 right-[31%] w-8 text-slate-300 items-center justify-center -translate-y-1/2 z-10">
            <ChevronRight size={32} />
          </div>

          {/* Step 3: The Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group">
              <div className="p-8 pb-0">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-blue-200 shadow-lg">3</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('pipeline.filterTitle')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">
                  {t('pipeline.filterDescription')}
                </p>
              </div>

              {/* Mini-UI: Scorecard */}
              <div className="mt-auto bg-slate-50 border-t border-slate-100 p-6 min-h-[160px] flex items-center justify-center relative overflow-hidden">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm w-full max-w-[200px]">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('pipeline.miniUi.alignment')}</span>
                    <span className="text-lg font-bold text-green-600">9.8</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "98%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-green-500 rounded-full"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-600" />
                    <span className="text-[10px] font-medium text-slate-500">{t('pipeline.miniUi.identityMatches')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            onClick={onSignup}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
          >
            <span>{t('pipeline.initializePipeline')}</span>
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

// --- Sub-Component: JSON Preview Section ---
// --- Sub-Component: JSON Preview Section ("The Portable IDE") ---
const JSONPreviewSection = () => {
  const t = useTranslations('Landing');
  return (
    <section className="py-24 px-6 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

        {/* Left Column: The Promise */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
            <Code2 size={14} />
            {t('identityStructure.developerFirst')}
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-[#111111] tracking-tight mb-6">
            {t('identityStructure.identityStructured')}
          </h2>

          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
            {t('identityStructure.identityStructuredDescription')}
          </p>

          {/* Horizontal Icon Cards */}
          <div className="flex flex-wrap gap-4">
            {/* Card 1: Portable */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                <FileJson size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{t('identityStructure.portable')}</div>
                <div className="text-xs text-slate-500">{t('identityStructure.modelAgnostic')}</div>
              </div>
            </div>

            {/* Card 2: Versioned */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
                <GitBranch size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{t('identityStructure.versioned')}</div>
                <div className="text-xs text-slate-500">{t('identityStructure.gitCompatible')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: The Visual (Interactive JSON Editor) */}
        <div className="perspective-1000 relative">
          {/* "Glass" Reflection Shadow */}
          <div className="absolute top-10 left-10 w-full h-full bg-azure/20 blur-3xl rounded-[30px] -z-10 opacity-60"></div>

          <motion.div
            className="relative bg-[#1E1E2E] rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden"
            initial={{ rotateY: -5, rotateX: 5 }}
            whileHover={{ rotateY: 0, rotateX: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            {/* Window Chrome */}
            <div className="h-10 bg-[#2D2D3B] border-b border-white/5 flex items-center px-4 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
              </div>
              {/* Filename Tab */}
              <div className="px-4 py-1 bg-[#1E1E2E] rounded-t-lg text-xs font-mono text-slate-400 border-t border-x border-white/5 -mb-3 translate-y-1">
                {t('identityStructure.filename')}
              </div>
              <div className="w-10"></div> {/* Spacer for balance */}
            </div>

            {/* Toolbar / Actions */}
            <div className="absolute top-3 right-4 z-10">
              <button className="text-slate-500 hover:text-slate-300 transition-colors">
                <Copy size={16} />
              </button>
            </div>

            {/* Editor Content */}
            <div className="p-6 font-mono text-sm leading-loose overflow-x-auto">
              <div className="flex">
                {/* Line Numbers */}
                <div className="flex flex-col text-slate-600 select-none text-right pr-4 border-r border-slate-700/50 mr-4">
                  <span>01</span>
                  <span>02</span>
                  <span>03</span>
                  <span>04</span>
                  <span>05</span>
                  <span>06</span>
                  <span>07</span>
                  <span>08</span>
                  <span>09</span>
                  <span>10</span>
                </div>

                {/* Code */}
                <div className="text-slate-300">
                  <div><span className="text-[#EAB308]">{`{`}</span></div>
                  <div className="pl-4">
                    <span className="text-[#2563EB]">"name"</span>: <span className="text-[#4ADE80]">{t('identityStructure.example.nameValue')}</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-[#2563EB]">"voice"</span>: <span className="text-[#EAB308]">{`{`}</span>
                  </div>
                  <div className="pl-8">
                    <span className="text-[#2563EB]">"tone"</span>: <span className="text-[#4ADE80]">{t('identityStructure.example.toneValue')}</span>,
                  </div>
                  <div className="pl-8">
                    <span className="text-[#2563EB]">"style"</span>: <span className="text-[#4ADE80]">{t('identityStructure.example.styleValue')}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-[#EAB308]">{`}`}</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-[#2563EB]">"keywords"</span>: <span className="text-[#EAB308]">[</span>
                  </div>
                  <div className="pl-8">
                    <span className="text-[#4ADE80]">{t('identityStructure.example.keyword1')}</span>, <span className="text-[#4ADE80]">{t('identityStructure.example.keyword2')}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-[#EAB308]">]</span>
                  </div>
                  <div><span className="text-[#EAB308]">{`}`}</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const Landing: React.FC<{ onLogin: () => void; onSignup: () => void; onNavigate?: (page: PageView) => void }> = ({ onLogin, onSignup, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const t = useTranslations('Landing');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsLangMenuOpen(false);
  };

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
            <Image src="/Resonate-Logo.png" alt="Resonate Logo" width={36} height={36} className="w-9 h-9 object-contain" />
            <span className="font-bold text-xl tracking-tight text-blue-600">Resonate</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors uppercase"
              >
                {locale}
                <ChevronDown size={14} />
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[80px] overflow-hidden"
                  >
                    {['en', 'fr', 'de'].map((l) => (
                      <button
                        key={l}
                        onClick={() => changeLanguage(l)}
                        className={`w-full text-left px-4 py-2 text-sm uppercase hover:bg-slate-50 transition-colors ${locale === l ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">{t('nav.features')}</a>
              <a href="#comparison" className="hover:text-blue-600 transition-colors">{t('nav.difference')}</a>
            </div>
            <div className="flex gap-3">
              <button onClick={onLogin} className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2">{t('nav.logIn')}</button>
              <button
                onClick={onSignup}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-none active:scale-95"
              >
                {t('nav.getStarted')}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden bg-white" >
        {/* Subtle Gradient Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F1F5F9] rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

          {/* Hero Content */}
          <div className="max-w-2xl flex flex-col justify-center h-full">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="w-fit mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F1F5F9] text-blue-600 text-xs font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                {t('hero.systemOnline')}
              </div>
            </motion.div>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.05] mb-6"
            >
              {t('hero.titlePart1')} <br />
              <span className="text-blue-600">{t('hero.titlePart2')}</span>
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg"
            >
              {t('hero.description')}
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
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-8 font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
              >
                <span className="mr-2">{t('hero.startSetup')}</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </button>
              <button
                onClick={() => onNavigate?.('documentation')}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-8 font-semibold text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
              >
                {t('hero.viewDocs')}
              </button>
            </motion.div>

            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mt-10 flex items-center gap-6 text-sm text-slate-500 font-medium"
            >
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-blue-600" /> {t('hero.freeToStart')}</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-blue-600" /> {t('hero.localStorage')}</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-blue-600" /> {t('hero.noTraining')}</span>
            </motion.div>
          </div>

          {/* Hero Visual - Transformation Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <TransformationVisual />
          </motion.div>
        </div>
      </section >

      {/* --- Logos Section --- */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50" >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-400 mb-8 uppercase tracking-widest">{t('integrations.seamlesslyIntegratesWith')}</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['OpenAI', 'Anthropic', 'Mistral AI', 'Meta Llama', 'Cohere'].map((brand) => (
              <span key={brand} className="text-xl font-bold text-slate-800 hover:text-blue-600 cursor-default transition-colors">{brand}</span>
            ))}
          </div>
        </div>
      </section >

      {/* --- 3-Step Onboarding Section --- */}
      <ThreeStepOnboarding onSignup={onSignup} />

      {/* --- Interactive Comparison Section --- */}
      <InteractiveComparison />

      {/* --- Bento Grid Features (Architecture of Identity) --- */}
      <section id="features" className="py-24 px-6 bg-white" >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{t('architecture.architectureTitle')}</h2>
            <p className="text-lg text-slate-600 mb-12">{t('architecture.architectureDescription')}</p>

            {/* The Glass Blueprint Schematic */}
            <SchematicDiagram />
          </div>

          {/* The Feature Grid */}
          <BentoGridFeatures />

        </div>
      </section >

      {/* --- JSON Preview Section ("Under the Hood") --- */}
      <JSONPreviewSection />

      {/* --- Use Cases Section --- */}
      <section className="py-24 px-6 bg-[#F1F5F9] border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">{t('audience.whoIsResonateFor')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Founders */}
            <div className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-blue-600 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <Briefcase size={24} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t('audience.founders')}</h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-auto">
                {t('audience.foundersDescription')}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t('audience.configuration')}</span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 font-mono text-xs text-slate-600 w-full">
                  <span className="text-blue-600">{"{"}</span>
                  <span className="text-purple-600">"tone"</span>:
                  <span className="text-slate-800">"Authoritative"</span>
                  <span className="text-blue-600">{"}"}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Creators */}
            <div className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-blue-600 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <PenTool size={24} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t('audience.creators')}</h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-auto">
                {t('audience.creatorsDescription')}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t('audience.configuration')}</span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 font-mono text-xs text-slate-600 w-full">
                  <span className="text-blue-600">{"{"}</span>
                  <span className="text-purple-600">"style"</span>:
                  <span className="text-slate-800">"Witty"</span>
                  <span className="text-blue-600">{"}"}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Support */}
            <div className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-blue-600 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <Building2 size={24} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t('audience.supportTeams')}</h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-auto">
                {t('audience.supportTeamsDescription')}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t('audience.configuration')}</span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 font-mono text-xs text-slate-600 w-full">
                  <span className="text-blue-600">{"{"}</span>
                  <span className="text-purple-600">"consistency"</span>:
                  <span className="text-slate-800">"100%"</span>
                  <span className="text-blue-600">{"}"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      <footer className="bg-white border-t border-slate-200 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-16">
          {/* Left Side: Brand */}
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <Image src="/Resonate-Logo.png" alt="Resonate Logo" width={48} height={48} className="w-12 h-12 object-contain" />
              <span className="font-bold text-2xl tracking-tight text-blue-600">Resonate</span>
            </div>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              {t('branding.tagline')}
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 w-fit rounded-full bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-700">{t('hero.systemOnline')}</span>
            </div>
          </div>

          {/* Right Side: Product Links */}
          <div className="flex flex-col md:items-end">
            <h3 className="font-bold text-slate-900 text-lg mb-6">{t('nav.product')}</h3>
            <ul className="space-y-4 text-base text-slate-600 flex flex-col md:items-end">
              <li><a href="#features" className="hover:text-blue-600 transition-colors">{t('nav.features')}</a></li>
              <li><a href="#comparison" className="hover:text-blue-600 transition-colors">{t('nav.difference')}</a></li>
              <li><button onClick={() => onNavigate?.('documentation')} className="hover:text-blue-600 transition-colors">{t('nav.documentation')}</button></li>
              <li><button onClick={onSignup} className="hover:text-blue-600 transition-colors">{t('nav.getStarted')}</button></li>
              <li><button onClick={onLogin} className="hover:text-blue-600 transition-colors">{t('nav.logIn')}</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p>2024 Resonate Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <button onClick={() => onNavigate?.('terms')} className="hover:text-blue-500 transition-colors">Terms of Service</button>
              <button onClick={() => onNavigate?.('privacy')} className="hover:text-blue-500 transition-colors">Privacy Policy</button>
            </div>
          </div>
          <div className="flex gap-6">
            <span>{t('branding.madeWithPrecision')}</span>
          </div>
        </div>
      </footer>
    </div >
  );
};
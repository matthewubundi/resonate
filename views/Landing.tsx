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
  ToggleLeft,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import HeroImage from '../assets/Hero.png';
import IntegrationImage from '../assets/Integration.png';
import ArchitectureImage from '../assets/Architecture.png';
import HeroBackground from '../components/HeroBackground';

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

// --- Image Placeholder Component ---
const ImagePlaceholder: React.FC<{
  aspectRatio?: string;
  className?: string;
  alt: string;
  src?: string | { src: string };
  priority?: boolean;
}> = ({ aspectRatio = "aspect-video", className = "", alt, src, priority = false }) => {
  // Extract readable aspect ratio from Tailwind class
  const getAspectRatioLabel = (ratio: string): string => {
    const ratioMap: Record<string, string> = {
      'aspect-video': '16:9',
      'aspect-square': '1:1',
      'aspect-[4/3]': '4:3',
      'aspect-[3/2]': '3:2',
      'aspect-[16/9]': '16:9',
      'aspect-[16/6]': '16:6',
    };
    return ratioMap[ratio] || ratio.replace('aspect-', '').replace(/[\[\]]/g, '').replace(/\//g, ':');
  };

  const aspectRatioLabel = getAspectRatioLabel(aspectRatio);

  // Normalize src - handle both string paths and imported image objects
  const imageSrc = typeof src === 'string' ? src : src?.src;

  // If src is provided, use Next.js Image component
  if (imageSrc) {
    // Filter out shadow and border classes from className when image is present
    const cleanClassName = className
      .replace(/\bshadow-\S+/g, '')
      .replace(/\bborder-\S+/g, '')
      .replace(/\bbg-\S+/g, '')
      .trim()
      .replace(/\s+/g, ' ');

    return (
      <div className={`relative ${aspectRatio} ${cleanClassName} overflow-hidden`}>
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  // Placeholder UI when no src is provided
  return (
    <div className={`relative ${aspectRatio} ${className} rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center group`}>
      <div className="flex flex-col items-center gap-3 text-slate-400 z-10">
        <ImageIcon size={32} className="group-hover:text-slate-500 transition-colors" />
        <span className="text-xs font-medium text-slate-500 px-4 text-center">{alt}</span>
      </div>
      {/* Aspect Ratio Badge */}
      <div className="absolute top-2 right-2 bg-blue-600/90 text-white text-xs font-mono px-2 py-1 rounded backdrop-blur-sm shadow-sm z-20">
        {aspectRatioLabel}
      </div>
      <div className="absolute inset-0 bg-grid-slate-200/50 opacity-30"></div>
    </div>
  );
};

export const Landing: React.FC<{ onLogin: () => void; onSignup: () => void; onNavigate?: (page: string) => void }> = ({ onLogin, onSignup, onNavigate }) => {
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
            <Image src="/Resonate-Logo.png" alt="Resonate Logo" width={36} height={36} className="object-contain" />
            <span className="font-bold text-xl tracking-tight text-blue-600">Resonate</span>
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

        <HeroBackground />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

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
                onClick={() => onNavigate?.('documentation')}
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

          {/* Hero Visual - Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <ImagePlaceholder
              aspectRatio="aspect-[4/3]"
              alt="Identity preservation visualization"
              className="w-full shadow-2xl shadow-blue-900/10"
              src={HeroImage}
              priority
            />
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

      {/* --- 3-Step Onboarding Section --- */}
      <ThreeStepOnboarding onSignup={onSignup} />

      {/* --- Interactive Comparison Section --- */}
      <InteractiveComparison />

      {/* --- Bento Grid Features --- */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Architecture of Identity</h2>
            <p className="text-lg text-slate-600 mb-8">Built for precision, privacy, and performance. Our engine deconstructs your linguistic style and reconstructs it on demand.</p>
            {/* Architecture Diagram Placeholder */}
            <div className="max-w-4xl mx-auto">
              <ImagePlaceholder
                aspectRatio="aspect-[16/9]"
                alt="Architecture diagram showing identity preservation workflow"
                className="w-full rounded-xl"
                src={ArchitectureImage}
              />
            </div>
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
              <div>
                <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                  <Fingerprint size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Digital Fingerprint</h3>
                <p className="text-slate-600 leading-relaxed max-w-md">
                  We don't just "prompt" the AI. We encapsulate your vocabulary, sentence structure, and tone into a portable JSON identity file that acts as a distinct layer between you and the model.
                </p>
              </div>
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

      {/* --- JSON Preview Section ("Under the Hood") --- */}
      <JSONPreviewSection />

      {/* --- Use Cases Section --- */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Who is Resonate for?</h2>
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

      <footer className="bg-white border-t border-slate-200 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-16">
          {/* Left Side: Brand */}
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <Image src="/Resonate-Logo.png" alt="Resonate Logo" width={48} height={48} className="object-contain" />
              <span className="font-bold text-2xl tracking-tight text-blue-600">Resonate</span>
            </div>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              The ultimate identity layer for generative AI. Preserve your linguistic fingerprint and protect your personal brand.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 w-fit rounded-full bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-700">System Online</span>
            </div>
          </div>

          {/* Right Side: Product Links */}
          <div className="flex flex-col md:items-end">
            <h3 className="font-bold text-slate-900 text-lg mb-6">Product</h3>
            <ul className="space-y-4 text-base text-slate-600 flex flex-col md:items-end">
              <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#comparison" className="hover:text-blue-600 transition-colors">The Difference</a></li>
              <li><button onClick={() => onNavigate?.('documentation')} className="hover:text-blue-600 transition-colors">Documentation</button></li>
              <li><button onClick={onSignup} className="hover:text-blue-600 transition-colors">Get Started</button></li>
              <li><button onClick={onLogin} className="hover:text-blue-600 transition-colors">Log In</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© 2024 Resonate Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Made with precision for writers.</span>
          </div>
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
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">The Difference is You</h2>
          <p className="text-slate-600">Toggle Resonate to see the transformation.</p>
        </div>

        {/* Comparison Visual Diagram */}
        <div className="mb-12">
          <ImagePlaceholder
            aspectRatio="aspect-[16/6]"
            alt="Visual comparison diagram showing generic AI vs Resonate transformation"
            className="w-full rounded-2xl"
            src={IntegrationImage}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Output Card */}
          <div className="relative md:col-span-2">
            {/* Toggle inside the container */}
            <div className="flex justify-end mb-4">
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

// --- Sub-Component: Three-Step Onboarding ---
const ThreeStepOnboarding: React.FC<{ onSignup: () => void }> = ({ onSignup }) => {
  const steps = [
    {
      number: 1,
      title: "The Interview",
      description: "Answer 8-12 simple questions about your style, values, and humor.",
      icon: Users,
      color: "blue",
      badgeColor: "bg-blue-600",
      iconBg: "bg-blue-50 text-blue-600",
      visual: null
    },
    {
      number: 2,
      title: "The Extraction",
      description: "Our engine creates your unique identity_json file—a portable digital fingerprint.",
      icon: Cpu,
      color: "purple",
      badgeColor: "bg-purple-600",
      iconBg: "bg-purple-50 text-purple-600",
      visual: null
    },
    {
      number: 3,
      title: "The Filter",
      description: "Paste text anywhere. We rewrite it instantly to match your voice, with automated scoring.",
      icon: Sparkles,
      color: "orange",
      badgeColor: "bg-orange-500",
      iconBg: "bg-orange-50 text-orange-600",
      visual: (
        <div className="mt-8 bg-white rounded-xl p-4 border border-slate-100 shadow-lg relative overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-50 to-transparent opacity-50 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="flex justify-between items-center mb-3 relative z-10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence Score</span>
            <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
              <CheckCircle2 size={10} className="text-green-600" />
              <span className="text-xs font-bold text-green-700">9.2/10 Match</span>
            </div>
          </div>
          <div className="space-y-2 relative z-10">
            <div className="flex gap-2 items-center">
              <div className="h-2 w-2 rounded-full bg-slate-200 shrink-0"></div>
              <div className="h-2 bg-slate-100 rounded-full w-3/4"></div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="h-2 w-2 rounded-full bg-slate-200 shrink-0"></div>
              <div className="h-2 bg-slate-100 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-32 px-6 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 font-display tracking-tight">
              Get Started in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">3 Simple Steps</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              No complex coding. No lengthy setup. Just answer a few questions and you're ready to preserve your identity.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[180px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-100 via-purple-100 to-orange-100 z-0"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative z-10"
              >
                <div className="group h-full">
                  {/* Card Container */}
                  <div className="h-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-100 transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center">

                    {/* Number Badge */}
                    <div className={`absolute top-6 right-6 w-10 h-10 rounded-full ${step.badgeColor} flex items-center justify-center text-white font-bold shadow-md`}>
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className={`h-20 w-20 rounded-3xl ${step.iconBg} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                      <Icon size={36} strokeWidth={1.5} />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed mb-6">{step.description}</p>

                    {/* Visual */}
                    {step.visual && (
                      <div className="w-full mt-auto">
                        {step.visual}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-slate-500 mb-8 font-medium">Ready to preserve your unique voice?</p>
          <button
            onClick={onSignup}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95"
          >
            <span>Start Your Interview</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// --- Sub-Component: JSON Preview Section ---
const JSONPreviewSection = () => {
  return (
    <section className="py-24 px-6 bg-slate-900 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-40 z-0"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Code2 size={14} />
            Under the Hood
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Your Identity, <span className="text-blue-500">Structured.</span>
          </h2>
          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            You own the data. Edit your rules, banned words, and tone anytime. We believe in radical transparency—no black box magic, just your rules applied perfectly.
          </p>

          {/* Feature list key points */}
          <div className="space-y-4">
            {[
              "Full JSON portability",
              "Edit via UI or direct code",
              "Version control your persona"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-slate-300 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code Block Visual */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>

          <div className="relative bg-[#1e1e1e] rounded-xl border border-white/10 shadow-2xl overflow-hidden font-mono text-sm leading-relaxed">
            {/* Header */}
            <div className="flex items-center px-4 py-3 bg-[#2d2d2d] border-b border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">JSON</span>
            </div>

            {/* Code Content */}
            <div className="p-8 overflow-x-auto text-slate-300">
              <pre className="leading-loose">
                <code>
                  {`{`}
                  <span className="text-orange-400">"tone"</span>: <span className="text-green-400">"Empathetic but direct"</span>,
                  <span className="text-orange-400">"vocabulary"</span>: {`{`}
                  <span className="text-orange-400">"avoid"</span>: [<span className="text-green-400">"synergy"</span>, <span className="text-green-400">"leverage"</span>],
                  <span className="text-orange-400">"prefer"</span>: [<span className="text-green-400">"help"</span>, <span className="text-green-400">"use"</span>]
                  {`}`},
                  <span className="text-orange-400">"values"</span>: [<span className="text-green-400">"transparency"</span>, <span className="text-green-400">"brevity"</span>]
                  {`}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
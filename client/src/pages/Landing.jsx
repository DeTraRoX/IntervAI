import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Mic, FileCode, CheckCircle2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="flex flex-col gap-16 py-12 md:py-20 relative">
      {/* Decorative background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <motion.div 
        className="text-center flex flex-col items-center gap-6 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm shadow-inner shadow-blue-500/5">
          <Sparkles size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
          <span>Next-Generation Career Preparation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Master Your Next Tech Interview with <span className="text-gradient">IntervAI</span>
        </h1>
        
        <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
          Simulate realistic technical, coding, behavioral, and HR interview chambers. Upload your resume to extract personalized AI-curated questions, speak naturally with real-time text-to-speech, write functional code in Monaco, and download detailed performance reports.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <Link
            to="/register"
            className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/30 active:scale-95 transition-all group"
          >
            <span>Start Mock Interview</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-4 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
          >
            Already registered? Sign in
          </Link>
        </div>
      </motion.div>

      {/* Highlights Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <GlassCard className="h-full flex flex-col gap-4 border border-white/5 hover:border-blue-500/20 hover:shadow-blue-500/5 hover:-translate-y-1 transition-all">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit">
              <Cpu size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">AI Resume Scanner</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Upload your PDF resume to extract skills, project stacks, and professional history. Our algorithm automatically tailors interview queries to your specific credentials.
            </p>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard className="h-full flex flex-col gap-4 border border-white/5 hover:border-purple-500/20 hover:shadow-purple-500/5 hover:-translate-y-1 transition-all">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit">
              <Mic size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Voice & Audio AI</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Experience realistic face-to-face setups. The AI recruiter verbalizes the prompts out loud, and captures your responses using browser-native Speech-to-Text inputs.
            </p>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard className="h-full flex flex-col gap-4 border border-white/5 hover:border-cyan-500/20 hover:shadow-cyan-500/5 hover:-translate-y-1 transition-all">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit">
              <FileCode size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Monaco Coding Lab</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Solve complex syntax puzzles inside VS Code's editor. Execute code snippets on-the-fly and fetch immediate suggestions regarding performance optimizations.
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Detail Showcase */}
      <motion.div
        className="flex flex-col md:flex-row items-center gap-12 mt-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex-1 flex flex-col gap-5">
          <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
            Realistic Performance Reports & Metric Dashboards
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Upon completing a mock session, IntervAI aggregates detailed analysis indicators. We analyze your technical concepts, structure delivery, confidence pacing, and code completeness to pinpoint strengths and areas of growth.
          </p>
          
          <ul className="flex flex-col gap-3">
            {[
              "Radar metric scoring (Technical, Communication, Confidence)",
              "Highlight checks for strong logical deductions",
              "Actionable study suggestions and roadmap structures",
              "Downloadable PDF resumes of interview transcripts"
            ].map((text, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-blue-400" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl filter blur-3xl opacity-20" />
          <GlassCard className="border border-white/10 shadow-2xl relative overflow-hidden bg-slate-900/40">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-gray-400 font-mono">intervai-analytics-engine</span>
            </div>

            <div className="flex flex-col gap-4 font-mono text-[11px] text-gray-300">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-400">Technical Score</span>
                <span className="text-blue-400 font-bold">8.5 / 10</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-400">Communication Rating</span>
                <span className="text-violet-400 font-bold">9.0 / 10</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-400">Problem Solving Metric</span>
                <span className="text-cyan-400 font-bold">8.0 / 10</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-400">Overall Grade</span>
                <span className="text-green-400 font-bold">85% (Excellent)</span>
              </div>
              
              <div className="mt-2 p-3 bg-white/5 border border-white/5 rounded-xl text-left">
                <span className="text-yellow-400 font-bold block mb-1">✓ Key Strength</span>
                <span className="text-xs text-gray-300 leading-normal">Strong explanation of closures and hooks. Communicates state loops effectively.</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;

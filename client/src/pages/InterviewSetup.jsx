import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interviewStore';
import { Terminal, Users, BrainCircuit, Code2, AlertTriangle, Sparkles, Loader } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const InterviewSetup = () => {
  const [role, setRole] = useState('Frontend Developer');
  const [type, setType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const { createInterview, error, loading } = useInterviewStore();
  const navigate = useNavigate();

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Software Engineer',
    'Data Analyst'
  ];

  const types = [
    { name: 'Technical', icon: <Terminal size={18} />, desc: 'Core engineering concepts, frameworks, and architecture' },
    { name: 'Coding', icon: <Code2 size={18} />, desc: 'Live Monaco coding environment with automatic test cases run' },
    { name: 'Behavioral', icon: <BrainCircuit size={18} />, desc: 'STAR technique prompts, situation handling, and culture' },
    { name: 'HR', icon: <Users size={18} />, desc: 'Career motivations, soft skills, alignment, and salary' }
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleStart = async () => {
    const session = await createInterview(role, type, difficulty);
    if (session) {
      navigate('/room');
    }
  };

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto relative">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <span>Configure Interview Room</span>
        </h1>
        <p className="text-sm text-gray-400">Initialize parameters. Our model will curate specific prompts for you.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Step 1: Select Job Role */}
        <GlassCard className="border border-white/5 flex flex-col gap-4">
          <span className="text-sm font-semibold text-blue-400 flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Step 1: Choose Target Position</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-3 text-xs rounded-xl border text-center transition-all font-semibold active:scale-95 ${
                  role === r
                    ? 'border-blue-500 bg-blue-500/10 text-white shadow-md shadow-blue-500/5'
                    : 'border-white/5 bg-slate-950/40 text-gray-400 hover:text-white hover:border-white/15'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Step 2: Select Interview Type */}
        <div className="flex flex-col gap-4">
          <span className="text-sm font-semibold text-purple-400 flex items-center gap-1.5 px-1">
            <Sparkles size={14} />
            <span>Step 2: Choose Interview Focus</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {types.map((t) => (
              <button
                key={t.name}
                onClick={() => setType(t.name)}
                className={`p-4 text-left rounded-2xl border transition-all flex items-start gap-4 active:scale-[0.98] ${
                  type === t.name
                    ? 'border-purple-500 bg-purple-500/10 text-white shadow-md shadow-purple-500/5'
                    : 'border-white/5 bg-slate-950/40 text-gray-400 hover:text-white hover:border-white/10'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${type === t.name ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-500'}`}>
                  {t.icon}
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className={`text-sm font-bold ${type === t.name ? 'text-white' : 'text-gray-300'}`}>{t.name} Interview</span>
                  <span className="text-xs text-gray-400 leading-normal">{t.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Select Difficulty */}
        <GlassCard className="border border-white/5 flex flex-col gap-4">
          <span className="text-sm font-semibold text-cyan-400 flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Step 3: Choose Level of Difficulty</span>
          </span>
          <div className="grid grid-cols-3 gap-4">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`py-3.5 text-xs rounded-xl border text-center transition-all font-bold active:scale-95 ${
                  difficulty === diff
                    ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-md shadow-cyan-500/5'
                    : 'border-white/5 bg-slate-950/40 text-gray-400 hover:text-white hover:border-white/15'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Submit */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/10 active:scale-95 text-base flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader size={18} className="animate-spin" />
              <span>Generating AI interview deck...</span>
            </>
          ) : (
            <span>Launch Mock Interview Room</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default InterviewSetup;

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInterviewStore } from '../store/interviewStore';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Calendar, BookOpen, Clock, FileText, ChevronRight, Award, PlusCircle, CheckCircle2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Dashboard = () => {
  const { fetchHistory, history, loading } = useInterviewStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchHistory();
  }, []);

  const getHighestScore = () => {
    if (history.length === 0) return 0;
    const scores = history.map(item => item.scores?.overall || 0);
    return Math.max(...scores);
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Beginner': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Advanced': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <span>Dashboard</span>
          </h1>
          <p className="text-sm text-gray-400">Track your interview preparation statistics and history</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/resume"
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold text-gray-300 hover:text-white glass-panel border-white/10 hover:border-white/20 rounded-xl transition-all"
          >
            <FileText size={14} />
            <span>Manage Resume</span>
          </Link>
          <Link
            to="/setup"
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg active:scale-95 transition-all shadow-md shadow-blue-500/10"
          >
            <PlusCircle size={14} />
            <span>New Interview</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Interviews Completed</span>
            <h3 className="text-2xl font-bold text-white mt-0.5">{history.length}</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Highest Score</span>
            <h3 className="text-2xl font-bold text-white mt-0.5">{getHighestScore()}%</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Target Readiness</span>
            <h3 className="text-2xl font-bold text-white mt-0.5">
              {history.length > 0 ? `${Math.min(100, 50 + history.length * 10)}%` : '0%'}
            </h3>
          </div>
        </GlassCard>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Interview History */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <h2 className="text-xl font-bold text-white">Interview History</h2>
          
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 glass-panel rounded-2xl border border-white/5">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Loading history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 glass-panel rounded-2xl border border-white/5 px-6 text-center">
              <div className="p-4 bg-white/5 text-gray-400 rounded-full">
                <Clock size={32} />
              </div>
              <h3 className="text-base font-bold text-white">No interviews completed yet</h3>
              <p className="text-xs text-gray-400 max-w-sm">Setup your interview params and test your skills with our interactive AI Recruiter.</p>
              <Link
                to="/setup"
                className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all"
              >
                Create Mock Interview
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {history.map((session) => (
                <div 
                  key={session._id}
                  className="glass-panel border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{session.role}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(session.difficulty)}`}>
                        {session.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{session.type} Interview</span>
                      <span className="text-gray-600">•</span>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400">Score</span>
                      <span className="text-lg font-extrabold text-blue-400">{session.scores?.overall || 0}%</span>
                    </div>
                    <Link
                      to={`/report/${session._id}`}
                      className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all"
                      title="View Report"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: Tips / Action checklist */}
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-white">Preparation Checklist</h2>
          <GlassCard className="flex flex-col gap-4 border border-white/5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 text-sm">
                <input type="checkbox" defaultChecked disabled className="mt-1 rounded border-white/10 bg-slate-950 accent-blue-500" />
                <div>
                  <span className="font-semibold text-white block">Create account</span>
                  <span className="text-xs text-gray-400">Registration completed successfully.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <input type="checkbox" defaultChecked={history.length > 0} disabled className="mt-1 rounded border-white/10 bg-slate-950 accent-blue-500" />
                <div>
                  <span className="font-semibold text-white block">Analyze your resume</span>
                  <span className="text-xs text-gray-400">Upload a PDF to extract your details.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <input type="checkbox" defaultChecked={history.length > 0} disabled className="mt-1 rounded border-white/10 bg-slate-950 accent-blue-500" />
                <div>
                  <span className="font-semibold text-white block">Complete mock interview</span>
                  <span className="text-xs text-gray-400">Finish at least one session to get scored.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <input type="checkbox" defaultChecked={getHighestScore() >= 80} disabled className="mt-1 rounded border-white/10 bg-slate-950 accent-blue-500" />
                <div>
                  <span className="font-semibold text-white block">Score above 80%</span>
                  <span className="text-xs text-gray-400">Refine communication and code quality.</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-left">
              <span className="text-xs font-bold text-blue-400 block mb-1">💡 Interview Pro Tip</span>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                When using Voice interview room, speak clearly. Try explaining the Big-O complexities of your solutions out loud.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

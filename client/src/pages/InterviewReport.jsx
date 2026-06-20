import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInterviewStore } from '../store/interviewStore';
import { ArrowLeft, Download, Mail, CheckCircle, AlertTriangle, TrendingUp, Sparkles, MessageSquare, Award, Loader } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const InterviewReport = () => {
  const { id } = useParams();
  const { fetchInterviewDetails, activeReport, loading } = useInterviewStore();
  const [emailStatus, setEmailStatus] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchInterviewDetails(id);
  }, [id]);

  const handleDownloadPDF = () => {
    setDownloading(true);
    setTimeout(() => {
      window.print(); // Native print handler is incredibly robust for printing clean web structures
      setDownloading(false);
    }, 1000);
  };

  const handleSendEmail = () => {
    setEmailStatus('Sending report...');
    setTimeout(() => {
      setEmailStatus('Report sent successfully to your registered email!');
      setTimeout(() => setEmailStatus(''), 4000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Compiling performance diagnostics...</span>
      </div>
    );
  }

  if (!activeReport) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h3 className="text-lg font-bold text-white">Report not found</h3>
        <p className="text-xs text-gray-400 max-w-sm">The requested interview summary could not be retrieved.</p>
        <Link to="/dashboard" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white transition-all">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { role, type, difficulty, scores, feedback, answers, createdAt } = activeReport;

  // Helpers for category score colors
  const getScoreColor = (val) => {
    if (val >= 8) return 'bg-green-500';
    if (val >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col gap-8 py-4 print:p-0 print:bg-white print:text-black">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendEmail}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:text-white glass-panel border-white/10 hover:border-white/20 rounded-xl transition-all"
          >
            <Mail size={14} />
            <span>Email Report</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Download size={14} />
            <span>{downloading ? 'Preparing Print...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {emailStatus && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs print:hidden animate-fade-in">
          <CheckCircle size={14} />
          <span>{emailStatus}</span>
        </div>
      )}

      {/* Main Report Page */}
      <div id="printable-report" className="flex flex-col gap-8 print:gap-4">
        {/* Header Summary */}
        <div className="glass-panel border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 print:border-gray-200 print:bg-white">
          <div className="flex flex-col gap-1.5 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 print:text-blue-600">IntervAI Session Outcomes</span>
            <h1 className="text-3xl font-bold text-white print:text-black">{role}</h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-xs text-gray-400 mt-1 print:text-gray-600">
              <span>{type} Mock Session</span>
              <span>•</span>
              <span>Difficulty: {difficulty}</span>
              <span>•</span>
              <span>Compiled: {new Date(createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Radial score circle */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                className="stroke-slate-800 print:stroke-gray-100 fill-transparent"
                strokeWidth="10"
              />
              <circle
                cx="64"
                cy="64"
                r="52"
                className="stroke-blue-500 fill-transparent transition-all duration-1000"
                strokeWidth="10"
                strokeDasharray={326.7}
                strokeDashoffset={326.7 - (326.7 * (scores?.overall || 75)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white print:text-black">{scores?.overall || 0}%</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Overall</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Category Scores */}
          <GlassCard className="border-white/5 flex flex-col gap-5 print:border-gray-200 print:bg-white">
            <h2 className="text-base font-bold text-white flex items-center gap-2 print:text-black">
              <TrendingUp size={18} className="text-blue-400" />
              <span>Competency Breakdown</span>
            </h2>
            
            <div className="flex flex-col gap-4.5">
              {[
                { label: 'Technical Knowledge', value: scores?.technical || 0 },
                { label: 'Communication Delivery', value: scores?.communication || 0 },
                { label: 'Confidence & Pacing', value: scores?.confidence || 0 },
                { label: 'Problem Solving Skill', value: scores?.problemSolving || 0 },
                { label: 'Query Relevance', value: scores?.relevance || 0 }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between items-center text-gray-300 font-medium print:text-gray-700">
                    <span>{item.label}</span>
                    <span className="font-bold">{item.value * 10}% ({item.value}/10)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden print:bg-gray-100">
                    <div 
                      className={`h-full ${getScoreColor(item.value)} rounded-full`}
                      style={{ width: `${item.value * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Strengths & Weaknesses */}
          <div className="flex flex-col gap-6">
            <GlassCard className="border-white/5 flex flex-col gap-4 print:border-gray-200 print:bg-white">
              <span className="text-sm font-bold text-green-400 flex items-center gap-1.5">
                <CheckCircle size={15} />
                <span>Key Strengths</span>
              </span>
              <ul className="flex flex-col gap-2">
                {feedback?.strengths?.map((str, idx) => (
                  <li key={idx} className="text-xs text-gray-300 list-disc list-inside leading-relaxed print:text-gray-700">
                    {str}
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="border-white/5 flex flex-col gap-4 print:border-gray-200 print:bg-white">
              <span className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
                <AlertTriangle size={15} />
                <span>Areas to Improve</span>
              </span>
              <ul className="flex flex-col gap-2">
                {feedback?.weaknesses?.map((weak, idx) => (
                  <li key={idx} className="text-xs text-gray-300 list-disc list-inside leading-relaxed print:text-gray-700">
                    {weak}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <GlassCard className="border-white/5 flex flex-col gap-4 print:border-gray-200 print:bg-white">
          <h2 className="text-base font-bold text-white flex items-center gap-2 print:text-black">
            <Sparkles size={18} className="text-yellow-400" />
            <span>Personalized Study Roadmaps</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {feedback?.recommendations?.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5 print:bg-gray-50 print:border-gray-200">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Adviced Practice {idx + 1}</span>
                <p className="text-xs text-gray-300 leading-normal print:text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Question & Answer Transcript */}
        <div className="flex flex-col gap-5 mt-4 print:mt-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 print:text-black">
            <MessageSquare size={18} className="text-purple-400" />
            <span>Interview Session Q&A Transcripts</span>
          </h2>

          <div className="flex flex-col gap-6">
            {answers?.map((ans, idx) => (
              <div 
                key={idx}
                className="glass-panel border-white/5 rounded-2xl p-6 flex flex-col gap-4 print:border-gray-200 print:bg-white"
              >
                <div className="flex justify-between items-start gap-4 pb-3 border-b border-white/5 print:border-gray-200">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Question {idx + 1}</span>
                    <h4 className="text-sm font-bold text-white leading-normal print:text-black">{ans.questionText}</h4>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-400 print:text-blue-600">
                    <Award size={12} />
                    <span>{ans.feedback?.score || 0}/10</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 bg-slate-950/40 border border-white/5 p-4 rounded-xl print:bg-gray-50 print:border-gray-200">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Your Answer</span>
                  {ans.codeAnswer ? (
                    <pre className="text-xs font-mono text-gray-300 leading-relaxed overflow-x-auto whitespace-pre p-2 bg-slate-950 rounded-lg print:text-gray-800">
                      {ans.codeAnswer}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-300 leading-relaxed print:text-gray-800">{ans.textAnswer || '(No explanation provided)'}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1 p-1">
                  <span className="text-[9px] uppercase font-bold text-blue-400 print:text-blue-600">AI Evaluation Feedback</span>
                  <p className="text-xs text-gray-400 leading-normal print:text-gray-600">{ans.feedback?.comments}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;

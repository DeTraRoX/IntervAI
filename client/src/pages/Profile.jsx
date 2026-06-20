import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, ShieldAlert, Sparkles, Sliders, CheckCircle, Volume2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Profile = () => {
  const { user } = useAuthStore();
  
  // Custom mock preferences for profile
  const [personality, setPersonality] = useState('Professional Recruiter');
  const [emailNotify, setEmailNotify] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  const personalities = [
    { name: 'Professional Recruiter', desc: 'Standard recruiter focusing on clean execution and structured STAR answers.' },
    { name: 'Tough CTO', desc: 'Skeptical technical officer demanding deep performance analysis and optimized code architectures.' },
    { name: 'Friendly Peer', desc: 'Encouraging engineer partner focused on collaborative code review and core concepts.' }
  ];

  const handleSavePreferences = () => {
    setSaveStatus('Saving changes...');
    setTimeout(() => {
      setSaveStatus('Preferences saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto relative">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <span>Profile & Preferences</span>
        </h1>
        <p className="text-sm text-gray-400">Manage your credentials, AI interviewer voice settings, and notifications</p>
      </div>

      {saveStatus && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs animate-fade-in">
          <CheckCircle size={14} />
          <span>{saveStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Account Details (1 Col) */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <GlassCard className="border border-white/5 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-bold text-white">{user?.name}</span>
              <span className="text-xs text-gray-400">{user?.email}</span>
            </div>
            
            <div className="w-full h-px bg-white/5 mt-2" />
            
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
              Member Since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'June 2026'}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Preferences Config (2 Cols) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Interviewer Personality */}
          <GlassCard className="border border-white/5 flex flex-col gap-5">
            <span className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
              <Sliders size={16} />
              <span>Interviewer Personality Settings</span>
            </span>

            <div className="flex flex-col gap-3">
              {personalities.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPersonality(p.name)}
                  className={`p-4 text-left rounded-xl border transition-all flex flex-col gap-1 active:scale-[0.99] ${
                    personality === p.name
                      ? 'border-blue-500 bg-blue-500/10 text-white shadow-md'
                      : 'border-white/5 bg-slate-950/40 text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <span className={`text-xs font-bold ${personality === p.name ? 'text-white' : 'text-gray-300'}`}>{p.name}</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Email / Delivery settings */}
          <GlassCard className="border border-white/5 flex flex-col gap-5">
            <span className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
              <Volume2 size={16} />
              <span>Notification & Audio delivery</span>
            </span>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-white">Email Report Delivery</span>
                  <span className="text-[10px] text-gray-400">Receive comprehensive PDF summaries inside your inbox immediately.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotify}
                  onChange={(e) => setEmailNotify(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-slate-950 accent-blue-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="w-full h-px bg-white/5" />

              <button
                onClick={handleSavePreferences}
                className="py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-blue-500/10"
              >
                Save Preferences
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React from 'react';

const VoiceWaveform = ({ isSpeaking = false, isRecording = false }) => {
  const getThemeClass = () => {
    if (isSpeaking) return 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]';
    if (isRecording) return 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
    return 'bg-slate-700';
  };

  return (
    <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-[200px] mx-auto px-4 py-2 border border-white/5 rounded-2xl bg-slate-950/40 relative">
      {/* Equalizer Visual bars */}
      {[...Array(9)].map((_, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${
            isSpeaking || isRecording ? 'wave-bar' : 'h-2'
          } ${getThemeClass()}`}
          style={{
            height: isSpeaking || isRecording ? `${Math.max(10, Math.floor(Math.random() * 95))}%` : '6px',
            animationDuration: isSpeaking ? '0.8s' : '0.5s',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
      
      {/* Absolute status pill */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider glass-panel border-white/10 text-gray-300">
        {isSpeaking ? (
          <span className="text-cyan-400 animate-pulse">AI Speaking</span>
        ) : isRecording ? (
          <span className="text-purple-400 animate-pulse">Listening...</span>
        ) : (
          <span className="text-gray-500">Standby</span>
        )}
      </div>
    </div>
  );
};

export default VoiceWaveform;

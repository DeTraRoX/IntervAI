import React from 'react';

const GlassCard = ({ children, className = '' }) => {
  return (
    <div className={`glass-panel rounded-2xl p-6 shadow-2xl relative border border-white/5 bg-slate-900/60 backdrop-blur-xl ${className}`}>
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;

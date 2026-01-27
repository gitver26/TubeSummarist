
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="relative z-10 py-8 text-center">
      <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full glass-morphism text-sm font-medium text-indigo-400">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
        Powered by Gemini 3 Flash
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
        TubeSummarist <span className="text-indigo-500">Pro</span>
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-slate-400 font-light px-4">
        Extract the essence of any YouTube video in seconds. Get precise summaries 
        and automatic PDF how-to guides for your learning journey.
      </p>
    </header>
  );
};

export default Header;

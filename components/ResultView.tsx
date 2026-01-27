
import React from 'react';
import { VideoInsight } from '../types';
import { downloadHowToPdf } from '../utils/pdfGenerator';

interface ResultViewProps {
  insight: VideoInsight;
}

const ResultView: React.FC<ResultViewProps> = ({ insight }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Card */}
      <div className="glass-morphism rounded-3xl p-8 border border-indigo-500/20 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <svg className="w-32 h-32 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
             <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/>
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <span className="p-2 bg-indigo-500/20 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          Insight Summary
        </h2>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-200 leading-relaxed font-light">
            {insight.summary}
          </p>
        </div>

        {insight.sourceUrls && insight.sourceUrls.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Sources Grounding</h4>
            <div className="flex flex-wrap gap-2">
              {insight.sourceUrls.map((url, i) => (
                <a 
                  key={i} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-slate-800 rounded-full text-xs text-indigo-400 hover:bg-slate-700 transition-colors"
                >
                  {new URL(url).hostname}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* How-To Card (Conditional) */}
      {insight.isHowTo && insight.howToSteps && (
        <div className="glass-morphism rounded-3xl p-8 border border-purple-500/20 shadow-2xl relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <span className="p-2 bg-purple-500/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
              Instructional Guide
            </h2>
            <button
              onClick={() => downloadHowToPdf(insight)}
              className="group relative flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 shadow-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF Guide
            </button>
          </div>

          <div className="grid gap-6">
            {insight.howToSteps.map((step, idx) => (
              <div key={idx} className="flex gap-6 p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 transition-colors border border-slate-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{step.step}</h3>
                  <p className="text-slate-400 leading-relaxed font-light">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultView;

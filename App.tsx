
import React, { useState } from 'react';
import Header from './components/Header';
import VideoInput from './components/VideoInput';
import ResultView from './components/ResultView';
import { generateVideoInsights } from './services/geminiService';
import { VideoInsight, AppStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [insight, setInsight] = useState<VideoInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcessVideo = async (url: string) => {
    setStatus(AppStatus.LOADING);
    setError(null);
    try {
      const result = await generateVideoInsights(url);
      setInsight(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while processing the video.");
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] selection:bg-indigo-500/30">
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <Header />
        
        <VideoInput 
          onProcess={handleProcessVideo} 
          isLoading={status === AppStatus.LOADING} 
        />

        {status === AppStatus.ERROR && (
          <div className="max-w-xl mx-auto px-4 mb-12">
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center animate-bounce">
              <p className="font-semibold mb-2">Oops! Something went wrong</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {status === AppStatus.SUCCESS && insight && (
          <ResultView insight={insight} />
        )}

        {status === AppStatus.IDLE && (
          <div className="max-w-2xl mx-auto px-4 text-center mt-20 opacity-40">
            <div className="flex justify-center gap-12 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2">1</div>
                <span className="text-sm">Paste Link</span>
              </div>
              <div className="w-12 h-px bg-slate-800 self-center"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2">2</div>
                <span className="text-sm">AI Analyzes</span>
              </div>
              <div className="w-12 h-px bg-slate-800 self-center"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2">3</div>
                <span className="text-sm">Get PDF Guide</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

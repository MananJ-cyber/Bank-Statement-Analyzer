import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import TransactionTable from './components/TransactionTable';
import AnalysisDashboard from './components/AnalysisDashboard';
import { analyzeBankStatement } from './services/geminiService';
import { AnalysisResult, AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processedFilesCount, setProcessedFilesCount] = useState<number>(0);

  const handleFilesSelected = async (files: File[]) => {
    setAppState(AppState.PROCESSING);
    setError(null);
    setProcessedFilesCount(files.length);

    try {
      const data = await analyzeBankStatement(files);
      setResult(data);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              StatementSense AI
            </h1>
          </div>
          {appState === AppState.SUCCESS && (
            <button 
              onClick={resetApp}
              className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Analyze New Statement
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Section - Only show when IDLE */}
        {appState === AppState.IDLE && (
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Turn Bank Statements into Insights
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Upload images or PDF documents of your bank statements. Our AI extracts every transaction 
              and provides instant financial analysis.
            </p>
            <FileUpload onFilesSelected={handleFilesSelected} />
          </div>
        )}

        {/* Processing State */}
        {appState === AppState.PROCESSING && (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Analyzing Documents...</h3>
            <p className="text-slate-500">Processing {processedFilesCount} file(s) with Gemini 2.5 Flash</p>
            <div className="mt-8 max-w-sm w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
               <div className="bg-indigo-600 h-1.5 rounded-full animate-progress w-full origin-left"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto mt-12 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={resetApp}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success State - Results */}
        {appState === AppState.SUCCESS && result && (
          <div className="space-y-8 animate-fade-in-up">
            <AnalysisDashboard insights={result.insights} />
            
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 px-1">Extracted Transactions</h2>
              <TransactionTable transactions={result.transactions} />
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
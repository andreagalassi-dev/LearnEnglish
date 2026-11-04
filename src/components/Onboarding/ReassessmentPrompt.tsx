import React from 'react';
import { RefreshCw, X } from 'lucide-react';

interface ReassessmentPromptProps {
  onStart: () => void;
  onDecline: () => void;
}

const ReassessmentPrompt: React.FC<ReassessmentPromptProps> = ({ onStart, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onDecline}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Level Up?</h2>
          <p className="text-gray-600 mb-6">
            You've been practicing for a while! Do you feel ready to take a quick test to adjust your difficulty level?
          </p>

          <div className="flex space-x-3 w-full">
            <button
              onClick={onDecline}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              Not Now
            </button>
            <button
              onClick={onStart}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReassessmentPrompt;

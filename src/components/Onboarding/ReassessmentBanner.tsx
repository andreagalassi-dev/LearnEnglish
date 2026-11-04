import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

const ReassessmentBanner: React.FC = () => {
  const { resetAssessment, launchCount } = useUserStore();
  const [isVisible, setIsVisible] = React.useState(true);

  // Show only if launchCount is a multiple of 30 and greater than 0
  const shouldShow = launchCount > 0 && launchCount % 30 === 0;

  if (!shouldShow || !isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 shadow-lg animate-slide-down">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin-slow" />
          <div>
            <p className="font-bold text-lg">Ready for the next level?</p>
            <p className="text-blue-100 text-sm">You've practiced 30 times! Do you want to retake the assessment?</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={resetAssessment}
            className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-sm"
          >
            Yes, Retake Test
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassessmentBanner;

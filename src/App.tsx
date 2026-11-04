import { useEffect, useRef, useState } from 'react';
import { useUserStore } from './store/userStore';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { useProgressStore } from './store/progressStore';
import { dataApi } from './services/api';
import InitialAssessment from './components/Onboarding/InitialAssessment';
import ChatArea from './components/Chat/ChatArea';
import Sidebar from './components/Sidebar/Sidebar';
import ReassessmentBanner from './components/Onboarding/ReassessmentBanner';
import AuthPage from './components/Auth/AuthPage';
import ReassessmentPrompt from './components/Onboarding/ReassessmentPrompt';
import AdminDashboard from './components/Admin/AdminDashboard';

import { useThemeStore } from './store/themeStore';

// Debounce helper
const debounce = <T extends (...args: unknown[]) => void>(func: T, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

function App() {
  const { hasCompletedAssessment, incrementLaunchCount, proficiencyLevel, setUserState, launchCount, resetAssessment } = useUserStore();
  const { isAuthenticated, user, fetchUser } = useAuthStore();
  const { messages, setMessages, resetChat } = useChatStore();
  const { mistakes, activeVocabulary, grammarAccuracy, dailyStats, setProgress, updateDailyTime, checkDailyReset, clearHistory } = useProgressStore();
  const { theme } = useThemeStore();
  
  const [showReassessmentPrompt, setShowReassessmentPrompt] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load data on login
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch user profile if missing
      if (!user) {
        fetchUser();
      }

      const loadData = async () => {
        try {
          const data = await dataApi.getData();
          if (data) {
            if (data.chat) setMessages(data.chat);
            if (data.progress) setProgress(data.progress);
            if (data.user) setUserState(data.user);
          } else {
            // New user or no data saved: Explicitly RESET everything to ensure no data leakage from previous user
            console.log('No data found for user, resetting state to defaults');
            resetAssessment();
            resetChat();
            clearHistory();
          }
        } catch (error) {
          console.error("Failed to load data", error);
          // If 401, interceptor handles logout, so isAuthenticated becomes false.
        } finally {
          setIsDataLoaded(true);
        }
      };
      loadData();
    } else {
      // User logged out: Clear all data from memory
      resetAssessment();
      resetChat();
      clearHistory();
      
      // If not authenticated, we don't need to load data, so we can say data is "loaded" (or rather, we are ready to render AuthPage)
      setIsDataLoaded(true); 
    }
  }, [isAuthenticated, user, fetchUser, setMessages, setProgress, setUserState, resetAssessment, resetChat, clearHistory]);

  // Check for daily reset on load and periodically
  useEffect(() => {
    if (isDataLoaded) {
      checkDailyReset();
    }
  }, [isDataLoaded, checkDailyReset]);

  // Track time spent
  useEffect(() => {
    if (isAuthenticated && isDataLoaded) {
      const interval = setInterval(() => {
        updateDailyTime(10); // Update every 10 seconds
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isDataLoaded, updateDailyTime]);

  // Check for reassessment trigger
  useEffect(() => {
    if (isDataLoaded && hasCompletedAssessment && launchCount > 0 && launchCount % 30 === 0) {
      // Only show if we haven't already shown it this session (simplified logic: rely on user action to close)
      // Ideally we'd track 'hasDeclined' in a session state, but for now let's just show it.
      // To prevent loop, we can check if we are already showing it.
      setShowReassessmentPrompt(true);
    }
  }, [launchCount, hasCompletedAssessment, isDataLoaded]);

  // Save data on changes (debounced)
  const saveDataRef = useRef<(data: unknown) => void>(undefined);
  useEffect(() => {
    saveDataRef.current = debounce(async (currentData: unknown) => {
      if (!isAuthenticated) return;
      try {
        await dataApi.saveData(currentData);
        console.log('Data saved successfully');
      } catch (error) {
        console.error('Failed to save data', error);
      }
    }, 2000);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && isDataLoaded) {
      const currentData = {
        chat: messages,
        progress: { mistakes, activeVocabulary, grammarAccuracy, dailyStats },
        user: { proficiencyLevel, hasCompletedAssessment, launchCount } 
      };
      saveDataRef.current?.(currentData);
    }
  }, [messages, mistakes, activeVocabulary, grammarAccuracy, dailyStats, proficiencyLevel, hasCompletedAssessment, launchCount, isAuthenticated, isDataLoaded]);

  useEffect(() => {
    if (isAuthenticated) {
      incrementLaunchCount();
    }
  }, [isAuthenticated, incrementLaunchCount]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (!isDataLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasCompletedAssessment) {
    return <InitialAssessment />;
  }

  // Simple routing
  const path = window.location.pathname;
  if (path === '/admin') {
    // Wait for user to be loaded
    if (!user) {
      return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (user.role !== 'admin') {
      window.location.href = '/';
      return null;
    }
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 p-4 gap-4 transition-colors">
        <div className="w-80 flex-shrink-0 h-full">
          <Sidebar />
        </div>
        <main className="flex-1 h-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden relative transition-colors">
          <AdminDashboard />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 flex gap-4 overflow-hidden relative transition-colors">
      <ReassessmentBanner />
      
      {showReassessmentPrompt && (
        <ReassessmentPrompt 
          onStart={() => {
            setShowReassessmentPrompt(false);
            resetAssessment(); // This will trigger InitialAssessment view
          }}
          onDecline={() => {
            setShowReassessmentPrompt(false);
            // We might want to increment launch count to 31 to avoid showing it again immediately on reload?
            // Or just let it be. User said "ask again at 60".
            // If we don't change launchCount, it will show again on next reload (30).
            // Let's increment launch count by 1 to skip the check until next time.
            incrementLaunchCount();
          }}
        />
      )}

      {/* Main Chat Area - 75% */}
      <div className="w-3/4 h-full">
        <ChatArea />
      </div>

      {/* Sidebar - 25% */}
      <div className="w-1/4 h-full">
        <Sidebar />
      </div>
    </div>
  );
}

export default App;

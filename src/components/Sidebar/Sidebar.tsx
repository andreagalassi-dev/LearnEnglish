import React, { useState, useRef, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { useProgressStore } from '../../store/progressStore';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { Book, TrendingUp, AlertCircle, MoreVertical, LogOut, Settings, Camera, Shield } from 'lucide-react';
import SettingsModal from '../Settings/SettingsModal';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { proficiencyLevel, profilePicture, setProfilePicture } = useUserStore();
  const { currentFeedback } = useChatStore();
  const { getRecentMistakes, dailyStats, getWeeklyGoalAverage, getMonthlyGoalAverage } = useProgressStore();
  const recentMistakes = getRecentMistakes(3);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePicture(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20 dark:border-gray-700 overflow-y-auto transition-colors">
        {/* Profile Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            <div 
              className="relative w-12 h-12 rounded-full group cursor-pointer overflow-hidden transition-transform hover:scale-105 shadow-lg"
              onClick={handleAvatarClick}
              title="Click to change profile picture"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">{user?.username || 'Guest'}</h3>
              <div className="relative group cursor-help">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium border-b border-dashed border-blue-300 dark:border-blue-700 inline-block">
                  {proficiencyLevel || 'Principiante'}
                </p>
                
                {/* Level Tooltip */}
                <div className="absolute left-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50 hidden group-hover:block">
                  <p className="text-xs text-gray-400 mb-2 px-2">Available Levels:</p>
                  {['Principiante', 'Intermedio', 'Avanzato', 'Esperto', 'Madrelingua'].map((level) => (
                    <div 
                      key={level} 
                      className={`px-2 py-1 rounded-lg text-xs mb-1 ${
                        proficiencyLevel === level 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in duration-200">
                {user?.role === 'admin' && (
                  <>
                    <button 
                      onClick={() => {
                        window.location.href = '/admin'; // Simple navigation for now
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 flex items-center space-x-2 font-medium"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                  </>
                )}
                <button 
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Feedback */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 dark:text-white flex items-center">
              <Book className="w-4 h-4 mr-2 text-blue-500" />
              Live Feedback
            </h4>
          </div>
          <div className="space-y-3">
            {!currentFeedback && (
              <p className="text-sm text-gray-400 italic">Start chatting to get feedback!</p>
            )}
            
            {currentFeedback?.correction && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3">
                <p className="text-xs text-red-800 dark:text-red-300 font-bold mb-1">Correction</p>
                <p className="text-sm text-red-700 dark:text-red-200">{currentFeedback.correction}</p>
              </div>
            )}

            {currentFeedback?.praise && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-3">
                <p className="text-xs text-green-800 dark:text-green-300 font-bold mb-1">Great Job!</p>
                <p className="text-sm text-green-700 dark:text-green-200">{currentFeedback.praise}</p>
              </div>
            )}

            {currentFeedback?.suggestion && (
               <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-bold mb-1">Suggestion</p>
                <p className="text-sm text-blue-700 dark:text-blue-200">{currentFeedback.suggestion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Corrections */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 dark:text-white flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
              Recent Corrections
            </h4>
          </div>
          <div className="space-y-3">
            {recentMistakes.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No mistakes yet. Keep practicing!</p>
            ) : (
              recentMistakes.map((mistake) => (
                <div key={mistake.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs text-red-500 dark:text-red-400 line-through mb-1">{mistake.original}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">{mistake.correction}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Goals / Next Steps */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 dark:text-white flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              Daily Goals
            </h4>
          </div>
          <div className="space-y-3">
            {/* Goal 1: Practice 30 mins */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Practice 30 mins</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {Math.min(Math.floor(dailyStats.timeSpent / 60), 30)}/30m
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${dailyStats.timeSpent >= 1800 ? 'bg-green-500' : 'bg-blue-500'}`} 
                  style={{ width: `${Math.min((dailyStats.timeSpent / 1800) * 100, 100)}%` }} 
                />
              </div>
            </div>

            {/* Goal 2: 10 Correct Messages */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">10 Correct Messages</span>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  {Math.min(dailyStats.correctMessages, 10)}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${dailyStats.correctMessages >= 10 ? 'bg-green-500' : 'bg-orange-500'}`} 
                  style={{ width: `${Math.min((dailyStats.correctMessages / 10) * 100, 100)}%` }} 
                />
              </div>
            </div>

            {/* Goal 3: 100 Messages (5+ words) */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">100 Messages (5+ words)</span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  {Math.min(dailyStats.longMessages || 0, 100)}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${(dailyStats.longMessages || 0) >= 100 ? 'bg-green-500' : 'bg-purple-500'}`} 
                  style={{ width: `${Math.min(((dailyStats.longMessages || 0) / 100) * 100, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Long-term Stats */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 dark:text-white flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
              Long-term Progress
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-300 font-semibold mb-1">Weekly Avg</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{getWeeklyGoalAverage()}/3 <span className="text-xs font-normal text-blue-700 dark:text-blue-300">Goals/Day</span></p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-800">
              <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold mb-1">Monthly Avg</p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{getMonthlyGoalAverage()}/3 <span className="text-xs font-normal text-purple-700 dark:text-purple-300">Goals/Day</span></p>
            </div>
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Sidebar;

import React, { useState, useRef } from 'react';
import { X, User, Lock, Info, Camera, AlertTriangle, Check, Settings as SettingsIcon, TrendingUp, Moon, Sun } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { authApi } from '../../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'account' | 'info';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const { user, updateUser } = useAuthStore();
  const { profilePicture, setProfilePicture, proficiencyLevel, setProficiencyLevel } = useUserStore();
  const { theme, toggleTheme } = useThemeStore();
  
  // Username State
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Level State
  const [selectedLevel, setSelectedLevel] = useState(proficiencyLevel || 'Beginner');
  const [showLevelConfirm, setShowLevelConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

  const handleUpdateUsername = async () => {
    setUsernameError('');
    setUsernameSuccess('');
    setIsUpdatingUsername(true);

    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty');
      setIsUpdatingUsername(false);
      return;
    }

    try {
      const response = await authApi.changeUsername(newUsername);
      updateUser(response.user);
      setUsernameSuccess('Username updated successfully!');
      setNewUsername('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setUsernameError(err.response?.data?.error || 'Failed to update username');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    setIsUpdatingPassword(true);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      setIsUpdatingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsUpdatingPassword(false);
      return;
    }

    try {
      await authApi.changePassword(oldPassword, newPassword);
      setPasswordSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setPasswordError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLevelChange = () => {
    setShowLevelConfirm(true);
  };

  const confirmLevelChange = () => {
    setProficiencyLevel(selectedLevel);
    setShowLevelConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
        
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 p-6 flex flex-col transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-8 flex items-center">
            <SettingsIcon className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
            Settings
          </h2>
          
          <nav className="space-y-2 flex-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center p-3 rounded-xl transition-colors ${activeTab === 'general' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <SettingsIcon className="w-5 h-5 mr-3" />
              General
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center p-3 rounded-xl transition-colors ${activeTab === 'account' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <User className="w-5 h-5 mr-3" />
              Account
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center p-3 rounded-xl transition-colors ${activeTab === 'info' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Info className="w-5 h-5 mr-3" />
              App Info
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto relative bg-white dark:bg-gray-900 transition-colors">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>

          {activeTab === 'general' && (
            <div className="max-w-2xl mx-auto space-y-10">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">General Settings</h3>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Dark Mode</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`${
                      theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                    } inline-block h-6 w-6 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="max-w-lg mx-auto mt-10">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">App Information</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">App Name</p>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">App Version</p>
                  </div>
                  <div className="space-y-4 text-right">
                    <p className="text-gray-900 dark:text-white font-bold">Linguanet AI</p>
                    <p className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-bold">1.1.1000</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
                &copy; 2025 Linguanet AI. All rights reserved.
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="max-w-2xl mx-auto space-y-10">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Account Settings</h3>

              {/* Profile Picture */}
              <div className="flex items-center space-x-6 pb-8 border-b border-gray-100 dark:border-gray-700">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl overflow-hidden">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Profile Picture</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Click the image to upload a new photo.</p>
                </div>
              </div>

              {/* Change Username */}
              <div className="pb-8 border-b border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-4 h-4 mr-2 text-indigo-500" />
                  Change Username
                </h4>
                <div className="flex space-x-3">
                  <input 
                    type="text" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="New Username"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <button 
                    onClick={handleUpdateUsername}
                    disabled={isUpdatingUsername}
                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isUpdatingUsername ? 'Saving...' : 'Confirm'}
                  </button>
                </div>
                {usernameError && <p className="mt-2 text-sm text-red-500 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> {usernameError}</p>}
                {usernameSuccess && <p className="mt-2 text-sm text-green-500 flex items-center"><Check className="w-3 h-3 mr-1" /> {usernameSuccess}</p>}
              </div>

              {/* Change Password */}
              <div className="pb-8 border-b border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-indigo-500" />
                  Change Password
                </h4>
                <div className="space-y-3">
                  <input 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Current Password"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword}
                      className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isUpdatingPassword ? 'Updating...' : 'Confirm'}
                    </button>
                  </div>
                </div>
                {passwordError && <p className="mt-2 text-sm text-red-500 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> {passwordError}</p>}
                {passwordSuccess && <p className="mt-2 text-sm text-green-500 flex items-center"><Check className="w-3 h-3 mr-1" /> {passwordSuccess}</p>}
              </div>

              {/* Change Level */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />
                  Proficiency Level
                </h4>
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Current Level</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adjust the difficulty of your conversations.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select 
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Native'].map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleLevelChange}
                      className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Level Confirmation Modal */}
      {showLevelConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Change Difficulty?</h3>
            <p className="text-gray-600 mb-8">
              Are you sure you want to change your level to <span className="font-bold text-indigo-600">{selectedLevel}</span>? 
              This will adapt all future conversations and exercises to the new difficulty level.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowLevelConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                No, Cancel
              </button>
              <button 
                onClick={confirmLevelChange}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Yes, Change it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;



import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onNavigate: (view: 'home' | 'chat' | 'profile' | 'assessment' | 'community') => void;
  currentView: string;
  isLoggedIn: boolean;
  userProfile: UserProfile;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  darkMode, 
  toggleDarkMode, 
  onNavigate, 
  currentView,
  isLoggedIn,
  userProfile,
  onLoginClick,
  onLogoutClick
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* Global Back Button (visible if not on home) */}
            {currentView !== 'home' && (
              <button 
                onClick={() => onNavigate('home')}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                aria-label="Go Back Home"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => onNavigate('home')}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                K
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Keep Grow
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Nav Links - Desktop Only */}
            <nav className="hidden md:flex gap-6 mr-4">
              <button 
                onClick={() => onNavigate('home')}
                className={`text-sm font-medium transition-colors ${currentView === 'home' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Companions
              </button>
              <button 
                onClick={() => onNavigate('community')}
                className={`text-sm font-medium transition-colors ${currentView === 'community' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Anonymous Advice
              </button>
            </nav>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                // Sun Icon
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Proper Moon Icon
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            {/* Profile Dropdown (Desktop/Tablet) */}
            <div className="relative hidden sm:block" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-10 h-10 rounded-full overflow-hidden ring-2 transition-all flex items-center justify-center font-bold text-white ${
                    isLoggedIn 
                    ? 'bg-gradient-to-br from-primary-500 to-emerald-600 ring-primary-100 dark:ring-primary-900' 
                    : 'bg-slate-200 dark:bg-slate-700 ring-transparent text-slate-500'
                }`}
              >
                {isLoggedIn ? getInitials(userProfile.name) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{isLoggedIn ? userProfile.name : "Guest User"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userProfile.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    My Profile & History
                  </button>
                  <button 
                    onClick={() => { onNavigate('community'); setIsProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    Community Advice
                  </button>
                  <button 
                    onClick={() => { onNavigate('assessment'); setIsProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    Take New Test
                  </button>
                  
                  <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                    {isLoggedIn ? (
                        <button 
                            onClick={() => { onLogoutClick(); setIsProfileOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <button 
                            onClick={() => { onLoginClick(); setIsProfileOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-bold"
                        >
                            Sign In / Create Profile
                        </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Added padding bottom for mobile nav */}
      <main className="flex-grow pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'home' || currentView === 'chat' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button 
            onClick={() => onNavigate('community')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'community' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-[10px] font-medium">Community</span>
          </button>

          <button 
            onClick={() => onNavigate('profile')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'profile' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
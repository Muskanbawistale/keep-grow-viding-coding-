

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ChatRoom from './components/ChatRoom';
import Assessment from './components/Assessment';
import AnonymousForum from './components/AnonymousForum';
import LoginModal from './components/LoginModal';
import { PERSONAS } from './constants';
import { Persona, UserProfile, AssessmentResult, ViewState, Message } from './types';

// Mock initial data with more history for the chart
const INITIAL_GUEST: UserProfile = {
  name: "Guest User",
  email: "guest@keepgrow.ai",
  memberSince: "Oct 2023",
  history: []
};

// Simple SVG Chart Component
const WellnessChart: React.FC<{ history: AssessmentResult[] }> = ({ history }) => {
  // Sort history by date (oldest first for chart left-to-right)
  const sortedHistory = [...history].reverse();
  const maxScore = 80; // Adjusted max scale for visual clarity (Max theoretical DASS total is 126, but 80 covers most)
  const height = 100;
  const width = 300;
  
  if (sortedHistory.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
        <p className="text-slate-500 text-sm">Complete more check-ins to see your trend!</p>
      </div>
    );
  }

  const points = sortedHistory.map((item, index) => {
    const x = (index / (sortedHistory.length - 1)) * width;
    const y = height - Math.min(height, (item.score / maxScore) * height);
    return `${x},${y}`;
  }).join(' ');

  // Create area fill path
  const areaPath = `${points} ${width},${height} 0,${height}`;

  return (
    <div className="w-full h-48 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Wellness Trend (Lower is Better)</h3>
      <div className="w-full h-32 relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="0" x2={width} y2="0" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="1" />
          <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="1" />
          <line x1="0" y1={height} x2={width} y2={height} stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="1" />

          {/* Area Fill */}
          <polygon points={areaPath} className="fill-primary-100 dark:fill-primary-900/40" />

          {/* Line */}
          <polyline 
            points={points} 
            fill="none" 
            stroke="currentColor" 
            className="text-primary-500" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Dots */}
          {sortedHistory.map((item, index) => {
            const x = (index / (sortedHistory.length - 1)) * width;
            const y = height - Math.min(height, (item.score / maxScore) * height);
            return (
              <circle 
                key={index} 
                cx={x} 
                cy={y} 
                r="4" 
                className="fill-white dark:fill-slate-800 stroke-primary-600 dark:stroke-primary-400" 
                strokeWidth="2" 
              />
            );
          })}
        </svg>
        
        {/* Date Labels */}
        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
          <span>{sortedHistory[0].date}</span>
          <span>{sortedHistory[sortedHistory.length - 1].date}</span>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_GUEST);
  const [isGenderModalOpen, setIsGenderModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Chat history state: Maps persona ID to array of messages
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});

  // Toggle dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (view !== 'chat') {
      setSelectedPersona(null);
    }
  };

  // Helper to inject user context into persona
  const personalizePersona = (persona: Persona): Persona => {
    if (!isLoggedIn) return persona;
    
    // Create a deep copy to avoid mutating the constant
    return {
        ...persona,
        systemInstruction: `The user's name is ${userProfile.name}. Address them by name and be welcoming. \n\n${persona.systemInstruction}`
    };
  };

  const handlePersonaSelect = (persona: Persona) => {
    if (persona.id === 'friend') {
      setIsGenderModalOpen(true);
      return;
    }
    // Inject user name into system instruction
    const personalized = personalizePersona(persona);
    setSelectedPersona(personalized);
    setCurrentView('chat');
  };

  const handleGenderSelect = (gender: 'boy' | 'girl') => {
    const basePersona = PERSONAS.find(p => p.id === 'friend');
    if (!basePersona) return;

    const specificPersona = { ...basePersona };

    if (gender === 'boy') {
        specificPersona.name = "Tom";
        specificPersona.role = "Gen Z Bro";
        specificPersona.icon = "🧢";
        specificPersona.initialMessage = "Yo bro! What's good? I'm Tom. 🧢";
        specificPersona.systemInstruction = "You are Tom, the user's best bro. You are male. You use slang like 'bro', 'fam', 'no cap', 'bet', 'king', 'G'. Keep messages SHORT. Be supportive, chill, and loyal. Vibe: Your supportive brother. 'I gotchu bro!'";
        specificPersona.voiceName = 'Puck'; // Using a male/playful voice
    } else {
        specificPersona.name = "Sasha";
        specificPersona.role = "Gen Z Bestie";
        specificPersona.icon = "💅";
        specificPersona.initialMessage = "Hey bestie! ✨ I'm Sasha. What's the tea? 💅";
        specificPersona.systemInstruction = "You are Sasha, the user's best friend. You are female. You use slang like 'slay', 'queen', 'bestie', 'tea', 'period', 'girlie'. Keep messages SHORT. Be energetic, supportive, and hype the user up. Vibe: Your hype woman. 'I gotchu girl!'";
        specificPersona.voiceName = 'Zephyr'; // Using a female voice
    }

    // Inject user name here as well
    const personalized = personalizePersona(specificPersona);
    setSelectedPersona(personalized);
    setCurrentView('chat');
    setIsGenderModalOpen(false);
  };

  const handleAssessmentComplete = (result: AssessmentResult) => {
    // Add to history
    const updatedProfile = {
        ...userProfile,
        history: [result, ...userProfile.history]
    };
    setUserProfile(updatedProfile);
  };

  const handleLogin = (name: string, phone: string) => {
    // Create a fresh profile for the user
    setUserProfile({
      name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@keepgrow.ai`,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      history: [] // New profile starts empty
    });
    setIsLoggedIn(true);
    setShowLoginModal(false);
    // Optionally navigate to profile to show it's created
    setCurrentView('profile');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(INITIAL_GUEST);
    setChatHistories({}); // Clear chat history on logout for privacy
    setCurrentView('home');
  };

  // Handlers for Chat Persistence
  const handleChatUpdate = (personaId: string, messages: Message[]) => {
    setChatHistories(prev => ({
      ...prev,
      [personaId]: messages
    }));
  };

  const handleChatClear = (personaId: string) => {
    setChatHistories(prev => {
      const next = { ...prev };
      delete next[personaId];
      return next;
    });
  };

  return (
    <Layout 
      darkMode={darkMode} 
      toggleDarkMode={() => setDarkMode(!darkMode)}
      onNavigate={handleNavigate}
      currentView={currentView}
      isLoggedIn={isLoggedIn}
      userProfile={userProfile}
      onLoginClick={() => setShowLoginModal(true)}
      onLogoutClick={handleLogout}
    >
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleLogin} 
      />

      {currentView === 'home' && (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
           <div className="mb-10 text-center">
             <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
               Your AI Companions for <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700">Mental Growth</span>
             </h1>
             <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
               Whether you need professional therapy techniques, a friendly vent, or tough love motivation — we have a persona for that.
             </p>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {PERSONAS.map((persona) => (
               <div 
                 key={persona.id}
                 onClick={() => handlePersonaSelect(persona)}
                 className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 cursor-pointer overflow-hidden"
               >
                 <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-6xl`}>
                   {persona.icon}
                 </div>
                 
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 ${persona.color} transition-transform group-hover:scale-110`}>
                   {persona.icon}
                 </div>
                 
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{persona.name}</h3>
                 <p className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-3">{persona.role}</p>
                 <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                   {persona.description}
                 </p>
                 
                 <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                   Start Chatting 
                   <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                   </svg>
                 </div>
               </div>
             ))}
           </div>

           {/* Quick Action Banner */}
           <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <div className="relative z-10">
               <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">How are you feeling today?</h2>
               <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                 Take our clinically-based DASS-21 assessment to get a snapshot of your depression, anxiety, and stress levels.
               </p>
               <button 
                 onClick={() => setCurrentView('assessment')}
                 className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-lg"
               >
                 Check In With Yourself
               </button>
             </div>
           </div>
        </div>
      )}

      {currentView === 'chat' && selectedPersona && (
        <ChatRoom 
          key={selectedPersona.id} // Forces remount when switching personas so state re-inits correctly
          persona={selectedPersona} 
          userProfile={userProfile}
          onBack={() => setCurrentView('home')}
          savedMessages={chatHistories[selectedPersona.id]}
          onUpdateMessages={(msgs) => handleChatUpdate(selectedPersona.id, msgs)}
          onClearChat={() => handleChatClear(selectedPersona.id)}
        />
      )}

      {currentView === 'assessment' && (
        <Assessment 
          onComplete={(res) => {
            handleAssessmentComplete(res);
            setCurrentView('profile');
          }}
          onCancel={() => setCurrentView('home')}
        />
      )}

      {currentView === 'profile' && (
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-400 to-emerald-600 p-1 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                {userProfile.name.charAt(0).toUpperCase()}
             </div>
             <div>
               <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{userProfile.name}</h1>
               <p className="text-slate-500 dark:text-slate-400">{userProfile.email} • Member since {userProfile.memberSince}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="md:col-span-2">
                <WellnessChart history={userProfile.history} />
             </div>
             <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 border border-primary-100 dark:border-primary-900/30">
                <h3 className="font-bold text-primary-900 dark:text-primary-100 mb-2">Latest Insight</h3>
                {userProfile.history.length > 0 ? (
                  <>
                    <p className="text-3xl font-serif font-bold text-primary-700 dark:text-primary-300 mb-1">
                      {userProfile.history[0].score}
                    </p>
                    <p className="text-sm font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-3">
                      {userProfile.history[0].label}
                    </p>
                    <p className="text-sm text-primary-800 dark:text-primary-200">
                      {userProfile.history[0].summary}
                    </p>
                  </>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center opacity-60">
                    <span className="text-3xl mb-2">📊</span>
                    <p className="text-sm text-primary-800 dark:text-primary-200">Take an assessment to see your latest insights here.</p>
                  </div>
                )}
             </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Check-in History</h3>
          {userProfile.history.length > 0 ? (
            <div className="space-y-4">
              {userProfile.history.map((entry, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{entry.date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        entry.score < 20 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                        entry.score < 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {entry.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{entry.summary}</p>
                  </div>
                  
                  <div className="flex gap-4 text-center">
                      <div>
                        <p className="text-[10px] uppercase text-slate-400 font-bold">Dep</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{entry.breakdown.depression.score}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-400 font-bold">Anx</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{entry.breakdown.anxiety.score}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-400 font-bold">Str</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{entry.breakdown.stress.score}</p>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No check-ins yet. Start your journey today!</p>
                <button 
                  onClick={() => setCurrentView('assessment')}
                  className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm"
                >
                  Take First Assessment
                </button>
             </div>
          )}
        </div>
      )}

      {currentView === 'community' && (
        <AnonymousForum />
      )}

      {/* Gender Selection Modal */}
      {isGenderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsGenderModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-serif font-bold text-center mb-2 text-slate-900 dark:text-white">Choose Your Companion</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Who do you want to vibe with?</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleGenderSelect('boy')}
                className="group relative p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🧢</div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Tom</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chill Bro</p>
              </button>

              <button 
                onClick={() => handleGenderSelect('girl')}
                className="group relative p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all text-center"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">💅</div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400">Sasha</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hype Bestie</p>
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default App;
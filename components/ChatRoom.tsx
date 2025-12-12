

import React, { useState, useEffect, useRef } from 'react';
import { Message, Persona, UserProfile } from '../types';
import { streamChatResponse } from '../services/geminiService';
import LiveVoice from './LiveVoice';

interface ChatRoomProps {
  persona: Persona;
  userProfile: UserProfile;
  onBack: () => void;
  savedMessages?: Message[];
  onUpdateMessages: (messages: Message[]) => void;
  onClearChat: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ 
  persona, 
  userProfile, 
  onBack, 
  savedMessages, 
  onUpdateMessages, 
  onClearChat 
}) => {
  // Initialize from saved history OR use default greeting if history is empty
  const [messages, setMessages] = useState<Message[]>(() => {
    if (savedMessages && savedMessages.length > 0) {
      return savedMessages;
    }
    return [{
      id: 'init',
      role: 'model',
      content: persona.initialMessage || `Hello! I'm ${persona.name}. How are you feeling right now?`,
      timestamp: Date.now()
    }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync messages back to App state whenever they change
  useEffect(() => {
    onUpdateMessages(messages);
  }, [messages, onUpdateMessages]);

  const handleSend = async (customContent?: string) => {
    const contentToSend = customContent || input;
    if (!contentToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: contentToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customContent) setInput('');
    setIsLoading(true);

    try {
      const responseStream = streamChatResponse(userMsg.content, messages, persona);
      let fullResponse = '';
      
      // Create a placeholder message for the model
      const modelMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: modelMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of responseStream) {
        fullResponse += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, content: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareResults = () => {
    if (userProfile.history.length === 0) return;
    
    const latest = userProfile.history[0];
    const shareMessage = `I'd like to share my latest DASS-21 assessment results with you for review.

📅 Date: ${latest.date}
📊 Status: ${latest.label} (Score: ${latest.score})

Breakdown:
• Depression: ${latest.breakdown.depression.score} (${latest.breakdown.depression.level})
• Anxiety: ${latest.breakdown.anxiety.score} (${latest.breakdown.anxiety.level})
• Stress: ${latest.breakdown.stress.score} (${latest.breakdown.stress.level})

AI Summary: ${latest.aiAnalysis.overallSummary}

Can you please provide some advice based on these results?`;

    handleSend(shareMessage);
  };

  const handleClear = () => {
    if (window.confirm(`Are you sure you want to delete your conversation history with ${persona.name}? This cannot be undone.`)) {
      onClearChat();
      // Reset local state to initial greeting immediately
      setMessages([{
        id: Date.now().toString(),
        role: 'model',
        content: persona.initialMessage || `Hello! I'm ${persona.name}. How are you feeling right now?`,
        timestamp: Date.now()
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {isVoiceMode && <LiveVoice persona={persona} userProfile={userProfile} onClose={() => setIsVoiceMode(false)} />}
      
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950">
        {/* Chat Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${persona.color}`}>
              {persona.icon}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">{persona.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{persona.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-full transition-colors"
              title="Clear Chat History"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <button
              onClick={() => setIsVoiceMode(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Voice Mode
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-primary-500 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto flex gap-2">
            {/* Share Results Button */}
            {userProfile.history.length > 0 && (
                <button 
                  onClick={handleShareResults}
                  className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors flex-shrink-0"
                  title="Share latest assessment results"
                >
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                   </svg>
                </button>
            )}

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${persona.name}...`}
              className="flex-grow p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-12 max-h-32"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
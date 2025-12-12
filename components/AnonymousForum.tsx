

import React, { useState, useEffect, useRef } from 'react';
import { CommunityPost } from '../types';

// Random alias generator
const ADJECTIVES = ['Calm', 'Quiet', 'Brave', 'Gentle', 'Kind', 'Wise', 'Happy', 'Blue', 'Green', 'Mystic'];
const NOUNS = ['Panda', 'River', 'Mountain', 'Owl', 'Tiger', 'Leaf', 'Cloud', 'Star', 'Ocean', 'Tree'];
const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

// Initial mock data
const INITIAL_POSTS: CommunityPost[] = [
  {
    id: '1',
    authorAlias: 'Mystic Owl',
    authorColor: 'bg-violet-500',
    content: "I'm feeling really overwhelmed with work lately. Everyone expects so much from me and I'm afraid to say no. Has anyone else dealt with this?",
    timestamp: Date.now() - 10000000,
    likes: 5
  },
  {
    id: '2',
    authorAlias: 'Gentle Leaf',
    authorColor: 'bg-emerald-500',
    content: "It's okay to set boundaries. I started saying 'let me check my schedule' instead of immediate yes. Gave me time to think.",
    timestamp: Date.now() - 9000000,
    likes: 12,
    replyTo: {
      id: '1',
      authorAlias: 'Mystic Owl',
      content: "I'm feeling really overwhelmed with work lately. Everyone expects so much from me..."
    }
  },
  {
    id: '3',
    authorAlias: 'Brave Tiger',
    authorColor: 'bg-orange-500',
    content: "Trying to get back into hobbies after a breakup. What do you guys do for fun that isn't screen time?",
    timestamp: Date.now() - 5000000,
    likes: 3
  }
];

const AnonymousForum: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [input, setInput] = useState('');
  const [myIdentity, setMyIdentity] = useState({ alias: '', color: '' });
  const [replyingTo, setReplyingTo] = useState<CommunityPost | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Assign a random identity for this session
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    setMyIdentity({ alias: `${adj} ${noun}`, color });
    
    // Scroll to bottom on load
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      authorAlias: myIdentity.alias,
      authorColor: myIdentity.color,
      content: input,
      timestamp: Date.now(),
      likes: 0,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        authorAlias: replyingTo.authorAlias,
        content: replyingTo.content
      } : undefined
    };

    setPosts([...posts, newPost]);
    setInput('');
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 dark:bg-slate-950">
      {/* Header / Guidelines */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              🎭 Anonymous Advice
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You are chatting as <span className={`font-bold px-1.5 py-0.5 rounded text-white ${myIdentity.color}`}>{myIdentity.alias}</span>. Be kind and supportive.
            </p>
          </div>
          <div className="hidden sm:block text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Safe Space • No Judgment • Strict Privacy
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          {posts.map((post) => {
            const isMe = post.authorAlias === myIdentity.alias;
            return (
              <div 
                key={post.id} 
                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ${post.authorColor}`}>
                  {post.authorAlias.charAt(0)}
                </div>

                {/* Message Bubble */}
                <div className={`group relative max-w-[85%] sm:max-w-[70%]`}>
                  <div className={`rounded-2xl shadow-sm p-3 ${
                    isMe 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                  }`}>
                    
                    {/* Quoted Reply Area */}
                    {post.replyTo && (
                      <div className={`mb-2 rounded-lg p-2 text-xs border-l-4 ${
                        isMe 
                          ? 'bg-primary-700/50 border-white/50 text-white/90' 
                          : 'bg-slate-100 dark:bg-slate-900/50 border-primary-500 text-slate-600 dark:text-slate-400'
                      }`}>
                        <p className="font-bold mb-0.5">{post.replyTo.authorAlias}</p>
                        <p className="truncate opacity-80">{post.replyTo.content}</p>
                      </div>
                    )}

                    {/* Sender Name (only if not me) */}
                    {!isMe && (
                      <p className={`text-[10px] font-bold mb-1 opacity-70 ${post.authorColor.replace('bg-', 'text-')}`}>
                        {post.authorAlias}
                      </p>
                    )}

                    <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{post.content}</p>
                    
                    <div className={`text-[10px] mt-1 flex justify-end opacity-60 ${isMe ? 'text-primary-100' : 'text-slate-400'}`}>
                      {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Reply Button (visible on hover) */}
                  <button 
                    onClick={() => setReplyingTo(post)}
                    className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 shadow-sm ${
                      isMe ? '-left-10' : '-right-10'
                    }`}
                    title="Reply to this message"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Reply Context Preview */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded-t-xl border-l-4 border-primary-500 mb-2 animate-in slide-in-from-bottom-2">
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-0.5">
                  Replying to {replyingTo.authorAlias}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {replyingTo.content}
                </p>
              </div>
              <button 
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your thoughts anonymously..."
              className="flex-grow p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-12 max-h-32 transition-all"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0 shadow-lg shadow-primary-500/20"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousForum;
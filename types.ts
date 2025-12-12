

export type ViewState = 'home' | 'chat' | 'profile' | 'assessment' | 'community';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string; // Emoji or generic icon name
  color: string;
  systemInstruction: string;
  voiceName: string; // 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'
  initialMessage?: string; // Optional custom opening message
}

export interface AssessmentQuestion {
  id: number;
  text: string;
  category: 'depression' | 'anxiety' | 'stress';
  options: { label: string; value: number }[];
}

export interface AssessmentResult {
  date: string;
  score: number;
  label: string;
  summary: string; // Used for history list preview
  breakdown: {
    depression: { score: number; level: string; explanation: string };
    anxiety: { score: number; level: string; explanation: string };
    stress: { score: number; level: string; explanation: string };
  };
  aiAnalysis: {
    overallSummary: string;
    whatThisMeans: string;
    suggestions: string[];
    supportNote: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  memberSince: string;
  history: AssessmentResult[];
}

export interface CommunityPost {
  id: string;
  authorAlias: string;
  authorColor: string; // Tailwind class for avatar background
  content: string;
  timestamp: number;
  likes: number;
  replyTo?: {
    id: string;
    authorAlias: string;
    content: string;
  };
}
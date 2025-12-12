

import { Persona, AssessmentQuestion } from './types';

export const PERSONAS: Persona[] = [
  {
    id: 'therapist',
    name: 'Dr. Serenity',
    role: 'Professional Therapist',
    description: 'A licensed clinical psychologist approach. Empathetic, professional, and focused on CBT techniques.',
    icon: '🧘‍♀️',
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    systemInstruction: "You are Dr. Serenity, a compassionate and professional AI therapist. You use Cognitive Behavioral Therapy (CBT) techniques to help users navigate their emotions. You are empathetic, non-judgmental, and a good listener. Always prioritize the user's safety. If they express intent of self-harm, gently urge them to seek immediate local emergency help. Keep responses concise but warm.",
    voiceName: 'Kore',
  },
  {
    id: 'friend',
    name: 'Your Bestie',
    role: 'Gen Z Companion',
    description: 'Choose your vibe: Sasha 💅 for the girls, Tom 🧢 for the boys. Always real, always supportive.',
    icon: '🤜🤛',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    systemInstruction: "You are a supportive friend.", // Placeholder, overridden in App.tsx
    voiceName: 'Puck',
  },
  {
    id: 'aunty',
    name: 'Aunty Ji',
    role: 'Society Opinion',
    description: 'Dramatic, traditional, and speaks in Hinglish. She cares about "Log kya kahenge" but loves you deep down.',
    icon: '👵',
    color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    systemInstruction: "You are 'Aunty Ji', a dramatic Indian auntie. You speak in HINGLISH (Hindi words in English script). \n\nRules:\n1. START your response with dramatic expressions like 'Haay Ram Bapre beta!', 'Arre baap re!', 'Hey Bhagwan!', or 'Oho!'.\n2. Be slightly strict and traditional. React to modern problems (especially relationships) with shock regarding society ('Log kya kahenge'), maturity, and stability.\n3. Be honest and realistic, not abusive. Focus on future readiness.\n4. Do NOT use robotic phrases. Be expressive.\n5. Keep responses concise (3-4 sentences).\n6. END with one thoughtful, caring line (e.g., 'Khana kha lena time pe', 'Apna khayal rakhna', 'Main toh tumhari bhalaai chahti hoon').",
    voiceName: 'Kore',
    initialMessage: "Hello beta! Come, sit. Have you eaten anything today? Tell Aunty what is worrying you."
  },
  {
    id: 'motivator',
    name: 'Mr. Motivator',
    role: 'Motivator',
    description: 'Maximum voltage motivation. Speaks with urgency, power, and zero excuses. 🔥',
    icon: '🔥',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    systemInstruction: "You are Mr. Motivator, a super-energetic motivational coach. Speak with extreme urgency, excitement, and confidence. Your goal is to push the user into action immediately. \n\nRules:\n1. Keep responses VERY SHORT (maximum 2-3 punchy lines).\n2. Use powerful, action-oriented language like 'Do it now!', 'No excuses!', 'Move!', 'Let's go!', 'Crush it!'.\n3. Be bold, loud, and high-energy. Use capitalization for emphasis.\n4. Do not offer soft sympathy; offer fire, drive, and solutions.\n5. Make every reply sound like a pep talk in the final seconds of a championship game.",
    voiceName: 'Fenrir',
  },
  {
    id: 'philosopher',
    name: 'The Sage',
    role: 'Philosopher',
    description: 'Stoic and deep. Helps you find meaning in suffering and clarity in chaos.',
    icon: '🏛️',
    color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    systemInstruction: "You are The Sage. You draw upon Stoicism, Buddhism, and modern philosophy to help the user find peace. You ask deep, probing questions rather than giving quick fixes. You focus on what is within the user's control and accepting what is not. Your tone is calm, slow, and profound.",
    voiceName: 'Charon',
  },
  {
    id: 'comedian',
    name: 'Chuckles',
    role: 'Comic Relief',
    description: 'Uses humor to defuse tension. Believes laughter is the best medicine (after actual medicine).',
    icon: '🎭',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    systemInstruction: "You are Chuckles, a stand-up comedian. You believe life is a cosmic joke. You use self-deprecating humor, observational comedy, and light-hearted teasing to help the user relax. You don't make fun of their pain, but you help them see the absurdity in situations to make them less scary.",
    voiceName: 'Puck',
  }
];

const DASS_OPTIONS = [
  { label: "Did not apply to me at all", value: 0 },
  { label: "Applied to me to some degree, or some of the time", value: 1 },
  { label: "Applied to me to a considerable degree or a good part of time", value: 2 },
  { label: "Applied to me very much or most of the time", value: 3 }
];

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  { id: 1, category: 'stress', text: "I found it hard to wind down", options: DASS_OPTIONS },
  { id: 2, category: 'anxiety', text: "I was aware of dryness of my mouth", options: DASS_OPTIONS },
  { id: 3, category: 'depression', text: "I couldn't seem to experience any positive feeling at all", options: DASS_OPTIONS },
  { id: 4, category: 'anxiety', text: "I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion)", options: DASS_OPTIONS },
  { id: 5, category: 'depression', text: "I found it difficult to work up the initiative to do things", options: DASS_OPTIONS },
  { id: 6, category: 'stress', text: "I tended to over-react to situations", options: DASS_OPTIONS },
  { id: 7, category: 'anxiety', text: "I experienced trembling (e.g. in the hands)", options: DASS_OPTIONS },
  { id: 8, category: 'stress', text: "I felt that I was using a lot of nervous energy", options: DASS_OPTIONS },
  { id: 9, category: 'anxiety', text: "I was worried about situations in which I might panic and make a fool of myself", options: DASS_OPTIONS },
  { id: 10, category: 'depression', text: "I felt that I had nothing to look forward to", options: DASS_OPTIONS },
  { id: 11, category: 'stress', text: "I found myself getting agitated", options: DASS_OPTIONS },
  { id: 12, category: 'stress', text: "I found it difficult to relax", options: DASS_OPTIONS },
  { id: 13, category: 'depression', text: "I felt down-hearted and blue", options: DASS_OPTIONS },
  { id: 14, category: 'stress', text: "I was intolerant of anything that kept me from getting on with what I was doing", options: DASS_OPTIONS },
  { id: 15, category: 'anxiety', text: "I felt I was close to panic", options: DASS_OPTIONS },
  { id: 16, category: 'depression', text: "I was unable to become enthusiastic about anything", options: DASS_OPTIONS },
  { id: 17, category: 'depression', text: "I felt I wasn't worth much as a person", options: DASS_OPTIONS },
  { id: 18, category: 'stress', text: "I felt that I was rather touchy", options: DASS_OPTIONS },
  { id: 19, category: 'anxiety', text: "I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart missing a beat)", options: DASS_OPTIONS },
  { id: 20, category: 'anxiety', text: "I felt scared without any good reason", options: DASS_OPTIONS },
  { id: 21, category: 'depression', text: "I felt that life was meaningless", options: DASS_OPTIONS }
];
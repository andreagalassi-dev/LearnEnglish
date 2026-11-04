import { create } from 'zustand';
import { type AIResponse } from '../services/ai';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  translation?: string;
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  currentFeedback: AIResponse['feedback'] | null;
  addMessage: (message: Message) => void;
  setTyping: (typing: boolean) => void;
  setFeedback: (feedback: AIResponse['feedback']) => void;
  resetChat: () => void;
  setMessages: (messages: Message[]) => void;
}

// import { persist, createJSONStorage } from 'zustand/middleware';

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  currentFeedback: null,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setTyping: (typing) => set({ isTyping: typing }),
  setFeedback: (feedback) => set({ currentFeedback: feedback }),
  setMessages: (messages: Message[]) => set({ messages }),
  resetChat: () => set({ 
    messages: [], 
    currentFeedback: null 
  }),
}));

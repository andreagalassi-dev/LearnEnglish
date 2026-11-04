
import { type ProficiencyLevel } from '../store/userStore';
import api from './api';

export interface AIResponse {
  text: string;
  translation: string;
  feedback: {
    correction?: string;
    praise?: string;
    suggestion?: string;
  };
  detectedLevel: ProficiencyLevel;
  grammarScore: number; // 0-100
  vocabularyWords: string[]; // List of unique/good words used
  modelUsed?: string;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}



export const sendMessageToAI = async (
  message: string,
  history: Message[],
  level: ProficiencyLevel | null,
  recentMistakes: { original: string; correction: string }[] = []
): Promise<AIResponse> => {
  try {
    const response = await api.post('/ai/chat', {
      message,
      history,
      level,
      recentMistakes,
    });

    return response.data as AIResponse;
  } catch (error) {
    console.error('Error calling AI API:', error);
    // Return a fallback response so the app doesn't hang
    return {
      text: "I'm having trouble connecting to the AI tutor right now. Please verify your connection or check server logs.",
      translation: "Ho problemi a connettermi al tutor AI in questo momento. Verifica la connessione o controlla i log del server.",
      feedback: {
        suggestion: "Check your backend server and Gemini API key in .env"
      },
      detectedLevel: level || 'Principiante',
      grammarScore: 0,
      vocabularyWords: []
    };
  }
};

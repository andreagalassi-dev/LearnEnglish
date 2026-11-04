import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

export interface Mistake {
  id: string;
  timestamp: number;
  original: string;
  correction: string;
  suggestion?: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  timeSpent: number; // seconds
  correctMessages: number;
  longMessages: number;
}

export interface ProgressState {
  mistakes: Mistake[];
  activeVocabulary: Record<string, number>; // Word -> Last Message ID
  grammarAccuracy: number;
  dailyStats: DailyStats;
  history: DailyStats[];
  addMistake: (mistake: Omit<Mistake, 'id' | 'timestamp'>) => void;
  getRecentMistakes: (limit?: number) => Mistake[];
  clearHistory: () => void;
  trackWords: (words: string[], currentMessageId: number) => void;
  pruneVocabulary: (currentMessageId: number) => void;
  updateAccuracy: (score: number) => void;
  updateDailyTime: (seconds: number) => void;
  incrementDailyCorrectMessages: () => void;
  incrementDailyLongMessages: () => void;
  checkDailyReset: () => void;
  getWeeklyGoalAverage: () => number;
  getMonthlyGoalAverage: () => number;
  setProgress: (state: Partial<ProgressState>) => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  mistakes: [],
  activeVocabulary: {},
  grammarAccuracy: 100, // Start with 100% optimism
  dailyStats: {
    date: new Date().toISOString().split('T')[0],
    timeSpent: 0,
    correctMessages: 0,
    longMessages: 0
  },
  history: [],
  addMistake: (mistake) => set((state) => ({
    mistakes: [
      {
        ...mistake,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      },
      ...state.mistakes,
    ],
  })),
  getRecentMistakes: (limit = 5) => {
    return get().mistakes.slice(0, limit);
  },
  clearHistory: () => set({ 
    mistakes: [], 
    activeVocabulary: {}, 
    grammarAccuracy: 100,
    dailyStats: {
      date: new Date().toISOString().split('T')[0],
      timeSpent: 0,
      correctMessages: 0,
      longMessages: 0
    },
    history: []
  }),
  trackWords: (words, currentMessageId) => set((state) => {
    const newVocab = { ...state.activeVocabulary };
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      newVocab[lowerWord] = currentMessageId;
    });
    return { activeVocabulary: newVocab };
  }),
  pruneVocabulary: (currentMessageId) => set((state) => {
    const newVocab = { ...state.activeVocabulary };
    let changed = false;
    Object.entries(newVocab).forEach(([word, lastId]) => {
      if (currentMessageId - lastId > 500) {
        delete newVocab[word];
        changed = true;
      }
    });
    return changed ? { activeVocabulary: newVocab } : state;
  }),
  updateAccuracy: (score) => set((state) => {
    // Simple moving average (weighting new score by 20%)
    const newAccuracy = (state.grammarAccuracy * 0.8) + (score * 0.2);
    return { grammarAccuracy: Math.round(newAccuracy) };
  }),
  updateDailyTime: (seconds) => set((state) => ({
    dailyStats: {
      ...state.dailyStats,
      timeSpent: state.dailyStats.timeSpent + seconds
    }
  })),
  incrementDailyCorrectMessages: () => set((state) => ({
    dailyStats: {
      ...state.dailyStats,
      correctMessages: state.dailyStats.correctMessages + 1
    }
  })),
  incrementDailyLongMessages: () => set((state) => ({
    dailyStats: {
      ...state.dailyStats,
      longMessages: (state.dailyStats.longMessages || 0) + 1
    }
  })),
  checkDailyReset: () => set((state) => {
    const today = new Date().toISOString().split('T')[0];
    if (state.dailyStats.date !== today) {
      // Archive previous day's stats if not already in history
      const history = [...state.history];
      const lastEntry = history[history.length - 1];
      
      // Avoid duplicates if checkDailyReset is called multiple times
      if (!lastEntry || lastEntry.date !== state.dailyStats.date) {
         history.push(state.dailyStats);
      }

      return {
        history,
        dailyStats: {
          date: today,
          timeSpent: 0,
          correctMessages: 0,
          longMessages: 0
        }
      };
    }
    return state;
  }),
  getWeeklyGoalAverage: () => {
    const { history, dailyStats } = get();
    const allStats = [...history, dailyStats];
    
    if (allStats.length === 0) return 0;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Check if we have history older than 7 days
    // If history is empty, oldestEntry is today (dailyStats.date)
    const oldestEntry = new Date(allStats[0].date);
    let divisor = 7;
    
    if (oldestEntry > oneWeekAgo) {
      // Less than a week of history: calculate days since start
      const daysSinceStart = Math.ceil((now.getTime() - oldestEntry.getTime()) / (1000 * 60 * 60 * 24));
      // Ensure at least 1 day is counted (today)
      divisor = Math.max(1, daysSinceStart);
    }

    const recentStats = allStats.filter(stat => new Date(stat.date) >= oneWeekAgo);
    
    const totalPoints = recentStats.reduce((sum, stat) => {
      let points = 0;
      if (stat.timeSpent >= 1800) points += 1; // 30 mins
      if (stat.correctMessages >= 10) points += 1; // 10 msgs
      if ((stat.longMessages || 0) >= 100) points += 1; // 100 long msgs
      return sum + points;
    }, 0);

    return parseFloat((totalPoints / divisor).toFixed(1));
  },
  getMonthlyGoalAverage: () => {
    const { history, dailyStats } = get();
    const allStats = [...history, dailyStats];

    if (allStats.length === 0) return 0;

    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Check if we have history older than 30 days
    const oldestEntry = new Date(allStats[0].date);
    let divisor = 30;
    
    if (oldestEntry > oneMonthAgo) {
      // Less than a month of history: calculate days since start
      const daysSinceStart = Math.ceil((now.getTime() - oldestEntry.getTime()) / (1000 * 60 * 60 * 24));
      divisor = Math.max(1, daysSinceStart);
    }
    
    const recentStats = allStats.filter(stat => new Date(stat.date) >= oneMonthAgo);

    const totalPoints = recentStats.reduce((sum, stat) => {
      let points = 0;
      if (stat.timeSpent >= 1800) points += 1; // 30 mins
      if (stat.correctMessages >= 10) points += 1; // 10 msgs
      if ((stat.longMessages || 0) >= 100) points += 1; // 100 long msgs
      return sum + points;
    }, 0);

    return parseFloat((totalPoints / divisor).toFixed(1));
  },
  setProgress: (state: Partial<ProgressState>) => set(state),
}));

import { create } from 'zustand';
// import { persist } from 'zustand/middleware';


export type ProficiencyLevel = 'Principiante' | 'Intermedio' | 'Medio' | 'Avanzato' | 'Esperto' | 'Madrelingua';

interface UserState {
  proficiencyLevel: ProficiencyLevel | null;
  hasCompletedAssessment: boolean;
  launchCount: number;
  profilePicture: string | null;
  setProficiencyLevel: (level: string) => void;
  completeAssessment: (level?: string) => void;
  incrementLaunchCount: () => void;
  resetAssessment: () => void;
  setProfilePicture: (url: string | null) => void;
  setUserState: (state: Partial<UserState>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  proficiencyLevel: 'Principiante',
  hasCompletedAssessment: false,
  launchCount: 0,
  profilePicture: null,
  setProficiencyLevel: (level) => set({ proficiencyLevel: level as ProficiencyLevel }),
  completeAssessment: (level) => set((state) => ({
    proficiencyLevel: (level as ProficiencyLevel) || state.proficiencyLevel || 'Principiante',
    hasCompletedAssessment: true
  })),
  incrementLaunchCount: () => set((state) => ({ launchCount: state.launchCount + 1 })),
  resetAssessment: () => set({
    hasCompletedAssessment: false,
    proficiencyLevel: 'Beginner' as ProficiencyLevel,
    launchCount: 0,
    profilePicture: null
  }),
  setProfilePicture: (url) => set({ profilePicture: url }),
  setUserState: (state) => set(state),
}));

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, setLanguage } from '@/lib/i18n';

export interface UserProfile {
  id:        string;
  name:      string;
  language:  Language;
  goal:      'muscle' | 'weight_loss' | 'toned' | 'active' | null;
  level:     'beginner' | 'intermediate' | 'advanced' | null;
  equipment: 'gym' | 'home' | 'dumbbells' | 'none' | null;
  weight_kg: number | null;
  height_cm: number | null;
  city:      string | null;
  country:   string | null;
  isPremium: boolean;
}

interface UserStore {
  user:         UserProfile | null;
  isOnboarded:  boolean;
  setUser:      (user: UserProfile) => void;
  updateUser:   (fields: Partial<UserProfile>) => void;
  setLanguage:  (lang: Language) => void;
  setOnboarded: (v: boolean) => void;
  clearUser:    () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user:        null,
      isOnboarded: false,

      setUser: (user) => {
        setLanguage(user.language);
        set({ user });
      },

      updateUser: (fields) => {
        const current = get().user;
        if (!current) return;
        const updated = { ...current, ...fields };
        if (fields.language) setLanguage(fields.language);
        set({ user: updated });
      },

      setLanguage: (lang) => {
        setLanguage(lang);
        get().updateUser({ language: lang });
      },

      setOnboarded: (v) => set({ isOnboarded: v }),

      clearUser: () => set({ user: null, isOnboarded: false }),
    }),
    {
      name:    'fos-user',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RoutineItem, UserSettingsState, CategoryType } from '../types';
import { DEFAULT_ROUTINES } from '../mock/mockData';

interface AppContextType {
  routines: RoutineItem[];
  toggleRoutineCompletion: (id: string) => void;
  toggleRoutineActive: (id: string) => void;
  addRoutine: (title: string, category: CategoryType) => void;
  archiveRoutine: (id: string) => void;
  userSettings: UserSettingsState;
  settings: UserSettingsState;
  updateUserSettings: (updates: Partial<UserSettingsState>) => void;
  updateSettings: (updates: Partial<UserSettingsState>) => void;
  resetAllData: () => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [routines, setRoutines] = useState<RoutineItem[]>(DEFAULT_ROUTINES);
  const [userSettings, setUserSettings] = useState<UserSettingsState>({
    themePreference: 'system',
    notificationsEnabled: true,
    reminderTime: '21:00', // Default 9:00 PM
  });

  const toggleRoutineCompletion = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextCompleted = !r.completed;
          const nextStreak = nextCompleted ? r.streak + 1 : Math.max(0, r.streak - 1);
          return { ...r, completed: nextCompleted, streak: nextStreak };
        }
        return r;
      })
    );
  };

  const toggleRoutineActive = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const addRoutine = (title: string, category: CategoryType) => {
    const newRoutine: RoutineItem = {
      id: `custom_${Date.now()}`,
      title,
      category,
      completed: false,
      streak: 0,
    };
    setRoutines((prev) => [...prev, newRoutine]);
  };

  const archiveRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const updateUserSettings = (updates: Partial<UserSettingsState>) => {
    setUserSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetAllData = () => {
    setRoutines(DEFAULT_ROUTINES);
    setUserSettings({
      themePreference: 'system',
      notificationsEnabled: true,
      reminderTime: '21:00',
    });
  };

  return (
    <AppContext.Provider
      value={{
        routines,
        toggleRoutineCompletion,
        toggleRoutineActive,
        addRoutine,
        archiveRoutine,
        userSettings,
        settings: userSettings,
        updateUserSettings,
        updateSettings: updateUserSettings,
        resetAllData,
        resetData: resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

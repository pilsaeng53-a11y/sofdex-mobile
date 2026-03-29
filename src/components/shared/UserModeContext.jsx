import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'sofdex_user_mode';

const UserModeContext = createContext({ mode: 'pro', setMode: () => {} });

export function UserModeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'pro'; } catch { return 'pro'; }
  });

  function setMode(m) {
    setModeState(m);
    try { localStorage.setItem(STORAGE_KEY, m); } catch {}
  }

  return (
    <UserModeContext.Provider value={{ mode, setMode, isLite: mode === 'lite', isPro: mode === 'pro' }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  return useContext(UserModeContext);
}
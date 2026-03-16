import React, { createContext, useContext, useState, useEffect } from 'react';

// User types: 'beginner' | 'trader' | 'investor' | 'partner'
// Partner status: 'none' | 'pending' | 'approved'

const UserTypeContext = createContext(null);

const DEFAULT_STATE = {
  userType: 'beginner',
  partnerStatus: 'none', // 'none' | 'pending' | 'approved'
  tradeCount: 0,
  copyCount: 0,
  partnerVisits: 0,
};

export function UserTypeProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('sofdex_usertype');
      return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : DEFAULT_STATE;
    } catch { return DEFAULT_STATE; }
  });

  const save = (next) => {
    setState(next);
    try { localStorage.setItem('sofdex_usertype', JSON.stringify(next)); } catch {}
  };

  const recordTrade = () => save(prev => {
    const tradeCount = prev.tradeCount + 1;
    const userType = tradeCount >= 3 ? 'trader' : prev.userType;
    return { ...prev, tradeCount, userType };
  });

  const recordCopy = () => save(prev => {
    const copyCount = prev.copyCount + 1;
    const userType = copyCount >= 3 && prev.userType === 'beginner' ? 'investor' : prev.userType;
    return { ...prev, copyCount, userType };
  });

  const recordPartnerVisit = () => save(prev => {
    const partnerVisits = prev.partnerVisits + 1;
    return { ...prev, partnerVisits };
  });

  const setUserType = (type) => save(prev => ({ ...prev, userType: type }));

  const applyForPartner = () => save(prev => ({ ...prev, partnerStatus: 'pending' }));

  // For demo: simulate approval toggle
  const setPartnerStatus = (status) => save(prev => ({
    ...prev,
    partnerStatus: status,
    userType: status === 'approved' ? 'partner' : prev.userType,
  }));

  const isPartnerApproved = state.partnerStatus === 'approved';
  const isPartnerPending = state.partnerStatus === 'pending';

  return (
    <UserTypeContext.Provider value={{
      ...state,
      isPartnerApproved,
      isPartnerPending,
      recordTrade,
      recordCopy,
      recordPartnerVisit,
      setUserType,
      applyForPartner,
      setPartnerStatus,
    }}>
      {children}
    </UserTypeContext.Provider>
  );
}

export function useUserType() {
  const ctx = useContext(UserTypeContext);
  if (!ctx) throw new Error('useUserType must be used inside UserTypeProvider');
  return ctx;
}
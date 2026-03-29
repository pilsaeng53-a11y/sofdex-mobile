/**
 * useSubordinates(parentWallet, parentGrade)
 * Fetches and classifies subordinates for a given parent wallet.
 * Replace getSubordinatesByParentWallet in partnerGradeService.js to connect real API.
 */
import { useState, useEffect } from 'react';
import { getSubordinatesByParentWallet, classifySubordinates } from '@/services/partnerGradeService';

export function useSubordinates(parentWallet, parentGrade) {
  const [active,   setActive]   = useState([]);
  const [promoted, setPromoted] = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!parentWallet || !parentGrade) { setActive([]); setPromoted([]); return; }
    let cancelled = false;
    setLoading(true);
    getSubordinatesByParentWallet(parentWallet).then(subs => {
      if (cancelled) return;
      const { active: a, promoted: p } = classifySubordinates(subs, parentGrade);
      setActive(a);
      setPromoted(p);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [parentWallet, parentGrade]);

  return { active, promoted, loading };
}
/**
 * usePartnerGrade(wallet)
 * Fetches partner grade info for a given wallet address.
 * Swap fetchPartnerGrade in partnerGradeService.js to connect real API.
 */
import { useState, useEffect } from 'react';
import { fetchPartnerGrade } from '@/services/partnerGradeService';

export function usePartnerGrade(wallet) {
  const [gradeInfo, setGradeInfo] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [fetched, setFetched]     = useState(false);

  useEffect(() => {
    if (!wallet) { setGradeInfo(null); setFetched(false); return; }
    let cancelled = false;
    setLoading(true);
    fetchPartnerGrade(wallet).then(data => {
      if (!cancelled) { setGradeInfo(data); setFetched(true); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [wallet]);

  return { gradeInfo, loading, fetched };
}
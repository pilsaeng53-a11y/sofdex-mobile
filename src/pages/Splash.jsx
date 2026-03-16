import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_3D_URL, LOGO_FONT_URL } from '../components/shared/SolFortLogo';

export default function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => navigate(createPageUrl('Home')), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-[#0a0e1a] flex flex-col items-center justify-center overflow-hidden z-50">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#8b5cf6]/8 blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-[#00d4aa]/6 blur-[100px]" />
        <div className="absolute top-2/3 right-1/4 w-[200px] h-[200px] rounded-full bg-[#06b6d4]/5 blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <AnimatePresence>
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-2xl shadow-[#8b5cf6]/30 flex items-center justify-center bg-transparent">
                <img src={LOGO_3D_URL} alt="SolFort" className="w-28 h-28 object-contain" />
              </div>
              <div className="absolute -inset-2 rounded-3xl border border-[#00d4aa]/20 animate-pulse" />
            </div>
          </motion.div>

          {/* Brand name — font logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-2"
          >
            <img src={LOGO_FONT_URL} alt="SOLFORT" className="h-12 object-contain" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 text-sm font-medium tracking-widest uppercase mb-12"
          >
            Multi-Asset DEX on Solana
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 10 }}
            transition={{ duration: 0.5 }}
            className="text-slate-400 text-center text-sm leading-relaxed max-w-[260px] mb-16"
          >
            Trade Perpetuals, RWAs & Global Assets on Solana
          </motion.p>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-1.5"
          >
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]"
                style={{
                  animation: 'pulseDot 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
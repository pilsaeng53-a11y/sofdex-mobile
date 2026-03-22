import React, { useState, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';

const QUICK_PRESETS = [5, 10, 20, 50];

function riskColor(leverage, maxLev) {
  const pct = leverage / maxLev;
  if (pct <= 0.2) return '#4ade80';
  if (pct <= 0.5) return '#f59e0b';
  return '#f87171';
}

function riskLabel(leverage, maxLev) {
  const pct = leverage / maxLev;
  if (pct <= 0.2) return 'Low Risk';
  if (pct <= 0.5) return 'Med Risk';
  return 'High Risk';
}

export default function LeverageControls({ leverage, onChange, maxLev = 100, minLev = 1 }) {
  const [inputVal, setInputVal] = useState('');
  const [focused, setFocused] = useState(false);

  const clamp = (v) => Math.max(minLev, Math.min(maxLev, Math.round(v)));

  const set = useCallback((v) => {
    const clamped = clamp(v);
    onChange(clamped);
    setInputVal('');
  }, [maxLev, minLev, onChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e) => {
    const raw = e.target.value;
    setInputVal(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(clamp(n));
  };

  const handleInputBlur = () => {
    setFocused(false);
    setInputVal('');
    // Ensure clamped on blur
    onChange(clamp(leverage));
  };

  const step = (delta) => set(leverage + delta);

  const color = riskColor(leverage, maxLev);
  const sliderPct = ((leverage - minLev) / (maxLev - minLev)) * 100;

  return (
    <div className="space-y-2">
      {/* Header row: badge + input + ±buttons */}
      <div className="flex items-center gap-2">
        {/* Leverage badge */}
        <div
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg flex-shrink-0"
          style={{
            background: `${color}14`,
            border: `1px solid ${color}30`,
          }}
        >
          <span className="text-[11px] font-black font-mono" style={{ color }}>
            {leverage}×
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: `${color}99` }}>
            {riskLabel(leverage, maxLev)}
          </span>
        </div>

        {/* Direct input */}
        <div
          className="flex items-center flex-1 rounded-lg overflow-hidden transition-all duration-150"
          style={{
            background: 'rgba(4,6,14,0.9)',
            border: focused ? '1px solid rgba(0,212,170,0.3)' : '1px solid rgba(148,163,184,0.08)',
            boxShadow: focused ? '0 0 0 2px rgba(0,212,170,0.07)' : 'none',
          }}
        >
          <input
            type="number"
            min={minLev}
            max={maxLev}
            value={focused ? inputVal : leverage}
            onChange={handleInputChange}
            onFocus={() => { setFocused(true); setInputVal(String(leverage)); }}
            onBlur={handleInputBlur}
            className="flex-1 h-8 px-2.5 bg-transparent font-mono font-black text-[12px] text-white placeholder-[#2a3348] focus:outline-none text-center"
            style={{ minWidth: 0 }}
          />
          <span className="pr-2 text-[9px] font-black select-none" style={{ color: '#3d4f6b' }}>×</span>
        </div>

        {/* − button */}
        <button
          onClick={() => step(-1)}
          disabled={leverage <= minLev}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-30"
          style={{
            background: 'rgba(4,6,14,0.9)',
            border: '1px solid rgba(148,163,184,0.08)',
            color: '#64748b',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(148,163,184,0.08)'}
        >
          <Minus className="w-3 h-3" />
        </button>

        {/* + button */}
        <button
          onClick={() => step(1)}
          disabled={leverage >= maxLev}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-30"
          style={{
            background: 'rgba(4,6,14,0.9)',
            border: '1px solid rgba(148,163,184,0.08)',
            color: '#64748b',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(148,163,184,0.08)'}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Slider */}
      <div className="relative px-0.5">
        <input
          type="range"
          min={minLev}
          max={maxLev}
          step={1}
          value={leverage}
          onChange={e => set(parseInt(e.target.value, 10))}
          className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${sliderPct}%, rgba(148,163,184,0.12) ${sliderPct}%, rgba(148,163,184,0.12) 100%)`,
            // thumb styling via inline trick
          }}
        />
        {/* Range min/max labels */}
        <div className="flex justify-between mt-0.5">
          <span className="text-[8px]" style={{ color: '#2a3348' }}>{minLev}×</span>
          <span className="text-[8px]" style={{ color: '#2a3348' }}>{maxLev}×</span>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-1">
        {QUICK_PRESETS.filter(p => p <= maxLev).map(preset => {
          const active = leverage === preset;
          return (
            <button
              key={preset}
              onClick={() => set(preset)}
              className="flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all duration-150"
              style={active ? {
                background: `${color}18`,
                color,
                border: `1px solid ${color}35`,
              } : {
                background: 'rgba(4,6,14,0.8)',
                color: '#3d4f6b',
                border: '1px solid rgba(148,163,184,0.07)',
              }}
            >
              {preset}×
            </button>
          );
        })}
      </div>
    </div>
  );
}
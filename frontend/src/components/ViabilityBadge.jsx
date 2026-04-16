import React from 'react';

const COLOR = { Safe: '#10B981', Moderate: '#F59E0B', Risk: '#EF4444' };
const BG = { Safe: '#ECFDF5', Moderate: '#FFFBEB', Risk: '#FEF2F2' };
const BORDER = { Safe: '#A7F3D0', Moderate: '#FCD34D', Risk: '#FECACA' };

export function ViabilityBadge({ score, risk, size = 'sm' }) {
  const c = COLOR[risk] || '#475569';
  const b = BG[risk] || '#F8F9FA';
  const br = BORDER[risk] || '#E2E8F0';
  const dot = size === 'lg' ? 10 : 8;
  const fontSize = size === 'lg' ? 13 : 11;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'lg' ? '5px 10px' : '3px 8px',
      background: b, border: `1px solid ${br}`,
      fontSize, fontWeight: 700, color: c, fontFamily: 'var(--font-mono)',
      whiteSpace: 'nowrap'
    }}>
      <span style={{ width: dot, height: dot, borderRadius: '50%', background: c, flexShrink: 0 }} />
      {score}/100 · {risk}
    </span>
  );
}

export function ViabilityGauge({ score, risk }) {
  const c = COLOR[risk] || '#475569';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="54" fill="none" stroke="#E2E8F0" strokeWidth="10" />
          <circle cx="70" cy="70" r="54" fill="none" stroke={c} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="butt" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: c, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>/100</span>
        </div>
      </div>
      <div style={{
        padding: '6px 16px', background: BG[risk], border: `1px solid ${BORDER[risk]}`,
        color: c, fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase'
      }}>
        {risk === 'Safe' ? '🟢' : risk === 'Moderate' ? '🟡' : '🔴'} {risk}
      </div>
    </div>
  );
}

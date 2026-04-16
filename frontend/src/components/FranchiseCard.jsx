import React from 'react';
import { Link } from 'react-router-dom';
import { ViabilityBadge } from './ViabilityBadge';
import { MapPin, CurrencyInr, Timer, Users } from '@phosphor-icons/react';

const CAT_COLORS = {
  'Tea & Coffee': { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  'Shawarma/BBQ': { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
  'Biryani': { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  'Pharmacy': { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  'Salon': { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  'Car Care': { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
};

function fmt(n) {
  if (!n) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

export default function FranchiseCard({
  franchise, matchScore, matchReason, onCompare, inCompare, showActions = true
}) {
  const {
    franchise_id, name, category, brand_type, short_description,
    investment_min, investment_max, viability_score, risk_level,
    breakeven_months_min, breakeven_months_max, best_chennai_zones = [],
    beginner_friendly, royalty_level
  } = franchise;

  const catStyle = CAT_COLORS[category] || { bg: '#F8F9FA', text: '#475569', border: '#E2E8F0' };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} data-testid={`franchise-card-${franchise_id}`}>
      {/* Match score bar if present */}
      {matchScore && (
        <div style={{ height: 4, background: '#E2E8F0' }}>
          <div style={{ height: '100%', width: `${matchScore}%`, background: '#0033A0', transition: 'width 0.8s ease' }} />
        </div>
      )}

      <div style={{ padding: '20px 20px 0' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {category}
            </span>
            {matchScore && (
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, padding: '3px 8px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                {matchScore}% Match
              </span>
            )}
          </div>
          <ViabilityBadge score={viability_score} risk={risk_level} />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 4, lineHeight: 1.2 }}>{name}</h3>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{brand_type}</div>
        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {matchReason || short_description}
        </p>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 20px', borderTop: '1px solid #F1F5F9', paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <Stat icon={<CurrencyInr size={13} weight="bold" />} label="Investment" value={`${fmt(investment_min)}–${fmt(investment_max)}`} />
        <Stat icon={<Timer size={13} weight="bold" />} label="Break-even" value={`${breakeven_months_min}–${breakeven_months_max} mo`} />
        <Stat icon={<MapPin size={13} weight="bold" />} label="Best Zone" value={best_chennai_zones[0]?.replace('Chennai', 'Chn') || 'Chennai'} />
        <Stat icon={<Users size={13} weight="bold" />} label="Royalty" value={royalty_level === 'None' ? '0% ✓' : royalty_level} color={royalty_level === 'None' ? '#10B981' : undefined} />
      </div>

      {/* Badges */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {beginner_friendly && (
          <span style={{ fontSize: 11, padding: '2px 8px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', fontWeight: 600 }}>Beginner Friendly</span>
        )}
        {royalty_level === 'None' && (
          <span style={{ fontSize: 11, padding: '2px 8px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', fontWeight: 600 }}>No Royalty</span>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{ display: 'flex', borderTop: '1px solid #E2E8F0', marginTop: 'auto' }}>
          <Link to={`/franchise/${franchise_id}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button data-testid={`view-details-${franchise_id}`} style={{ width: '100%', padding: '12px', background: '#0033A0', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = '#002277'}
              onMouseOut={e => e.currentTarget.style.background = '#0033A0'}>
              View Details →
            </button>
          </Link>
          {onCompare && (
            <button
              data-testid={`compare-btn-${franchise_id}`}
              onClick={() => onCompare(franchise)}
              style={{ padding: '12px 16px', background: inCompare ? '#EFF6FF' : 'white', border: 'none', borderLeft: '1px solid #E2E8F0', cursor: 'pointer', color: inCompare ? '#0033A0' : '#475569', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}>
              {inCompare ? '✓ Added' : '+ Compare'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, color }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94A3B8', marginBottom: 2 }}>
        {icon}
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: color || '#0F172A', fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  );
}

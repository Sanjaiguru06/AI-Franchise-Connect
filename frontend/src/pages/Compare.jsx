import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ViabilityBadge } from '../components/ViabilityBadge';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Brain } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function fmt(n) {
  if (!n && n !== 0) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

const ROWS = [
  { key: 'category', label: 'Category' },
  { key: 'brand_type', label: 'Brand Type' },
  { key: 'outlet_format', label: 'Outlet Format' },
  { key: 'investment_min', label: 'Min Investment', fmt: fmt },
  { key: 'investment_max', label: 'Max Investment', fmt: fmt },
  { key: 'franchise_fee_display', label: 'Franchise Fee' },
  { key: 'royalty_level', label: 'Royalty' },
  { key: 'royalty_pct', label: 'Royalty %', fmt: v => v === 0 ? '0%' : `${v}%` },
  { key: 'expected_revenue_min', label: 'Monthly Rev (Min)', fmt: fmt },
  { key: 'expected_revenue_max', label: 'Monthly Rev (Max)', fmt: fmt },
  { key: 'breakeven_months_min', label: 'Break-even (Min)', fmt: v => `${v} months` },
  { key: 'breakeven_months_max', label: 'Break-even (Max)', fmt: v => `${v} months` },
  { key: 'min_area_sqft', label: 'Min Area', fmt: v => v === 0 ? 'No space needed' : `${v} sqft` },
  { key: 'staff_required', label: 'Staff Needed' },
  { key: 'operational_complexity', label: 'Complexity' },
  { key: 'beginner_friendly', label: 'Beginner Friendly', fmt: v => v ? '✅ Yes' : '❌ No' },
  { key: 'training_provided', label: 'Training', fmt: v => v ? '✅ Included' : 'Self-managed' },
  { key: 'rent_sensitivity', label: 'Rent Sensitivity' },
  { key: 'footfall_dependency', label: 'Footfall Dependency' },
];

export default function Compare() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [franchises, setFranchises] = useState(location.state?.franchises || []);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    if (franchises.length >= 2 && user) {
      fetchInsight();
    }
  }, [franchises]);

  const fetchInsight = async () => {
    setInsightLoading(true);
    try {
      const r = await axios.post(`${API}/ai/compare-insight`, {
        franchise_ids: franchises.map(f => f.franchise_id)
      });
      setInsight(r.data);
    } catch { }
    finally { setInsightLoading(false); }
  };

  const getVal = (f, row) => {
    const val = f[row.key];
    if (val === undefined || val === null) return '—';
    return row.fmt ? row.fmt(val) : val.toString();
  };

  const highlight = (row) => {
    if (franchises.length < 2) return null;
    if (['investment_min', 'investment_max'].includes(row.key)) {
      const min = Math.min(...franchises.map(f => f[row.key] || Infinity));
      return franchises.map(f => f[row.key] === min ? 'best' : null);
    }
    if (['expected_revenue_min', 'expected_revenue_max'].includes(row.key)) {
      const max = Math.max(...franchises.map(f => f[row.key] || 0));
      return franchises.map(f => f[row.key] === max ? 'best' : null);
    }
    if (row.key === 'viability_score') {
      const max = Math.max(...franchises.map(f => f.viability_score || 0));
      return franchises.map(f => f.viability_score === max ? 'best' : null);
    }
    if (['breakeven_months_min', 'breakeven_months_max'].includes(row.key)) {
      const min = Math.min(...franchises.map(f => f[row.key] || Infinity));
      return franchises.map(f => f[row.key] === min ? 'best' : null);
    }
    return null;
  };

  if (franchises.length === 0) {
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 16 }}>No franchises selected for comparison</h2>
        <button onClick={() => navigate('/browse')} className="btn-primary">Browse Franchises</button>
      </div>
    );
  }

  const colWidth = `${100 / (franchises.length + 1)}%`;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '24px 0' }}>
        <div className="container">
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>Side-by-Side Comparison</h1>
          <p style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>Comparing {franchises.length} franchises · {franchises.map(f => f.name).join(' vs ')}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 24px' }}>
        {/* AI Insight */}
        {user && franchises.length >= 2 && (
          <div style={{ background: '#0033A0', padding: '20px 24px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Brain size={24} color="white" weight="fill" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>AI Verdict</div>
              {insightLoading ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              ) : insight ? (
                <div>
                  <p style={{ color: 'white', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{insight.verdict}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {[
                      { l: 'Best for Beginners', v: insight.best_for_beginners },
                      { l: 'Best ROI', v: insight.best_roi },
                      { l: 'Lowest Risk', v: insight.lowest_risk },
                    ].map(i => (
                      <div key={i.l} style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 14px' }}>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{i.l}</div>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{i.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Comparison table */}
        <div style={{ background: 'white', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: `160px ${franchises.map(() => '1fr').join(' ')}`, borderBottom: '2px solid #E2E8F0' }}>
            <div style={{ padding: '16px', background: '#F8F9FA' }} />
            {franchises.map(f => (
              <div key={f.franchise_id} style={{ padding: '16px', borderLeft: '1px solid #E2E8F0', background: '#F8F9FA' }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 6 }}>{f.name}</div>
                <ViabilityBadge score={f.viability_score} risk={f.risk_level} />
              </div>
            ))}
          </div>

          {/* Viability row */}
          <div style={{ display: 'grid', gridTemplateColumns: `160px ${franchises.map(() => '1fr').join(' ')}`, borderBottom: '1px solid #E2E8F0', background: '#F8F9FA' }}>
            <div style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center' }}>Viability Score</div>
            {franchises.map((f, fi) => {
              const maxScore = Math.max(...franchises.map(x => x.viability_score));
              const isBest = f.viability_score === maxScore;
              return (
                <div key={f.franchise_id} style={{ padding: '14px 16px', borderLeft: '1px solid #E2E8F0', background: isBest ? '#ECFDF5' : 'white' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 18, color: isBest ? '#065F46' : '#0F172A' }}>{f.viability_score}</span>
                  {isBest && <span style={{ marginLeft: 6, fontSize: 11, color: '#065F46', fontWeight: 700 }}>BEST</span>}
                </div>
              );
            })}
          </div>

          {/* Data rows */}
          {ROWS.map((row, ri) => {
            const hl = highlight(row);
            return (
              <div key={row.key} style={{ display: 'grid', gridTemplateColumns: `160px ${franchises.map(() => '1fr').join(' ')}`, borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', background: ri % 2 === 0 ? 'white' : '#F8F9FA', display: 'flex', alignItems: 'center' }}>{row.label}</div>
                {franchises.map((f, fi) => {
                  const isBest = hl ? hl[fi] === 'best' : false;
                  return (
                    <div key={f.franchise_id} style={{
                      padding: '12px 16px', borderLeft: '1px solid #E2E8F0',
                      background: isBest ? '#ECFDF5' : (ri % 2 === 0 ? 'white' : '#F8F9FA'),
                      fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)',
                      color: isBest ? '#065F46' : '#0F172A', display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      {getVal(f, row)}
                      {isBest && <span style={{ fontSize: 10, background: '#10B981', color: 'white', padding: '1px 5px', fontFamily: 'var(--font-body)' }}>BEST</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          {franchises.map(f => (
            <button key={f.franchise_id}
              onClick={() => navigate(`/roadmap/${f.franchise_id}`)}
              className="btn-primary" style={{ fontSize: 13, padding: '10px 20px' }}>
              Roadmap for {f.name} →
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

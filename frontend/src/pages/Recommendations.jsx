import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FranchiseCard from '../components/FranchiseCard';
import { Brain, Funnel, ArrowsDownUp } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Recommendations() {
  const location = useLocation();
  const navigate = useNavigate();
  const quizAnswers = location.state?.quizAnswers;
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('match');
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    if (!quizAnswers) { navigate('/quiz'); return; }
    fetchRecs();
  }, [quizAnswers]);

  const fetchRecs = async () => {
    setLoading(true); setError('');
    try {
      const r = await axios.post(`${API}/ai/match`, quizAnswers);
      setRecs(r.data.recommendations || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'AI matching failed. Please try again.');
    } finally { setLoading(false); }
  };

  const sorted = [...recs].sort((a, b) => {
    if (sortBy === 'match') return (b.match_score || 0) - (a.match_score || 0);
    if (sortBy === 'investment') return a.investment_min - b.investment_min;
    if (sortBy === 'viability') return b.viability_score - a.viability_score;
    if (sortBy === 'breakeven') return a.breakeven_months_min - b.breakeven_months_min;
    return 0;
  });

  const toggleCompare = (f) => {
    setCompareList(l =>
      l.find(x => x.franchise_id === f.franchise_id)
        ? l.filter(x => x.franchise_id !== f.franchise_id)
        : l.length < 3 ? [...l, f] : l
    );
  };

  const BUDGET_MAP = { under_5L: 'Under ₹5L', '5L_15L': '₹5–15L', '15L_30L': '₹15–30L', '30L_60L': '₹30–60L', above_60L: 'Above ₹60L' };
  const ZONE_MAP = { south_omr: 'South Chennai / OMR', central: 'Central Chennai', north: 'North Chennai', west: 'West Chennai', outskirts: 'Outskirts', any: 'Any Zone' };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, background: '#0033A0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={20} color="white" weight="fill" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0033A0', textTransform: 'uppercase', letterSpacing: '0.15em' }}>AI Match Results</div>
              <h1 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>Your Top Franchise Matches</h1>
            </div>
          </div>

          {/* Quiz summary */}
          {quizAnswers && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {[
                { l: 'Budget', v: BUDGET_MAP[quizAnswers.budget] },
                { l: 'Zone', v: ZONE_MAP[quizAnswers.zone] },
                { l: 'Experience', v: quizAnswers.experience },
                { l: 'Risk', v: quizAnswers.risk },
              ].map(t => (
                <div key={t.l} style={{ padding: '4px 10px', background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: 12 }}>
                  <span style={{ color: '#475569' }}>{t.l}: </span>
                  <span style={{ fontWeight: 700, color: '#0033A0', textTransform: 'capitalize' }}>{t.v}</span>
                </div>
              ))}
              <button onClick={() => navigate('/quiz')} style={{ padding: '4px 10px', background: 'none', border: '1px solid #E2E8F0', fontSize: 12, cursor: 'pointer', color: '#475569' }}>
                Edit Preferences →
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Compare bar */}
        {compareList.length > 0 && (
          <div style={{ background: '#0033A0', padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Comparing {compareList.length}/3:</span>
              {compareList.map(f => (
                <span key={f.franchise_id} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', fontSize: 13 }}>{f.name}</span>
              ))}
            </div>
            <button
              data-testid="go-compare"
              onClick={() => navigate('/compare', { state: { franchises: compareList } })}
              style={{ background: 'white', color: '#0033A0', border: 'none', padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Compare Now →
            </button>
          </div>
        )}

        {/* Sort controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 14, color: '#475569' }}>
            {loading ? 'AI is analyzing...' : `${recs.length} franchises matched`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowsDownUp size={16} color="#475569" />
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Sort by:</span>
            {[
              { v: 'match', l: 'AI Match %' },
              { v: 'viability', l: 'Viability Score' },
              { v: 'investment', l: 'Investment ↑' },
              { v: 'breakeven', l: 'Break-even ↑' },
            ].map(s => (
              <button key={s.v} data-testid={`sort-${s.v}`} onClick={() => setSortBy(s.v)} style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                background: sortBy === s.v ? '#0033A0' : 'white',
                color: sortBy === s.v ? 'white' : '#475569',
                border: `1px solid ${sortBy === s.v ? '#0033A0' : '#E2E8F0'}`,
                cursor: 'pointer', transition: 'all 0.15s'
              }}>{s.l}</button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 60, height: 60, border: '4px solid #E2E8F0', borderTopColor: '#0033A0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Groq AI is analyzing {(quizAnswers?.categories || []).join(', ')} franchises...</h3>
            <p style={{ color: '#475569', fontSize: 14 }}>Scoring each franchise against your profile. This takes 5–10 seconds.</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ padding: '24px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>AI Matching Failed</div>
            <p style={{ fontSize: 14 }}>{error}</p>
            <button onClick={fetchRecs} style={{ marginTop: 12, padding: '8px 16px', background: '#0033A0', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Retry</button>
          </div>
        )}

        {/* Results grid */}
        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {sorted.map(f => (
              <FranchiseCard
                key={f.franchise_id}
                franchise={f}
                matchScore={f.match_score}
                matchReason={f.match_reason}
                onCompare={toggleCompare}
                inCompare={!!compareList.find(x => x.franchise_id === f.franchise_id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>No exact matches found</h3>
            <p style={{ color: '#475569', marginBottom: 24 }}>Try widening your budget or selecting more categories.</p>
            <button onClick={() => navigate('/quiz')} className="btn-primary">Retake Quiz</button>
          </div>
        )}
      </div>
    </div>
  );
}

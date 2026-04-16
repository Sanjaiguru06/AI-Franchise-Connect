import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import FranchiseCard from '../components/FranchiseCard';
import { MagnifyingGlass, Funnel, X } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CATS = ['All', 'Tea & Coffee', 'Shawarma/BBQ', 'Biryani', 'Pharmacy', 'Salon', 'Car Care'];
const BUDGETS = [
  { l: 'Any Budget', v: '' },
  { l: 'Under ₹5L', v: '500000' },
  { l: 'Under ₹15L', v: '1500000' },
  { l: 'Under ₹30L', v: '3000000' },
  { l: 'Under ₹60L', v: '6000000' },
];
const RISKS = [{ l: 'Any Risk', v: '' }, { l: 'Safe', v: 'Safe' }, { l: 'Moderate', v: 'Moderate' }, { l: 'Risk', v: 'Risk' }];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [franchises, setFranchises] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [compareList, setCompareList] = useState([]);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All',
    search: '',
    investment_max: '',
    risk: '',
    beginner: false,
  });

  useEffect(() => {
    setPage(1);
    fetchFranchises(1);
  }, [filters]);

  useEffect(() => {
    fetchFranchises(page);
  }, [page]);

  const fetchFranchises = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15 };
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.investment_max) params.investment_max = filters.investment_max;
      if (filters.risk) params.risk = filters.risk;
      if (filters.beginner) params.beginner = true;
      const r = await axios.get(`${API}/franchises`, { params });
      setFranchises(r.data.franchises || []);
      setTotal(r.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  const toggleCompare = (f) => {
    setCompareList(l =>
      l.find(x => x.franchise_id === f.franchise_id)
        ? l.filter(x => x.franchise_id !== f.franchise_id)
        : l.length < 3 ? [...l, f] : l
    );
  };

  const clearFilters = () => setFilters({ category: 'All', search: '', investment_max: '', risk: '', beginner: false });
  const hasFilters = filters.category !== 'All' || filters.search || filters.investment_max || filters.risk || filters.beginner;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '32px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 8 }}>
            Explore Franchises
          </h1>
          <p style={{ fontSize: 15, color: '#475569' }}>{total} franchise listings across 6 categories in Chennai</p>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 24px' }}>
        {/* Compare bar */}
        {compareList.length > 0 && (
          <div style={{ background: '#0033A0', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Comparing {compareList.length}/3:</span>
              {compareList.map(f => (
                <span key={f.franchise_id} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', fontSize: 13 }}>{f.name}</span>
              ))}
            </div>
            <button onClick={() => navigate('/compare', { state: { franchises: compareList } })} style={{ background: 'white', color: '#0033A0', border: 'none', padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Compare Now →
            </button>
          </div>
        )}

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <MagnifyingGlass size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              data-testid="browse-search"
              type="text" placeholder="Search franchises..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ width: '100%', padding: '11px 12px 11px 36px', border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#0033A0'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>
          <select data-testid="filter-budget" value={filters.investment_max} onChange={e => setFilters(f => ({ ...f, investment_max: e.target.value }))}
            style={{ padding: '11px 14px', border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'var(--font-body)', background: 'white', cursor: 'pointer', outline: 'none' }}>
            {BUDGETS.map(b => <option key={b.v} value={b.v}>{b.l}</option>)}
          </select>
          <select data-testid="filter-risk" value={filters.risk} onChange={e => setFilters(f => ({ ...f, risk: e.target.value }))}
            style={{ padding: '11px 14px', border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'var(--font-body)', background: 'white', cursor: 'pointer', outline: 'none' }}>
            {RISKS.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', border: '1.5px solid #E2E8F0', background: filters.beginner ? '#EFF6FF' : 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <input data-testid="filter-beginner" type="checkbox" checked={filters.beginner} onChange={e => setFilters(f => ({ ...f, beginner: e.target.checked }))} style={{ accentColor: '#0033A0' }} />
            Beginner Friendly
          </label>
          {hasFilters && (
            <button onClick={clearFilters} style={{ padding: '11px 14px', background: 'none', border: '1.5px solid #E2E8F0', cursor: 'pointer', fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATS.map(c => (
            <button
              key={c}
              data-testid={`cat-tab-${c.replace(/[^a-z]/gi, '-').toLowerCase()}`}
              onClick={() => setFilters(f => ({ ...f, category: c }))}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 600,
                background: filters.category === c ? '#0033A0' : 'white',
                color: filters.category === c ? 'white' : '#475569',
                border: `1.5px solid ${filters.category === c ? '#0033A0' : '#E2E8F0'}`,
                cursor: 'pointer', transition: 'all 0.15s'
              }}>{c}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 320, background: '#f0f0f0' }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {franchises.map(f => (
                <FranchiseCard key={f.franchise_id} franchise={f} onCompare={toggleCompare} inCompare={!!compareList.find(x => x.franchise_id === f.franchise_id)} />
              ))}
            </div>
            {franchises.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No franchises found</h3>
                <p style={{ color: '#475569' }}>Try clearing your filters</p>
              </div>
            )}
            {/* Pagination */}
            {total > 15 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', border: '1px solid #E2E8F0', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
                <span style={{ padding: '8px 16px', background: '#0033A0', color: 'white', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total} style={{ padding: '8px 16px', border: '1px solid #E2E8F0', background: 'white', cursor: page * 15 >= total ? 'not-allowed' : 'pointer', opacity: page * 15 >= total ? 0.4 : 1 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

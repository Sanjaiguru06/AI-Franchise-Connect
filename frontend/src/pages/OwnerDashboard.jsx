import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ViabilityBadge } from '../components/ViabilityBadge';
import { PlusCircle, Pencil, Trash, ChartBar, Eye } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function fmt(n) {
  if (!n) return '₹0';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n}`;
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/auth'); return; }
    axios.get(`${API}/franchises/mine`).then(r => {
      setFranchises(r.data.franchises || []);
    }).finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (fid) => {
    if (!window.confirm('Deactivate this listing?')) return;
    try {
      await axios.delete(`${API}/franchises/${fid}`);
      setFranchises(f => f.filter(x => x.franchise_id !== fid));
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to delete');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0033A0', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Owner Dashboard</div>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              Welcome, {user?.name?.split(' ')[0]}
            </h1>
            <p style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>Manage your franchise listings and track performance.</p>
          </div>
          <button data-testid="add-franchise-btn" onClick={() => navigate('/owner/add')} className="btn-primary" style={{ gap: 8 }}>
            <PlusCircle size={18} weight="bold" /> List New Franchise
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Active Listings', value: franchises.length, icon: '🏪' },
            { label: 'Total Views', value: '—', icon: '👁️' },
            { label: 'Inquiries', value: '—', icon: '💬' },
            { label: 'Account Type', value: 'Owner', icon: '⭐' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', border: '1px solid #E2E8F0', padding: '20px 24px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Listings */}
        <div style={{ background: 'white', border: '1px solid #E2E8F0' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>My Franchise Listings</h2>
            <span style={{ fontSize: 13, color: '#475569', fontFamily: 'var(--font-mono)' }}>{franchises.length} listings</span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} /></div>
          ) : franchises.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No listings yet</h3>
              <p style={{ color: '#475569', marginBottom: 24, fontSize: 14 }}>List your franchise and reach 1000+ seekers on FranchiseIQ.</p>
              <button onClick={() => navigate('/owner/add')} className="btn-primary">List Your First Franchise →</button>
            </div>
          ) : (
            <div>
              {franchises.map(f => (
                <div key={f.franchise_id} data-testid={`listing-${f.franchise_id}`} style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, fontSize: 16 }}>{f.name}</h3>
                      <ViabilityBadge score={f.viability_score} risk={f.risk_level} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, color: '#475569' }}>📂 {f.category}</span>
                      <span style={{ fontSize: 13, color: '#475569', fontFamily: 'var(--font-mono)' }}>💰 {fmt(f.investment_min)} – {fmt(f.investment_max)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button data-testid={`view-${f.franchise_id}`} onClick={() => navigate(`/franchise/${f.franchise_id}`)} style={{ padding: '8px 14px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Eye size={14} /> View
                    </button>
                    <button data-testid={`edit-${f.franchise_id}`} onClick={() => navigate(`/owner/edit/${f.franchise_id}`)} style={{ padding: '8px 14px', border: '1px solid #0033A0', color: '#0033A0', background: 'white', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button data-testid={`delete-${f.franchise_id}`} onClick={() => handleDelete(f.franchise_id)} style={{ padding: '8px 14px', border: '1px solid #EF4444', color: '#EF4444', background: 'white', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Trash size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

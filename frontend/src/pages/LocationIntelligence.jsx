import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, TrendUp, Warning } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATS = ['Tea & Coffee', 'Shawarma/BBQ', 'Biryani', 'Pharmacy', 'Salon', 'Car Care'];
const CAT_COLORS = {
  'Tea & Coffee': '#F59E0B', 'Shawarma/BBQ': '#EF4444', 'Biryani': '#10B981',
  'Pharmacy': '#3B82F6', 'Salon': '#8B5CF6', 'Car Care': '#06B6D4'
};
const SAT_COLOR = { Low: '#10B981', Medium: '#F59E0B', High: '#EF4444' };

export default function LocationIntelligence() {
  const [zones, setZones] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedCat, setSelectedCat] = useState('All');

  useEffect(() => {
    axios.get(`${API}/location/intelligence`).then(r => {
      setZones(r.data.zones || []);
      setInsights(r.data.insights || []);
      if (r.data.zones?.length) setSelectedZone(r.data.zones[0]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} /></div>;

  const filteredInsights = selectedCat === 'All' ? insights : insights.filter(i => i.category === selectedCat);

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div style={{
        background: '#0F172A', padding: '48px 0', position: 'relative', overflow: 'hidden',
        backgroundImage: 'url(https://images.unsplash.com/photo-1724992609108-0918470cb673?w=1200&auto=format&fit=crop&q=40)',
        backgroundSize: 'cover', backgroundPosition: 'center'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>Location Intelligence</div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: 'white', letterSpacing: '-1px', marginBottom: 12 }}>
            Chennai Zone Analysis
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 500 }}>
            Demand vs. saturation data for all 5 Chennai zones across 6 franchise categories.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Best Opportunities */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Best Opportunities Right Now</h2>
          <p style={{ color: '#475569', fontSize: 14, marginBottom: 20 }}>Highest demand + lowest saturation = best entry window</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {insights.map(ins => (
              <div key={ins.category} style={{ background: 'white', border: '1px solid #E2E8F0', padding: '16px', borderLeft: `4px solid ${CAT_COLORS[ins.category] || '#0033A0'}` }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{ins.category}</div>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>{ins.best_zone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: '#E2E8F0' }}>
                    <div style={{ height: '100%', background: CAT_COLORS[ins.category], width: `${ins.opportunity_score}%` }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: '#0033A0' }}>{ins.opportunity_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {zones.map(z => (
            <button key={z.id} onClick={() => setSelectedZone(z)} style={{
              padding: '10px 20px', border: `2px solid ${selectedZone?.id === z.id ? '#0033A0' : '#E2E8F0'}`,
              background: selectedZone?.id === z.id ? '#EFF6FF' : 'white', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, color: selectedZone?.id === z.id ? '#0033A0' : '#475569', transition: 'all 0.15s'
            }}>{z.name.split('(')[0].trim()}</button>
          ))}
        </div>

        {/* Selected Zone Detail */}
        {selectedZone && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 32 }}>
            {/* Zone info */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <MapPin size={20} color="#0033A0" weight="fill" />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{selectedZone.name}</h3>
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 16, lineHeight: 1.6 }}>
                <strong>Subzones:</strong> {selectedZone.subzones}
              </div>
              <div style={{ fontSize: 13, color: '#0F172A', lineHeight: 1.6, marginBottom: 16, padding: '12px', background: '#F8F9FA', border: '1px solid #E2E8F0' }}>
                {selectedZone.profile}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Avg Rent</span>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>₹{selectedZone.avg_rent_sqft}/sqft</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Best Categories Here</div>
                {selectedZone.best_categories?.map(c => (
                  <span key={c} style={{ display: 'inline-block', margin: '3px 4px 3px 0', padding: '4px 10px', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, fontWeight: 600, border: '1px solid #BFDBFE' }}>{c}</span>
                ))}
              </div>
            </div>

            {/* Demand vs Saturation */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '24px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Demand vs. Saturation by Category</h3>
              {CATS.map(cat => {
                const demand = selectedZone.demand?.[cat] || 0;
                const sat = selectedZone.saturation?.[cat] || 'Low';
                const opportunity = demand - ({ High: 30, Medium: 15, Low: 0 }[sat] || 0);
                return (
                  <div key={cat} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, background: CAT_COLORS[cat], borderRadius: '50%' }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{cat}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, padding: '2px 8px', background: SAT_COLOR[sat] + '20', color: SAT_COLOR[sat], fontWeight: 700, border: `1px solid ${SAT_COLOR[sat]}40` }}>
                          {sat} Competition
                        </span>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0033A0' }}>{demand}%</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: '#F1F5F9', borderRadius: 0, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${demand}%`,
                        background: `linear-gradient(90deg, ${CAT_COLORS[cat]}, ${CAT_COLORS[cat]}90)`,
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Zone Matrix */}
        <div style={{ background: 'white', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Full Zone × Category Matrix</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#F8F9FA' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', borderBottom: '1px solid #E2E8F0' }}>Zone</th>
                  {CATS.map(c => <th key={c} style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#475569', borderBottom: '1px solid #E2E8F0' }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {zones.map(z => (
                  <tr key={z.id} style={{ borderBottom: '1px solid #F1F5F9' }} onClick={() => setSelectedZone(z)}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#0033A0' }}>{z.name.split('(')[0].trim()}</td>
                    {CATS.map(cat => {
                      const sat = z.saturation?.[cat] || 'Low';
                      const demand = z.demand?.[cat] || 0;
                      return (
                        <td key={cat} style={{ padding: '10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0033A0' }}>{demand}%</div>
                            <div style={{ fontSize: 10, padding: '1px 6px', background: SAT_COLOR[sat] + '20', color: SAT_COLOR[sat], fontWeight: 700, border: `1px solid ${SAT_COLOR[sat]}40` }}>{sat}</div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

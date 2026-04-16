import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ViabilityGauge, ViabilityBadge } from '../components/ViabilityBadge';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, CurrencyInr, Timer, Users, Buildings, Brain, PaperPlaneRight,
  ArrowLeft, ChartBar, ArrowRight, CheckCircle
} from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function fmt(n) {
  if (!n) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

const CAT_COLORS = {
  'Tea & Coffee': '#FFF7ED', 'Shawarma/BBQ': '#FFF1F2', 'Biryani': '#ECFDF5',
  'Pharmacy': '#EFF6FF', 'Salon': '#F5F3FF', 'Car Care': '#F0FDF4',
};

export default function FranchiseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [franchise, setFranchise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    axios.get(`${API}/franchises/${id}`)
      .then(r => setFranchise(r.data))
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));

    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: `Hi! I'm your AI advisor for this franchise. Ask me anything — "Is this good for a beginner?", "What's the risk?", "How much can I earn?" — I'll explain it in plain language.`
    }]);
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendChat = async (e) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;
    if (!user) { navigate('/auth'); return; }
    const msg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const r = await axios.post(`${API}/ai/chat`, {
        franchise_id: franchise.franchise_id,
        message: msg, session_id: sessionId
      });
      setMessages(m => [...m, { role: 'assistant', content: r.data.response }]);
      setSessionId(r.data.session_id);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I had an issue. Please try again.' }]);
    } finally { setChatLoading(false); }
  };

  const QUICK_QUESTIONS = ['Is this beginner friendly?', 'What are the main risks?', 'How much monthly profit?', 'Best location in Chennai?'];

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} /></div>;
  if (!franchise) return <div style={{ padding: 80, textAlign: 'center' }}>Franchise not found. <button onClick={() => navigate('/browse')} style={{ background: 'none', border: 'none', color: '#0033A0', cursor: 'pointer', fontWeight: 700 }}>Browse all →</button></div>;

  const {
    name, category, brand_type, short_description, outlet_format,
    investment_min, investment_max, franchise_fee_display,
    royalty_level, royalty_pct, setup_includes = [],
    min_area_sqft, max_area_sqft, best_chennai_zones = [],
    rent_sensitivity, footfall_dependency, staff_required,
    training_provided, operational_complexity, beginner_friendly,
    expected_revenue_min, expected_revenue_max,
    breakeven_months_min, breakeven_months_max,
    viability_score, risk_level
  } = franchise;

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: CAT_COLORS[category] || 'white', borderBottom: '1px solid #E2E8F0', padding: '32px 0' }}>
        <div className="container">
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#0033A0', marginBottom: 10 }}>{category} · {brand_type}</div>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-1px', marginBottom: 12 }}>{name}</h1>
              <p style={{ fontSize: 16, color: '#475569', maxWidth: 560, lineHeight: 1.7, marginBottom: 16 }}>{short_description}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {beginner_friendly && <span style={{ padding: '4px 10px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: 12, fontWeight: 700 }}>Beginner Friendly</span>}
                {royalty_level === 'None' && <span style={{ padding: '4px 10px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: 12, fontWeight: 700 }}>No Royalty</span>}
                <span style={{ padding: '4px 10px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 12, fontWeight: 700 }}>{outlet_format}</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ViabilityGauge score={viability_score} risk={risk_level} />
              <div style={{ marginTop: 12, fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Viability Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key metrics bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 0 }}>
          {[
            { label: 'Investment', value: `${fmt(investment_min)} – ${fmt(investment_max)}`, icon: '💰' },
            { label: 'Monthly Revenue', value: `${fmt(expected_revenue_min)} – ${fmt(expected_revenue_max)}`, icon: '📈' },
            { label: 'Break-even', value: `${breakeven_months_min}–${breakeven_months_max} months`, icon: '⏱️' },
            { label: 'Royalty', value: royalty_level === 'None' ? 'Zero Royalty ✓' : `${royalty_pct}%`, icon: '🤝' },
            { label: 'Area Required', value: min_area_sqft === 0 ? 'No space needed' : `${min_area_sqft}–${max_area_sqft} sqft`, icon: '📐' },
          ].map(m => (
            <div key={m.label} style={{ padding: '20px 16px', borderRight: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: '#0F172A', marginBottom: 2 }}>{m.value}</div>
              <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container" style={{ display: 'flex', gap: 0 }}>
          {[
            { v: 'overview', l: 'Overview' },
            { v: 'operations', l: 'Operations' },
            { v: 'location', l: 'Location' },
          ].map(t => (
            <button key={t.v} onClick={() => setActiveTab(t.v)} style={{
              padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-body)',
              color: activeTab === t.v ? '#0033A0' : '#475569',
              borderBottom: `2px solid ${activeTab === t.v ? '#0033A0' : 'transparent'}`,
              transition: 'all 0.2s'
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Left: Detail panels */}
        <div>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <InfoCard title="Investment Breakdown">
                <Row label="Franchise Fee" value={franchise_fee_display} />
                <Row label="Royalty" value={royalty_level === 'None' ? '0% — No royalty' : `${royalty_pct}% (${royalty_level})`} highlight={royalty_level === 'None'} />
                <Row label="Total Investment" value={`${fmt(investment_min)} – ${fmt(investment_max)}`} />
                <Row label="Setup Includes" value={setup_includes.join(', ')} />
              </InfoCard>
              <InfoCard title="Revenue Potential">
                <Row label="Monthly Revenue Est." value={`${fmt(expected_revenue_min)} – ${fmt(expected_revenue_max)}`} />
                <Row label="Break-even Period" value={`${breakeven_months_min}–${breakeven_months_max} months`} />
              </InfoCard>
              <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '24px' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>AI Viability Analysis</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'For Beginners', value: beginner_friendly ? 'Recommended ✓' : 'Requires experience', ok: beginner_friendly },
                    { label: 'Complexity', value: operational_complexity, ok: !operational_complexity.toLowerCase().includes('high') },
                    { label: 'Royalty Structure', value: royalty_level, ok: royalty_level === 'None' || royalty_level === 'Low' },
                    { label: 'Risk Level', value: risk_level, ok: risk_level === 'Safe' },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '14px', background: m.ok ? '#ECFDF5' : '#F8F9FA', border: `1px solid ${m.ok ? '#A7F3D0' : '#E2E8F0'}` }}>
                      <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: m.ok ? '#065F46' : '#0F172A' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operations' && (
            <InfoCard title="Operational Details">
              <Row label="Outlet Format" value={outlet_format} />
              <Row label="Area Required" value={min_area_sqft === 0 ? 'No physical space' : `${min_area_sqft}–${max_area_sqft} sq ft`} />
              <Row label="Staff Required" value={staff_required} />
              <Row label="Operational Complexity" value={operational_complexity} />
              <Row label="Rent Sensitivity" value={rent_sensitivity} />
              <Row label="Footfall Dependency" value={footfall_dependency} />
              <Row label="Training Provided" value={training_provided ? 'Yes — full training included' : 'Self-managed'} highlight={training_provided} />
            </InfoCard>
          )}

          {activeTab === 'location' && (
            <InfoCard title="Chennai Location Intelligence">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 10 }}>Best Zones for This Franchise</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {best_chennai_zones.map(z => (
                    <span key={z} style={{ padding: '6px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 13, fontWeight: 600 }}>
                      📍 {z}
                    </span>
                  ))}
                </div>
              </div>
              <Row label="Rent Sensitivity" value={rent_sensitivity} />
              <Row label="Footfall Requirement" value={footfall_dependency} />
            </InfoCard>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button
              data-testid="get-roadmap-btn"
              onClick={() => navigate(`/roadmap/${franchise.franchise_id}`)}
              className="btn-primary" style={{ gap: 10 }}>
              <ArrowRight size={16} /> Get My Roadmap
            </button>
            <button
              data-testid="view-location-btn"
              onClick={() => navigate('/location')}
              className="btn-outline" style={{ fontSize: 14 }}>
              Zone Intelligence →
            </button>
          </div>
        </div>

        {/* Right: AI Chat */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'white', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ background: '#0033A0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={18} color="white" weight="fill" />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>AI Franchise Explainer</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Powered by Groq · {name}</div>
              </div>
            </div>

            {/* Quick questions */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => { setInput(q); }} style={{ padding: '5px 10px', background: '#F1F5F9', border: '1px solid #E2E8F0', fontSize: 11, cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#EFF6FF'}
                  onMouseOut={e => e.currentTarget.style.background = '#F1F5F9'}>{q}</button>
              ))}
            </div>

            {/* Messages */}
            <div style={{ height: 320, overflowY: 'auto', padding: '16px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 16, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '10px 14px',
                    background: m.role === 'user' ? '#0033A0' : '#F1F5F9',
                    color: m.role === 'user' ? 'white' : '#0F172A',
                    fontSize: 13, lineHeight: 1.6, borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px'
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: 'flex', gap: 6, padding: '8px 0' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#94A3B8', animation: 'bounce-dot 1.4s infinite' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#94A3B8', animation: 'bounce-dot 1.4s -0.16s infinite' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#94A3B8', animation: 'bounce-dot 1.4s -0.32s infinite' }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendChat} style={{ borderTop: '1px solid #E2E8F0', display: 'flex', gap: 0 }}>
              <input
                data-testid="chat-input"
                value={input} onChange={e => setInput(e.target.value)}
                placeholder={user ? 'Ask about this franchise...' : 'Login to chat with AI'}
                disabled={!user}
                style={{ flex: 1, padding: '14px 16px', border: 'none', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', background: user ? 'white' : '#F8F9FA' }}
              />
              <button data-testid="chat-send" type="submit" disabled={!input.trim() || chatLoading || !user}
                style={{ padding: '14px 16px', background: '#0033A0', border: 'none', cursor: 'pointer', color: 'white', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#002277'}
                onMouseOut={e => e.currentTarget.style.background = '#0033A0'}>
                <PaperPlaneRight size={18} weight="fill" />
              </button>
            </form>
            {!user && (
              <div style={{ padding: '8px 16px', background: '#FFFBEB', fontSize: 12, color: '#92400E', textAlign: 'center' }}>
                <button onClick={() => navigate('/auth')} style={{ background: 'none', border: 'none', color: '#0033A0', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Login</button> to use AI Explainer
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '24px' }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F1F5F9' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 13, color: '#475569', fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: highlight ? '#065F46' : '#0F172A', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

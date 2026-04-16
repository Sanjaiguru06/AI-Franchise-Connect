import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Buildings, Brain, ChartBar, MapPin, Star, Lightning, Users } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HERO_BG = "https://images.unsplash.com/photo-1754398783378-85c228f5f577?w=1400&auto=format&fit=crop&q=60";

const STEPS = [
  { n: '01', title: 'Readiness Quiz', desc: 'Tell us your budget, zone, experience & goals.', icon: <Users size={24} weight="bold" color="#0033A0" /> },
  { n: '02', title: 'AI Match', desc: 'Groq AI ranks franchises by % compatibility for you.', icon: <Brain size={24} weight="bold" color="#0033A0" /> },
  { n: '03', title: 'Compare + Score', desc: 'Viability Index 0–100 with Safe / Moderate / Risk.', icon: <ChartBar size={24} weight="bold" color="#0033A0" /> },
  { n: '04', title: 'AI Explainer', desc: 'Chat with AI: "Is this good for a beginner?"', icon: <Lightning size={24} weight="bold" color="#0033A0" /> },
  { n: '05', title: 'Roadmap', desc: 'Legal, finance, licensing — step-by-step checklist.', icon: <Star size={24} weight="bold" color="#0033A0" /> },
];

const WHY = [
  { title: 'Guided Journey', sub: 'Not a raw directory', desc: 'Step-by-step advisor that holds your hand through every decision.' },
  { title: 'Viability Index', sub: '0–100 risk score', desc: 'Objective AI score based on investment, breakeven & market conditions.' },
  { title: 'AI Explainer', sub: 'Beginner-friendly Q&A', desc: 'Chat in plain language. No jargon, just clarity on any franchise.' },
  { title: 'Zone Intel', sub: 'Chennai-specific', desc: 'Demand vs saturation data for all 5 Chennai zones.' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 130, categories: 6 });
  const [featuredFranchises, setFeaturedFranchises] = useState([]);

  useEffect(() => {
    axios.get(`${API}/franchises?limit=6`).then(r => {
      setFeaturedFranchises(r.data.franchises || []);
      setStats(s => ({ ...s, total: r.data.total || 130 }));
    }).catch(() => {});
  }, []);

  return (
    <div style={{ background: '#fff' }}>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, backgroundImage: `url(${HERO_BG})`,
          backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.15)'
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,51,160,0.85) 0%, rgba(0,0,0,0.6) 100%)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ maxWidth: 720 }} className="animate-fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 14px', marginBottom: 28 }}>
              <Lightning size={14} color="#F59E0B" weight="fill" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>AI-Powered · Chennai-Focused · {stats.total}+ Franchises</span>
            </div>

            <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 24, fontFamily: 'var(--font-heading)' }}>
              Find Your Perfect<br />
              <span style={{ color: '#60A5FA' }}>Franchise Match</span><br />
              with AI.
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 540, marginBottom: 40 }}>
              The intelligent platform that guides first-time entrepreneurs from discovery to launch — not just a directory, your franchise advisor.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                data-testid="hero-find-match"
                onClick={() => navigate(user ? '/quiz' : '/auth?mode=register')}
                className="btn-primary"
                style={{ fontSize: 16, padding: '15px 32px', gap: 10 }}>
                Find My Franchise Match <ArrowRight size={18} weight="bold" />
              </button>
              <button
                data-testid="hero-browse"
                onClick={() => navigate('/browse')}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', padding: '14px 28px', cursor: 'pointer', fontWeight: 600, fontSize: 16, fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                Browse All Franchises
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 0' }}>
          <div className="container" style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {[
              { v: `${stats.total}+`, l: 'Franchise Listings' },
              { v: '6', l: 'Categories' },
              { v: '5', l: 'Chennai Zones' },
              { v: 'AI', l: 'Powered by Groq' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: 'var(--font-mono)' }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="section" style={{ background: '#F8F9FA', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0033A0', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>The Process</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-1px' }}>Your 5-Step Journey to Franchise Success</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1, background: '#E2E8F0' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ background: 'white', padding: '32px 24px', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#F8F9FA'}
                onMouseOut={e => e.currentTarget.style.background = 'white'}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#0033A0', letterSpacing: '0.15em', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>STEP {s.n}</div>
                <div style={{ marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0033A0', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 10 }}>Categories</div>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>6 Industries, 130+ Opportunities</h2>
            </div>
            <Link to="/browse" style={{ textDecoration: 'none' }}><button className="btn-outline" style={{ fontSize: 13 }}>Browse All →</button></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 1, background: '#E2E8F0' }}>
            {[
              { name: 'Tea & Coffee', emoji: '☕', count: '43 listings', color: '#FFF7ED' },
              { name: 'Shawarma/BBQ', emoji: '🥙', count: '22 listings', color: '#FFF1F2' },
              { name: 'Biryani', emoji: '🍚', count: '20 listings', color: '#ECFDF5' },
              { name: 'Pharmacy', emoji: '💊', count: '10 listings', color: '#EFF6FF' },
              { name: 'Salon', emoji: '✂️', count: '11 listings', color: '#F5F3FF' },
              { name: 'Car Care', emoji: '🚗', count: '14 listings', color: '#F0FDF4' },
            ].map(c => (
              <Link key={c.name} to={`/browse?category=${encodeURIComponent(c.name)}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: c.color, padding: '28px 20px', cursor: 'pointer', borderBottom: '3px solid transparent', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderBottomColor = '#0033A0'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderBottomColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{c.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{c.count}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ───────────────────────────────────────────────── */}
      <section className="section" style={{ background: '#0033A0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>Why FranchiseIQ</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Built Better than bharatfranchise.com</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: 'rgba(255,255,255,0.1)' }}>
            {WHY.map((w, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '32px 24px', borderBottom: '3px solid rgba(255,255,255,0)', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                <div style={{ fontWeight: 800, fontSize: 18, color: 'white', marginBottom: 4 }}>{w.title}</div>
                <div style={{ fontSize: 12, color: '#60A5FA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{w.sub}</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="section" style={{ background: '#F8F9FA', borderTop: '1px solid #E2E8F0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-1px', marginBottom: 16 }}>Ready to Find Your Franchise?</h2>
          <p style={{ fontSize: 16, color: '#475569', marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
            Join thousands of Chennai entrepreneurs who made confident franchise decisions with FranchiseIQ.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button data-testid="cta-quiz" onClick={() => navigate(user ? '/quiz' : '/auth?mode=register')} className="btn-primary" style={{ fontSize: 16, padding: '15px 36px' }}>
              Take the AI Quiz →
            </button>
            <button data-testid="cta-owner" onClick={() => navigate(user?.role === 'owner' ? '/owner/dashboard' : '/auth?mode=register&role=owner')}
              className="btn-outline" style={{ fontSize: 16, padding: '15px 32px' }}>
              List Your Franchise
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E2E8F0', padding: '32px 0', background: '#0F172A' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Buildings size={20} color="#60A5FA" weight="fill" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'white', fontSize: 16 }}>FranchiseIQ</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Chennai's #1 AI-Powered Franchise Discovery Platform · 2024
          </div>
        </div>
      </footer>
    </div>
  );
}

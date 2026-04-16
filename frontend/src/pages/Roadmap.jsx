import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Circle, Clock, CurrencyInr, Brain } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Roadmap() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [franchise, setFranchise] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem(`roadmap_${id}`) || '{}');
    setCompleted(savedProgress);

    // Fetch franchise first, then roadmap
    axios.get(`${API}/franchises/${id}`).then(r => {
      setFranchise(r.data);
      return axios.post(`${API}/ai/roadmap`, {
        franchise_id: r.data.franchise_id,
        zone: r.data.best_chennai_zones?.[0] || 'Chennai',
        experience: 'none'
      });
    }).then(r => {
      setRoadmap(r.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const toggleStep = (i) => {
    const next = { ...completed, [i]: !completed[i] };
    setCompleted(next);
    localStorage.setItem(`roadmap_${id}`, JSON.stringify(next));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalSteps = roadmap?.steps?.length || 0;
  const progress = totalSteps ? Math.round((completedCount / totalSteps) * 100) : 0;

  if (loading) return (
    <div style={{ padding: 80, textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, border: '4px solid #E2E8F0', borderTopColor: '#0033A0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
      <p style={{ color: '#475569', fontSize: 14 }}>Groq AI is building your personalized roadmap...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div style={{ background: '#0033A0', padding: '32px 0 0' }}>
        <div className="container">
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Brain size={20} color="rgba(255,255,255,0.8)" weight="fill" />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI-Generated Roadmap</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: 8 }}>
            {franchise?.name} Launch Plan
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 24 }}>
            {roadmap?.total_duration || 'Personalized timeline'} · Chennai Market
          </p>

          {/* Progress bar */}
          <div style={{ background: 'rgba(255,255,255,0.15)', height: 4, marginBottom: 0 }}>
            <div style={{ height: '100%', background: '#60A5FA', width: `${progress}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Progress summary */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ padding: '16px 24px', background: 'white', border: '1px solid #E2E8F0', flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0033A0', fontFamily: 'var(--font-mono)' }}>{progress}%</div>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Completed</div>
          </div>
          <div style={{ padding: '16px 24px', background: 'white', border: '1px solid #E2E8F0', flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{completedCount}/{totalSteps}</div>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Steps Done</div>
          </div>
          <div style={{ padding: '16px 24px', background: 'white', border: '1px solid #E2E8F0', flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{roadmap?.total_duration || 'TBD'}</div>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Total Duration</div>
          </div>
        </div>

        {/* Steps - vertical timeline */}
        <div style={{ position: 'relative', paddingLeft: 0 }}>
          {roadmap?.steps?.map((step, i) => {
            const done = !!completed[i];
            return (
              <div key={i} style={{ display: 'flex', gap: 20, marginBottom: 0, position: 'relative' }}>
                {/* Timeline line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 48 }}>
                  <button onClick={() => toggleStep(i)} style={{
                    width: 44, height: 44, borderRadius: '50%', border: `3px solid ${done ? '#10B981' : '#0033A0'}`,
                    background: done ? '#10B981' : 'white', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s'
                  }}>
                    {done ? <CheckCircle size={24} color="white" weight="fill" /> : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 14, color: '#0033A0' }}>
                        {step.step || i + 1}
                      </span>
                    )}
                  </button>
                  {i < (roadmap?.steps?.length || 0) - 1 && (
                    <div style={{ width: 3, flex: 1, background: done ? '#10B981' : '#E2E8F0', minHeight: 40, transition: 'background 0.3s' }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingBottom: 32 }}>
                  <div style={{ background: done ? '#ECFDF5' : 'white', border: `1px solid ${done ? '#A7F3D0' : '#E2E8F0'}`, padding: '20px 24px', transition: 'all 0.25s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                          {step.icon || '📌'} {step.duration || `Step ${i + 1}`}
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: done ? '#065F46' : '#0F172A' }}>{step.title}</h3>
                      </div>
                      {step.cost_estimate && step.cost_estimate !== '₹0' && (
                        <div style={{ padding: '6px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: 12, fontWeight: 700, color: '#1D4ED8', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                          {step.cost_estimate}
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>{step.description}</p>
                    {step.actions?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginBottom: 10 }}>Action Items</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {step.actions.map((action, ai) => (
                            <div key={ai} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <div style={{ width: 20, height: 20, background: done ? '#10B981' : '#0033A0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{ai + 1}</span>
                              </div>
                              <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <button onClick={() => toggleStep(i)} style={{ marginTop: 16, padding: '8px 16px', background: done ? '#10B981' : '#0033A0', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'background 0.2s' }}>
                      {done ? '✓ Completed — Click to Undo' : 'Mark as Done'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips */}
        {roadmap?.tips?.length > 0 && (
          <div style={{ background: '#0033A0', padding: '24px', marginTop: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Pro Tips from FranchiseIQ</div>
            {roadmap.tips.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, background: '#60A5FA', borderRadius: '50%', marginTop: 8, flexShrink: 0 }} />
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{t}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

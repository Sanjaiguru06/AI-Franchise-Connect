import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ArrowLeft, Brain } from '@phosphor-icons/react';

const STEPS = [
  {
    id: 'budget', question: 'What is your investment budget?',
    subtext: 'Include franchise fee and setup costs.',
    options: [
      { v: 'under_5L', l: 'Under ₹5 Lakhs', d: 'Entry-level kiosk & cloud kitchen models' },
      { v: '5L_15L', l: '₹5 – ₹15 Lakhs', d: 'QSR, salon, and mid-range food franchises' },
      { v: '15L_30L', l: '₹15 – ₹30 Lakhs', d: 'Established brands with proven systems' },
      { v: '30L_60L', l: '₹30 – ₹60 Lakhs', d: 'Premium retail, pharmacy & full salons' },
      { v: 'above_60L', l: 'Above ₹60 Lakhs', d: 'Premium chains and national brands' },
    ],
  },
  {
    id: 'zone', question: 'Which Chennai zone interests you?',
    subtext: 'We will show franchise demand vs saturation for this zone.',
    options: [
      { v: 'south_omr', l: 'South Chennai / OMR', d: 'IT Corridor — Velachery, Sholinganallur, Navalur' },
      { v: 'central', l: 'Central Chennai', d: 'Anna Nagar, T Nagar, Chetpet — high footfall' },
      { v: 'north', l: 'North Chennai', d: 'Padi, Ambattur — underserved, low rents' },
      { v: 'west', l: 'West Chennai', d: 'Porur, Vadapalani, Koyambedu — transit hub' },
      { v: 'outskirts', l: 'Outskirts (GST / ECR)', d: 'Pallavaram, Tambaram — emerging zones' },
      { v: 'any', l: 'Open to Any Zone', d: 'Show me the best fit regardless of zone' },
    ],
  },
  {
    id: 'experience', question: 'What is your business experience level?',
    subtext: 'This helps match you with franchises that suit your background.',
    options: [
      { v: 'none', l: 'Complete Beginner', d: 'No prior business or franchise experience' },
      { v: 'basic', l: 'Some Experience', d: 'Managed a team, ran a small shop, or had a job in business' },
      { v: 'experienced', l: 'Experienced Entrepreneur', d: 'Previously ran or invested in a business' },
    ],
  },
  {
    id: 'risk', question: 'What is your risk tolerance?',
    subtext: 'This shapes our AI viability score recommendations for you.',
    options: [
      { v: 'low', l: 'Low Risk', d: 'I want proven brands with fast break-even and no royalty' },
      { v: 'medium', l: 'Medium Risk', d: 'Balanced between growth potential and stability' },
      { v: 'high', l: 'High Risk / High Reward', d: 'I am comfortable with higher investment and longer payback' },
    ],
  },
  {
    id: 'categories', question: 'Which business categories interest you?',
    subtext: 'Select all that apply. Our AI will consider these first.',
    multi: true,
    options: [
      { v: 'Tea & Coffee', l: 'Tea & Coffee', d: 'Kiosks, cafés, chai shops', emoji: '☕' },
      { v: 'Shawarma/BBQ', l: 'Shawarma / BBQ', d: 'QSR, street food, grills', emoji: '🥙' },
      { v: 'Biryani', l: 'Biryani', d: 'Cloud kitchens, dine-in, takeaway', emoji: '🍚' },
      { v: 'Pharmacy', l: 'Pharmacy', d: 'Generic & branded retail', emoji: '💊' },
      { v: 'Salon', l: 'Salon', d: 'Unisex, ladies, premium studios', emoji: '✂️' },
      { v: 'Car Care', l: 'Car Care', d: 'Wash, detailing, mobile service', emoji: '🚗' },
    ],
  },
];

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ budget: '', zone: '', experience: '', risk: '', categories: [] });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const current = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  const select = (val) => {
    if (current.multi) {
      setAnswers(a => {
        const cats = a.categories.includes(val)
          ? a.categories.filter(c => c !== val)
          : [...a.categories, val];
        return { ...a, categories: cats };
      });
    } else {
      setAnswers(a => ({ ...a, [current.id]: val }));
    }
  };

  const isSelected = (val) => current.multi
    ? answers.categories.includes(val)
    : answers[current.id] === val;

  const canNext = current.multi
    ? answers.categories.length > 0
    : !!answers[current.id];

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else submitQuiz();
  };

  const submitQuiz = async () => {
    if (!user) { navigate('/auth?mode=register'); return; }
    setLoading(true);
    const cats = answers.categories.length === 0 ? ['All'] : answers.categories;
    const payload = { ...answers, categories: cats };
    navigate('/recommendations', { state: { quizAnswers: payload } });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '16px 24px' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Brain size={20} color="#0033A0" weight="fill" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Business Readiness Check</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#475569', fontFamily: 'var(--font-mono)' }}>Step {step + 1} of {STEPS.length}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ maxWidth: 1280, margin: '12px auto 0', padding: '0 24px' }}>
          <div style={{ height: 3, background: '#E2E8F0' }}>
            <div style={{ height: '100%', background: '#0033A0', width: `${progress + (100 / STEPS.length)}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 680 }} key={step} className="animate-fade-up">
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0033A0', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>
            {step + 1} / {STEPS.length}
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 8, lineHeight: 1.2 }}>
            {current.question}
          </h1>
          <p style={{ fontSize: 15, color: '#475569', marginBottom: 36 }}>{current.subtext}</p>

          <div style={{ display: 'grid', gridTemplateColumns: current.multi ? 'repeat(auto-fit, minmax(180px, 1fr))' : '1fr', gap: 10 }}>
            {current.options.map(opt => (
              <button
                key={opt.v}
                data-testid={`quiz-option-${opt.v}`}
                onClick={() => select(opt.v)}
                style={{
                  padding: current.multi ? '20px 16px' : '18px 20px',
                  border: `2px solid ${isSelected(opt.v) ? '#0033A0' : '#E2E8F0'}`,
                  background: isSelected(opt.v) ? '#EFF6FF' : 'white',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s', display: 'flex',
                  flexDirection: current.multi ? 'column' : 'row',
                  alignItems: current.multi ? 'flex-start' : 'center',
                  gap: 12,
                }}
                onMouseOver={e => { if (!isSelected(opt.v)) e.currentTarget.style.borderColor = '#94A3B8'; }}
                onMouseOut={e => { if (!isSelected(opt.v)) e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                {current.multi && <span style={{ fontSize: 24 }}>{opt.emoji}</span>}
                {!current.multi && (
                  <div style={{ width: 20, height: 20, border: `2px solid ${isSelected(opt.v) ? '#0033A0' : '#CBD5E1'}`, borderRadius: '50%', background: isSelected(opt.v) ? '#0033A0' : 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected(opt.v) && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: isSelected(opt.v) ? '#0033A0' : '#0F172A', marginBottom: 3 }}>{opt.l}</div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>{opt.d}</div>
                </div>
                {current.multi && isSelected(opt.v) && (
                  <div style={{ marginTop: 4, width: 20, height: 20, background: '#0033A0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: 12 }}>✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
            <button
              data-testid="quiz-back"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px solid #E2E8F0', padding: '12px 20px', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1, fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-body)' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <button
              data-testid="quiz-next"
              onClick={next}
              disabled={!canNext || loading}
              className="btn-primary"
              style={{ gap: 10, padding: '12px 28px' }}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> :
                step === STEPS.length - 1 ? 'Get AI Recommendations' : 'Next'}
              {!loading && <ArrowRight size={16} weight="bold" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

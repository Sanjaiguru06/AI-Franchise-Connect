import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATS = ['Tea & Coffee', 'Shawarma/BBQ', 'Biryani', 'Pharmacy', 'Salon', 'Car Care'];
const ZONES = ['South Chennai', 'OMR/IT Corridor', 'Central Chennai', 'North Chennai', 'West Chennai', 'Outskirts'];
const COMPLEXITIES = ['Low', 'Low-Medium', 'Medium', 'Medium-High', 'High'];
const ROYALTIES = ['None', 'Low', 'Medium', 'High'];

const INIT = {
  name: '', category: 'Tea & Coffee', brand_type: 'Local', short_description: '',
  outlet_format: 'Kiosk', investment_min: '', investment_max: '',
  franchise_fee_display: '', royalty_level: 'None', royalty_pct: 0,
  min_area_sqft: 0, max_area_sqft: 0, best_chennai_zones: [],
  rent_sensitivity: 'Medium', footfall_dependency: 'Medium', staff_required: '2-3',
  operational_complexity: 'Medium', beginner_friendly: true,
  expected_revenue_min: '', expected_revenue_max: '',
  breakeven_months_min: '', breakeven_months_max: '',
  contact_email: '', contact_phone: ''
};

export default function AddFranchise() {
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/auth'); return; }
    if (isEdit) {
      axios.get(`${API}/franchises/${id}`).then(r => {
        const d = r.data;
        setForm({
          ...INIT, ...d,
          investment_min: d.investment_min / 100000,
          investment_max: d.investment_max / 100000,
          expected_revenue_min: d.expected_revenue_min / 100000,
          expected_revenue_max: d.expected_revenue_max / 100000,
        });
      });
    }
  }, [user, id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleZone = (z) => {
    setForm(f => ({
      ...f, best_chennai_zones: f.best_chennai_zones.includes(z)
        ? f.best_chennai_zones.filter(x => x !== z)
        : [...f.best_chennai_zones, z]
    }));
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = {
        ...form,
        investment_min: Math.round(parseFloat(form.investment_min) * 100000),
        investment_max: Math.round(parseFloat(form.investment_max) * 100000),
        expected_revenue_min: Math.round(parseFloat(form.expected_revenue_min) * 100000),
        expected_revenue_max: Math.round(parseFloat(form.expected_revenue_max) * 100000),
        breakeven_months_min: parseInt(form.breakeven_months_min),
        breakeven_months_max: parseInt(form.breakeven_months_max),
        min_area_sqft: parseInt(form.min_area_sqft) || 0,
        max_area_sqft: parseInt(form.max_area_sqft) || 0,
        royalty_pct: parseFloat(form.royalty_pct) || 0,
      };
      if (isEdit) {
        await axios.put(`${API}/franchises/${id}`, payload);
      } else {
        await axios.post(`${API}/franchises`, payload);
      }
      setSuccess(true);
      setTimeout(() => navigate('/owner/dashboard'), 1500);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save. Please check all fields.');
    } finally { setLoading(false); }
  };

  const STEPS = ['Basic Info', 'Financial Details', 'Operations', 'Location & Contact'];

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <CheckCircle size={64} color="#10B981" weight="fill" style={{ marginBottom: 20 }} />
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Listing {isEdit ? 'Updated' : 'Published'}!</h2>
        <p style={{ color: '#475569' }}>Redirecting to dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '24px 0' }}>
        <div className="container">
          <button onClick={() => navigate('/owner/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{isEdit ? 'Edit Franchise Listing' : 'List Your Franchise'}</h1>
        </div>
      </div>

      {/* Step tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container" style={{ display: 'flex', gap: 0 }}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setStep(i)} style={{ padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: step === i ? '#0033A0' : '#475569', borderBottom: `2px solid ${step === i ? '#0033A0' : 'transparent'}`, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: step >= i ? '#0033A0' : '#E2E8F0', color: step >= i ? 'white' : '#475569', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px', maxWidth: 800 }}>
        <form onSubmit={submit}>
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '28px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Basic Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Franchise Name *" required>
                  <input data-testid="field-name" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. My Brand Name" style={inputStyle} />
                </Field>
                <Field label="Category *">
                  <select data-testid="field-category" value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Brand Type">
                  <select value={form.brand_type} onChange={e => set('brand_type', e.target.value)} style={inputStyle}>
                    {['Local', 'Regional', 'National', 'International'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Outlet Format">
                  <select value={form.outlet_format} onChange={e => set('outlet_format', e.target.value)} style={inputStyle}>
                    {['Kiosk', 'Small QSR', 'Cloud Kitchen', 'Dine-in', 'Takeaway', 'Retail Store', 'Salon', 'Service Center', 'Mobile Service', 'Other'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Short Description *">
                <textarea data-testid="field-description" value={form.short_description} onChange={e => set('short_description', e.target.value)} required rows={3} placeholder="Describe your franchise in 1-2 sentences..." style={{ ...inputStyle, resize: 'vertical' }} />
              </Field>
            </div>
          )}

          {/* Step 1: Financials */}
          {step === 1 && (
            <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '28px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Financial Details</h2>
              <p style={{ fontSize: 13, color: '#475569', marginBottom: 20, background: '#EFF6FF', padding: '10px 14px', border: '1px solid #BFDBFE' }}>Enter all values in Lakhs (₹). e.g. 5 = ₹5 Lakhs</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Min Investment (Lakhs) *">
                  <input data-testid="field-inv-min" type="number" step="0.5" min="0" value={form.investment_min} onChange={e => set('investment_min', e.target.value)} required placeholder="e.g. 5" style={inputStyle} />
                </Field>
                <Field label="Max Investment (Lakhs) *">
                  <input type="number" step="0.5" min="0" value={form.investment_max} onChange={e => set('investment_max', e.target.value)} required placeholder="e.g. 15" style={inputStyle} />
                </Field>
                <Field label="Franchise Fee (display text)">
                  <input value={form.franchise_fee_display} onChange={e => set('franchise_fee_display', e.target.value)} placeholder="e.g. ₹2L+GST or Included" style={inputStyle} />
                </Field>
                <Field label="Royalty Structure">
                  <select value={form.royalty_level} onChange={e => set('royalty_level', e.target.value)} style={inputStyle}>
                    {ROYALTIES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Royalty %">
                  <input type="number" step="0.5" min="0" max="50" value={form.royalty_pct} onChange={e => set('royalty_pct', e.target.value)} placeholder="0" style={inputStyle} />
                </Field>
                <Field label="Monthly Revenue Min (Lakhs) *">
                  <input type="number" step="0.1" min="0" value={form.expected_revenue_min} onChange={e => set('expected_revenue_min', e.target.value)} required placeholder="e.g. 2" style={inputStyle} />
                </Field>
                <Field label="Monthly Revenue Max (Lakhs)">
                  <input type="number" step="0.1" min="0" value={form.expected_revenue_max} onChange={e => set('expected_revenue_max', e.target.value)} placeholder="e.g. 5" style={inputStyle} />
                </Field>
                <Field label="Break-even Min (months) *">
                  <input type="number" min="1" value={form.breakeven_months_min} onChange={e => set('breakeven_months_min', e.target.value)} required placeholder="e.g. 12" style={inputStyle} />
                </Field>
                <Field label="Break-even Max (months)">
                  <input type="number" min="1" value={form.breakeven_months_max} onChange={e => set('breakeven_months_max', e.target.value)} placeholder="e.g. 18" style={inputStyle} />
                </Field>
              </div>
            </div>
          )}

          {/* Step 2: Operations */}
          {step === 2 && (
            <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '28px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Operational Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Min Area (sqft)">
                  <input type="number" min="0" value={form.min_area_sqft} onChange={e => set('min_area_sqft', e.target.value)} placeholder="e.g. 200" style={inputStyle} />
                </Field>
                <Field label="Max Area (sqft)">
                  <input type="number" min="0" value={form.max_area_sqft} onChange={e => set('max_area_sqft', e.target.value)} placeholder="e.g. 500" style={inputStyle} />
                </Field>
                <Field label="Staff Required">
                  <input value={form.staff_required} onChange={e => set('staff_required', e.target.value)} placeholder="e.g. 2-3" style={inputStyle} />
                </Field>
                <Field label="Operational Complexity">
                  <select value={form.operational_complexity} onChange={e => set('operational_complexity', e.target.value)} style={inputStyle}>
                    {COMPLEXITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Rent Sensitivity">
                  <select value={form.rent_sensitivity} onChange={e => set('rent_sensitivity', e.target.value)} style={inputStyle}>
                    {['Low', 'Medium', 'High'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Footfall Dependency">
                  <select value={form.footfall_dependency} onChange={e => set('footfall_dependency', e.target.value)} style={inputStyle}>
                    {['Low', 'Medium', 'High'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.beginner_friendly} onChange={e => set('beginner_friendly', e.target.checked)} style={{ accentColor: '#0033A0', width: 18, height: 18 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Beginner Friendly</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>Check if this franchise is suitable for first-time entrepreneurs</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Location & Contact */}
          {step === 3 && (
            <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '28px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Location & Contact</h2>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', display: 'block', marginBottom: 10 }}>Best Chennai Zones (select all that apply)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ZONES.map(z => (
                    <button key={z} type="button" onClick={() => toggleZone(z)} style={{
                      padding: '8px 14px', border: `2px solid ${form.best_chennai_zones.includes(z) ? '#0033A0' : '#E2E8F0'}`,
                      background: form.best_chennai_zones.includes(z) ? '#EFF6FF' : 'white',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      color: form.best_chennai_zones.includes(z) ? '#0033A0' : '#475569', transition: 'all 0.15s'
                    }}>{z}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Contact Email">
                  <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="your@email.com" style={inputStyle} />
                </Field>
                <Field label="Contact Phone">
                  <input type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="+91 99999 99999" style={inputStyle} />
                </Field>
              </div>
            </div>
          )}

          {error && <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 13, marginTop: 16 }}>{error}</div>}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              style={{ padding: '12px 24px', border: '1.5px solid #E2E8F0', background: 'white', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1, fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-body)' }}>
              ← Back
            </button>
            {step < 3 ? (
              <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary">
                Next →
              </button>
            ) : (
              <button data-testid="submit-franchise" type="submit" disabled={loading} className="btn-primary">
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : `${isEdit ? 'Update' : 'Publish'} Listing →`}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', background: 'white' };

function Field({ label, children, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

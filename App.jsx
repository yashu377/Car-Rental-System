import React, { useState, useEffect, createContext, useContext } from 'react';

// ─── API Base ─────────────────────────────────────────────────────────────────
const API = 'http://localhost:5000/api';

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const authFetch = async (url, opts = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  car: "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5a2 2 0 0 1-2 2h-2M14 17H9m10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0M7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM23 21v-2a4 4 0 0 0-3-3.87",
  calendar: "M3 9h18M3 4h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm5 0V2m8 2V2",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9",
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  fuel: "M3 22V8l9-6 9 6v14H3zM12 2v20M3 12h18",
  seat: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.024.017.047.034.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.04.001-.088-.041-.104a13.09 13.09 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z",
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18M6 6l12 12",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};

// ─── Global Styles (injected once) ───────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0a0a0f;
    --surface:  #111118;
    --card:     #16161f;
    --border:   #1e1e2e;
    --accent:   #e63946;
    --accent2:  #ff6b6b;
    --gold:     #f4a261;
    --text:     #f0f0f8;
    --muted:    #6b6b8a;
    --success:  #2dc653;
    --warning:  #f4a261;
    --radius:   14px;
    --shadow:   0 20px 60px rgba(0,0,0,.6);
  }

  html, body, #root { height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }

  h1, h2, h3, .display { font-family: 'Bebas Neue', sans-serif; letter-spacing: .04em; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 8px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all .2s; white-space: nowrap;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(230,57,70,.35); }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--border); color: var(--text); }
  .btn-sm { padding: 6px 14px; font-size: 12px; }
  .btn-danger { background: rgba(230,57,70,.15); color: var(--accent); border: 1px solid rgba(230,57,70,.3); }
  .btn-danger:hover { background: var(--accent); color: #fff; }
  .btn-success { background: rgba(45,198,83,.15); color: var(--success); border: 1px solid rgba(45,198,83,.3); }
  .btn-success:hover { background: var(--success); color: #fff; }

  input, select, textarea {
    width: 100%; padding: 12px 16px; background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; transition: border-color .2s;
  }
  input:focus, select:focus, textarea:focus { border-color: var(--accent); }
  label { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }

  .badge {
    display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em;
  }
  .badge-available { background: rgba(45,198,83,.15); color: var(--success); }
  .badge-booked     { background: rgba(230,57,70,.15); color: var(--accent); }
  .badge-maintenance{ background: rgba(244,162,97,.15); color: var(--warning); }
  .badge-pending    { background: rgba(244,162,97,.15); color: var(--warning); }
  .badge-confirmed  { background: rgba(45,198,83,.15); color: var(--success); }
  .badge-cancelled  { background: rgba(230,57,70,.15); color: var(--accent); }
  .badge-completed  { background: rgba(107,107,138,.15); color: var(--muted); }

  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp .4s ease both; }
`;

function injectStyles() {
  if (document.getElementById('crs-styles')) return;
  const s = document.createElement('style');
  s.id = 'crs-styles';
  s.textContent = STYLES;
  document.head.appendChild(s);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  return (
    <ToastContext.Provider value={add}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'error' ? '#2a0f12' : '#0f2a14',
            border: `1px solid ${t.type === 'error' ? '#5a1a20' : '#1a5a28'}`,
            color: t.type === 'error' ? '#ff8a8a' : '#6ddc8a',
            padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
            animation: 'fadeUp .3s ease', maxWidth: 320
          }}>{t.msg}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
const useToast = () => useContext(ToastContext);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
    <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', animation: 'fadeUp .3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '.04em' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>
            <Icon d={Icons.x} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Login / Register ─────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    setError(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const body = mode === 'login' ? { email: form.email, password: form.password } : form;
      const data = await fetch(`${API}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      }).then(r => r.json());
      if (data.error) throw new Error(data.error);
      if (mode === 'login') {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } else {
        setMode('login');
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(230,57,70,.12) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: -200, left: -200, width: 500, height: 500, background: 'radial-gradient(circle, rgba(244,162,97,.08) 0%, transparent 70%)', borderRadius: '50%' }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 440, padding: 20 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'var(--accent)', borderRadius: 16, marginBottom: 16 }}>
            <Icon d={Icons.car} size={30} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 42, letterSpacing: '.06em', lineHeight: 1 }}>DRIVEFLEET</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Premium Car Rental Management</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 8, padding: 4, marginBottom: 28 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize', transition: 'all .2s', background: mode === m ? 'var(--accent)' : 'transparent', color: mode === m ? '#fff' : 'var(--muted)' }}>{m}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Smith" />
              </div>
            )}
            <div>
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" onKeyDown={e => e.key === 'Enter' && handle()} />
            </div>
            <div>
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handle()} />
            </div>
            {mode === 'register' && (
              <div>
                <label>Account Type</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="user">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            )}

            {error && <div style={{ background: 'rgba(230,57,70,.1)', border: '1px solid rgba(230,57,70,.3)', borderRadius: 8, padding: '10px 14px', color: 'var(--accent)', fontSize: 13 }}>{error}</div>}

            <button className="btn btn-primary" onClick={handle} disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          {mode === 'login' && (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 20 }}>
              Demo admin: <strong style={{ color: 'var(--text)' }}>admin@carrental.com</strong> / <strong style={{ color: 'var(--text)' }}>password</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ user, active, setActive, onLogout }) {
  const navItems = user.role === 'admin'
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
        { id: 'cars', label: 'Manage Cars', icon: Icons.car },
        { id: 'bookings', label: 'Bookings', icon: Icons.calendar },
        { id: 'users', label: 'Users', icon: Icons.users },
      ]
    : [
        { id: 'browse', label: 'Browse Cars', icon: Icons.car },
        { id: 'my-bookings', label: 'My Bookings', icon: Icons.calendar },
      ];

  return (
    <div style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={Icons.car} size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '.06em' }}>DRIVEFLEET</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10,
            border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
            transition: 'all .15s', marginBottom: 4,
            background: active === item.id ? 'rgba(230,57,70,.15)' : 'transparent',
            color: active === item.id ? 'var(--accent)' : 'var(--muted)'
          }}>
            <Icon d={item.icon} size={17} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user.role === 'admin' ? '🔑 Administrator' : '👤 Customer'}</div>
        </div>
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={onLogout}>
          <Icon d={Icons.logout} size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = 'var(--accent)' }) {
  return (
    <div className="fade-up" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, display: 'flex', gap: 20, alignItems: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon d={icon} size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontFamily: 'Bebas Neue', letterSpacing: '.04em', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Dashboard (Admin) ────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { authFetch(`${API}/stats`).then(setStats).catch(() => {}); }, []);
  if (!stats) return <Spinner />;
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 36, marginBottom: 8 }}>DASHBOARD</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Overview of your fleet and operations</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Total Cars" value={stats.total_cars} icon={Icons.car} color="var(--accent)" />
        <StatCard label="Available" value={stats.available_cars} icon={Icons.check} color="var(--success)" />
        <StatCard label="Customers" value={stats.total_users} icon={Icons.users} color="var(--gold)" />
        <StatCard label="Bookings" value={stats.total_bookings} icon={Icons.calendar} color="#a78bfa" />
        <StatCard label="Revenue (₹)" value={`₹${Number(stats.total_revenue).toLocaleString()}`} icon={Icons.dollar} color="var(--success)" />
      </div>
    </div>
  );
}

// ─── Car Form ─────────────────────────────────────────────────────────────────
function CarForm({ car, onSave, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState(car || { brand: '', model: '', year: new Date().getFullYear(), color: '', price_per_day: '', fuel_type: 'petrol', transmission: 'automatic', seats: 5, image_url: '', description: '', status: 'available' });
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setLoading(true);
    try {
      if (car) await authFetch(`${API}/cars/${car.id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await authFetch(`${API}/cars`, { method: 'POST', body: JSON.stringify(form) });
      toast(car ? 'Car updated!' : 'Car added!');
      onSave();
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  const Field = ({ label: l, k, type = 'text', placeholder }) => (
    <div><label>{l}</label><input type={type} value={form[k]} onChange={f(k)} placeholder={placeholder} /></div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Brand" k="brand" placeholder="BMW" />
        <Field label="Model" k="model" placeholder="M5 Competition" />
        <Field label="Year" k="year" type="number" placeholder="2023" />
        <Field label="Color" k="color" placeholder="Alpine White" />
        <Field label="Price / Day (₹)" k="price_per_day" type="number" placeholder="120" />
        <Field label="Seats" k="seats" type="number" placeholder="5" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div><label>Fuel Type</label>
          <select value={form.fuel_type} onChange={f('fuel_type')}>
            {['petrol','diesel','electric','hybrid'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div><label>Transmission</label>
          <select value={form.transmission} onChange={f('transmission')}>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>
      {car && <div><label>Status</label>
        <select value={form.status} onChange={f('status')}>
          {['available','booked','maintenance'].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>}
      <Field label="Image URL" k="image_url" placeholder="https://..." />
      <div><label>Description</label><textarea rows={3} value={form.description} onChange={f('description')} style={{ resize: 'vertical' }} /></div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Saving…' : 'Save Car'}</button>
      </div>
    </div>
  );
}

// ─── Car Card ─────────────────────────────────────────────────────────────────
function CarCard({ car, onBook, onEdit, onDelete, isAdmin }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card)', border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', overflow: 'hidden', transition: 'all .3s',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? '0 24px 48px rgba(230,57,70,.2)' : 'none',
        cursor: 'default',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img src={car.image_url || 'https://via.placeholder.com/400x200?text=No+Image'} alt={`${car.brand} ${car.model}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s', transform: hovered ? 'scale(1.06)' : 'scale(1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 60%)', opacity: hovered ? 1 : 0.5, transition: 'opacity .3s' }} />
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className={`badge badge-${car.status}`}>{car.status}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: 16 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: '.04em', lineHeight: 1 }}>{car.brand}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>{car.model} · {car.year}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px' }}>
        {/* Specs row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {[
            { label: car.fuel_type, icon: Icons.fuel },
            { label: car.transmission, icon: Icons.car },
            { label: `${car.seats} seats`, icon: Icons.users },
          ].map(({ label, icon }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>
              <Icon d={icon} size={13} />
              {label}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: 'var(--accent)' }}>₹{Number(car.price_per_day).toLocaleString()}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}> / day</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isAdmin ? (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(car)}><Icon d={Icons.edit} size={13} />Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(car.id)}><Icon d={Icons.trash} size={13} /></button>
              </>
            ) : (
              car.status === 'available' && (
                <button className="btn btn-primary btn-sm" onClick={() => onBook(car)}><Icon d={Icons.calendar} size={13} />Book</button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cars Panel (Admin) ───────────────────────────────────────────────────────
function CarsPanel({ isAdmin }) {
  const toast = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | {car}
  const [bookCar, setBookCar] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    authFetch(`${API}/cars`).then(data => { setCars(data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const deleteCar = async (id) => {
    if (!confirm('Delete this car?')) return;
    try { await authFetch(`${API}/cars/${id}`, { method: 'DELETE' }); toast('Car deleted'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  const filtered = cars.filter(c => {
    const q = search.toLowerCase();
    const matchQ = `${c.brand} ${c.model} ${c.color}`.toLowerCase().includes(q);
    const matchF = filter === 'all' || c.status === filter;
    return matchQ && matchF;
  });

  return (
    <div style={{ padding: 32, flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 36 }}>{isAdmin ? 'MANAGE CARS' : 'BROWSE CARS'}</h2>
        {isAdmin && <button className="btn btn-primary" onClick={() => setModal('add')}><Icon d={Icons.plus} size={16} />Add Car</button>}
      </div>
      <p style={{ color: 'var(--muted)', marginBottom: 28 }}>{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cars…" style={{ width: 220 }} />
        {['all', 'available', 'booked', 'maintenance'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map((car, i) => (
            <div key={car.id} className="fade-up" style={{ animationDelay: `${i * .05}s` }}>
              <CarCard car={car} isAdmin={isAdmin} onEdit={c => setModal(c)} onDelete={deleteCar} onBook={setBookCar} />
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add New Car' : `Edit — ${modal.brand} ${modal.model}`} onClose={() => setModal(null)}>
          <CarForm car={modal === 'add' ? null : modal} onSave={() => { setModal(null); load(); }} onClose={() => setModal(null)} />
        </Modal>
      )}

      {/* Book Modal */}
      {bookCar && <BookModal car={bookCar} onClose={() => setBookCar(null)} onBooked={() => { setBookCar(null); load(); }} />}
    </div>
  );
}

// ─── Book Modal ───────────────────────────────────────────────────────────────
function BookModal({ car, onClose, onBooked }) {
  const toast = useToast();
  const today = new Date().toISOString().split('T')[0];
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);

  const days = end && start ? Math.ceil((new Date(end) - new Date(start)) / 86400000) : 0;
  const total = days * car.price_per_day;

  const book = async () => {
    if (!end || days < 1) return toast('Select valid dates', 'error');
    setLoading(true);
    try {
      await authFetch(`${API}/bookings`, { method: 'POST', body: JSON.stringify({ car_id: car.id, start_date: start, end_date: end }) });
      toast('Booking confirmed! 🎉');
      onBooked();
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={`Book — ${car.brand} ${car.model}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <img src={car.image_url} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label>Start Date</label><input type="date" value={start} min={today} onChange={e => setStart(e.target.value)} /></div>
          <div><label>End Date</label><input type="date" value={end} min={start || today} onChange={e => setEnd(e.target.value)} /></div>
        </div>
        {days > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Duration</span><span>{days} day{days !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Rate</span><span>₹{Number(car.price_per_day).toLocaleString()} / day</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total</span><span style={{ color: 'var(--accent)', fontSize: 20 }}>₹{Number(total).toLocaleString()}</span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button className="btn btn-primary" onClick={book} disabled={loading || days < 1} style={{ flex: 1, justifyContent: 'center' }}>{loading ? 'Booking…' : 'Confirm Booking'}</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Bookings Panel ───────────────────────────────────────────────────────────
function BookingsPanel({ isAdmin }) {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    authFetch(`${API}/bookings`).then(data => { setBookings(data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try { await authFetch(`${API}/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); toast('Status updated'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ padding: 32, flex: 1, overflow: 'auto' }}>
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 36, marginBottom: 8 }}>{isAdmin ? 'ALL BOOKINGS' : 'MY BOOKINGS'}</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 28 }}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>

      {loading ? <Spinner /> : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
          <Icon d={Icons.calendar} size={48} />
          <p style={{ marginTop: 16 }}>No bookings yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map((b, i) => (
            <div key={b.id} className="fade-up" style={{ animationDelay: `${i * .04}s`, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {b.image_url && <img src={b.image_url} alt="" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8 }} />}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{b.brand} {b.model}</div>
                {isAdmin && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.user_name} · {b.user_email}</div>}
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{b.start_date} → {b.end_date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--accent)' }}>₹{Number(b.total_price).toLocaleString()}</div>
                <span className={`badge badge-${b.status}`} style={{ marginTop: 4 }}>{b.status}</span>
              </div>
              {isAdmin && b.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => updateStatus(b.id, 'confirmed')}><Icon d={Icons.check} size={13} />Confirm</button>
                  <button className="btn btn-danger btn-sm" onClick={() => updateStatus(b.id, 'cancelled')}><Icon d={Icons.x} size={13} />Cancel</button>
                </div>
              )}
              {isAdmin && b.status === 'confirmed' && (
                <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(b.id, 'completed')}>Complete</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Users Panel (Admin) ─────────────────────────────────────────────────────
function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { authFetch(`${API}/users`).then(data => { setUsers(data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  return (
    <div style={{ padding: 32, flex: 1, overflow: 'auto' }}>
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 36, marginBottom: 8 }}>USERS</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 28 }}>{users.length} registered users</p>
      {loading ? <Spinner /> : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Name', 'Email', 'Role', 'Joined'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px 18px', color: 'var(--muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className="fade-up" style={{ animationDelay: `${i * .03}s`, borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 18px', color: 'var(--muted)' }}>#{u.id}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--muted)' }}>{u.email}</td>
                  <td style={{ padding: '14px 18px' }}><span className={`badge badge-${u.role === 'admin' ? 'confirmed' : 'available'}`}>{u.role}</span></td>
                  <td style={{ padding: '14px 18px', color: 'var(--muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  injectStyles();
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
  });
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (user) setActive(user.role === 'admin' ? 'dashboard' : 'browse');
  }, [user?.role]);

  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  if (!user) return <ToastProvider><AuthPage onLogin={u => setUser(u)} /></ToastProvider>;

  const renderPage = () => {
    switch (active) {
      case 'dashboard': return <Dashboard />;
      case 'cars': return <CarsPanel isAdmin={true} />;
      case 'browse': return <CarsPanel isAdmin={false} />;
      case 'bookings': return <BookingsPanel isAdmin={true} />;
      case 'my-bookings': return <BookingsPanel isAdmin={false} />;
      case 'users': return <UsersPanel />;
      default: return null;
    }
  };

  return (
    <ToastProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar user={user} active={active} setActive={setActive} onLogout={logout} />
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
          {renderPage()}
        </main>
      </div>
    </ToastProvider>
  );
}

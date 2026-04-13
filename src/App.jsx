// App.jsx — FFC MM Canteens (All bugs fixed)
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// ── API URL ─────────────────────────────────────────────
// REACT_APP_API_URL must be set to your BACKEND Netlify URL
// e.g. https://ffcmm-canteen.netlify.app
// We append /api so all calls go to /api/...
const _base   = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_URL = _base + '/api';

// Axios instance with no default auth header
const api = axios.create({ baseURL: API_URL });

// ── Constants ────────────────────────────────────────────
const SUPERADMIN_USER = 'kingsman';
const SUPERADMIN_PIN  = '1920';

export default function App() {
  const [page,       setPage]       = useState('home');
  const [auth,       setAuth]       = useState(false);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [loggedUser, setLoggedUser] = useState('');
  const [loggedPin,  setLoggedPin]  = useState('');

  return (
    <div className="app">
      {page === 'home' && <HomePage setPage={setPage} />}
      {page === 'complaint' && <ComplaintForm setPage={setPage} />}
      {page === 'admin' && !auth && (
        <AdminLogin
          setPage={setPage}
          onAuth={(user, pin, isSuper) => {
            setAuth(true); setSuperAdmin(isSuper);
            setLoggedUser(user); setLoggedPin(pin);
            setPage('dashboard');
          }}
        />
      )}
      {page === 'dashboard' && auth && (
        <AdminDashboard
          setPage={setPage}
          setAuth={setAuth}
          superAdmin={superAdmin}
          loggedUser={loggedUser}
          adminPin={loggedPin}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════
function HomePage({ setPage }) {
  const [showTracker,  setShowTracker]  = useState(false);
  const [complaints,   setComplaints]   = useState([]);
  const [tLoading,     setTLoading]     = useState(false);
  const [tError,       setTError]       = useState('');

  const loadTracker = async () => {
    if (showTracker) { setShowTracker(false); return; }
    setTLoading(true); setTError('');
    try {
      const r = await api.get('/complaints');
      setComplaints(Array.isArray(r.data) ? r.data : []);
      setShowTracker(true);
    } catch (e) {
      setTError('Could not load complaints: ' + (e.response?.data?.error || e.message));
      setShowTracker(true);
    } finally { setTLoading(false); }
  };

  return (
    <div className="home-page">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <div className="logo">🏭</div>
            <div>
              <h1>Canteen Complaint Management System</h1>
              <p>FFC MM — Official Portal</p>
            </div>
          </div>
          <button className="admin-btn" onClick={() => setPage('admin')}>🔐 Admin Panel</button>
        </div>
      </header>

      <main className="home-content">
        <section className="hero">
          <h2>Welcome to <span>FFC MM Canteens</span></h2>
          <p>Report issues quickly and efficiently. Your feedback drives improvement.</p>
        </section>

        <div className="options-grid">
          <div className="canteen-card">
            <div className="icon">🍴</div>
            <h3>Plant Canteen</h3>
            <p>Main facility canteen — report food quality, hygiene or service issues</p>
            <button onClick={() => setPage('complaint')}>Report Issue →</button>
          </div>
          <div className="canteen-card">
            <div className="icon">🏢</div>
            <h3>Staff Hostel-II Canteen</h3>
            <p>Hostel facility canteen — report any concerns quickly</p>
            <button onClick={() => setPage('complaint')}>Report Issue →</button>
          </div>
        </div>

        <div className="tracker-section">
          <div className="tracker-header" onClick={loadTracker}>
            <div>
              <h3>📋 Complaints Tracker</h3>
              <p>View and track all submitted complaints and their current status</p>
            </div>
            <button className="tracker-toggle">
              {tLoading ? '⏳ Loading...' : showTracker ? '▲ Hide' : '▼ View Tracker'}
            </button>
          </div>
          {showTracker && (
            <div className="tracker-body">
              {tError ? (
                <div className="tracker-empty" style={{ color: 'var(--danger)' }}>{tError}</div>
              ) : complaints.length === 0 ? (
                <div className="tracker-empty">No complaints submitted yet.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {complaints.map(c => <TrackerItem key={c._id} c={c} />)}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>

      <footer><p>FFC MM — Canteen Complaint Management System © 2026</p></footer>
    </div>
  );
}

function TrackerItem({ c }) {
  const hasActions = c.status !== 'New' || c.investigation ||
                     c.fineAmount > 0 || (c.remarks && c.remarks.length > 0);
  return (
    <li className="tracker-item">
      <div className="tracker-item-head">
        <span className="tracker-item-name">{c.fullName} — {c.designation}</span>
        <span className="tracker-item-canteen">{c.canteen}</span>
      </div>
      <div className="tracker-item-detail">{c.complaintDetails}</div>
      {hasActions && (
        <div className="tracker-actions">
          {c.investigation && <span>📝 {c.investigation}</span>}
          {c.fineAmount > 0 && <span> | 💰 Fine: PKR {c.fineAmount}</span>}
          {c.status === 'Under Investigation' && c.updatedAt && (
            <span> | 🔍 Under investigation since {new Date(c.updatedAt).toLocaleDateString('en-GB')}</span>
          )}
          {c.status === 'Closed' && c.updatedAt && (
            <span> | 🔒 Closed on {new Date(c.updatedAt).toLocaleDateString('en-GB')}</span>
          )}
          {c.status === 'Resolved' && (c.resolvedAt || c.updatedAt) && (
            <span> | ✅ Resolved on {new Date(c.resolvedAt || c.updatedAt).toLocaleDateString('en-GB')}</span>
          )}
          {c.remarks && c.remarks.length > 0 && (
            <span> | 💬 {c.remarks[c.remarks.length - 1].text}</span>
          )}
        </div>
      )}
      <div className="tracker-item-footer">
        <span className="tracker-item-date">{new Date(c.submittedAt).toLocaleDateString('en-GB')}</span>
        <span className={`badge-status ${c.status.replace(/\s+/g, '-').toLowerCase()}`}>{c.status}</span>
      </div>
    </li>
  );
}

// ══════════════════════════════════════════════════════
// COMPLAINT FORM
// ══════════════════════════════════════════════════════
function ComplaintForm({ setPage }) {
  const [form, setForm] = useState({
    fullName: '', personalNumber: '', designation: '', department: '',
    mobileNumber: '', complaintDetails: '', canteen: 'Plant Canteen',
    imageUrl: '', videoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const toB64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = () => rej(new Error('Read failed'));
    r.readAsDataURL(file);
  });

  const onImage = async (e) => {
    const f = e.target.files[0];
    if (f) try { setForm(p => ({ ...p, imageUrl: '' })); const b = await toB64(f); setForm(p => ({ ...p, imageUrl: b })); }
    catch (e) { console.error(e); }
  };
  const onVideo = async (e) => {
    const f = e.target.files[0];
    if (f) try { const b = await toB64(f); setForm(p => ({ ...p, videoUrl: b })); }
    catch (e) { console.error(e); }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      await api.post('/complaints', form);
      setMessage('✅ Complaint submitted successfully! Thank you for reporting.');
      setForm({
        fullName: '', personalNumber: '', designation: '', department: '',
        mobileNumber: '', complaintDetails: '', canteen: 'Plant Canteen',
        imageUrl: '', videoUrl: ''
      });
      setTimeout(() => setPage('home'), 2500);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Submission failed. Please try again.'));
    } finally { setLoading(false); }
  };

  return (
    <div className="complaint-page">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <div className="logo">🏭</div>
            <div>
              <h1>Canteen Complaint Management System</h1>
              <p>FFC MM — Submit Complaint</p>
            </div>
          </div>
          <button onClick={() => setPage('home')} className="back-btn">← Back</button>
        </div>
      </header>

      <main className="complaint-content">
        <div className="form-container">
          <div className="form-header">
            <div className="header-icon">📝</div>
            <h2>Submit a Complaint</h2>
            <p>Fill out the form below to report an issue</p>
          </div>
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}
                 style={{ margin: '16px 40px 0' }}>
              {message}
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="form-section">
              <label>Full Name *</label>
              <input type="text" name="fullName" placeholder="Enter your full name"
                value={form.fullName} onChange={onChange} required />
            </div>
            <div className="form-row">
              <div className="form-section">
                <label>Personal Number (P. No) *</label>
                <input type="text" name="personalNumber" placeholder="e.g. P-12345"
                  value={form.personalNumber} onChange={onChange} required />
              </div>
              <div className="form-section">
                <label>Mobile Number *</label>
                <input type="tel" name="mobileNumber" placeholder="e.g. 03001234567"
                  value={form.mobileNumber} onChange={onChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-section">
                <label>Designation *</label>
                <input type="text" name="designation" placeholder="e.g. Engineer, Operator"
                  value={form.designation} onChange={onChange} required />
              </div>
              <div className="form-section">
                <label>Department / Unit *</label>
                <input type="text" name="department" placeholder="Enter your department"
                  value={form.department} onChange={onChange} required />
              </div>
            </div>
            <div className="form-section">
              <label>Canteen *</label>
              <select name="canteen" value={form.canteen} onChange={onChange} required>
                <option value="Plant Canteen">Plant Canteen</option>
                <option value="Staff Hostel-II Canteen">Staff Hostel-II Canteen</option>
              </select>
            </div>
            <div className="form-section">
              <label>Complaint Details *</label>
              <textarea name="complaintDetails" placeholder="Describe the issue in detail..."
                value={form.complaintDetails} onChange={onChange} rows="5" required />
            </div>
            <div className="form-row">
              <div className="form-section">
                <label>Upload Picture (Optional)</label>
                <input type="file" accept="image/*" onChange={onImage} />
              </div>
              <div className="form-section">
                <label>Upload Video (Optional)</label>
                <input type="file" accept="video/*" onChange={onVideo} />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '⏳ Submitting...' : '📨 Submit Complaint'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ADMIN LOGIN
// ══════════════════════════════════════════════════════
function AdminLogin({ setPage, onAuth }) {
  const [mode,        setMode]        = useState('login');
  const [username,    setUsername]    = useState('');
  const [pin,         setPin]         = useState('');
  const [loginErr,    setLoginErr]    = useState('');
  const [loginLoad,   setLoginLoad]   = useState(false);

  const [otpSending,  setOtpSending]  = useState(false);
  const [otpErr,      setOtpErr]      = useState('');
  const [otp,         setOtp]         = useState('');
  const [newPin,      setNewPin]      = useState('');
  const [confPin,     setConfPin]     = useState('');
  const [resetLoad,   setResetLoad]   = useState(false);
  const [resetMsg,    setResetMsg]    = useState('');
  const [resetErr,    setResetErr]    = useState('');

  const doLogin = async (e) => {
    e.preventDefault();
    setLoginErr(''); setLoginLoad(true);
    const u = username.trim();
    const p = pin.trim();
    if (!u)        { setLoginErr('❌ Enter your username.'); setLoginLoad(false); return; }
    if (p.length < 4) { setLoginErr('❌ PIN must be at least 4 digits.'); setLoginLoad(false); return; }
    try {
      const res = await api.post('/admin/verify-pin', { username: u, pin: p });
      if (res.data.success) {
        onAuth(u, p, res.data.isSuperAdmin === true);
      } else {
        setLoginErr('❌ Invalid username or PIN.'); setPin('');
      }
    } catch (err) {
      setLoginErr('❌ ' + (err.response?.data?.error || 'Login failed. Please try again.'));
      setPin('');
    } finally { setLoginLoad(false); }
  };

  const sendOtp = async () => {
    setOtpErr(''); setOtpSending(true);
    try { await api.post('/admin/forgot-pin'); setMode('forgot-verify'); }
    catch (err) { setOtpErr(err.response?.data?.error || '❌ Failed to send code.'); }
    finally { setOtpSending(false); }
  };

  const doReset = async (e) => {
    e.preventDefault(); setResetErr('');
    if (newPin !== confPin) { setResetErr('❌ PINs do not match.'); return; }
    if (newPin.length < 4)  { setResetErr('❌ PIN must be 4+ digits.'); return; }
    setResetLoad(true);
    try {
      const res = await api.post('/admin/reset-pin', { otp, newPin });
      if (res.data.success) {
        setResetMsg('✅ PIN updated! Login with your new PIN.');
        setTimeout(() => { setMode('login'); setOtp(''); setNewPin(''); setConfPin(''); setResetMsg(''); }, 2500);
      }
    } catch (err) { setResetErr(err.response?.data?.error || '❌ Invalid or expired code.'); }
    finally { setResetLoad(false); }
  };

  const back = () => {
    setMode('login'); setPin(''); setLoginErr('');
    setOtp(''); setNewPin(''); setConfPin('');
    setOtpErr(''); setResetErr(''); setResetMsg('');
  };

  return (
    <div className="admin-login-page">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <div className="logo">🏭</div>
            <div>
              <h1>Canteen Complaint Management System</h1>
              <p>FFC MM — Admin Portal</p>
            </div>
          </div>
          <button onClick={() => setPage('home')} className="back-btn">← Home</button>
        </div>
      </header>

      <div className="login-container">
        <div className="login-card">

          {mode === 'login' && (
            <>
              <div className="login-icon">🔐</div>
              <h2>Admin Access</h2>
              <p>Enter your username and PIN</p>
              {loginErr && <div className="error-message">{loginErr}</div>}
              <form onSubmit={doLogin}>
                <input type="text" placeholder="Username"
                  value={username} onChange={e => setUsername(e.target.value)}
                  required autoFocus autoComplete="username"
                  style={{ textAlign:'left', letterSpacing:'normal',
                           fontSize:'15px', padding:'13px 16px', fontFamily:'var(--ff-body)' }} />
                <input type="password" placeholder="PIN (digits only)"
                  maxLength="8" value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  required autoComplete="current-password" />
                <button type="submit" disabled={loginLoad || pin.length < 4 || !username.trim()}>
                  {loginLoad ? '⏳ Verifying...' : '🔓 Unlock'}
                </button>
              </form>
              <button className="forgot-pin-link" onClick={() => setMode('forgot-request')}>
                Forgot PIN?
              </button>
            </>
          )}

          {mode === 'forgot-request' && (
            <>
              <div className="login-icon">📧</div>
              <h2>Reset PIN</h2>
              <p>A 6-digit code will be sent to:<br />
                <strong>sagarahmedwaseer4553@gmail.com</strong></p>
              {otpErr && <div className="error-message">{otpErr}</div>}
              <button className="submit-btn" onClick={sendOtp}
                disabled={otpSending} style={{ marginTop: 16 }}>
                {otpSending ? '⏳ Sending...' : '📨 Send Verification Code'}
              </button>
              <button className="forgot-pin-link" onClick={back}>← Back to Login</button>
            </>
          )}

          {mode === 'forgot-verify' && (
            <>
              <div className="login-icon">🔑</div>
              <h2>Verify & Reset</h2>
              <p>Code sent to <strong>sagarahmedwaseer4553@gmail.com</strong><br />
                <small style={{ color: 'var(--text3)' }}>Valid 10 minutes. Check spam folder.</small>
              </p>
              {resetErr && <div className="error-message">{resetErr}</div>}
              {resetMsg  && <div className="success-message">{resetMsg}</div>}
              <form onSubmit={doReset}>
                <input type="text" placeholder="6-digit code" maxLength="6"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  required autoFocus style={{ letterSpacing:8, textAlign:'center', fontSize:22 }} />
                <input type="password" placeholder="New PIN (min 4 digits)" maxLength="8"
                  value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} required />
                <input type="password" placeholder="Confirm new PIN" maxLength="8"
                  value={confPin} onChange={e => setConfPin(e.target.value.replace(/\D/g, ''))} required />
                <button type="submit" style={{ marginTop:14 }}
                  disabled={resetLoad || otp.length!==6 || newPin.length<4 || confPin.length<4}>
                  {resetLoad ? '⏳ Updating...' : '✅ Update PIN'}
                </button>
              </form>
              <button className="forgot-pin-link"
                onClick={() => { setMode('forgot-request'); setOtp(''); setNewPin(''); setConfPin(''); setResetErr(''); }}>
                ← Resend Code
              </button>
              <button className="forgot-pin-link" onClick={back} style={{ marginTop:4 }}>← Back to Login</button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════
function AdminDashboard({ setPage, setAuth, superAdmin, loggedUser, adminPin }) {
  const [complaints,    setComplaints]    = useState([]);
  const [stats,         setStats]         = useState(null);
  const [selected,      setSelected]      = useState(null);
  const [filter,        setFilter]        = useState('All');
  const [canteenFilter, setCanteenFilter] = useState('All');
  const [loading,       setLoading]       = useState(true);
  const [emailCfg,      setEmailCfg]      = useState({ recipients: [], enableNotifications: true });
  const [showEmail,     setShowEmail]     = useState(false);
  const [showUsers,     setShowUsers]     = useState(false);
  const [newEmail,      setNewEmail]      = useState('');
  const [fetchErr,      setFetchErr]      = useState('');

  // User management
  const [subUsers,    setSubUsers]    = useState([]);
  const [newUsr,      setNewUsr]      = useState('');
  const [newUPin,     setNewUPin]     = useState('');
  const [otpStep,     setOtpStep]     = useState(false);
  const [pendingAct,  setPendingAct]  = useState(null);
  const [vOtp,        setVOtp]        = useState('');
  const [otpSend,     setOtpSend]     = useState(false);
  const [userMsg,     setUserMsg]     = useState('');
  const [userErr,     setUserErr]     = useState('');

  const H = { adminpin: adminPin };

  const fetchAll = useCallback(async () => {
    setFetchErr('');
    try {
      const [cR, sR, eR] = await Promise.all([
        api.get('/complaints',        { headers: H }),
        api.get('/admin/stats',        { headers: H }),
        api.get('/admin/email-config', { headers: H })
      ]);
      setComplaints(Array.isArray(cR.data) ? cR.data : []);
      setStats(sR.data);
      setEmailCfg(eR.data);
    } catch (e) {
      console.error('Fetch error:', e.response?.status, e.response?.data);
      const s = e.response?.status;
      const m = e.response?.data?.error || e.message;
      if (s === 401) {
        setFetchErr('❌ Auth failed (401). Logout and login again.');
      } else {
        setFetchErr(`Failed to load (${s||'network'}): ${m}`);
      }
    } finally { setLoading(false); }
  }, [adminPin]); // eslint-disable-line

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const loadUsers = async () => {
    try {
      const r = await api.get(`/admin/users?username=${encodeURIComponent(loggedUser)}&pin=${encodeURIComponent(adminPin)}`);
      setSubUsers(Array.isArray(r.data) ? r.data : []);
    } catch (e) { console.error('Load users:', e.response?.data); }
  };

  const updateComplaint = async (id, updates) => {
    try {
      await api.put(`/complaints/${id}`, updates, { headers: H });
      await fetchAll(); setSelected(null);
    } catch (e) { alert('Update failed: ' + (e.response?.data?.error || e.message)); }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm('Delete this complaint permanently?')) return;
    try { await api.delete(`/complaints/${id}`, { headers: H }); await fetchAll(); }
    catch (e) { alert('Delete failed: ' + (e.response?.data?.error || e.message)); }
  };

  const addEmail = async () => {
    if (!newEmail || emailCfg.recipients.includes(newEmail)) return;
    const u = { ...emailCfg, recipients: [...emailCfg.recipients, newEmail] };
    try { await api.put('/admin/email-config', u, { headers: H }); setEmailCfg(u); setNewEmail(''); }
    catch (e) { console.error(e); }
  };

  const removeEmail = async (em) => {
    const u = { ...emailCfg, recipients: emailCfg.recipients.filter(x => x !== em) };
    try { await api.put('/admin/email-config', u, { headers: H }); setEmailCfg(u); }
    catch (e) { console.error(e); }
  };

  const startAction = async (act) => {
    setUserErr(''); setOtpSend(true);
    try { await api.post('/admin/forgot-pin'); setPendingAct(act); setOtpStep(true); }
    catch (e) { setUserErr('Failed to send code: ' + (e.response?.data?.error || e.message)); }
    finally { setOtpSend(false); }
  };

  const confirmAction = async () => {
    if (vOtp.length !== 6) { setUserErr('Enter valid 6-digit code'); return; }
    setUserErr('');
    try {
      await api.post('/admin/verify-otp', { otp: vOtp });
      if (pendingAct.type === 'add') {
        await api.post('/admin/users', {
          username: loggedUser, pin: adminPin,
          newUsername: pendingAct.newUsername, newPin: pendingAct.newPin
        });
        setUserMsg(`✅ User "${pendingAct.newUsername}" added!`);
        setNewUsr(''); setNewUPin('');
      } else {
        await api.delete(`/admin/users/${pendingAct.target}`, {
          data: { username: loggedUser, pin: adminPin }
        });
        setUserMsg(`✅ User "${pendingAct.target}" removed.`);
      }
      await loadUsers();
      setOtpStep(false); setPendingAct(null); setVOtp('');
      setTimeout(() => setUserMsg(''), 4000);
    } catch (e) { setUserErr(e.response?.data?.error || 'Invalid or expired code'); }
  };

  const logout = () => { setAuth(false); setPage('home'); };

  const filtered = complaints.filter(c =>
    (filter === 'All' || c.status === filter) &&
    (canteenFilter === 'All' || c.canteen === canteenFilter)
  );

  const printReport = (c) => {
    const w = window.open('', '', 'height=650,width=860');
    const actionDate = (c.status === 'Closed' || c.status === 'Under Investigation') && c.updatedAt
      ? new Date(c.updatedAt).toLocaleDateString('en-GB') : null;
    const resolvedDate = c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString('en-GB') : null;

    w.document.write(`<!DOCTYPE html><html><head><title>Complaint Report</title>
    <style>
      body{font-family:Arial,sans-serif;margin:36px;color:#1a1008}
      h2{color:#a83030;margin-bottom:4px;font-size:22px}
      .sub{color:#9a7a60;font-size:13px;margin-bottom:22px}
      table{width:100%;border-collapse:collapse;margin:18px 0}
      th,td{border:1px solid #ddd;padding:10px 13px;text-align:left;font-size:13px}
      th{background:#a83030;color:#fff;font-weight:700}
      tr:nth-child(even){background:#fdf8f3}
      .box{background:#fdf3dc;border:1px solid #c8960a;border-radius:6px;padding:14px 16px;margin:14px 0}
      .box h4{color:#a87c08;margin:0 0 8px;font-size:13px;text-transform:uppercase}
      .sig{margin-top:50px;display:flex;justify-content:flex-end}
      .sig-b{text-align:center;width:260px}
      .sig-l{border-top:1.5px solid #1a1008;padding-top:8px;font-size:13px;font-weight:700}
      .sig-t{font-size:12px;color:#5a3e2b;margin-top:4px}
      @media print{.np{display:none}}
    </style></head><body>
    <h2>🏭 FFC MM Canteens — Complaint Report</h2>
    <div class="sub">Generated: ${new Date().toLocaleString('en-GB')}</div>
    <table>
      <tr><th>Field</th><th>Details</th></tr>
      <tr><td><b>Full Name</b></td><td>${c.fullName}</td></tr>
      <tr><td><b>P. No</b></td><td>${c.personalNumber}</td></tr>
      <tr><td><b>Designation</b></td><td>${c.designation}</td></tr>
      <tr><td><b>Department</b></td><td>${c.department}</td></tr>
      <tr><td><b>Mobile</b></td><td>${c.mobileNumber}</td></tr>
      <tr><td><b>Canteen</b></td><td>${c.canteen}</td></tr>
      <tr><td><b>Status</b></td><td>${c.status}</td></tr>
      <tr><td><b>Fine Amount</b></td><td>${c.fineAmount > 0 ? 'PKR ' + c.fineAmount : 'N/A'}</td></tr>
      <tr><td><b>Submitted</b></td><td>${new Date(c.submittedAt).toLocaleString('en-GB')}</td></tr>
      ${actionDate ? `<tr><td><b>${c.status==='Closed'?'Date Closed':'Investigation Started'}</b></td><td>${actionDate}</td></tr>` : ''}
      ${resolvedDate ? `<tr><td><b>Date Resolved</b></td><td>${resolvedDate}</td></tr>` : ''}
      <tr><td colspan="2"><b>Complaint Details:</b><br/><br/>${c.complaintDetails.replace(/\n/g,'<br/>')}</td></tr>
    </table>
    ${c.investigation?`<div class="box"><h4>🔍 Investigation / Admin Actions</h4><p>${c.investigation}</p></div>`:''}
    ${c.remarks&&c.remarks.length>0?`<div class="box"><h4>💬 Remarks History</h4>${c.remarks.map(r=>`<p>• ${r.text} <em style="color:#9a7a60;font-size:12px">(${new Date(r.addedAt).toLocaleString('en-GB')})</em></p>`).join('')}</div>`:''}
    <div class="sig"><div class="sig-b">
      <div style="height:50px"></div>
      <div class="sig-l">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
      <div class="sig-t">Chairman Canteen Committee</div>
    </div></div>
    <div class="np" style="margin-top:24px">
      <button onclick="window.print()" style="background:#a83030;color:#fff;border:none;padding:10px 22px;border-radius:6px;cursor:pointer;font-size:14px">🖨️ Print</button>
      <button onclick="window.close()" style="background:#f0ede8;color:#1a1008;border:1px solid #ddd;padding:10px 22px;border-radius:6px;cursor:pointer;font-size:14px;margin-left:8px">Close</button>
    </div></body></html>`);
    w.document.close();
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <div className="logo">⚙️</div>
            <div>
              <h1>Admin — {superAdmin ? 'Kingsman (Super Admin)' : loggedUser}</h1>
              <p>FFC MM — Canteens Management</p>
            </div>
          </div>
          <div className="navbar-buttons">
            {superAdmin && (
              <>
                <button onClick={() => { setShowUsers(v => !v); if (!showUsers) loadUsers(); }} className="config-btn">👥 Users</button>
                <button onClick={() => setShowEmail(v => !v)} className="config-btn">📧 Email</button>
              </>
            )}
            <button onClick={logout} className="logout-btn">🔓 Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">

        {fetchErr && (
          <div className="error-message" style={{ marginBottom: 20 }}>
            {fetchErr}
            <button onClick={fetchAll} style={{ marginLeft:12, padding:'4px 12px',
              background:'var(--red)', color:'#fff', border:'none', borderRadius:6,
              cursor:'pointer', fontSize:12 }}>Retry</button>
          </div>
        )}

        {/* USER MANAGEMENT */}
        {superAdmin && showUsers && (
          <div className="user-mgmt-panel">
            <h3>👥 User Management</h3>
            <p>Add or remove admin users. Each action requires Gmail verification.</p>
            {userMsg && <div className="success-message">{userMsg}</div>}
            {userErr && <div className="error-message">{userErr}</div>}
            {otpStep ? (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize:13, color:'var(--text2)', marginBottom:10 }}>
                  Enter the 6-digit code sent to Gmail:
                </p>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <input type="text" placeholder="6-digit code" maxLength="6"
                    value={vOtp} onChange={e => setVOtp(e.target.value.replace(/\D/g,''))}
                    style={{ flex:1, minWidth:140, letterSpacing:6, textAlign:'center', fontSize:18 }} />
                  <button onClick={confirmAction}
                    style={{ padding:'0 20px', background:'var(--red)', color:'#fff', border:'none',
                             borderRadius:9, cursor:'pointer', fontWeight:700, fontSize:13, minHeight:44 }}>
                    ✅ Confirm
                  </button>
                  <button onClick={() => { setOtpStep(false); setPendingAct(null); setVOtp(''); }}
                    style={{ padding:'0 16px', background:'var(--bg4)', color:'var(--text2)',
                             border:'1.5px solid var(--border)', borderRadius:9, cursor:'pointer',
                             fontSize:13, minHeight:44 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ul className="user-list">
                  <li className="user-item">
                    <span className="user-item-name">kingsman</span>
                    <span className="user-item-role permanent">Permanent Super Admin</span>
                  </li>
                  {subUsers.map((u, i) => (
                    <li key={i} className="user-item">
                      <span className="user-item-name">{u.username}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span className="user-item-role">Admin</span>
                        <button onClick={() => startAction({ type:'remove', target:u.username })}
                          disabled={otpSend}
                          style={{ background:'none', border:'none', color:'var(--danger)',
                                   cursor:'pointer', fontSize:16, padding:'0 4px' }}>✕</button>
                      </div>
                    </li>
                  ))}
                  {subUsers.length === 0 && (
                    <li style={{ padding:'10px 0', fontSize:13, color:'var(--text3)' }}>No sub-users yet.</li>
                  )}
                </ul>
                <div className="add-user-row">
                  <input type="text" placeholder="New username"
                    value={newUsr} onChange={e => setNewUsr(e.target.value)} />
                  <input type="password" placeholder="PIN (min 4 digits)"
                    value={newUPin} onChange={e => setNewUPin(e.target.value.replace(/\D/g,''))} maxLength="8" />
                  <button disabled={otpSend}
                    onClick={() => {
                      if (!newUsr.trim() || newUPin.length < 4) { setUserErr('Enter username and PIN (min 4 digits)'); return; }
                      setUserErr(''); startAction({ type:'add', newUsername: newUsr.trim(), newPin: newUPin });
                    }}>
                    {otpSend ? '⏳' : '+ Add User'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* EMAIL CONFIG */}
        {superAdmin && showEmail && (
          <div className="email-config-panel">
            <h3>📧 Email Configuration</h3>
            <p>Add email addresses to receive complaint notifications</p>
            <div className="email-input-group">
              <input type="email" placeholder="admin@example.com"
                value={newEmail} onChange={e => setNewEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEmail()} />
              <button onClick={addEmail}>Add Email</button>
            </div>
            <div className="email-list">
              <h4>Recipients ({emailCfg.recipients ? emailCfg.recipients.length : 0}):</h4>
              {!emailCfg.recipients || emailCfg.recipients.length === 0
                ? <p style={{ fontSize:13, color:'var(--text3)' }}>No emails configured</p>
                : emailCfg.recipients.map((em, i) => (
                  <div key={i} className="email-item">
                    <span>✉️ {em}</span>
                    <button onClick={() => removeEmail(em)}>✕</button>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* STATS */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalComplaints}</div>
              <div className="stat-label">Total Complaints</div>
            </div>
            <div className="stat-card new">
              <div className="stat-number">{stats.newComplaints}</div>
              <div className="stat-label">New</div>
            </div>
            <div className="stat-card progress">
              <div className="stat-number">{stats.inProgressComplaints}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card resolved">
              <div className="stat-number">{stats.resolvedComplaints}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        )}

        {/* FILTERS + REFRESH */}
        <div className="filters">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <select value={canteenFilter} onChange={e => setCanteenFilter(e.target.value)}>
            <option value="All">All Canteens</option>
            <option value="Plant Canteen">Plant Canteen</option>
            <option value="Staff Hostel-II Canteen">Staff Hostel-II Canteen</option>
          </select>
          <button onClick={fetchAll}
            style={{ padding:'9px 16px', background:'var(--gold-light)', color:'var(--gold2)',
                     border:'1.5px solid rgba(200,150,10,.3)', borderRadius:10, cursor:'pointer',
                     fontWeight:700, fontSize:13, fontFamily:'var(--ff-body)' }}>
            🔄 Refresh
          </button>
        </div>

        {/* TABLE */}
        <div className="complaints-table">
          <h3>Complaints ({filtered.length})</h3>
          <div style={{ overflowX:'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>P. No</th><th>Canteen</th>
                  <th>Status</th><th>Fine (PKR)</th><th>Submitted</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign:'center', padding:32, color:'var(--text3)' }}>
                    No complaints found
                  </td></tr>
                ) : filtered.map(c => (
                  <tr key={c._id}>
                    <td>{c.fullName}</td>
                    <td style={{ fontFamily:'var(--ff-mono)', fontSize:12 }}>{c.personalNumber}</td>
                    <td>{c.canteen}</td>
                    <td><span className={`status ${c.status.replace(/\s+/g,'-').toLowerCase()}`}>{c.status}</span></td>
                    <td>{c.fineAmount || 0}</td>
                    <td style={{ fontSize:12 }}>{new Date(c.submittedAt).toLocaleDateString('en-GB')}</td>
                    <td>
                      <button onClick={() => setSelected(c)}>View</button>
                      <button className="btn-delete" onClick={() => deleteComplaint(c._id)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <ComplaintDetail
            complaint={selected}
            onUpdate={updateComplaint}
            onClose={() => setSelected(null)}
            onPrint={printReport}
          />
        )}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// COMPLAINT DETAIL MODAL
// ══════════════════════════════════════════════════════
function ComplaintDetail({ complaint: c, onUpdate, onClose, onPrint }) {
  const [status,  setStatus]  = useState(c.status);
  const [remarks, setRemarks] = useState('');
  const [fine,    setFine]    = useState(c.fineAmount || 0);
  const [invest,  setInvest]  = useState(c.investigation || '');
  const [saving,  setSaving]  = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(c._id, {
      status,
      remarks:       remarks.trim() || undefined,
      fineAmount:    parseFloat(fine) || 0,
      investigation: invest.trim()
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <h2>Complaint Details</h2>

        <div className="detail-section">
          <h4>Complainant Information</h4>
          <p><strong>Name:</strong> {c.fullName}</p>
          <p><strong>P. No:</strong> {c.personalNumber}</p>
          <p><strong>Designation:</strong> {c.designation}</p>
          <p><strong>Department:</strong> {c.department}</p>
          <p><strong>Mobile:</strong> {c.mobileNumber}</p>
        </div>

        <div className="detail-section">
          <h4>Complaint Information</h4>
          <p><strong>Canteen:</strong> {c.canteen}</p>
          <p><strong>Details:</strong> {c.complaintDetails}</p>
          <p><strong>Submitted:</strong> {new Date(c.submittedAt).toLocaleString('en-GB')}</p>
          {c.updatedAt  && <p><strong>Last Updated:</strong> {new Date(c.updatedAt).toLocaleString('en-GB')}</p>}
          {c.resolvedAt && <p><strong>Resolved:</strong> {new Date(c.resolvedAt).toLocaleString('en-GB')}</p>}
        </div>

        {(c.imageUrl || c.videoUrl) && (
          <div className="detail-section">
            <h4>Attached Media</h4>
            {c.imageUrl && (
              <div style={{ marginBottom:10 }}>
                <p style={{ marginBottom:6 }}><strong>📷 Image:</strong></p>
                <img src={c.imageUrl} alt="Attachment"
                  style={{ maxWidth:'100%', borderRadius:8, border:'1px solid var(--border)' }} />
              </div>
            )}
            {c.videoUrl && (
              <div>
                <p style={{ marginBottom:6 }}><strong>🎥 Video:</strong></p>
                <video src={c.videoUrl} controls
                  style={{ maxWidth:'100%', borderRadius:8, border:'1px solid var(--border)' }} />
              </div>
            )}
          </div>
        )}

        <div className="detail-section">
          <h4>Admin Actions</h4>
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <label>Fine Amount (PKR)</label>
          <input type="number" value={fine} onChange={e => setFine(e.target.value)} min="0" step="1" />
          <label>Investigation Details</label>
          <textarea value={invest} onChange={e => setInvest(e.target.value)}
            placeholder="Enter investigation findings..." rows="3" />
          <label>Add New Remark</label>
          <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
            placeholder="Add a new remark..." rows="2" />
          {c.remarks && c.remarks.length > 0 && (
            <div className="remarks-list">
              <h5>Remarks History ({c.remarks.length})</h5>
              {c.remarks.map((r, i) => (
                <p key={i}>
                  <small>{new Date(r.addedAt).toLocaleString('en-GB')}</small><br />{r.text}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button className="save-btn" onClick={save} disabled={saving}>
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
          <button className="print-btn" onClick={() => onPrint(c)}>🖨️ Print Report</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// App.jsx - FFC MM Canteens — Fully Fixed
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [currentPage,        setCurrentPage]        = useState('home');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [isSuperAdmin,       setIsSuperAdmin]       = useState(false);
  const [loggedInUser,       setLoggedInUser]       = useState('');
  const [storedPin,          setStoredPin]          = useState('');

  return (
    <div className="app">
      {currentPage === 'home' && (
        <HomePage setCurrentPage={setCurrentPage} />
      )}
      {currentPage === 'complaint' && (
        <ComplaintForm setCurrentPage={setCurrentPage} />
      )}
      {currentPage === 'admin' && !adminAuthenticated && (
        <AdminLogin
          onAuthenticate={(user, pin, superAdmin) => {
            setAdminAuthenticated(true);
            setIsSuperAdmin(superAdmin);
            setLoggedInUser(user);
            setStoredPin(pin);
            setCurrentPage('admin-dashboard');
          }}
          setCurrentPage={setCurrentPage}
        />
      )}
      {currentPage === 'admin-dashboard' && adminAuthenticated && (
        <AdminDashboard
          setCurrentPage={setCurrentPage}
          setAdminAuthenticated={setAdminAuthenticated}
          isSuperAdmin={isSuperAdmin}
          loggedInUser={loggedInUser}
          adminPin={storedPin}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════════
function HomePage({ setCurrentPage }) {
  const [showTracker,    setShowTracker]    = useState(false);
  const [complaints,     setComplaints]     = useState([]);
  const [trackerLoading, setTrackerLoading] = useState(false);

  const loadComplaints = async () => {
    if (showTracker) { setShowTracker(false); return; }
    setTrackerLoading(true);
    try {
      const res = await axios.get(`${API_URL}/complaints`);
      setComplaints(res.data);
      setShowTracker(true);
    } catch { setShowTracker(true); }
    finally { setTrackerLoading(false); }
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
          <button className="admin-btn" onClick={() => setCurrentPage('admin')}>
            🔐 Admin Panel
          </button>
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
            <button onClick={() => setCurrentPage('complaint')}>Report Issue →</button>
          </div>
          <div className="canteen-card">
            <div className="icon">🏢</div>
            <h3>Staff Hostel-II Canteen</h3>
            <p>Hostel facility canteen — report any concerns quickly</p>
            <button onClick={() => setCurrentPage('complaint')}>Report Issue →</button>
          </div>
        </div>

        <div className="tracker-section">
          <div className="tracker-header" onClick={loadComplaints}>
            <div>
              <h3>📋 Complaints Tracker</h3>
              <p>View and track all submitted complaints and their current status</p>
            </div>
            <button className="tracker-toggle">
              {trackerLoading ? '⏳ Loading...' : showTracker ? '▲ Hide Tracker' : '▼ View Tracker'}
            </button>
          </div>
          {showTracker && (
            <div className="tracker-body">
              {complaints.length === 0 ? (
                <div className="tracker-empty">No complaints submitted yet.</div>
              ) : (
                <ul className="tracker-list">
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
  const hasActions = c.status !== 'New' || c.investigation || c.fineAmount > 0 ||
                     (c.remarks && c.remarks.length > 0);
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
          {c.status === 'Resolved' && c.updatedAt && (
            <span> | ✅ Resolved on {new Date(c.updatedAt).toLocaleDateString('en-GB')}</span>
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

// ══════════════════════════════════════════════════════════
// COMPLAINT FORM
// ══════════════════════════════════════════════════════════
function ComplaintForm({ setCurrentPage }) {
  const [formData, setFormData] = useState({
    fullName: '', personalNumber: '', designation: '', department: '',
    mobileNumber: '', complaintDetails: '', canteen: 'Plant Canteen',
    imageUrl: '', videoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toBase64 = (file) => new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) { const b = await toBase64(file); setFormData(p => ({ ...p, imageUrl: b })); }
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (file) { const b = await toBase64(file); setFormData(p => ({ ...p, videoUrl: b })); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      await axios.post(`${API_URL}/complaints`, formData);
      setMessage('✅ Complaint submitted successfully! Thank you for reporting.');
      setFormData({ fullName: '', personalNumber: '', designation: '', department: '',
        mobileNumber: '', complaintDetails: '', canteen: 'Plant Canteen', imageUrl: '', videoUrl: '' });
      setTimeout(() => setCurrentPage('home'), 2000);
    } catch { setMessage('❌ Error submitting complaint. Please try again.'); }
    finally { setLoading(false); }
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
          <button onClick={() => setCurrentPage('home')} className="back-btn">← Back</button>
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
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <label>Full Name *</label>
              <input type="text" name="fullName" placeholder="Enter your full name"
                value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-section">
                <label>Personal Number (P. No) *</label>
                <input type="text" name="personalNumber" placeholder="e.g. P-12345"
                  value={formData.personalNumber} onChange={handleChange} required />
              </div>
              <div className="form-section">
                <label>Mobile Number *</label>
                <input type="tel" name="mobileNumber" placeholder="e.g. 03001234567"
                  value={formData.mobileNumber} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-section">
                <label>Designation *</label>
                <input type="text" name="designation" placeholder="e.g. Engineer, Operator"
                  value={formData.designation} onChange={handleChange} required />
              </div>
              <div className="form-section">
                <label>Department / Unit *</label>
                <input type="text" name="department" placeholder="Enter your department"
                  value={formData.department} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-section">
              <label>Canteen *</label>
              <select name="canteen" value={formData.canteen} onChange={handleChange} required>
                <option value="Plant Canteen">Plant Canteen</option>
                <option value="Staff Hostel-II Canteen">Staff Hostel-II Canteen</option>
              </select>
            </div>
            <div className="form-section">
              <label>Complaint Details *</label>
              <textarea name="complaintDetails" placeholder="Describe the issue in detail..."
                value={formData.complaintDetails} onChange={handleChange} rows="5" required />
            </div>
            <div className="form-row">
              <div className="form-section">
                <label>Upload Picture (Optional)</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>
              <div className="form-section">
                <label>Upload Video (Optional)</label>
                <input type="file" accept="video/*" onChange={handleVideoChange} />
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

// ══════════════════════════════════════════════════════════
// ADMIN LOGIN
// ══════════════════════════════════════════════════════════
function AdminLogin({ onAuthenticate, setCurrentPage }) {
  const [mode,        setMode]        = useState('login');
  const [username,    setUsername]    = useState('');
  const [pin,         setPin]         = useState('');
  const [loginError,  setLoginError]  = useState('');
  const [loginLoading,setLoginLoading]= useState(false);

  const [otpSending,  setOtpSending]  = useState(false);
  const [otpError,    setOtpError]    = useState('');
  const [otp,         setOtp]         = useState('');
  const [newPin,      setNewPin]      = useState('');
  const [confirmPin,  setConfirmPin]  = useState('');
  const [resetLoading,setResetLoading]= useState(false);
  const [resetMsg,    setResetMsg]    = useState('');
  const [resetError,  setResetError]  = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const trimUser = username.trim();
    const trimPin  = pin.trim();

    if (!trimUser || trimPin.length < 4) {
      setLoginError('❌ Enter username and PIN (min 4 digits).');
      setLoginLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/admin/verify-pin`, {
        username: trimUser,
        pin:      trimPin
      });

      if (res.data.success) {
        onAuthenticate(trimUser, trimPin, res.data.isSuperAdmin === true);
      } else {
        setLoginError('❌ Invalid username or PIN.');
        setPin('');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setLoginError('❌ ' + msg);
      setPin('');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setOtpError(''); setOtpSending(true);
    try {
      await axios.post(`${API_URL}/admin/forgot-pin`);
      setMode('forgot-verify');
    } catch (err) {
      setOtpError(err.response?.data?.error || '❌ Failed to send code. Check email settings.');
    } finally { setOtpSending(false); }
  };

  const handleResetPin = async (e) => {
    e.preventDefault(); setResetError('');
    if (newPin !== confirmPin) { setResetError('❌ PINs do not match.'); return; }
    if (newPin.length < 4)    { setResetError('❌ PIN must be at least 4 digits.'); return; }
    setResetLoading(true);
    try {
      const res = await axios.post(`${API_URL}/admin/reset-pin`, { otp, newPin });
      if (res.data.success) {
        setResetMsg('✅ PIN updated! Login with your new PIN.');
        setTimeout(() => {
          setMode('login'); setOtp(''); setNewPin(''); setConfirmPin(''); setResetMsg('');
        }, 2500);
      }
    } catch (err) {
      setResetError(err.response?.data?.error || '❌ Invalid or expired code.');
    } finally { setResetLoading(false); }
  };

  const backToLogin = () => {
    setMode('login'); setPin(''); setLoginError('');
    setOtp(''); setNewPin(''); setConfirmPin('');
    setOtpError(''); setResetError(''); setResetMsg('');
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
          <button onClick={() => setCurrentPage('home')} className="back-btn">← Home</button>
        </div>
      </header>
      <div className="login-container">
        <div className="login-card">

          {/* ── LOGIN MODE ── */}
          {mode === 'login' && (
            <>
              <div className="login-icon">🔐</div>
              <h2>Admin Access</h2>
              <p>Enter your username and PIN</p>
              {loginError && <div className="error-message">{loginError}</div>}
              <form onSubmit={handleLogin}>
                {/* Username — normal text input, NOT styled like PIN */}
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  style={{
                    textAlign: 'left',
                    letterSpacing: 'normal',
                    fontSize: '15px',
                    padding: '13px 16px',
                    fontFamily: 'var(--ff-body)'
                  }}
                />
                {/* PIN — digits only */}
                <input
                  type="password"
                  placeholder="PIN (digits only)"
                  maxLength="8"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="submit"
                  disabled={loginLoading || pin.length < 4 || !username.trim()}
                >
                  {loginLoading ? '⏳ Verifying...' : '🔓 Unlock'}
                </button>
              </form>
              <button className="forgot-pin-link" onClick={() => setMode('forgot-request')}>
                Forgot PIN?
              </button>
            </>
          )}

          {/* ── FORGOT: REQUEST OTP ── */}
          {mode === 'forgot-request' && (
            <>
              <div className="login-icon">📧</div>
              <h2>Reset PIN</h2>
              <p>A 6-digit code will be sent to:<br />
                <strong>sagarahmedwaseer4553@gmail.com</strong></p>
              {otpError && <div className="error-message">{otpError}</div>}
              <button
                className="submit-btn"
                onClick={handleRequestOtp}
                disabled={otpSending}
                style={{ marginTop: 16 }}
              >
                {otpSending ? '⏳ Sending...' : '📨 Send Verification Code'}
              </button>
              <button className="forgot-pin-link" onClick={backToLogin}>← Back to Login</button>
            </>
          )}

          {/* ── FORGOT: ENTER CODE + NEW PIN ── */}
          {mode === 'forgot-verify' && (
            <>
              <div className="login-icon">🔑</div>
              <h2>Verify & Reset</h2>
              <p>Code sent to <strong>sagarahmedwaseer4553@gmail.com</strong><br />
                <small style={{ color: 'var(--text3)' }}>Valid 10 minutes. Check spam.</small>
              </p>
              {resetError && <div className="error-message">{resetError}</div>}
              {resetMsg   && <div className="success-message">{resetMsg}</div>}
              <form onSubmit={handleResetPin}>
                <input
                  type="text" placeholder="6-digit code" maxLength="6"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  required autoFocus
                  style={{ letterSpacing: 8, textAlign: 'center', fontSize: 22 }}
                />
                <input
                  type="password" placeholder="New PIN (min 4 digits)" maxLength="8"
                  value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} required
                />
                <input
                  type="password" placeholder="Confirm new PIN" maxLength="8"
                  value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} required
                />
                <button
                  type="submit"
                  style={{ marginTop: 14 }}
                  disabled={resetLoading || otp.length !== 6 || newPin.length < 4 || confirmPin.length < 4}
                >
                  {resetLoading ? '⏳ Updating...' : '✅ Update PIN'}
                </button>
              </form>
              <button
                className="forgot-pin-link"
                onClick={() => { setMode('forgot-request'); setOtp(''); setNewPin(''); setConfirmPin(''); setResetError(''); }}
              >← Resend Code</button>
              <button className="forgot-pin-link" onClick={backToLogin} style={{ marginTop: 4 }}>
                ← Back to Login
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════
function AdminDashboard({ setCurrentPage, setAdminAuthenticated, isSuperAdmin, loggedInUser, adminPin }) {
  const [complaints,        setComplaints]        = useState([]);
  const [stats,             setStats]             = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter,            setFilter]            = useState('All');
  const [canteenFilter,     setCanteenFilter]     = useState('All');
  const [loading,           setLoading]           = useState(true);
  const [emailConfig,       setEmailConfig]       = useState({ recipients: [], enableNotifications: true });
  const [showEmailConfig,   setShowEmailConfig]   = useState(false);
  const [showUserMgmt,      setShowUserMgmt]      = useState(false);
  const [newEmail,          setNewEmail]          = useState('');
  const [fetchError,        setFetchError]        = useState('');

  // User management
  const [subUsers,      setSubUsers]      = useState([]);
  const [newSubUser,    setNewSubUser]    = useState('');
  const [newSubPin,     setNewSubPin]     = useState('');
  const [otpStep,       setOtpStep]       = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [verifyOtp,     setVerifyOtp]     = useState('');
  const [otpSending,    setOtpSending]    = useState(false);
  const [userMsg,       setUserMsg]       = useState('');
  const [userErr,       setUserErr]       = useState('');

  // All dashboard requests use adminPin in header
  const H = { adminpin: adminPin };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  const fetchAll = async () => {
    setFetchError('');
    try {
      const [cR, sR, eR] = await Promise.all([
        axios.get(`${API_URL}/complaints`,          { headers: H }),
        axios.get(`${API_URL}/admin/stats`,          { headers: H }),
        axios.get(`${API_URL}/admin/email-config`,   { headers: H })
      ]);
      setComplaints(cR.data);
      setStats(sR.data);
      setEmailConfig(eR.data);
    } catch (e) {
      console.error('Dashboard fetch error:', e.response?.status, e.response?.data);
      setFetchError(`Failed to load data (${e.response?.status || 'network error'}): ${e.response?.data?.error || e.message}`);
    } finally { setLoading(false); }
  };

  const loadSubUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users?username=${encodeURIComponent(loggedInUser)}&pin=${encodeURIComponent(adminPin)}`);
      setSubUsers(res.data);
    } catch (e) { console.error('Load users:', e.response?.data); }
  };

  const updateComplaint = async (id, updates) => {
    try {
      await axios.put(`${API_URL}/complaints/${id}`, updates, { headers: H });
      fetchAll(); setSelectedComplaint(null);
    } catch (e) { console.error('Update error:', e); }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm('Delete this complaint permanently?')) return;
    try {
      await axios.delete(`${API_URL}/complaints/${id}`, { headers: H });
      fetchAll();
    } catch (e) { console.error('Delete error:', e); }
  };

  const addEmail = async () => {
    if (!newEmail || emailConfig.recipients.includes(newEmail)) return;
    const updated = { ...emailConfig, recipients: [...emailConfig.recipients, newEmail] };
    try {
      await axios.put(`${API_URL}/admin/email-config`, updated, { headers: H });
      setEmailConfig(updated); setNewEmail('');
    } catch (e) { console.error('Add email error:', e); }
  };

  const removeEmail = async (email) => {
    const updated = { ...emailConfig, recipients: emailConfig.recipients.filter(e => e !== email) };
    try {
      await axios.put(`${API_URL}/admin/email-config`, updated, { headers: H });
      setEmailConfig(updated);
    } catch (e) { console.error('Remove email error:', e); }
  };

  const startUserAction = async (action) => {
    setUserErr(''); setOtpSending(true);
    try {
      await axios.post(`${API_URL}/admin/forgot-pin`);
      setPendingAction(action); setOtpStep(true);
    } catch { setUserErr('Failed to send verification code'); }
    finally { setOtpSending(false); }
  };

  const confirmUserAction = async () => {
    if (verifyOtp.length !== 6) { setUserErr('Enter valid 6-digit code'); return; }
    setUserErr('');
    try {
      await axios.post(`${API_URL}/admin/verify-otp`, { otp: verifyOtp });
      if (pendingAction.type === 'add') {
        await axios.post(`${API_URL}/admin/users`, {
          username: loggedInUser, pin: adminPin,
          newUsername: pendingAction.newUsername, newPin: pendingAction.newPin
        });
        setUserMsg(`✅ User "${pendingAction.newUsername}" added!`);
        setNewSubUser(''); setNewSubPin('');
      } else {
        await axios.delete(`${API_URL}/admin/users/${pendingAction.targetUsername}`, {
          data: { username: loggedInUser, pin: adminPin }
        });
        setUserMsg(`✅ User "${pendingAction.targetUsername}" removed.`);
      }
      await loadSubUsers();
      setOtpStep(false); setPendingAction(null); setVerifyOtp('');
      setTimeout(() => setUserMsg(''), 4000);
    } catch (e) { setUserErr(e.response?.data?.error || 'Invalid or expired code'); }
  };

  const filtered = () => complaints.filter(c =>
    (filter === 'All' || c.status === filter) &&
    (canteenFilter === 'All' || c.canteen === canteenFilter)
  );

  const generateReport = (c) => {
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
      .np button{margin:4px}
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
      ${actionDate ? `<tr><td><b>${c.status === 'Closed' ? 'Date Closed' : 'Investigation Started'}</b></td><td>${actionDate}</td></tr>` : ''}
      ${resolvedDate ? `<tr><td><b>Date Resolved</b></td><td>${resolvedDate}</td></tr>` : ''}
      <tr><td colspan="2"><b>Complaint Details:</b><br/><br/>${c.complaintDetails.replace(/\n/g, '<br/>')}</td></tr>
    </table>
    ${c.investigation ? `<div class="box"><h4>🔍 Investigation / Admin Actions</h4><p>${c.investigation}</p></div>` : ''}
    ${c.remarks && c.remarks.length > 0 ? `
      <div class="box"><h4>💬 Remarks History</h4>
      ${c.remarks.map(r => `<p>• ${r.text} <em style="color:#9a7a60;font-size:12px">(${new Date(r.addedAt).toLocaleString('en-GB')})</em></p>`).join('')}
      </div>` : ''}
    <div class="sig"><div class="sig-b">
      <div style="height:50px"></div>
      <div class="sig-l">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
      <div class="sig-t">Chairman Canteen Committee</div>
    </div></div>
    <div class="np" style="margin-top:24px">
      <button onclick="window.print()"
        style="background:#a83030;color:#fff;border:none;padding:10px 22px;border-radius:6px;cursor:pointer;font-size:14px">
        🖨️ Print Report</button>
      <button onclick="window.close()"
        style="background:#f0ede8;color:#1a1008;border:1px solid #ddd;padding:10px 22px;border-radius:6px;cursor:pointer;font-size:14px;margin-left:8px">
        Close</button>
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
              <h1>Admin — {isSuperAdmin ? 'Kingsman (Super Admin)' : loggedInUser}</h1>
              <p>FFC MM — Canteens Management</p>
            </div>
          </div>
          <div className="navbar-buttons">
            {isSuperAdmin && (
              <>
                <button onClick={() => { setShowUserMgmt(v => !v); if (!showUserMgmt) loadSubUsers(); }}
                  className="config-btn">👥 Users</button>
                <button onClick={() => setShowEmailConfig(v => !v)} className="config-btn">📧 Email</button>
              </>
            )}
            <button onClick={() => { setAdminAuthenticated(false); setCurrentPage('home'); }} className="logout-btn">
              🔓 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">

        {fetchError && (
          <div className="error-message" style={{ marginBottom: 20 }}>
            {fetchError}
            <button onClick={fetchAll}
              style={{ marginLeft: 12, padding: '4px 12px', background: 'var(--red)', color: '#fff',
                       border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
              Retry
            </button>
          </div>
        )}

        {/* USER MANAGEMENT */}
        {isSuperAdmin && showUserMgmt && (
          <div className="user-mgmt-panel">
            <h3>👥 User Management</h3>
            <p>Add or remove admin users. Each action requires Gmail verification.</p>
            {userMsg && <div className="success-message">{userMsg}</div>}
            {userErr && <div className="error-message">{userErr}</div>}
            {otpStep ? (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
                  Enter the 6-digit code sent to your Gmail:
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input type="text" placeholder="6-digit code" maxLength="6"
                    value={verifyOtp} onChange={e => setVerifyOtp(e.target.value.replace(/\D/g, ''))}
                    style={{ flex: 1, minWidth: 140, letterSpacing: 6, textAlign: 'center', fontSize: 18 }} />
                  <button onClick={confirmUserAction}
                    style={{ padding: '0 20px', background: 'var(--red)', color: '#fff', border: 'none',
                             borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13, minHeight: 44 }}>
                    ✅ Confirm
                  </button>
                  <button onClick={() => { setOtpStep(false); setPendingAction(null); setVerifyOtp(''); }}
                    style={{ padding: '0 16px', background: 'var(--bg4)', color: 'var(--text2)',
                             border: '1.5px solid var(--border)', borderRadius: 9, cursor: 'pointer',
                             fontSize: 13, minHeight: 44 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="user-item-role">Admin</span>
                        <button onClick={() => startUserAction({ type: 'remove', targetUsername: u.username })}
                          disabled={otpSending}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)',
                                   cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>
                      </div>
                    </li>
                  ))}
                  {subUsers.length === 0 && (
                    <li style={{ padding: '10px 0', fontSize: 13, color: 'var(--text3)' }}>
                      No sub-users added yet.
                    </li>
                  )}
                </ul>
                <div className="add-user-row">
                  <input type="text" placeholder="New username"
                    value={newSubUser} onChange={e => setNewSubUser(e.target.value)} />
                  <input type="password" placeholder="PIN (min 4 digits)"
                    value={newSubPin} onChange={e => setNewSubPin(e.target.value.replace(/\D/g, ''))} maxLength="8" />
                  <button disabled={otpSending}
                    onClick={() => {
                      if (!newSubUser.trim() || newSubPin.length < 4) {
                        setUserErr('Enter username and PIN (min 4 digits)'); return;
                      }
                      setUserErr('');
                      startUserAction({ type: 'add', newUsername: newSubUser.trim(), newPin: newSubPin });
                    }}>
                    {otpSending ? '⏳' : '+ Add User'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* EMAIL CONFIG */}
        {isSuperAdmin && showEmailConfig && (
          <div className="email-config-panel">
            <h3>📧 Email Configuration</h3>
            <p>Add email addresses to receive complaint notifications</p>
            <div className="email-input-group">
              <input type="email" placeholder="admin@example.com"
                value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              <button onClick={addEmail}>Add Email</button>
            </div>
            <div className="email-list">
              <h4>Recipients ({emailConfig.recipients.length}):</h4>
              {emailConfig.recipients.length === 0
                ? <p style={{ fontSize: 13, color: 'var(--text3)' }}>No emails configured</p>
                : emailConfig.recipients.map((email, i) => (
                  <div key={i} className="email-item">
                    <span>✉️ {email}</span>
                    <button onClick={() => removeEmail(email)}>✕</button>
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

        {/* FILTERS */}
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
        </div>

        {/* TABLE */}
        <div className="complaints-table">
          <h3>Complaints ({filtered().length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>P. No</th><th>Canteen</th>
                  <th>Status</th><th>Fine (PKR)</th><th>Submitted</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered().length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>
                    No complaints found
                  </td></tr>
                ) : filtered().map(c => (
                  <tr key={c._id}>
                    <td>{c.fullName}</td>
                    <td style={{ fontFamily: 'var(--ff-mono)', fontSize: 12 }}>{c.personalNumber}</td>
                    <td>{c.canteen}</td>
                    <td>
                      <span className={`status ${c.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.fineAmount || 0}</td>
                    <td style={{ fontSize: 12 }}>{new Date(c.submittedAt).toLocaleDateString('en-GB')}</td>
                    <td>
                      <button onClick={() => setSelectedComplaint(c)}>View</button>
                      <button className="btn-delete" onClick={() => deleteComplaint(c._id)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedComplaint && (
          <ComplaintDetail
            complaint={selectedComplaint}
            onUpdate={updateComplaint}
            onClose={() => setSelectedComplaint(null)}
            onPrint={generateReport}
          />
        )}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// COMPLAINT DETAIL MODAL
// ══════════════════════════════════════════════════════════
function ComplaintDetail({ complaint, onUpdate, onClose, onPrint }) {
  const [status,        setStatus]        = useState(complaint.status);
  const [remarks,       setRemarks]       = useState('');
  const [fineAmount,    setFineAmount]    = useState(complaint.fineAmount || 0);
  const [investigation, setInvestigation] = useState(complaint.investigation || '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <h2>Complaint Details</h2>

        <div className="detail-section">
          <h4>Complainant Information</h4>
          <p><strong>Name:</strong> {complaint.fullName}</p>
          <p><strong>P. No:</strong> {complaint.personalNumber}</p>
          <p><strong>Designation:</strong> {complaint.designation}</p>
          <p><strong>Department:</strong> {complaint.department}</p>
          <p><strong>Mobile:</strong> {complaint.mobileNumber}</p>
        </div>

        <div className="detail-section">
          <h4>Complaint Information</h4>
          <p><strong>Canteen:</strong> {complaint.canteen}</p>
          <p><strong>Details:</strong> {complaint.complaintDetails}</p>
          <p><strong>Submitted:</strong> {new Date(complaint.submittedAt).toLocaleString('en-GB')}</p>
          {complaint.updatedAt && (
            <p><strong>Last Updated:</strong> {new Date(complaint.updatedAt).toLocaleString('en-GB')}</p>
          )}
        </div>

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
          <input type="number" value={fineAmount}
            onChange={e => setFineAmount(e.target.value)} min="0" />

          <label>Investigation Details</label>
          <textarea value={investigation} onChange={e => setInvestigation(e.target.value)}
            placeholder="Enter investigation findings..." rows="3" />

          <label>Add New Remark</label>
          <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
            placeholder="Add a new remark..." rows="2" />

          {complaint.remarks && complaint.remarks.length > 0 && (
            <div className="remarks-list">
              <h5>Remarks History ({complaint.remarks.length})</h5>
              {complaint.remarks.map((r, i) => (
                <p key={i}>
                  <small>{new Date(r.addedAt).toLocaleString('en-GB')}</small><br />
                  {r.text}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button className="save-btn"
            onClick={() => onUpdate(complaint._id, {
              status,
              remarks:       remarks || undefined,
              fineAmount:    parseFloat(fineAmount) || 0,
              investigation
            })}>
            💾 Save Changes
          </button>
          <button className="print-btn" onClick={() => onPrint(complaint)}>🖨️ Print Report</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

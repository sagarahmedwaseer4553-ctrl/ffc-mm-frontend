// App.jsx - FFC MM Canteens — Complete Upgraded UI
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const PERMANENT_USER = 'kingsman';
const PERMANENT_PIN  = '1920';

export default function App() {
  const [currentPage, setCurrentPage]           = useState('home');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin]         = useState(false);
  const [loggedInUser, setLoggedInUser]          = useState('');

  return (
    <div className="app">
      {currentPage === 'home' && (
        <HomePage setCurrentPage={setCurrentPage} />
      )}
      {currentPage === 'complaint' && (
        <ComplaintForm setCurrentPage={setCurrentPage} />
      )}
      {currentPage === 'tracker' && (
        <PublicTracker setCurrentPage={setCurrentPage} />
      )}
      {currentPage === 'admin' && !adminAuthenticated && (
        <AdminLogin
          onAuthenticate={(user, superAdmin) => {
            setAdminAuthenticated(true);
            setIsSuperAdmin(superAdmin);
            setLoggedInUser(user);
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
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════════
function HomePage({ setCurrentPage }) {
  const [showTracker, setShowTracker] = useState(false);
  const [complaints, setComplaints]   = useState([]);
  const [trackerLoading, setTrackerLoading] = useState(false);

  const loadComplaints = async () => {
    if (complaints.length > 0) { setShowTracker(v => !v); return; }
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

        {/* PUBLIC TRACKER */}
        <div className="tracker-section">
          <div className="tracker-header" onClick={loadComplaints}>
            <div>
              <h3>📋 Complaints Tracker</h3>
              <p>View and track all submitted complaints and their status</p>
            </div>
            <button className="tracker-toggle">
              {trackerLoading ? '⏳ Loading...' : showTracker ? '▲ Hide' : '▼ View Tracker'}
            </button>
          </div>
          {showTracker && (
            <div className="tracker-body">
              {complaints.length === 0 ? (
                <div className="tracker-empty">No complaints submitted yet.</div>
              ) : (
                <ul className="tracker-list">
                  {complaints.map(c => (
                    <li key={c._id} className="tracker-item">
                      <div className="tracker-item-head">
                        <span className="tracker-item-name">{c.fullName} — {c.designation}</span>
                        <span className="tracker-item-canteen">{c.canteen}</span>
                      </div>
                      <div className="tracker-item-detail">{c.complaintDetails}</div>
                      {/* Admin actions visible to public */}
                      {(c.status !== 'New' || c.investigation || c.fineAmount > 0) && (
                        <div className="tracker-actions">
                          {c.investigation && <span>📝 {c.investigation}</span>}
                          {c.fineAmount > 0 && <span> &nbsp;|&nbsp; 💰 Fine: PKR {c.fineAmount}</span>}
                          {c.resolvedAt  && <span> &nbsp;|&nbsp; ✅ Resolved: {new Date(c.resolvedAt).toLocaleDateString()}</span>}
                          {c.status === 'Under Investigation' && c.updatedAt && (
                            <span> &nbsp;|&nbsp; 🔍 Under investigation since {new Date(c.updatedAt).toLocaleDateString()}</span>
                          )}
                          {c.status === 'Closed' && c.updatedAt && (
                            <span> &nbsp;|&nbsp; 🔒 Closed on {new Date(c.updatedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                      <div className="tracker-item-footer">
                        <span className="tracker-item-date">{new Date(c.submittedAt).toLocaleDateString('en-GB')}</span>
                        <span className={`badge-status ${c.status.replace(/\s+/g,'-').toLowerCase()}`}>{c.status}</span>
                      </div>
                    </li>
                  ))}
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

// ══════════════════════════════════════════════════════════
// PUBLIC TRACKER PAGE (standalone)
// ══════════════════════════════════════════════════════════
function PublicTracker({ setCurrentPage }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/complaints`)
      .then(r => setComplaints(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <div className="logo">🏭</div>
            <div>
              <h1>Canteen Complaint Management System</h1>
              <p>FFC MM — Tracker</p>
            </div>
          </div>
          <button className="back-btn" onClick={() => setCurrentPage('home')}>← Back</button>
        </div>
      </header>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <h2 style={{ fontFamily: 'var(--ff-head)', fontSize: 28, marginBottom: 24, color: 'var(--text)' }}>
          All Complaints
        </h2>
        {loading ? <div className="loading">Loading...</div> : complaints.length === 0 ? (
          <div className="tracker-empty">No complaints yet.</div>
        ) : (
          <ul className="tracker-list">
            {complaints.map(c => (
              <li key={c._id} className="tracker-item">
                <div className="tracker-item-head">
                  <span className="tracker-item-name">{c.fullName} — {c.designation}, {c.department}</span>
                  <span className="tracker-item-canteen">{c.canteen}</span>
                </div>
                <div className="tracker-item-detail">{c.complaintDetails}</div>
                {(c.status !== 'New' || c.investigation || c.fineAmount > 0) && (
                  <div className="tracker-actions">
                    {c.investigation && <span>📝 {c.investigation}</span>}
                    {c.fineAmount > 0 && <span> &nbsp;|&nbsp; 💰 Fine: PKR {c.fineAmount}</span>}
                    {c.status === 'Under Investigation' && c.updatedAt && (
                      <span> &nbsp;|&nbsp; 🔍 Under investigation since {new Date(c.updatedAt).toLocaleDateString()}</span>
                    )}
                    {c.status === 'Closed' && c.updatedAt && (
                      <span> &nbsp;|&nbsp; 🔒 Closed on {new Date(c.updatedAt).toLocaleDateString()}</span>
                    )}
                    {c.status === 'Resolved' && c.updatedAt && (
                      <span> &nbsp;|&nbsp; ✅ Resolved on {new Date(c.updatedAt).toLocaleDateString()}</span>
                    )}
                    {c.remarks && c.remarks.length > 0 && (
                      <span> &nbsp;|&nbsp; 💬 Remarks: {c.remarks[c.remarks.length-1].text}</span>
                    )}
                  </div>
                )}
                <div className="tracker-item-footer">
                  <span className="tracker-item-date">{new Date(c.submittedAt).toLocaleDateString('en-GB')}</span>
                  <span className={`badge-status ${c.status.replace(/\s+/g,'-').toLowerCase()}`}>{c.status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// COMPLAINT FORM
// ══════════════════════════════════════════════════════════
function ComplaintForm({ setCurrentPage }) {
  const [formData, setFormData] = useState({
    fullName:'', personalNumber:'', designation:'', department:'',
    mobileNumber:'', complaintDetails:'', canteen:'Plant Canteen',
    imageUrl:'', videoUrl:''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (file) => new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) { const b = await handleFileUpload(file); setFormData(prev => ({ ...prev, imageUrl: b })); }
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (file) { const b = await handleFileUpload(file); setFormData(prev => ({ ...prev, videoUrl: b })); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      await axios.post(`${API_URL}/complaints`, formData);
      setMessage('✅ Complaint submitted successfully! Thank you for reporting.');
      setFormData({ fullName:'', personalNumber:'', designation:'', department:'',
        mobileNumber:'', complaintDetails:'', canteen:'Plant Canteen', imageUrl:'', videoUrl:'' });
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
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`} style={{ margin: '16px 40px 0' }}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <label htmlFor="fullName">Full Name *</label>
              <input id="fullName" type="text" name="fullName" placeholder="Enter your full name"
                value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-section">
                <label htmlFor="personalNumber">Personal Number (P. No) *</label>
                <input id="personalNumber" type="text" name="personalNumber" placeholder="e.g. P-12345"
                  value={formData.personalNumber} onChange={handleChange} required />
              </div>
              <div className="form-section">
                <label htmlFor="mobileNumber">Mobile Number *</label>
                <input id="mobileNumber" type="tel" name="mobileNumber" placeholder="e.g. 03001234567"
                  value={formData.mobileNumber} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-section">
                <label htmlFor="designation">Designation *</label>
                <input id="designation" type="text" name="designation" placeholder="e.g. Engineer, Operator"
                  value={formData.designation} onChange={handleChange} required />
              </div>
              <div className="form-section">
                <label htmlFor="department">Department / Unit *</label>
                <input id="department" type="text" name="department" placeholder="Enter your department"
                  value={formData.department} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-section">
              <label htmlFor="canteen">Canteen *</label>
              <select id="canteen" name="canteen" value={formData.canteen} onChange={handleChange} required>
                <option value="Plant Canteen">Plant Canteen</option>
                <option value="Staff Hostel-II Canteen">Staff Hostel-II Canteen</option>
              </select>
            </div>
            <div className="form-section">
              <label htmlFor="complaintDetails">Complaint Details *</label>
              <textarea id="complaintDetails" name="complaintDetails"
                placeholder="Describe the issue in detail..." value={formData.complaintDetails}
                onChange={handleChange} rows="5" required />
            </div>
            <div className="form-row">
              <div className="form-section">
                <label htmlFor="image">Upload Picture (Optional)</label>
                <input id="image" type="file" accept="image/*" onChange={handleImageChange} />
              </div>
              <div className="form-section">
                <label htmlFor="video">Upload Video (Optional)</label>
                <input id="video" type="file" accept="video/*" onChange={handleVideoChange} />
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
// ADMIN LOGIN — supports username + PIN, two user levels
// ══════════════════════════════════════════════════════════
function AdminLogin({ onAuthenticate, setCurrentPage }) {
  const [mode, setMode]     = useState('login');
  const [username, setUsername] = useState('');
  const [pin, setPin]       = useState('');
  const [loginError, setLoginError]   = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // forgot
  const [otpSending, setOtpSending] = useState(false);
  const [otpError, setOtpError]     = useState('');
  const [otp, setOtp]               = useState('');
  const [newPin, setNewPin]         = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg]     = useState('');
  const [resetError, setResetError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(''); setLoginLoading(true);
    try {
      // Check if permanent superadmin
      if (username.trim() === PERMANENT_USER && pin.trim() === PERMANENT_PIN) {
        localStorage.setItem('adminPin', pin.trim());
        localStorage.setItem('adminUser', username.trim());
        onAuthenticate(username.trim(), true);
        return;
      }
      // Otherwise verify via API (regular admin users defined by kingsman)
      const res = await axios.post(`${API_URL}/admin/verify-pin`, { pin: pin.trim(), username: username.trim() });
      if (res.data.success) {
        localStorage.setItem('adminPin', pin.trim());
        localStorage.setItem('adminUser', username.trim());
        onAuthenticate(username.trim(), false);
      }
    } catch {
      setLoginError('❌ Invalid username or PIN. Please try again.');
      setPin('');
    } finally { setLoginLoading(false); }
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
        setTimeout(() => { setMode('login'); setOtp(''); setNewPin(''); setConfirmPin(''); setResetMsg(''); }, 2500);
      }
    } catch (err) { setResetError(err.response?.data?.error || '❌ Invalid or expired code.'); }
    finally { setResetLoading(false); }
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

          {mode === 'login' && (
            <>
              <div className="login-icon">🔐</div>
              <h2>Admin Access</h2>
              <p>Enter your username and PIN to access the admin panel</p>
              {loginError && <div className="error-message">{loginError}</div>}
              <form onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required autoFocus
                  style={{ textAlign: 'left', letterSpacing: 'normal', fontSize: '15px', padding: '13px 15px' }}
                />
                <input
                  type="password"
                  placeholder="Enter PIN"
                  maxLength="8"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  required
                />
                <button type="submit" disabled={loginLoading || pin.length < 4 || !username.trim()}>
                  {loginLoading ? '⏳ Verifying...' : '🔓 Unlock'}
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
              <p>A 6-digit code will be sent to:<br /><strong>sagarahmedwaseer4553@gmail.com</strong></p>
              {otpError && <div className="error-message">{otpError}</div>}
              <button className="submit-btn" onClick={handleRequestOtp} disabled={otpSending} style={{ marginTop: 16 }}>
                {otpSending ? '⏳ Sending...' : '📨 Send Verification Code'}
              </button>
              <button className="forgot-pin-link" onClick={backToLogin}>← Back to Login</button>
            </>
          )}

          {mode === 'forgot-verify' && (
            <>
              <div className="login-icon">🔑</div>
              <h2>Enter Verification Code</h2>
              <p>Code sent to <strong>sagarahmedwaseer4553@gmail.com</strong><br />
                <small style={{ color: 'var(--text3)' }}>Valid 10 minutes. Check spam.</small>
              </p>
              {resetError && <div className="error-message">{resetError}</div>}
              {resetMsg   && <div className="success-message">{resetMsg}</div>}
              <form onSubmit={handleResetPin}>
                <input type="text" placeholder="6-digit code" maxLength="6"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required autoFocus />
                <input type="password" placeholder="New PIN (min 4 digits)" maxLength="8"
                  value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} required />
                <input type="password" placeholder="Confirm new PIN" maxLength="8"
                  value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} required />
                <button type="submit"
                  disabled={resetLoading || otp.length!==6 || newPin.length<4 || confirmPin.length<4}
                  style={{ marginTop: 14 }}>
                  {resetLoading ? '⏳ Updating...' : '✅ Update PIN'}
                </button>
              </form>
              <button className="forgot-pin-link" onClick={() => { setMode('forgot-request'); setOtp(''); setNewPin(''); setConfirmPin(''); setResetError(''); }}>
                ← Resend Code
              </button>
              <button className="forgot-pin-link" onClick={backToLogin} style={{ marginTop: 4 }}>← Back to Login</button>
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
function AdminDashboard({ setCurrentPage, setAdminAuthenticated, isSuperAdmin, loggedInUser }) {
  const [complaints, setComplaints]   = useState([]);
  const [stats, setStats]             = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter]           = useState('All');
  const [canteenFilter, setCanteenFilter] = useState('All');
  const [loading, setLoading]         = useState(true);
  const [adminPin]                    = useState(localStorage.getItem('adminPin'));
  const [emailConfig, setEmailConfig] = useState({ recipients: [], enableNotifications: true });
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [newEmail, setNewEmail]       = useState('');

  // User management state (super admin only)
  const [subUsers, setSubUsers]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('subUsers') || '[]'); } catch { return []; }
  });
  const [newSubUser, setNewSubUser]   = useState('');
  const [newSubPin, setNewSubPin]     = useState('');
  const [verifyOtp, setVerifyOtp]     = useState('');
  const [pendingAction, setPendingAction] = useState(null); // {type:'add'|'remove', data}
  const [otpStep, setOtpStep]         = useState(false);
  const [otpSending, setOtpSending]   = useState(false);
  const [otpMsg, setOtpMsg]           = useState('');
  const [otpError2, setOtpError2]     = useState('');

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const fetchData = async () => {
    try {
      const [cRes, sRes, eRes] = await Promise.all([
        axios.get(`${API_URL}/complaints`,        { headers: { adminpin: adminPin } }),
        axios.get(`${API_URL}/admin/stats`,        { headers: { adminpin: adminPin } }),
        axios.get(`${API_URL}/admin/email-config`, { headers: { adminpin: adminPin } })
      ]);
      setComplaints(cRes.data);
      setStats(sRes.data);
      setEmailConfig(eRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleUpdateComplaint = async (id, updates) => {
    try {
      await axios.put(`${API_URL}/complaints/${id}`, updates, { headers: { adminpin: adminPin } });
      fetchData(); setSelectedComplaint(null);
    } catch (e) { console.error(e); }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Delete this complaint permanently?')) return;
    try {
      await axios.delete(`${API_URL}/complaints/${id}`, { headers: { adminpin: adminPin } });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleAddEmail = async () => {
    if (!newEmail || emailConfig.recipients.includes(newEmail)) return;
    const updated = { ...emailConfig, recipients: [...emailConfig.recipients, newEmail] };
    try {
      await axios.put(`${API_URL}/admin/email-config`, updated, { headers: { adminpin: adminPin } });
      setEmailConfig(updated); setNewEmail('');
    } catch (e) { console.error(e); }
  };

  const handleRemoveEmail = async (email) => {
    const updated = { ...emailConfig, recipients: emailConfig.recipients.filter(e => e !== email) };
    try {
      await axios.put(`${API_URL}/admin/email-config`, updated, { headers: { adminpin: adminPin } });
      setEmailConfig(updated);
    } catch (e) { console.error(e); }
  };

  // Request OTP before user management action
  const requestOtpForAction = async (action) => {
    setOtpError2(''); setOtpSending(true);
    try {
      await axios.post(`${API_URL}/admin/forgot-pin`);
      setPendingAction(action); setOtpStep(true);
      setOtpMsg('Verification code sent to sagarahmedwaseer4553@gmail.com');
    } catch { setOtpError2('Failed to send verification code'); }
    finally { setOtpSending(false); }
  };

  const confirmOtpAction = async () => {
    if (!verifyOtp || verifyOtp.length !== 6) { setOtpError2('Enter valid 6-digit code'); return; }
    try {
      // Verify OTP via backend
      await axios.post(`${API_URL}/admin/verify-otp`, { otp: verifyOtp });
      if (pendingAction.type === 'add') {
        const updated = [...subUsers, { username: pendingAction.username, pin: pendingAction.pin }];
        setSubUsers(updated);
        localStorage.setItem('subUsers', JSON.stringify(updated));
        setNewSubUser(''); setNewSubPin('');
      } else if (pendingAction.type === 'remove') {
        const updated = subUsers.filter(u => u.username !== pendingAction.username);
        setSubUsers(updated);
        localStorage.setItem('subUsers', JSON.stringify(updated));
      }
      setOtpStep(false); setPendingAction(null); setVerifyOtp('');
      setOtpMsg('Action completed successfully!');
      setTimeout(() => setOtpMsg(''), 3000);
    } catch { setOtpError2('Invalid or expired code'); }
  };

  const getFiltered = () => complaints.filter(c => {
    const sm = filter === 'All' || c.status === filter;
    const cm = canteenFilter === 'All' || c.canteen === canteenFilter;
    return sm && cm;
  });

  const handleLogout = () => {
    localStorage.removeItem('adminPin'); localStorage.removeItem('adminUser');
    setAdminAuthenticated(false); setCurrentPage('home');
  };

  const generateReport = (complaint) => {
    const w = window.open('', '', 'height=600,width=850');
    const actionDate = (complaint.status === 'Closed' || complaint.status === 'Under Investigation')
      ? (complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleDateString('en-GB') : 'N/A')
      : null;

    w.document.write(`<!DOCTYPE html><html><head><title>Complaint Report</title>
    <style>
      body{font-family:Arial,sans-serif;margin:32px;color:#1a1008}
      h2{color:#a83030;margin-bottom:4px;font-size:22px}
      .subtitle{color:#9a7a60;font-size:13px;margin-bottom:20px}
      table{width:100%;border-collapse:collapse;margin:18px 0}
      th,td{border:1px solid #ddd;padding:10px 12px;text-align:left;font-size:13px}
      th{background:#a83030;color:#fff;font-weight:700}
      tr:nth-child(even){background:#fdf8f3}
      .actions-box{background:#fdf3dc;border:1px solid #c8960a;border-radius:6px;padding:14px;margin:14px 0}
      .actions-box h4{color:#a87c08;margin:0 0 8px;font-size:13px}
      .sig-box{margin-top:40px;page-break-inside:avoid}
      .sig-line{width:260px;border-top:1.5px solid #1a1008;margin:0 auto;padding-top:8px;text-align:center;font-size:13px;font-weight:700;color:#1a1008}
      .sig-title{text-align:center;font-size:12px;color:#5a3e2b;margin-top:4px}
      .no-print button{margin:4px}
      @media print{.no-print{display:none}}
    </style></head><body>
    <h2>🏭 FFC MM — Canteen Complaint Report</h2>
    <div class="subtitle">Generated on ${new Date().toLocaleString('en-GB')}</div>
    <table>
      <tr><th>Field</th><th>Details</th></tr>
      <tr><td><strong>Full Name</strong></td><td>${complaint.fullName}</td></tr>
      <tr><td><strong>P. No</strong></td><td>${complaint.personalNumber}</td></tr>
      <tr><td><strong>Designation</strong></td><td>${complaint.designation}</td></tr>
      <tr><td><strong>Department</strong></td><td>${complaint.department}</td></tr>
      <tr><td><strong>Mobile</strong></td><td>${complaint.mobileNumber}</td></tr>
      <tr><td><strong>Canteen</strong></td><td>${complaint.canteen}</td></tr>
      <tr><td><strong>Status</strong></td><td>${complaint.status}</td></tr>
      <tr><td><strong>Fine Amount</strong></td><td>${complaint.fineAmount ? 'PKR ' + complaint.fineAmount : 'N/A'}</td></tr>
      <tr><td><strong>Submitted</strong></td><td>${new Date(complaint.submittedAt).toLocaleString('en-GB')}</td></tr>
      ${actionDate ? `<tr><td><strong>${complaint.status === 'Closed' ? 'Closed On' : 'Investigation Started'}</strong></td><td>${actionDate}</td></tr>` : ''}
      <tr><td colspan="2"><strong>Complaint Details:</strong><br/><br/>${complaint.complaintDetails}</td></tr>
    </table>
    ${complaint.investigation ? `
    <div class="actions-box">
      <h4>🔍 Investigation / Admin Actions</h4>
      <p>${complaint.investigation}</p>
    </div>` : ''}
    ${complaint.remarks && complaint.remarks.length > 0 ? `
    <div class="actions-box">
      <h4>💬 Remarks</h4>
      ${complaint.remarks.map(r => `<p>• ${r.text} <em style="color:#9a7a60;font-size:12px">(${new Date(r.addedAt).toLocaleString('en-GB')})</em></p>`).join('')}
    </div>` : ''}
    <div class="sig-box">
      <div class="sig-line">&nbsp;</div>
      <div class="sig-title">Chairman Canteen Committee</div>
    </div>
    <br/><br/>
    <div class="no-print">
      <button onclick="window.print()" style="background:#a83030;color:#fff;border:none;padding:10px 22px;border-radius:6px;cursor:pointer;font-size:14px">🖨️ Print</button>
      <button onclick="window.close()" style="background:#f0ede8;color:#1a1008;border:1px solid #ddd;padding:10px 22px;border-radius:6px;cursor:pointer;font-size:14px;margin-left:8px">Close</button>
    </div>
    </body></html>`);
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
              <h1>Admin Panel {isSuperAdmin ? '— Kingsman' : `— ${loggedInUser}`}</h1>
              <p>FFC MM — Canteens Management</p>
            </div>
          </div>
          <div className="navbar-buttons">
            {isSuperAdmin && (
              <>
                <button onClick={() => setShowUserMgmt(v => !v)} className="config-btn">👥 Users</button>
                <button onClick={() => setShowEmailConfig(v => !v)} className="config-btn">📧 Email</button>
              </>
            )}
            <button onClick={handleLogout} className="logout-btn">🔓 Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">

        {/* USER MANAGEMENT — super admin only */}
        {isSuperAdmin && showUserMgmt && (
          <div className="user-mgmt-panel">
            <h3>👥 User Management</h3>
            <p>Add or remove admin users. Each action requires email verification.</p>

            {otpMsg   && <div className="success-message">{otpMsg}</div>}
            {otpError2 && <div className="error-message">{otpError2}</div>}

            {otpStep ? (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
                  Enter the 6-digit code sent to sagarahmedwaseer4553@gmail.com:
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input type="text" placeholder="6-digit code" maxLength="6"
                    value={verifyOtp} onChange={e => setVerifyOtp(e.target.value.replace(/\D/g,''))}
                    style={{ flex: 1, letterSpacing: 6, textAlign: 'center', fontSize: 18 }} />
                  <button onClick={confirmOtpAction}
                    style={{ padding: '0 20px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    Confirm
                  </button>
                  <button onClick={() => { setOtpStep(false); setPendingAction(null); setVerifyOtp(''); }}
                    style={{ padding: '0 16px', background: 'var(--bg4)', color: 'var(--text2)', border: '1.5px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontSize: 13 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ul className="user-list">
                  <li className="user-item">
                    <span className="user-item-name">kingsman</span>
                    <span className="user-item-role permanent">Permanent Admin</span>
                  </li>
                  {subUsers.map((u, i) => (
                    <li key={i} className="user-item">
                      <span className="user-item-name">{u.username}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="user-item-role">Admin</span>
                        <button onClick={() => requestOtpForAction({ type: 'remove', username: u.username })}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16 }}
                          disabled={otpSending}>✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="add-user-row">
                  <input type="text" placeholder="New username"
                    value={newSubUser} onChange={e => setNewSubUser(e.target.value)} />
                  <input type="password" placeholder="PIN (digits only)"
                    value={newSubPin} onChange={e => setNewSubPin(e.target.value.replace(/\D/g,''))} maxLength="8" />
                  <button
                    onClick={() => {
                      if (!newSubUser.trim() || newSubPin.length < 4) return;
                      requestOtpForAction({ type: 'add', username: newSubUser.trim(), pin: newSubPin });
                    }}
                    disabled={otpSending || !newSubUser.trim() || newSubPin.length < 4}>
                    {otpSending ? '⏳ Sending...' : '+ Add User'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* EMAIL CONFIG — super admin only */}
        {isSuperAdmin && showEmailConfig && (
          <div className="email-config-panel">
            <h3>📧 Email Configuration</h3>
            <p>Add email addresses to receive complaint notifications</p>
            <div className="email-input-group">
              <input type="email" placeholder="admin@example.com"
                value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              <button onClick={handleAddEmail}>Add Email</button>
            </div>
            <div className="email-list">
              <h4>Recipients ({emailConfig.recipients.length}):</h4>
              {emailConfig.recipients.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text3)' }}>No emails configured</p>
              ) : (
                emailConfig.recipients.map((email, idx) => (
                  <div key={idx} className="email-item">
                    <span>✉️ {email}</span>
                    <button onClick={() => handleRemoveEmail(email)}>✕</button>
                  </div>
                ))
              )}
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
          <h3>Complaints ({getFiltered().length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>P. No</th><th>Canteen</th>
                  <th>Status</th><th>Fine (PKR)</th><th>Submitted</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFiltered().map(c => (
                  <tr key={c._id}>
                    <td>{c.fullName}</td>
                    <td style={{ fontFamily: 'var(--ff-mono)', fontSize: 12 }}>{c.personalNumber}</td>
                    <td>{c.canteen}</td>
                    <td><span className={`status ${c.status.replace(/\s+/g,'-').toLowerCase()}`}>{c.status}</span></td>
                    <td>{c.fineAmount || 0}</td>
                    <td style={{ fontSize: 12 }}>{new Date(c.submittedAt).toLocaleDateString('en-GB')}</td>
                    <td>
                      <button onClick={() => setSelectedComplaint(c)}>View</button>
                      <button className="btn-delete" onClick={() => handleDeleteComplaint(c._id)}>🗑</button>
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
            onUpdate={handleUpdateComplaint}
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
  const [status, setStatus]           = useState(complaint.status);
  const [remarks, setRemarks]         = useState('');
  const [fineAmount, setFineAmount]   = useState(complaint.fineAmount || 0);
  const [investigation, setInvestigation] = useState(complaint.investigation || '');

  const handleSave = () => {
    onUpdate(complaint._id, {
      status,
      remarks:       remarks || undefined,
      fineAmount:    parseFloat(fineAmount),
      investigation
    });
  };

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
          <input type="number" value={fineAmount} onChange={e => setFineAmount(e.target.value)} min="0" />
          <label>Investigation Details</label>
          <textarea value={investigation} onChange={e => setInvestigation(e.target.value)}
            placeholder="Enter investigation findings..." rows="3" />
          <label>Add Remark</label>
          <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
            placeholder="Add a new remark..." rows="2" />
          {complaint.remarks && complaint.remarks.length > 0 && (
            <div className="remarks-list">
              <h5>Previous Remarks:</h5>
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
          <button onClick={handleSave} className="save-btn">💾 Save Changes</button>
          <button onClick={() => onPrint(complaint)} className="print-btn">🖨️ Print Report</button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
}

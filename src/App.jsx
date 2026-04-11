// App.jsx - Complete Frontend Application
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

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
          onAuthenticate={() => {
            setAdminAuthenticated(true);
            setCurrentPage('admin-dashboard');
          }}
          setCurrentPage={setCurrentPage}
        />
      )}
      {currentPage === 'admin-dashboard' && adminAuthenticated && (
        <AdminDashboard
          setCurrentPage={setCurrentPage}
          setAdminAuthenticated={setAdminAuthenticated}
        />
      )}
    </div>
  );
}

// ==================== HOME PAGE ====================

function HomePage({ setCurrentPage }) {
  return (
    <div className="home-page">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <div className="logo">🏭</div>
            <h1>Plant Canteen</h1>
            <p>Complaint Management System</p>
          </div>
          <button className="admin-btn" onClick={() => setCurrentPage('admin')}>
            🔐 Admin
          </button>
        </div>
      </header>

      <main className="home-content">
        <section className="hero">
          <h2>Welcome to FFC MM Canteens</h2>
          <p>Report issues quickly and efficiently</p>
        </section>

        <div className="options-grid">
          <div className="option-card canteen-card">
            <div className="icon">🍴</div>
            <h3>Plant Canteen</h3>
            <p>Main facility canteen</p>
            <button onClick={() => setCurrentPage('complaint')}>Report Issue →</button>
          </div>
          <div className="option-card canteen-card">
            <div className="icon">🏢</div>
            <h3>Staff Hostel-II Canteen</h3>
            <p>Hostel facility canteen</p>
            <button onClick={() => setCurrentPage('complaint')}>Report Issue →</button>
          </div>
        </div>

        <section className="features">
          <h3>System Features</h3>
          <ul>
            <li>✅ Quick complaint submission</li>
            <li>✅ Image &amp; video upload support</li>
            <li>✅ Real-time status tracking</li>
            <li>✅ Email notifications</li>
            <li>✅ Admin investigation &amp; resolution</li>
          </ul>
        </section>
      </main>

      <footer>
        <p>FFC MM - Canteens Management System © 2026</p>
      </footer>
    </div>
  );
}

// ==================== COMPLAINT FORM ====================

function ComplaintForm({ setCurrentPage }) {
  const [formData, setFormData] = useState({
    fullName: '', personalNumber: '', designation: '', department: '',
    mobileNumber: '', complaintDetails: '', canteen: 'Plant Canteen',
    imageUrl: '', videoUrl: ''
  });
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, imageUrl: await handleFileUpload(file) }));
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, videoUrl: await handleFileUpload(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post(`${API_URL}/complaints`, formData);
      setMessage('✅ Complaint submitted successfully! Thank you for reporting.');
      setFormData({
        fullName: '', personalNumber: '', designation: '', department: '',
        mobileNumber: '', complaintDetails: '', canteen: 'Plant Canteen',
        imageUrl: '', videoUrl: ''
      });
      setTimeout(() => setCurrentPage('home'), 2000);
    } catch (error) {
      setMessage('❌ Error submitting complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-page">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <div className="logo">🏭</div>
            <h1>Plant Canteen</h1>
            <p>Complaint Management System</p>
          </div>
          <button onClick={() => setCurrentPage('home')} className="back-btn">← Back</button>
        </div>
      </header>

      <main className="complaint-content">
        <div className="form-container">
          <div className="form-header">
            <div className="header-icon">📝</div>
            <h2>Submit a Complaint</h2>
            <p>Fill out the form below to report an issue at the {formData.canteen}.</p>
          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <label htmlFor="fullName">Full Name *</label>
              <input id="fullName" type="text" name="fullName" placeholder="Enter your name"
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

// ==================== ADMIN LOGIN ====================
// Three modes: 'login' | 'forgot-request' | 'forgot-verify'

function AdminLogin({ onAuthenticate, setCurrentPage }) {
  const [mode, setMode]         = useState('login');

  // login mode
  const [pin, setPin]           = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // forgot — step 1: request OTP
  const [otpSending, setOtpSending]   = useState(false);
  const [otpSent, setOtpSent]         = useState(false);
  const [otpError, setOtpError]       = useState('');

  // forgot — step 2: verify OTP + new PIN
  const [otp, setOtp]           = useState('');
  const [newPin, setNewPin]     = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [resetError, setResetError]   = useState('');

  // ── Login submit ──────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await axios.post(`${API_URL}/admin/verify-pin`, { pin });
      if (res.data.success) {
        localStorage.setItem('adminPin', pin);
        onAuthenticate();
      }
    } catch {
      setLoginError('❌ Invalid PIN. Please try again.');
      setPin('');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Request OTP ───────────────────────────────────────────
  const handleRequestOtp = async () => {
    setOtpError('');
    setOtpSending(true);
    try {
      await axios.post(`${API_URL}/admin/forgot-pin`);
      setOtpSent(true);
      setMode('forgot-verify');
    } catch (err) {
      setOtpError(
        err.response?.data?.error ||
        '❌ Failed to send code. Check email settings in Netlify env vars.'
      );
    } finally {
      setOtpSending(false);
    }
  };

  // ── Reset PIN ─────────────────────────────────────────────
  const handleResetPin = async (e) => {
    e.preventDefault();
    setResetError('');
    if (newPin !== confirmPin) {
      setResetError('❌ PINs do not match.');
      return;
    }
    if (newPin.length < 4) {
      setResetError('❌ PIN must be at least 4 digits.');
      return;
    }
    setResetLoading(true);
    try {
      const res = await axios.post(`${API_URL}/admin/reset-pin`, { otp, newPin });
      if (res.data.success) {
        setResetMsg('✅ PIN updated successfully! You can now login with your new PIN.');
        setTimeout(() => {
          setMode('login');
          setOtp(''); setNewPin(''); setConfirmPin('');
          setResetMsg(''); setOtpSent(false);
        }, 2500);
      }
    } catch (err) {
      setResetError(err.response?.data?.error || '❌ Invalid or expired code. Try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // ── Back to login ─────────────────────────────────────────
  const backToLogin = () => {
    setMode('login');
    setPin(''); setLoginError('');
    setOtp(''); setNewPin(''); setConfirmPin('');
    setOtpSent(false); setOtpError(''); setResetError(''); setResetMsg('');
  };

  return (
    <div className="admin-login-page">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <div className="logo">🏭</div>
            <h1>Plant Canteen</h1>
            <p>Admin Portal</p>
          </div>
          <button onClick={() => setCurrentPage('home')} className="back-btn">← Home</button>
        </div>
      </header>

      <div className="login-container">
        <div className="login-card">

          {/* ═══ MODE: LOGIN ═══ */}
          {mode === 'login' && (
            <>
              <div className="login-icon">🔐</div>
              <h2>Admin Access</h2>
              <p>Enter your PIN to access the admin panel</p>

              {loginError && <div className="error-message">{loginError}</div>}

              <form onSubmit={handleLogin}>
                <input
                  type="password"
                  placeholder="Enter PIN"
                  maxLength="8"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
                <button type="submit" disabled={loginLoading || pin.length < 4}>
                  {loginLoading ? '⏳ Verifying...' : '🔓 Unlock'}
                </button>
              </form>

              <button
                className="forgot-pin-link"
                onClick={() => setMode('forgot-request')}
              >
                Forgot PIN?
              </button>
            </>
          )}

          {/* ═══ MODE: FORGOT — REQUEST OTP ═══ */}
          {mode === 'forgot-request' && (
            <>
              <div className="login-icon">📧</div>
              <h2>Reset PIN</h2>
              <p>
                A 6-digit verification code will be sent to:<br />
                <strong>sagarahmedwaseer4553@gmail.com</strong>
              </p>

              {otpError && <div className="error-message">{otpError}</div>}

              <button
                className="submit-btn"
                onClick={handleRequestOtp}
                disabled={otpSending}
                style={{ marginTop: '16px' }}
              >
                {otpSending ? '⏳ Sending...' : '📨 Send Verification Code'}
              </button>

              <button className="forgot-pin-link" onClick={backToLogin}>
                ← Back to Login
              </button>
            </>
          )}

          {/* ═══ MODE: FORGOT — VERIFY OTP + NEW PIN ═══ */}
          {mode === 'forgot-verify' && (
            <>
              <div className="login-icon">🔑</div>
              <h2>Enter Verification Code</h2>
              <p>
                Code sent to <strong>sagarahmedwaseer4553@gmail.com</strong><br />
                <small style={{ color: '#888' }}>Valid for 10 minutes. Check spam if not received.</small>
              </p>

              {resetError && <div className="error-message">{resetError}</div>}
              {resetMsg   && <div className="success-message">{resetMsg}</div>}

              <form onSubmit={handleResetPin}>
                <label style={{ fontSize: '13px', color: '#555', marginBottom: '4px', display: 'block' }}>
                  6-Digit Code from Email
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '22px' }}
                />

                <label style={{ fontSize: '13px', color: '#555', margin: '12px 0 4px', display: 'block' }}>
                  New PIN
                </label>
                <input
                  type="password"
                  placeholder="Enter new PIN (min 4 digits)"
                  maxLength="8"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  required
                />

                <label style={{ fontSize: '13px', color: '#555', margin: '12px 0 4px', display: 'block' }}>
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  placeholder="Confirm new PIN"
                  maxLength="8"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  required
                />

                <button
                  type="submit"
                  disabled={resetLoading || otp.length !== 6 || newPin.length < 4 || confirmPin.length < 4}
                  style={{ marginTop: '16px' }}
                >
                  {resetLoading ? '⏳ Updating...' : '✅ Update PIN'}
                </button>
              </form>

              <button
                className="forgot-pin-link"
                onClick={() => { setMode('forgot-request'); setOtp(''); setNewPin(''); setConfirmPin(''); setResetError(''); }}
              >
                ← Resend Code
              </button>
              <button className="forgot-pin-link" onClick={backToLogin} style={{ marginTop: '4px' }}>
                ← Back to Login
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN DASHBOARD ====================

function AdminDashboard({ setCurrentPage, setAdminAuthenticated }) {
  const [complaints, setComplaints]     = useState([]);
  const [stats, setStats]               = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter]             = useState('All');
  const [canteenFilter, setCanteenFilter] = useState('All');
  const [loading, setLoading]           = useState(true);
  const [adminPin]                      = useState(localStorage.getItem('adminPin'));
  const [emailConfig, setEmailConfig]   = useState({ recipients: [], enableNotifications: true });
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [newEmail, setNewEmail]         = useState('');

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const fetchData = async () => {
    try {
      const [complaintsRes, statsRes, emailRes] = await Promise.all([
        axios.get(`${API_URL}/complaints`,          { headers: { adminPin } }),
        axios.get(`${API_URL}/admin/stats`,          { headers: { adminPin } }),
        axios.get(`${API_URL}/admin/email-config`,   { headers: { adminPin } })
      ]);
      setComplaints(complaintsRes.data);
      setStats(statsRes.data);
      setEmailConfig(emailRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComplaint = async (id, updates) => {
    try {
      await axios.put(`${API_URL}/complaints/${id}`, updates, { headers: { adminPin } });
      fetchData();
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail || emailConfig.recipients.includes(newEmail)) return;
    const updated = { ...emailConfig, recipients: [...emailConfig.recipients, newEmail] };
    try {
      await axios.put(`${API_URL}/admin/email-config`, updated, { headers: { adminPin } });
      setEmailConfig(updated);
      setNewEmail('');
    } catch (error) {
      console.error('Error updating email config:', error);
    }
  };

  const handleRemoveEmail = async (email) => {
    const updated = { ...emailConfig, recipients: emailConfig.recipients.filter(e => e !== email) };
    try {
      await axios.put(`${API_URL}/admin/email-config`, updated, { headers: { adminPin } });
      setEmailConfig(updated);
    } catch (error) {
      console.error('Error updating email config:', error);
    }
  };

  const getFilteredComplaints = () => complaints.filter(c => {
    const statusMatch  = filter === 'All'        || c.status  === filter;
    const canteenMatch = canteenFilter === 'All' || c.canteen === canteenFilter;
    return statusMatch && canteenMatch;
  });

  const handleLogout = () => {
    localStorage.removeItem('adminPin');
    setAdminAuthenticated(false);
    setCurrentPage('home');
  };

  const generateReport = (complaint) => {
    const w = window.open('', '', 'height=500,width=800');
    w.document.write(`
      <html><head><title>Complaint Report</title>
      <style>
        body{font-family:Arial;margin:20px}
        h2{color:#2d7e5e}
        table{width:100%;border-collapse:collapse;margin:20px 0}
        th,td{border:1px solid #ddd;padding:10px;text-align:left}
        th{background:#2d7e5e;color:#fff}
      </style></head><body>
      <h2>Complaint Report</h2>
      <table>
        <tr><th>Field</th><th>Details</th></tr>
        <tr><td>Name</td><td>${complaint.fullName}</td></tr>
        <tr><td>P. No</td><td>${complaint.personalNumber}</td></tr>
        <tr><td>Designation</td><td>${complaint.designation}</td></tr>
        <tr><td>Department</td><td>${complaint.department}</td></tr>
        <tr><td>Mobile</td><td>${complaint.mobileNumber}</td></tr>
        <tr><td>Canteen</td><td>${complaint.canteen}</td></tr>
        <tr><td>Status</td><td>${complaint.status}</td></tr>
        <tr><td>Fine Amount</td><td>${complaint.fineAmount || 'N/A'}</td></tr>
        <tr><td>Investigation</td><td>${complaint.investigation || 'Pending'}</td></tr>
        <tr><td>Submitted</td><td>${new Date(complaint.submittedAt).toLocaleString()}</td></tr>
        <tr><td colspan="2"><strong>Complaint:</strong><br/>${complaint.complaintDetails}</td></tr>
      </table>
      <button onclick="window.print()">🖨️ Print</button>
      <button onclick="window.close()">Close</button>
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
            <h1>Admin Panel</h1>
            <p>FFC MM - Canteens Management</p>
          </div>
          <div className="navbar-buttons">
            <button onClick={() => setShowEmailConfig(!showEmailConfig)} className="config-btn">
              📧 Email Config
            </button>
            <button onClick={handleLogout} className="logout-btn">🔓 Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        {showEmailConfig && (
          <div className="email-config-panel">
            <h3>📧 Email Configuration</h3>
            <p>Add email addresses to receive complaint notifications</p>
            <div className="email-input-group">
              <input type="email" placeholder="admin@example.com"
                value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <button onClick={handleAddEmail}>Add Email</button>
            </div>
            <div className="email-list">
              <h4>Recipients ({emailConfig.recipients.length}):</h4>
              {emailConfig.recipients.length === 0 ? (
                <p>No emails configured</p>
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

        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <select value={canteenFilter} onChange={(e) => setCanteenFilter(e.target.value)}>
            <option value="All">All Canteens</option>
            <option value="Plant Canteen">Plant Canteen</option>
            <option value="Staff Hostel-II Canteen">Staff Hostel-II Canteen</option>
          </select>
        </div>

        <div className="complaints-table">
          <h3>Complaints ({getFilteredComplaints().length})</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th><th>P. No</th><th>Canteen</th>
                <th>Status</th><th>Fine</th><th>Submitted</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredComplaints().map(complaint => (
                <tr key={complaint._id}>
                  <td>{complaint.fullName}</td>
                  <td>{complaint.personalNumber}</td>
                  <td>{complaint.canteen}</td>
                  <td className={`status ${complaint.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {complaint.status}
                  </td>
                  <td>PKR {complaint.fineAmount || 0}</td>
                  <td>{new Date(complaint.submittedAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => setSelectedComplaint(complaint)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

// ==================== COMPLAINT DETAIL MODAL ====================

function ComplaintDetail({ complaint, onUpdate, onClose, onPrint }) {
  const [status, setStatus]             = useState(complaint.status);
  const [remarks, setRemarks]           = useState('');
  const [fineAmount, setFineAmount]     = useState(complaint.fineAmount || 0);
  const [investigation, setInvestigation] = useState(complaint.investigation || '');

  const handleSave = () => {
    onUpdate(complaint._id, {
      status,
      remarks: remarks || undefined,
      fineAmount: parseFloat(fineAmount),
      investigation
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
          <p><strong>Submitted:</strong> {new Date(complaint.submittedAt).toLocaleString()}</p>
        </div>

        <div className="detail-section">
          <h4>Admin Actions</h4>

          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <label>Fine Amount (PKR)</label>
          <input type="number" value={fineAmount}
            onChange={(e) => setFineAmount(e.target.value)} min="0" />

          <label>Investigation Details</label>
          <textarea value={investigation} onChange={(e) => setInvestigation(e.target.value)}
            placeholder="Enter investigation findings..." rows="3" />

          <label>Add Remark</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add a new remark..." rows="2" />

          {complaint.remarks && complaint.remarks.length > 0 && (
            <div className="remarks-list">
              <h5>Previous Remarks:</h5>
              {complaint.remarks.map((remark, idx) => (
                <p key={idx}>
                  <small>{new Date(remark.addedAt).toLocaleString()}</small><br />
                  {remark.text}
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

// App.jsx — FFC MM Canteens (Tabs: Complaint + Menu, Admin Menu Editor)
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const _base   = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_URL = _base + '/api';
const api = axios.create({ baseURL: API_URL });

// ── Default Menu Data ────────────────────────────────────
const DEFAULT_MENU = {
  'Plant Canteen': [
    { day:'Monday',    tag:'Start of Week',    meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Paratha','Egg','Aloo Bhujia','Milk','Tea']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Chicken Biryani','Mix Vegetables','Dal Lobia']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Mutton Qorma','Kale Chane','Zarda Rice']}]},
    { day:'Tuesday',   tag:'Mid-Week Treat',   meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Aloo Paratha','Paratha','Egg','Phane','Tea']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Chicken White Handi','Dal Mong','Aloo Gajar']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Chicken Pulao','Chicken Sabzi']}]},
    { day:'Wednesday', tag:'Hump Day Special', meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Paratha','Egg','Aloo Bhujia','Milk','Tea']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Dal Mong','White Rice','Mix Vegetables','Karhi Pakora']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Chicken Achari Gosht','Dal Chana','White Rice']}]},
    { day:'Thursday',  tag:'Almost Friday',    meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Aloo Paratha','Paratha','Egg','Phane','Tea']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Beef Nihari','Dal Chana','Vegetables']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Chicken Qorma','Dal Chana','Vegetables']}]},
    { day:'Friday',    tag:'Weekend Begins',   meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Aloo Paratha','Paratha','Egg','Tea']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Chicken Biryani','Aloo Chips','Dal Mong']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Beef Qorma','Dal Mash','Aloo Qeema']}]},
    { day:'Saturday',  tag:'Weekend Special',  meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Aloo Paratha','Paratha','Egg','Phane','Tea']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Mutton Kabab','Sabzi Pulao','Vegetables']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Chicken Pulao','Mutton Qorma','Dal']}]},
    { day:'Sunday',    tag:'Rest & Feast',     meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Paratha','Egg','Aloo Bhujia','Milk','Tea']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Mutton Kabab','Sabzi Pulao']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Mutton Qorma','Dal','Vegetables']}]},
  ],
  'Staff Hostel-II Canteen': [
    { day:'Monday',    tag:'Start of Week',    meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Paratha','Omelette','Chai']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Daal Chawal','Salad']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Chicken Karahi','Roti','Raita']}]},
    { day:'Tuesday',   tag:'Mid-Week Treat',   meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Halwa Puri','Aloo','Chai']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Chicken Pulao','Kachumber']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Beef Keema','Roti','Dal']}]},
    { day:'Wednesday', tag:'Hump Day Special', meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Paratha','Egg','Milk','Tea']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Biryani','Raita','Salad']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Aloo Gosht','Roti','Dal Mash']}]},
    { day:'Thursday',  tag:'Almost Friday',    meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Aloo Paratha','Lassi']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Daal Makhni','Chawal','Roti']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Mutton Paya','Naan','Salad']}]},
    { day:'Friday',    tag:'Juma Special',     meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Paratha','Egg','Chai']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Pulao','Chicken Qorma','Raita']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Beef Handi','Roti','Salad']}]},
    { day:'Saturday',  tag:'Weekend Special',  meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Puri','Halwa','Chai']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Chicken Biryani','Salad']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Daal Gosht','Roti','Chawal']}]},
    { day:'Sunday',    tag:'Rest & Feast',     meals:[{label:'Breakfast',time:'7:00–9:00 AM',icon:'🍳',items:['Nihari','Naan','Chai']},{label:'Lunch',time:'12:30–2:30 PM',icon:'🍛',items:['Mix Pulao','Raita']},{label:'Dinner',time:'7:00–9:00 PM',icon:'🍲',items:['Chicken Handi','Roti','Dal']}]},
  ],
  'Cafeteria Canteen': [
    { day:'Monday',    tag:'Start of Week',    meals:[{label:'Breakfast',time:'8:00–10:00 AM',icon:'☕',items:['Sandwich','Juice','Tea/Coffee']},{label:'Lunch',time:'1:00–3:00 PM',icon:'🥗',items:['Pasta','Salad','Bread']},{label:'Snacks',time:'4:00–5:00 PM',icon:'🍪',items:['Samosa','Pakora','Chai']}]},
    { day:'Tuesday',   tag:'Mid-Week Treat',   meals:[{label:'Breakfast',time:'8:00–10:00 AM',icon:'☕',items:['Club Sandwich','Milk','Tea']},{label:'Lunch',time:'1:00–3:00 PM',icon:'🥗',items:['Fried Rice','Spring Rolls','Soup']},{label:'Snacks',time:'4:00–5:00 PM',icon:'🍪',items:['Cake Slice','Biscuits','Coffee']}]},
    { day:'Wednesday', tag:'Hump Day Special', meals:[{label:'Breakfast',time:'8:00–10:00 AM',icon:'☕',items:['Egg Toast','Juice','Tea']},{label:'Lunch',time:'1:00–3:00 PM',icon:'🥗',items:['Burger','Fries','Cold Drink']},{label:'Snacks',time:'4:00–5:00 PM',icon:'🍪',items:['Patties','Tea','Fruit']}]},
    { day:'Thursday',  tag:'Almost Friday',    meals:[{label:'Breakfast',time:'8:00–10:00 AM',icon:'☕',items:['Paratha Roll','Lassi']},{label:'Lunch',time:'1:00–3:00 PM',icon:'🥗',items:['Chicken Sandwich','Salad','Juice']},{label:'Snacks',time:'4:00–5:00 PM',icon:'🍪',items:['Donut','Coffee','Fruit']}]},
    { day:'Friday',    tag:'TGIF Special',     meals:[{label:'Breakfast',time:'8:00–10:00 AM',icon:'☕',items:['French Toast','Juice','Tea']},{label:'Lunch',time:'1:00–3:00 PM',icon:'🥗',items:['Pizza Slice','Salad','Cold Drink']},{label:'Snacks',time:'4:00–5:00 PM',icon:'🍪',items:['Cake','Tea','Biscuits']}]},
    { day:'Saturday',  tag:'Weekend Vibes',    meals:[{label:'Breakfast',time:'8:00–10:00 AM',icon:'☕',items:['Waffle','Juice','Coffee']},{label:'Lunch',time:'1:00–3:00 PM',icon:'🥗',items:['Grilled Chicken','Fries','Salad']},{label:'Snacks',time:'4:00–5:00 PM',icon:'🍪',items:['Brownie','Tea']}]},
    { day:'Sunday',    tag:'Rest & Relax',     meals:[{label:'Breakfast',time:'8:00–10:00 AM',icon:'☕',items:['Pancakes','Juice','Tea']},{label:'Lunch',time:'1:00–3:00 PM',icon:'🥗',items:['BBQ Platter','Garlic Bread','Soup']},{label:'Snacks',time:'4:00–5:00 PM',icon:'🍪',items:['Muffin','Coffee']}]},
  ],
};

const DEFAULT_CONTACTS = {
  'Plant Canteen':           [['Ahmad Naveed','03461113920'],['Ahmad Maqsood','03044467651'],['Iqbal Naeem','Committee']],
  'Staff Hostel-II Canteen': [['Ahmad Naveed','03461113920'],['Ahmad Maqsood','03044467651'],['Iqbal Naeem','Committee']],
  'Cafeteria Canteen':       [['Ahmad Naveed','03461113920'],['Ahmad Maqsood','03044467651'],['Iqbal Naeem','Committee']],
};
const MEAL_COLORS = {
  Breakfast: { bg:'#fff8e8', border:'#f0c040', icon:'#e8a000', label:'#b07800', dot:'#f0c040' },
  Lunch:     { bg:'#eaf6ff', border:'#60b8f0', icon:'#1a7ab8', label:'#0a5a90', dot:'#60b8f0' },
  Dinner:    { bg:'#fff0f0', border:'#f08080', icon:'#c03030', label:'#901818', dot:'#f08080' },
  Snacks:    { bg:'#f0fff4', border:'#60d090', icon:'#1a9050', label:'#0a6830', dot:'#60d090' },
};
const DEFAULT_COLOR = { bg:'#f8f8f8', border:'#ccc', icon:'#666', label:'#444', dot:'#999' };

export default function App() {
  const [page,       setPage]       = useState('home');
  const [auth,       setAuth]       = useState(false);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [loggedUser, setLoggedUser] = useState('');
  const [loggedPin,  setLoggedPin]  = useState('');
  const [menuData, setMenuData] = useState(() => {
    try {
      const saved = localStorage.getItem('ffcmm_menu');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return DEFAULT_MENU;
  });

  const [contactData, setContactData] = useState(() => {
    try {
      const saved = localStorage.getItem('ffcmm_contacts');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return DEFAULT_CONTACTS;
  });

  const saveMenu = (newMenu) => {
    setMenuData(newMenu);
    try { localStorage.setItem('ffcmm_menu', JSON.stringify(newMenu)); } catch(e) {}
  };

  const saveContacts = (newContacts) => {
    setContactData(newContacts);
    try { localStorage.setItem('ffcmm_contacts', JSON.stringify(newContacts)); } catch(e) {}
  };

  return (
    <div className="app">
      {page === 'complaint' && (
        <ComplaintForm setPage={setPage} />
      )}
      {page === 'home' && (
        <HomePage setPage={setPage} menuData={menuData} contactData={contactData} />
      )}
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
          menuData={menuData}
          saveMenu={saveMenu}
          contactData={contactData}
          saveContacts={saveContacts}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// HOME PAGE — with tabs
// ══════════════════════════════════════════════════════
function HomePage({ setPage, menuData, contactData }) {
  const [tab, setTab] = useState('complaint');

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

      {/* Tab switcher */}
      <div className="tab-bar">
        <button
          className={`tab-btn${tab === 'complaint' ? ' active' : ''}`}
          onClick={() => setTab('complaint')}
        >
          📋 Submit Complaint
        </button>
        <button
          className={`tab-btn${tab === 'menu' ? ' active' : ''}`}
          onClick={() => setTab('menu')}
        >
          🍽️ Weekly Menu
        </button>
      </div>

      {tab === 'complaint' && <ComplaintTab setPage={setPage} />}
      {tab === 'menu'      && <MenuTab menuData={menuData} contactData={contactData} />}

      <footer><p>FFC MM — Canteen Complaint Management System © 2026</p></footer>
    </div>
  );
}

// ── Complaint Tab ────────────────────────────────────────
function ComplaintTab({ setPage }) {
  const [showTracker, setShowTracker] = useState(false);
  const [complaints,  setComplaints]  = useState([]);
  const [tLoading,    setTLoading]    = useState(false);
  const [tError,      setTError]      = useState('');

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
    <main className="home-content">
      <section className="hero">
        <h2>Welcome to <span>FFC MM Canteens</span></h2>
        <p>Report issues quickly and efficiently. Your feedback drives improvement.</p>
      </section>

      <div className="options-grid">
        {['Plant Canteen','Staff Hostel-II Canteen','Cafeteria Canteen'].map((name, i) => (
          <div className="canteen-card" key={name}>
            <div className="icon">{['🍴','🏢','☕'][i]}</div>
            <h3>{name}</h3>
            <p>{['Main facility canteen — report food quality, hygiene or service issues',
                  'Hostel facility canteen — report any concerns quickly',
                  'Office cafeteria — report any service or food issues'][i]}</p>
            <button onClick={() => setPage('complaint')}>Report Issue →</button>
          </div>
        ))}
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
              <div className="tracker-empty" style={{ color:'var(--danger)' }}>{tError}</div>
            ) : complaints.length === 0 ? (
              <div className="tracker-empty">No complaints submitted yet.</div>
            ) : (
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {complaints.map(c => <TrackerItem key={c._id} c={c} />)}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
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
          {c.remarks && c.remarks.length > 0 && (
            <span> | 💬 {c.remarks[c.remarks.length - 1].text}</span>
          )}
        </div>
      )}
      <div className="tracker-item-footer">
        <span className="tracker-item-date">{new Date(c.submittedAt).toLocaleDateString('en-GB')}</span>
        <span className={`badge-status ${c.status.replace(/\s+/g,'-').toLowerCase()}`}>{c.status}</span>
      </div>
    </li>
  );
}

// ── Menu Tab ─────────────────────────────────────────────
const CANTEENS = ['Plant Canteen','Staff Hostel-II Canteen','Cafeteria Canteen'];
const CANTEEN_THEMES = {
  'Plant Canteen':           { accent:'#c8960a', light:'#fff8e8', badge:'🍴', gradient:'linear-gradient(135deg,#fff8e8,#fdf3d0)' },
  'Staff Hostel-II Canteen': { accent:'#1a7ab8', light:'#eaf6ff', badge:'🏢', gradient:'linear-gradient(135deg,#eaf6ff,#d0ecff)' },
  'Cafeteria Canteen':       { accent:'#2a9d5c', light:'#edfff5', badge:'☕', gradient:'linear-gradient(135deg,#edfff5,#c8f5e0)' },
};
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function MenuTab({ menuData, contactData }) {
  const [selectedCanteen, setSelectedCanteen] = useState('Plant Canteen');
  const [activeDay,       setActiveDay]       = useState(0);
  const theme    = CANTEEN_THEMES[selectedCanteen];
  const dayMenu  = (menuData[selectedCanteen] || DEFAULT_MENU['Plant Canteen'])[activeDay];
  const contacts = (contactData && contactData[selectedCanteen]) || DEFAULT_CONTACTS[selectedCanteen];

  return (
    <div className="menu-tab">
      {/* Canteen selector */}
      <div className="menu-canteen-bar">
        {CANTEENS.map(c => {
          const t = CANTEEN_THEMES[c];
          return (
            <button
              key={c}
              className={`menu-canteen-btn${selectedCanteen===c?' active':''}`}
              style={selectedCanteen===c ? { background:t.accent, color:'#fff', borderColor:t.accent } : {}}
              onClick={() => { setSelectedCanteen(c); setActiveDay(0); }}
            >
              {t.badge} {c}
            </button>
          );
        })}
      </div>

      {/* Hero banner */}
      <div className="menu-hero" style={{ background: theme.gradient, borderColor: theme.accent + '40' }}>
        <div className="menu-hero-badge" style={{ background: theme.accent }}>{theme.badge} Weekly Menu 2026</div>
        <h2 className="menu-hero-title" style={{ color: theme.accent }}>{selectedCanteen}</h2>
        <p className="menu-hero-sub">Fresh Meals · Every Day · Prepared with Care</p>
      </div>

      {/* Day navigation pills */}
      <div className="menu-day-nav">
        {DAYS.map((d, i) => (
          <button
            key={d}
            className={`menu-day-btn${activeDay===i?' active':''}`}
            style={activeDay===i ? { background:theme.accent, borderColor:theme.accent, color:'#fff' } : { borderColor: theme.accent + '50', color: theme.accent }}
            onClick={() => setActiveDay(i)}
          >
            <span className="menu-day-short">{d.slice(0,3)}</span>
            <span className="menu-day-full">{d}</span>
          </button>
        ))}
      </div>

      {/* Day header */}
      <div className="menu-day-header">
        <span className="menu-day-name" style={{ color: theme.accent }}>{dayMenu?.day || DAYS[activeDay]}</span>
        <span className="menu-day-tag" style={{ borderColor: theme.accent + '50', color: theme.accent }}>{dayMenu?.tag || ''}</span>
      </div>

      {/* Meal cards */}
      <div className="menu-meals-grid">
        {(dayMenu?.meals || []).map((meal, i) => {
          const col = MEAL_COLORS[meal.label] || DEFAULT_COLOR;
          return (
            <div
              key={i}
              className="menu-meal-card"
              style={{ background: col.bg, borderColor: col.border, animationDelay: `${i * 0.08}s` }}
            >
              <div className="menu-meal-top" style={{ borderBottomColor: col.border + '60' }}>
                <span className="menu-meal-icon" style={{ fontSize:32 }}>{meal.icon}</span>
                <div>
                  <div className="menu-meal-label" style={{ color: col.label }}>{meal.label}</div>
                  <div className="menu-meal-time" style={{ color: col.icon + 'aa' }}>{meal.time}</div>
                </div>
              </div>
              <div className="menu-meal-items">
                {meal.items.map((item, j) => (
                  <div key={j} className="menu-meal-item">
                    <div className="menu-meal-dot" style={{ background: col.dot }}></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact strip */}
      <div className="menu-footer" style={{ background: theme.light, borderColor: theme.accent + '30' }}>
        <p style={{ color:'#666', fontSize:13 }}>Menu prepared by the Canteen Committee. For changes or suggestions, contact:</p>
        <div className="menu-contacts">
          {contacts.map(([name,num], idx)=>(
            <div key={idx} className="menu-contact-chip" style={{ borderColor: theme.accent + '40', color: theme.accent }}>
              <span style={{ color:'#888', fontSize:11, display:'block' }}>{name}</span>
              {num}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// COMPLAINT FORM PAGE
// ══════════════════════════════════════════════════════
function ComplaintForm({ setPage }) {
  const [form, setForm] = useState({
    fullName:'', personalNumber:'', designation:'', department:'',
    mobileNumber:'', complaintDetails:'', canteen:'Plant Canteen', imageUrl:''
  });
  const [loading,    setLoading]    = useState(false);
  const [message,    setMessage]    = useState('');
  const [imgError,   setImgError]   = useState('');
  const [imgPreview, setImgPreview] = useState('');

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
  const toB64 = f => new Promise((res,rej) => { const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=()=>rej(new Error('Read failed')); r.readAsDataURL(f); });

  const onImage = async e => {
    const f = e.target.files[0]; if (!f) return;
    setImgError('');
    if (f.size > MAX_IMAGE_BYTES) { setImgError('❌ Image too large. Maximum 2 MB.'); e.target.value=''; setForm(p=>({...p,imageUrl:''})); setImgPreview(''); return; }
    try { const b=await toB64(f); setForm(p=>({...p,imageUrl:b})); setImgPreview(b); } catch(err){}
  };

  const onSubmit = async e => {
    e.preventDefault(); if (imgError) return;
    setLoading(true); setMessage('');
    try {
      await api.post('/complaints', form);
      setMessage('✅ Complaint submitted successfully! Thank you for reporting.');
      setForm({ fullName:'', personalNumber:'', designation:'', department:'', mobileNumber:'', complaintDetails:'', canteen:'Plant Canteen', imageUrl:'' });
      setImgPreview('');
      setTimeout(() => setPage('home'), 2500);
    } catch(err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Submission failed. Please try again.'));
    } finally { setLoading(false); }
  };

  return (
    <div className="complaint-page">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <div className="logo">🏭</div>
            <div><h1>Canteen Complaint Management System</h1><p>FFC MM — Submit Complaint</p></div>
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
          {message && <div className={`message ${message.includes('✅')?'success':'error'}`} style={{margin:'16px 40px 0'}}>{message}</div>}
          <form onSubmit={onSubmit}>
            <div className="form-section"><label>Full Name *</label><input type="text" name="fullName" placeholder="Enter your full name" value={form.fullName} onChange={onChange} required /></div>
            <div className="form-row">
              <div className="form-section"><label>Personal Number (P. No) *</label><input type="text" name="personalNumber" placeholder="e.g. P-12345" value={form.personalNumber} onChange={onChange} required /></div>
              <div className="form-section"><label>Mobile Number *</label><input type="tel" name="mobileNumber" placeholder="e.g. 03001234567" value={form.mobileNumber} onChange={onChange} required /></div>
            </div>
            <div className="form-row">
              <div className="form-section"><label>Designation *</label><input type="text" name="designation" placeholder="e.g. Engineer, Operator" value={form.designation} onChange={onChange} required /></div>
              <div className="form-section"><label>Department / Unit *</label><input type="text" name="department" placeholder="Enter your department" value={form.department} onChange={onChange} required /></div>
            </div>
            <div className="form-section">
              <label>Canteen *</label>
              <select name="canteen" value={form.canteen} onChange={onChange} required>
                <option value="Plant Canteen">Plant Canteen</option>
                <option value="Staff Hostel-II Canteen">Staff Hostel-II Canteen</option>
                <option value="Cafeteria Canteen">Cafeteria Canteen</option>
              </select>
            </div>
            <div className="form-section"><label>Complaint Details *</label><textarea name="complaintDetails" placeholder="Describe the issue in detail..." value={form.complaintDetails} onChange={onChange} rows="5" required /></div>
            <div className="form-section">
              <label>Upload Picture (Optional — max 2 MB)</label>
              <input type="file" accept="image/*" onChange={onImage} />
              {imgError && <div style={{color:'var(--danger)',fontSize:13,marginTop:5,fontWeight:700}}>{imgError}</div>}
              {imgPreview && !imgError && (
                <div style={{marginTop:8}}>
                  <img src={imgPreview} alt="Preview" style={{maxWidth:'100%',maxHeight:180,borderRadius:8,border:'1.5px solid var(--border)',objectFit:'contain'}} />
                  <div style={{fontSize:12,color:'var(--success)',marginTop:4}}>✅ Image ready to submit</div>
                </div>
              )}
            </div>
            <button type="submit" className="submit-btn" disabled={loading || !!imgError}>
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
  const [mode,      setMode]      = useState('login');
  const [username,  setUsername]  = useState('');
  const [pin,       setPin]       = useState('');
  const [loginErr,  setLoginErr]  = useState('');
  const [loginLoad, setLoginLoad] = useState(false);
  const [otpSending,setOtpSending]= useState(false);
  const [otpErr,    setOtpErr]    = useState('');
  const [otp,       setOtp]       = useState('');
  const [newPin,    setNewPin]    = useState('');
  const [confPin,   setConfPin]   = useState('');
  const [resetLoad, setResetLoad] = useState(false);
  const [resetMsg,  setResetMsg]  = useState('');
  const [resetErr,  setResetErr]  = useState('');

  const doLogin = async e => {
    e.preventDefault(); setLoginErr(''); setLoginLoad(true);
    const u=username.trim(), p=pin.trim();
    if(!u){setLoginErr('❌ Enter your username.');setLoginLoad(false);return;}
    if(p.length<4){setLoginErr('❌ PIN must be at least 4 digits.');setLoginLoad(false);return;}
    try {
      const res = await api.post('/admin/verify-pin',{username:u,pin:p});
      if(res.data.success) onAuth(u,p,res.data.isSuperAdmin===true);
      else { setLoginErr('❌ Invalid username or PIN.'); setPin(''); }
    } catch(err) { setLoginErr('❌ '+(err.response?.data?.error||'Login failed.')); setPin(''); }
    finally { setLoginLoad(false); }
  };

  const sendOtp = async () => {
    setOtpErr(''); setOtpSending(true);
    try { await api.post('/admin/forgot-pin'); setMode('forgot-verify'); }
    catch(err) { setOtpErr(err.response?.data?.error||'❌ Failed to send code.'); }
    finally { setOtpSending(false); }
  };

  const doReset = async e => {
    e.preventDefault(); setResetErr('');
    if(newPin!==confPin){setResetErr('❌ PINs do not match.');return;}
    if(newPin.length<4){setResetErr('❌ PIN must be 4+ digits.');return;}
    setResetLoad(true);
    try {
      const res=await api.post('/admin/reset-pin',{otp,newPin});
      if(res.data.success){setResetMsg('✅ PIN updated!');setTimeout(()=>{setMode('login');setOtp('');setNewPin('');setConfPin('');setResetMsg('');},2500);}
    } catch(err){setResetErr(err.response?.data?.error||'❌ Invalid or expired code.');}
    finally{setResetLoad(false);}
  };

  const back = () => { setMode('login');setPin('');setLoginErr('');setOtp('');setNewPin('');setConfPin('');setOtpErr('');setResetErr('');setResetMsg(''); };

  return (
    <div className="admin-login-page">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section"><div className="logo">🏭</div><div><h1>Canteen Complaint Management System</h1><p>FFC MM — Admin Portal</p></div></div>
          <button onClick={() => setPage('home')} className="back-btn">← Home</button>
        </div>
      </header>
      <div className="login-container">
        <div className="login-card">
          {mode==='login' && (
            <>
              <div className="login-icon">🔐</div>
              <h2>Admin Access</h2>
              <p>Enter your username and PIN</p>
              {loginErr && <div className="error-message">{loginErr}</div>}
              <form onSubmit={doLogin}>
                <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required autoFocus autoComplete="username" style={{textAlign:'left',letterSpacing:'normal',fontSize:'15px',padding:'13px 16px',fontFamily:'var(--ff-body)'}} />
                <input type="password" placeholder="PIN (digits only)" maxLength="8" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} required autoComplete="current-password" />
                <button type="submit" disabled={loginLoad||pin.length<4||!username.trim()}>{loginLoad?'⏳ Verifying...':'🔓 Unlock'}</button>
              </form>
              <button className="forgot-pin-link" onClick={()=>setMode('forgot-request')}>Forgot PIN?</button>
            </>
          )}
          {mode==='forgot-request' && (
            <>
              <div className="login-icon">📧</div>
              <h2>Reset PIN</h2>
              <p>A 6-digit code will be sent to:<br/><strong>sagarahmedwaseer4553@gmail.com</strong></p>
              {otpErr && <div className="error-message">{otpErr}</div>}
              <button className="submit-btn" onClick={sendOtp} disabled={otpSending} style={{marginTop:16}}>{otpSending?'⏳ Sending...':'📨 Send Verification Code'}</button>
              <button className="forgot-pin-link" onClick={back}>← Back to Login</button>
            </>
          )}
          {mode==='forgot-verify' && (
            <>
              <div className="login-icon">🔑</div>
              <h2>Verify & Reset</h2>
              <p>Code sent to <strong>sagarahmedwaseer4553@gmail.com</strong></p>
              {resetErr && <div className="error-message">{resetErr}</div>}
              {resetMsg  && <div className="success-message">{resetMsg}</div>}
              <form onSubmit={doReset}>
                <input type="text" placeholder="6-digit code" maxLength="6" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} required autoFocus style={{letterSpacing:8,textAlign:'center',fontSize:22}} />
                <input type="password" placeholder="New PIN (min 4 digits)" maxLength="8" value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,''))} required />
                <input type="password" placeholder="Confirm new PIN" maxLength="8" value={confPin} onChange={e=>setConfPin(e.target.value.replace(/\D/g,''))} required />
                <button type="submit" style={{marginTop:14}} disabled={resetLoad||otp.length!==6||newPin.length<4||confPin.length<4}>{resetLoad?'⏳ Updating...':'✅ Update PIN'}</button>
              </form>
              <button className="forgot-pin-link" onClick={back} style={{marginTop:4}}>← Back to Login</button>
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
function AdminDashboard({ setPage, setAuth, superAdmin, loggedUser, adminPin, menuData, saveMenu, contactData, saveContacts }) {
  const [complaints,    setComplaints]    = useState([]);
  const [stats,         setStats]         = useState(null);
  const [selected,      setSelected]      = useState(null);
  const [filter,        setFilter]        = useState('All');
  const [canteenFilter, setCanteenFilter] = useState('All');
  const [loading,       setLoading]       = useState(true);
  const [emailCfg,      setEmailCfg]      = useState({ recipients:[], enableNotifications:true });
  const [showEmail,     setShowEmail]     = useState(false);
  const [showUsers,     setShowUsers]     = useState(false);
  const [showMenuEdit,  setShowMenuEdit]  = useState(false);
  const [newEmail,      setNewEmail]      = useState('');
  const [fetchErr,      setFetchErr]      = useState('');
  const [subUsers,      setSubUsers]      = useState([]);
  const [newUsr,        setNewUsr]        = useState('');
  const [newUPin,       setNewUPin]       = useState('');
  const [otpStep,       setOtpStep]       = useState(false);
  const [pendingAct,    setPendingAct]    = useState(null);
  const [vOtp,          setVOtp]          = useState('');
  const [otpSend,       setOtpSend]       = useState(false);
  const [userMsg,       setUserMsg]       = useState('');
  const [userErr,       setUserErr]       = useState('');

  const H = { adminpin: adminPin };

  const fetchAll = useCallback(async () => {
    setFetchErr('');
    try {
      const [cR,sR,eR] = await Promise.all([
        api.get('/complaints',        {headers:H}),
        api.get('/admin/stats',       {headers:H}),
        api.get('/admin/email-config',{headers:H}),
      ]);
      setComplaints(Array.isArray(cR.data)?cR.data:[]);
      setStats(sR.data);
      setEmailCfg(eR.data);
    } catch(e) {
      const s=e.response?.status, m=e.response?.data?.error||e.message;
      if(s===401) setFetchErr('❌ Auth failed (401). Logout and login again.');
      else setFetchErr(`Failed to load (${s||'network'}): ${m}`);
    } finally { setLoading(false); }
  }, [adminPin]); // eslint-disable-line

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const loadUsers = async () => {
    try {
      const r = await api.get(`/admin/users?username=${encodeURIComponent(loggedUser)}&pin=${encodeURIComponent(adminPin)}`);
      setSubUsers(Array.isArray(r.data)?r.data:[]);
    } catch(e) { console.error(e.response?.data); }
  };

  const updateComplaint = async (id, updates) => {
    try { await api.put(`/complaints/${id}`,updates,{headers:H}); await fetchAll(); setSelected(null); }
    catch(e) { alert('Update failed: '+(e.response?.data?.error||e.message)); }
  };

  const deleteComplaint = async id => {
    if(!window.confirm('Delete this complaint permanently?')) return;
    try { await api.delete(`/complaints/${id}`,{headers:H}); await fetchAll(); }
    catch(e) { alert('Delete failed: '+(e.response?.data?.error||e.message)); }
  };

  const addEmail = async () => {
    if(!newEmail||emailCfg.recipients.includes(newEmail)) return;
    const u={...emailCfg,recipients:[...emailCfg.recipients,newEmail]};
    try { await api.put('/admin/email-config',u,{headers:H}); setEmailCfg(u); setNewEmail(''); } catch(e){}
  };

  const removeEmail = async em => {
    const u={...emailCfg,recipients:emailCfg.recipients.filter(x=>x!==em)};
    try { await api.put('/admin/email-config',u,{headers:H}); setEmailCfg(u); } catch(e){}
  };

  const startAction = async act => {
    setUserErr(''); setOtpSend(true);
    try { await api.post('/admin/forgot-pin'); setPendingAct(act); setOtpStep(true); }
    catch(e) { setUserErr('Failed to send code: '+(e.response?.data?.error||e.message)); }
    finally { setOtpSend(false); }
  };

  const confirmAction = async () => {
    if(vOtp.length!==6){setUserErr('Enter valid 6-digit code');return;} setUserErr('');
    try {
      await api.post('/admin/verify-otp',{otp:vOtp});
      if(pendingAct.type==='add'){
        await api.post('/admin/users',{username:loggedUser,pin:adminPin,newUsername:pendingAct.newUsername,newPin:pendingAct.newPin});
        setUserMsg(`✅ User "${pendingAct.newUsername}" added!`); setNewUsr(''); setNewUPin('');
      } else {
        await api.delete(`/admin/users/${pendingAct.target}`,{data:{username:loggedUser,pin:adminPin}});
        setUserMsg(`✅ User "${pendingAct.target}" removed.`);
      }
      await loadUsers(); setOtpStep(false); setPendingAct(null); setVOtp('');
      setTimeout(()=>setUserMsg(''),4000);
    } catch(e){setUserErr(e.response?.data?.error||'Invalid or expired code');}
  };

  const logout = () => { setAuth(false); setPage('home'); };

  const filtered = complaints.filter(c =>
    (filter==='All'||c.status===filter) && (canteenFilter==='All'||c.canteen===canteenFilter)
  );

  const printReport = c => {
    const w=window.open('','','height=650,width=860');
    w.document.write(`<!DOCTYPE html><html><head><title>Complaint Report</title><style>body{font-family:Arial,sans-serif;margin:36px;color:#1a1008}h2{color:#a83030;margin-bottom:4px;font-size:22px}.sub{color:#9a7a60;font-size:13px;margin-bottom:22px}table{width:100%;border-collapse:collapse;margin:18px 0}th,td{border:1px solid #ddd;padding:10px 13px;text-align:left;font-size:13px}th{background:#a83030;color:#fff;font-weight:700}tr:nth-child(even){background:#fdf8f3}.box{background:#fdf3dc;border:1px solid #c8960a;border-radius:6px;padding:14px 16px;margin:14px 0}.box h4{color:#a87c08;margin:0 0 8px;font-size:13px;text-transform:uppercase}.sig{margin-top:50px;display:flex;justify-content:flex-end}.sig-b{text-align:center;width:260px}.sig-l{border-top:1.5px solid #1a1008;padding-top:8px;font-size:13px;font-weight:700}.sig-t{font-size:12px;color:#5a3e2b;margin-top:4px}@media print{.np{display:none}}</style></head><body>
    <h2>🏭 FFC MM Canteens — Complaint Report</h2><div class="sub">Generated: ${new Date().toLocaleString('en-GB')}</div>
    <table><tr><th>Field</th><th>Details</th></tr><tr><td><b>Full Name</b></td><td>${c.fullName}</td></tr><tr><td><b>P. No</b></td><td>${c.personalNumber}</td></tr><tr><td><b>Designation</b></td><td>${c.designation}</td></tr><tr><td><b>Department</b></td><td>${c.department}</td></tr><tr><td><b>Mobile</b></td><td>${c.mobileNumber}</td></tr><tr><td><b>Canteen</b></td><td>${c.canteen}</td></tr><tr><td><b>Status</b></td><td>${c.status}</td></tr><tr><td><b>Fine Amount</b></td><td>${c.fineAmount>0?'PKR '+c.fineAmount:'N/A'}</td></tr><tr><td><b>Submitted</b></td><td>${new Date(c.submittedAt).toLocaleString('en-GB')}</td></tr><tr><td colspan="2"><b>Complaint Details:</b><br/><br/>${c.complaintDetails.replace(/\n/g,'<br/>')}</td></tr></table>
    ${c.investigation?`<div class="box"><h4>🔍 Investigation</h4><p>${c.investigation}</p></div>`:''}
    ${c.remarks&&c.remarks.length>0?`<div class="box"><h4>💬 Remarks</h4>${c.remarks.map(r=>`<p>• ${r.text} <em style="color:#9a7a60;font-size:12px">(${new Date(r.addedAt).toLocaleString('en-GB')})</em></p>`).join('')}</div>`:''}
    <div class="sig"><div class="sig-b"><div style="height:50px"></div><div class="sig-l">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div><div class="sig-t">Chairman Canteen Committee</div></div></div>
    <div class="np" style="margin-top:24px"><button onclick="window.print()" style="background:#a83030;color:#fff;border:none;padding:10px 22px;border-radius:6px;cursor:pointer;font-size:14px">🖨️ Print</button><button onclick="window.close()" style="background:#f0ede8;color:#1a1008;border:1px solid #ddd;padding:10px 22px;border-radius:6px;cursor:pointer;font-size:14px;margin-left:8px">Close</button></div></body></html>`);
    w.document.close();
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <div className="logo">⚙️</div>
            <div><h1>Admin — {superAdmin?'Kingsman (Super Admin)':loggedUser}</h1><p>FFC MM — Canteens Management</p></div>
          </div>
          <div className="navbar-buttons">
            {superAdmin && (
              <>
                <button onClick={()=>{setShowUsers(v=>!v);if(!showUsers)loadUsers();}} className="config-btn">👥 Users</button>
                <button onClick={()=>setShowEmail(v=>!v)} className="config-btn">📧 Email</button>
              </>
            )}
            <button onClick={()=>setShowMenuEdit(v=>!v)} className="config-btn">🍽️ Menu</button>
            <button onClick={logout} className="logout-btn">🔓 Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        {fetchErr && <div className="error-message" style={{marginBottom:20}}>{fetchErr}<button onClick={fetchAll} style={{marginLeft:12,padding:'4px 12px',background:'var(--red)',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontSize:12}}>Retry</button></div>}

        {/* MENU EDITOR */}
        {showMenuEdit && <MenuEditor menuData={menuData} saveMenu={saveMenu} contactData={contactData} saveContacts={saveContacts} />}

        {/* USER MANAGEMENT */}
        {superAdmin && showUsers && (
          <div className="user-mgmt-panel">
            <h3>👥 User Management</h3>
            <p>Add or remove admin users. Each action requires Gmail verification.</p>
            {userMsg && <div className="success-message">{userMsg}</div>}
            {userErr && <div className="error-message">{userErr}</div>}
            {otpStep ? (
              <div style={{marginTop:14}}>
                <p style={{fontSize:13,color:'var(--text2)',marginBottom:10}}>Enter the 6-digit code sent to Gmail:</p>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  <input type="text" placeholder="6-digit code" maxLength="6" value={vOtp} onChange={e=>setVOtp(e.target.value.replace(/\D/g,''))} style={{flex:1,minWidth:140,letterSpacing:6,textAlign:'center',fontSize:18}} />
                  <button onClick={confirmAction} style={{padding:'0 20px',background:'var(--red)',color:'#fff',border:'none',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,minHeight:44}}>✅ Confirm</button>
                  <button onClick={()=>{setOtpStep(false);setPendingAct(null);setVOtp('');}} style={{padding:'0 16px',background:'var(--bg4)',color:'var(--text2)',border:'1.5px solid var(--border)',borderRadius:9,cursor:'pointer',fontSize:13,minHeight:44}}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <ul className="user-list">
                  <li className="user-item"><span className="user-item-name">kingsman</span><span className="user-item-role permanent">Permanent Super Admin</span></li>
                  {subUsers.map((u,i)=>(
                    <li key={i} className="user-item">
                      <span className="user-item-name">{u.username}</span>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <span className="user-item-role">Admin</span>
                        <button onClick={()=>startAction({type:'remove',target:u.username})} disabled={otpSend} style={{background:'none',border:'none',color:'var(--danger)',cursor:'pointer',fontSize:16,padding:'0 4px'}}>✕</button>
                      </div>
                    </li>
                  ))}
                  {subUsers.length===0 && <li style={{padding:'10px 0',fontSize:13,color:'var(--text3)'}}>No sub-users yet.</li>}
                </ul>
                <div className="add-user-row">
                  <input type="text" placeholder="New username" value={newUsr} onChange={e=>setNewUsr(e.target.value)} />
                  <input type="password" placeholder="PIN (min 4 digits)" value={newUPin} onChange={e=>setNewUPin(e.target.value.replace(/\D/g,''))} maxLength="8" />
                  <button disabled={otpSend} onClick={()=>{if(!newUsr.trim()||newUPin.length<4){setUserErr('Enter username and PIN (min 4 digits)');return;}setUserErr('');startAction({type:'add',newUsername:newUsr.trim(),newPin:newUPin});}}>{otpSend?'⏳':'+ Add User'}</button>
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
              <input type="email" placeholder="admin@example.com" value={newEmail} onChange={e=>setNewEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addEmail()} />
              <button onClick={addEmail}>Add Email</button>
            </div>
            <div className="email-list">
              <h4>Recipients ({emailCfg.recipients?emailCfg.recipients.length:0}):</h4>
              {!emailCfg.recipients||emailCfg.recipients.length===0
                ? <p style={{fontSize:13,color:'var(--text3)'}}>No emails configured</p>
                : emailCfg.recipients.map((em,i)=>(
                  <div key={i} className="email-item"><span>✉️ {em}</span><button onClick={()=>removeEmail(em)}>✕</button></div>
                ))
              }
            </div>
          </div>
        )}

        {stats && (
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-number">{stats.totalComplaints}</div><div className="stat-label">Total Complaints</div></div>
            <div className="stat-card new"><div className="stat-number">{stats.newComplaints}</div><div className="stat-label">New</div></div>
            <div className="stat-card progress"><div className="stat-number">{stats.inProgressComplaints}</div><div className="stat-label">In Progress</div></div>
            <div className="stat-card resolved"><div className="stat-number">{stats.resolvedComplaints}</div><div className="stat-label">Resolved</div></div>
          </div>
        )}

        <div className="filters">
          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <select value={canteenFilter} onChange={e=>setCanteenFilter(e.target.value)}>
            <option value="All">All Canteens</option>
            <option value="Plant Canteen">Plant Canteen</option>
            <option value="Staff Hostel-II Canteen">Staff Hostel-II Canteen</option>
            <option value="Cafeteria Canteen">Cafeteria Canteen</option>
          </select>
          <button onClick={fetchAll} style={{padding:'9px 16px',background:'var(--gold-light)',color:'var(--gold2)',border:'1.5px solid rgba(200,150,10,.3)',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--ff-body)'}}>🔄 Refresh</button>
        </div>

        <div className="complaints-table">
          <h3>Complaints ({filtered.length})</h3>
          <div style={{overflowX:'auto'}}>
            <table>
              <thead><tr><th>Name</th><th>P. No</th><th>Canteen</th><th>Status</th><th>Fine (PKR)</th><th>Submitted</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length===0
                  ? <tr><td colSpan="7" style={{textAlign:'center',padding:32,color:'var(--text3)'}}>No complaints found</td></tr>
                  : filtered.map(c=>(
                    <tr key={c._id}>
                      <td>{c.fullName}</td>
                      <td style={{fontFamily:'var(--ff-mono)',fontSize:12}}>{c.personalNumber}</td>
                      <td>{c.canteen}</td>
                      <td><span className={`status ${c.status.replace(/\s+/g,'-').toLowerCase()}`}>{c.status}</span></td>
                      <td>{c.fineAmount||0}</td>
                      <td style={{fontSize:12}}>{new Date(c.submittedAt).toLocaleDateString('en-GB')}</td>
                      <td>
                        <button onClick={()=>setSelected(c)}>View</button>
                        <button className="btn-delete" onClick={()=>deleteComplaint(c._id)}>🗑</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {selected && <ComplaintDetail complaint={selected} onUpdate={updateComplaint} onClose={()=>setSelected(null)} onPrint={printReport} />}
      </main>
    </div>
  );
}

// ── Menu Editor ──────────────────────────────────────────
function MenuEditor({ menuData, saveMenu, contactData, saveContacts }) {
  const [editCanteen, setEditCanteen] = useState('Plant Canteen');
  const [editDay,     setEditDay]     = useState(0);
  const [editMeal,    setEditMeal]    = useState(0);
  const [saved,       setSaved]       = useState(false);
  const [activeTab,   setActiveTab]   = useState('meals'); // 'meals' | 'contacts'

  // Local draft for the textarea — avoids calling saveMenu on every keystroke
  const dayData  = menuData[editCanteen]?.[editDay];
  const mealData = dayData?.meals?.[editMeal];

  const [draftItems, setDraftItems] = useState('');
  const [draftTime,  setDraftTime]  = useState('');

  // Sync draft when selection changes
  useEffect(() => {
    setDraftItems(mealData?.items?.join('\n') || '');
    setDraftTime(mealData?.time || '');
  }, [editCanteen, editDay, editMeal, menuData]);

  // Contact draft
  const [draftContacts, setDraftContacts] = useState('');
  useEffect(() => {
    const contacts = (contactData && contactData[editCanteen]) || DEFAULT_CONTACTS[editCanteen];
    setDraftContacts(contacts.map(([name, num]) => `${name}|${num}`).join('\n'));
  }, [editCanteen, contactData]);

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  const saveMeal = () => {
    const newMenu = JSON.parse(JSON.stringify(menuData));
    newMenu[editCanteen][editDay].meals[editMeal].items =
      draftItems.split('\n').map(s => s.trim()).filter(Boolean);
    newMenu[editCanteen][editDay].meals[editMeal].time = draftTime.trim();
    saveMenu(newMenu);
    showSaved();
  };

  const saveContactsNow = () => {
    const parsed = draftContacts.split('\n').map(line => {
      const [name, ...rest] = line.split('|');
      return [name?.trim() || '', rest.join('|').trim() || ''];
    }).filter(([name]) => name);
    const newContacts = { ...contactData, [editCanteen]: parsed };
    saveContacts(newContacts);
    showSaved();
  };

  const resetToDefault = () => {
    if (!window.confirm('Reset ALL menus and contacts to default? This cannot be undone.')) return;
    saveMenu(DEFAULT_MENU);
    saveContacts(DEFAULT_CONTACTS);
    showSaved();
  };

  return (
    <div className="menu-editor-panel">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:16}}>
        <div>
          <h3 style={{fontFamily:'var(--ff-head)',fontSize:17,fontWeight:700,color:'var(--text)',marginBottom:4}}>🍽️ Menu Editor</h3>
          <p style={{fontSize:13,color:'var(--text2)'}}>Edit what's served each day — press <strong>Save</strong> to keep changes</p>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {saved && <span style={{fontSize:13,color:'var(--success)',fontWeight:700,animation:'fadeIn .3s ease both'}}>✅ Saved!</span>}
          <button onClick={resetToDefault} style={{fontSize:12,padding:'6px 14px',background:'var(--red-light)',color:'var(--red)',border:'1.5px solid rgba(201,64,64,.25)',borderRadius:8,cursor:'pointer',fontWeight:700}}>↺ Reset to Default</button>
        </div>
      </div>

      {/* Canteen selector */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
        {CANTEENS.map(c => (
          <button key={c} onClick={()=>{setEditCanteen(c);setEditDay(0);setEditMeal(0);}}
            style={{padding:'7px 16px',borderRadius:20,border:'1.5px solid',cursor:'pointer',fontWeight:700,fontSize:12,fontFamily:'var(--ff-body)',transition:'all .18s',
              background: editCanteen===c ? '#333' : 'var(--bg4)',
              color: editCanteen===c ? '#fff' : 'var(--text2)',
              borderColor: editCanteen===c ? '#333' : 'var(--border2)'}}>
            {c}
          </button>
        ))}
      </div>

      {/* Sub-tab: Meals vs Contacts */}
      <div style={{display:'flex',gap:0,borderBottom:'2px solid var(--border)',marginBottom:16}}>
        {['meals','contacts'].map(t => (
          <button key={t} onClick={()=>setActiveTab(t)}
            style={{padding:'8px 20px',border:'none',background:'none',cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--ff-body)',
              color: activeTab===t ? 'var(--red2)' : 'var(--text3)',
              borderBottom: activeTab===t ? '2.5px solid var(--red)' : '2.5px solid transparent',
              marginBottom:'-2px',transition:'all .18s'}}>
            {t === 'meals' ? '🍛 Meal Items' : '📞 Contacts'}
          </button>
        ))}
      </div>

      {activeTab === 'meals' && (
        <>
          {/* Day selector */}
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
            {DAYS.map((d,i) => (
              <button key={d} onClick={()=>{setEditDay(i);setEditMeal(0);}}
                style={{padding:'5px 12px',borderRadius:20,border:'1.5px solid',cursor:'pointer',fontSize:12,fontFamily:'var(--ff-body)',transition:'all .18s',
                  background: editDay===i ? 'var(--gold)' : 'var(--bg4)',
                  color: editDay===i ? '#fff' : 'var(--text2)',
                  borderColor: editDay===i ? 'var(--gold)' : 'var(--border)'}}>
                {d.slice(0,3)}
              </button>
            ))}
          </div>

          {/* Meal selector */}
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:18}}>
            {(dayData?.meals||[]).map((m,i) => (
              <button key={i} onClick={()=>setEditMeal(i)}
                style={{padding:'5px 14px',borderRadius:20,border:'1.5px solid',cursor:'pointer',fontSize:12,fontFamily:'var(--ff-body)',transition:'all .18s',
                  background: editMeal===i ? 'var(--red)' : 'var(--bg4)',
                  color: editMeal===i ? '#fff' : 'var(--text2)',
                  borderColor: editMeal===i ? 'var(--red)' : 'var(--border)'}}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {mealData && (
            <div style={{background:'var(--bg4)',border:'1.5px solid var(--border)',borderRadius:12,padding:'16px 18px'}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--red2)',letterSpacing:'.6px',textTransform:'uppercase',marginBottom:12}}>
                Editing: {editCanteen} → {dayData.day} → {mealData.icon} {mealData.label}
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:700,color:'var(--text2)',display:'block',marginBottom:5}}>SERVING TIME</label>
                <input type="text" value={draftTime}
                  onChange={e => setDraftTime(e.target.value)}
                  style={{width:'100%',padding:'9px 13px',borderRadius:9,border:'1.5px solid var(--border)',fontSize:13,fontFamily:'var(--ff-body)',background:'var(--bg3)',color:'var(--text)'}} />
              </div>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:11,fontWeight:700,color:'var(--text2)',display:'block',marginBottom:5}}>MENU ITEMS (one per line)</label>
                <textarea
                  value={draftItems}
                  onChange={e => setDraftItems(e.target.value)}
                  rows={Math.max(4, draftItems.split('\n').length + 1)}
                  style={{width:'100%',padding:'10px 13px',borderRadius:9,border:'1.5px solid var(--border)',fontSize:13,fontFamily:'var(--ff-body)',background:'var(--bg3)',color:'var(--text)',resize:'vertical',lineHeight:1.7}}
                />
                <div style={{fontSize:11,color:'var(--text3)',marginTop:4}}>One item per line. Click Save when done.</div>
              </div>
              <button onClick={saveMeal}
                style={{padding:'10px 28px',background:'linear-gradient(135deg,var(--red2),var(--red3))',color:'#fff',border:'none',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--ff-body)',boxShadow:'0 3px 12px var(--red-glow)',transition:'all .2s'}}>
                💾 Save Changes
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'contacts' && (
        <div style={{background:'var(--bg4)',border:'1.5px solid var(--border)',borderRadius:12,padding:'16px 18px'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--red2)',letterSpacing:'.6px',textTransform:'uppercase',marginBottom:10}}>
            Contacts for: {editCanteen}
          </div>
          <label style={{fontSize:11,fontWeight:700,color:'var(--text2)',display:'block',marginBottom:5}}>
            CONTACTS (one per line — format: <span style={{fontFamily:'var(--ff-mono)'}}>Name|Phone</span>)
          </label>
          <textarea
            value={draftContacts}
            onChange={e => setDraftContacts(e.target.value)}
            rows={6}
            placeholder={'Ahmad Naveed|03461113920\nAhmad Maqsood|03044467651\nIqbal Naeem|Committee'}
            style={{width:'100%',padding:'10px 13px',borderRadius:9,border:'1.5px solid var(--border)',fontSize:13,fontFamily:'var(--ff-mono)',background:'var(--bg3)',color:'var(--text)',resize:'vertical',lineHeight:1.9,marginBottom:10}}
          />
          <div style={{fontSize:11,color:'var(--text3)',marginBottom:12}}>
            Each line: <strong>Name|PhoneNumber</strong> (use | to separate). Click Save when done.
          </div>
          <button onClick={saveContactsNow}
            style={{padding:'10px 28px',background:'linear-gradient(135deg,var(--gold2),var(--gold3))',color:'#fff',border:'none',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--ff-body)',boxShadow:'0 3px 12px var(--gold-glow)',transition:'all .2s'}}>
            💾 Save Contacts
          </button>
        </div>
      )}
    </div>
  );
}

// ── Complaint Detail Modal ───────────────────────────────
function ComplaintDetail({ complaint:initial, onUpdate, onClose, onPrint }) {
  const [full,   setFull]   = useState(initial);
  const [status, setStatus] = useState(initial.status);
  const [remarks,setRemarks]= useState('');
  const [fine,   setFine]   = useState(initial.fineAmount||0);
  const [invest, setInvest] = useState(initial.investigation||'');
  const [saving, setSaving] = useState(false);
  const [imgLoad,setImgLoad]= useState(true);

  useEffect(() => {
    let cancelled=false;
    api.get(`/complaints/${initial._id}`)
      .then(r=>{if(!cancelled){setFull(r.data);setImgLoad(false);}})
      .catch(()=>{if(!cancelled)setImgLoad(false);});
    return ()=>{cancelled=true;};
  },[initial._id]); // eslint-disable-line

  const c = full;
  const save = async () => { setSaving(true); await onUpdate(c._id,{status,remarks:remarks.trim()||undefined,fineAmount:parseFloat(fine)||0,investigation:invest.trim()}); setSaving(false); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e=>e.stopPropagation()}>
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
        <div className="detail-section">
          <h4>📷 Attached Image</h4>
          {imgLoad ? <div style={{fontSize:13,color:'var(--text3)',padding:'8px 0'}}>⏳ Loading image...</div>
            : c.imageUrl ? <img src={c.imageUrl} alt="Complaint attachment" style={{maxWidth:'100%',borderRadius:8,border:'1.5px solid var(--border)',marginTop:6}} />
            : <div style={{fontSize:13,color:'var(--text3)',padding:'4px 0'}}>No image attached.</div>}
        </div>
        <div className="detail-section">
          <h4>Admin Actions</h4>
          <label>Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <label>Fine Amount (PKR)</label>
          <input type="number" value={fine} onChange={e=>setFine(e.target.value)} min="0" step="1" />
          <label>Investigation Details</label>
          <textarea value={invest} onChange={e=>setInvest(e.target.value)} placeholder="Enter investigation findings..." rows="3" />
          <label>Add New Remark</label>
          <textarea value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Add a new remark..." rows="2" />
          {c.remarks&&c.remarks.length>0 && (
            <div className="remarks-list">
              <h5>Remarks History ({c.remarks.length})</h5>
              {c.remarks.map((r,i)=>(<p key={i}><small>{new Date(r.addedAt).toLocaleString('en-GB')}</small><br/>{r.text}</p>))}
            </div>
          )}
        </div>
        <div className="modal-buttons">
          <button className="save-btn" onClick={save} disabled={saving}>{saving?'⏳ Saving...':'💾 Save Changes'}</button>
          <button className="print-btn" onClick={()=>onPrint(c)}>🖨️ Print Report</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

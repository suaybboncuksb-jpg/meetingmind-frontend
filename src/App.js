import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

const API = 'http://localhost:8080/api/meetings';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { id: 'meetings', label: 'Meetings', icon: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z' },
  { id: 'tasks', label: 'Aufgaben', icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' },
  { id: 'archive', label: 'Archiv', icon: 'M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z' },
  { id: 'settings', label: 'Einstellungen', icon: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z' },
];

const STATUS_OPTIONS = ['OFFEN', 'IN_BEARBEITUNG', 'ABGESCHLOSSEN'];

const ONBOARDING_STEPS = [
  {
    title: 'Willkommen bei MeetingMind',
    desc: 'Das KI-gestützte Tool für professionelle Meeting-Protokolle. Erstelle, verwalte und analysiere deine Meetings mit Google Gemini AI.',
    hint: 'Schritt 1 von 3',
  },
  {
    title: 'Meetings erstellen & verwalten',
    desc: 'Lege neue Meetings an, erfasse den Protokolltext und behalte den Überblick über alle vergangenen Besprechungen in einer strukturierten Liste.',
    hint: 'Schritt 2 von 3',
  },
  {
    title: 'KI-Analyse starten',
    desc: 'Mit einem Klick analysiert Google Gemini dein Protokoll und erstellt automatisch eine Zusammenfassung sowie eine Liste erkannter Aufgaben.',
    hint: 'Schritt 3 von 3',
  },
];

function Icon({ path, size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d={path} />
    </svg>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
}

function StatusBadge({ meeting }) {
  if (meeting.aiSummary) return <span className="badge badge-analyzed">Analysiert</span>;
  if (meeting.protocolText) return <span className="badge badge-open">Offen</span>;
  return <span className="badge badge-draft">Entwurf</span>;
}

function groupMeetingsByDate(meetings) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const groups = { 'Heute': [], 'Diese Woche': [], 'Älter': [] };
  meetings.forEach(m => {
    const d = new Date(m.meetingDate);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups['Heute'].push(m);
    else if (d >= weekAgo) groups['Diese Woche'].push(m);
    else groups['Älter'].push(m);
  });
  return groups;
}

async function exportToPDF(meeting) {
  const element = document.getElementById('export-content');
  element.classList.add('exporting');
  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  element.classList.remove('exporting');
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, width, height);
  pdf.save(`${meeting.title.replace(/\s+/g, '_')}_Protokoll.pdf`);
}

function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useState(0);
  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-logo">
          <div className="logo-mark" style={{ width: 48, height: 48, fontSize: 22, borderRadius: 12 }}>M</div>
        </div>
        <div className="onboarding-hint">{current.hint}</div>
        <h2 className="onboarding-title">{current.title}</h2>
        <p className="onboarding-desc">{current.desc}</p>
        <div className="onboarding-dots">
          {ONBOARDING_STEPS.map((_, i) => (
            <div key={i} className={`onboarding-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>
        <div className="onboarding-actions">
          {step > 0 && (
            <button className="btn-onboard-back" onClick={() => setStep(s => s - 1)}>
              Zurück
            </button>
          )}
          <button className="btn-onboard-next" onClick={() => isLast ? onFinish() : setStep(s => s + 1)}>
            {isLast ? 'Loslegen' : 'Weiter'}
          </button>
        </div>
        <button className="onboarding-skip" onClick={onFinish}>Überspringen</button>
      </div>
    </div>
  );
}

function ShortcutsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tastaturkürzel</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="shortcuts-list">
          {[
            { key: 'N', desc: 'Neues Meeting erstellen' },
            { key: 'D', desc: 'Dashboard öffnen' },
            { key: 'M', desc: 'Meetings öffnen' },
            { key: 'Esc', desc: 'Formular schließen / Modal schließen' },
            { key: '?', desc: 'Diese Übersicht anzeigen' },
          ].map(s => (
            <div key={s.key} className="shortcut-row">
              <kbd className="kbd">{s.key}</kbd>
              <span>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activeNav, setActiveNav, onNewMeeting, darkMode, setDarkMode, sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">M</div>
          <span className="logo-name">MeetingMind</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
            >
              <Icon path={item.icon} size={17} />
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="dark-toggle"
            onClick={() => setDarkMode(d => !d)}
          >
            <span className="dark-toggle-icon">{darkMode ? '○' : '●'}</span>
            <span className="nav-label">{darkMode ? 'Hellmodus' : 'Dunkelmodus'}</span>
          </button>
          <div className="user-profile">
            <div className="user-avatar">SB</div>
            <div className="user-info">
              <span className="user-name">Suayb B.</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Dashboard({ meetings }) {
  const analyzed = meetings.filter(m => m.aiSummary).length;
  const open = meetings.filter(m => m.protocolText && !m.aiSummary).length;
  const totalTasks = meetings.reduce((sum, m) => sum + (m.tasks?.length || 0), 0);

  return (
    <div className="detail-panel fade-in">
      <div className="detail-header">
        <div>
          <h2>Dashboard</h2>
          <p className="detail-sub">Übersicht aller Meeting-Aktivitäten</p>
        </div>
      </div>
      <div className="detail-body">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{meetings.length}</span>
            <span className="stat-label">Meetings gesamt</span>
            <div className="stat-bar" style={{ width: '100%' }} />
          </div>
          <div className="stat-card">
            <span className="stat-value">{analyzed}</span>
            <span className="stat-label">KI-analysiert</span>
            <div className="stat-bar green" style={{ width: meetings.length ? `${(analyzed / meetings.length) * 100}%` : '0%' }} />
          </div>
          <div className="stat-card">
            <span className="stat-value">{open}</span>
            <span className="stat-label">Offen</span>
            <div className="stat-bar amber" style={{ width: meetings.length ? `${(open / meetings.length) * 100}%` : '0%' }} />
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalTasks}</span>
            <span className="stat-label">Aufgaben erkannt</span>
            <div className="stat-bar blue" style={{ width: '60%' }} />
          </div>
        </div>
        <div className="detail-section">
          <h3 className="section-title">Letzte Meetings</h3>
          {meetings.slice(0, 5).map(m => (
            <div key={m.id} className="dashboard-meeting-row">
              <div className="dmr-left">
                <span className="dmr-title">{m.title}</span>
                <span className="dmr-meta">{m.location} · {new Date(m.meetingDate).toLocaleDateString('de-DE')}</span>
              </div>
              <StatusBadge meeting={m} />
            </div>
          ))}
          {meetings.length === 0 && <p className="empty-list">Noch keine Meetings vorhanden.</p>}
        </div>
      </div>
    </div>
  );
}

function MeetingList({ meetings, selected, onSelect, search, setSearch, onNewMeeting }) {
  const filtered = meetings.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );
  const groups = groupMeetingsByDate(filtered);

  return (
    <div className="meeting-list-panel">
      <div className="list-header">
        <div className="list-header-top">
          <h2>Meetings <span className="count">{meetings.length}</span></h2>
          <button className="icon-btn" onClick={onNewMeeting} title="Neues Meeting (N)">+</button>
        </div>
        <div className="search-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            placeholder="Meetings durchsuchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="meeting-items">
        {filtered.length === 0 && <div className="empty-list">Keine Meetings gefunden.</div>}
        {Object.entries(groups).map(([label, items]) =>
          items.length === 0 ? null : (
            <div key={label}>
              <div className="date-group-label">{label}</div>
              {items.map(m => (
                <div
                  key={m.id}
                  className={`meeting-item slide-in ${selected?.id === m.id ? 'active' : ''}`}
                  onClick={() => onSelect(m)}
                >
                  <div className="meeting-item-top">
                    <span className="meeting-item-title">{m.title}</span>
                    <StatusBadge meeting={m} />
                  </div>
                  <div className="meeting-item-meta">
                    <span>{m.location || 'Kein Ort'}</span>
                    <span>{new Date(m.meetingDate).toLocaleDateString('de-DE')}</span>
                  </div>
                  {m.protocolText && (
                    <p className="meeting-item-preview">
                      {m.protocolText.substring(0, 65)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function NewMeetingForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '', location: '', meetingDate: '', protocolText: ''
  });

  return (
    <div className="detail-panel fade-in">
      <div className="detail-header">
        <div>
          <h2>Neues Meeting</h2>
          <p className="detail-sub">Erstelle ein neues Meeting und erfasse das Protokoll</p>
        </div>
        <div className="detail-actions">
          <button className="btn-analyze" onClick={() => {
            if (!form.title) return alert('Bitte Titel eingeben');
            onSave(form);
          }}>Speichern</button>
          <button className="btn-delete" onClick={onCancel}>Abbrechen (Esc)</button>
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Titel *</label>
          <input placeholder="z.B. Sprint Planning Q3"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Ort</label>
          <input placeholder="z.B. Konferenzraum A"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Datum & Uhrzeit</label>
          <input type="datetime-local"
            value={form.meetingDate}
            onChange={e => setForm({ ...form, meetingDate: e.target.value })} />
        </div>
        <div className="form-group full-width">
          <label>Protokolltext</label>
          <textarea rows={7}
            placeholder="Was wurde besprochen? Wer übernimmt was?"
            value={form.protocolText}
            onChange={e => setForm({ ...form, protocolText: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function MeetingDetail({ meeting, onAnalyze, onDelete, analyzing, onStatusChange, onTaskToggle }) {
  if (!meeting) {
    return (
      <div className="detail-panel empty-detail fade-in">
        <div className="empty-state">
          <div className="empty-icon-box">MM</div>
          <h3>Kein Meeting ausgewählt</h3>
          <p>Wähle ein Meeting aus der Liste oder drücke N für ein neues Meeting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-panel fade-in">
      <div className="detail-header">
        <div>
          <h2>{meeting.title}</h2>
          <p className="detail-sub">
            {meeting.location || 'Kein Ort'} &nbsp;·&nbsp;
            {new Date(meeting.meetingDate).toLocaleDateString('de-DE', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
        <div className="detail-actions">
          <select
            className="status-select"
            value={meeting.manualStatus || 'OFFEN'}
            onChange={e => onStatusChange(meeting.id, e.target.value)}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <button
            className={`btn-analyze ${analyzing ? 'loading' : ''}`}
            onClick={() => onAnalyze(meeting.id)}
            disabled={analyzing}
          >
            {analyzing && <span className="spinner" />}
            {analyzing ? 'Analyse läuft...' : 'KI-Analyse starten'}
          </button>
          <button className="btn-export" onClick={() => exportToPDF(meeting)}>
            PDF Export
          </button>
          <button className="btn-delete" onClick={() => onDelete(meeting.id)}>
            Löschen
          </button>
        </div>
      </div>

      <div className="detail-body" id="export-content">
        <div className="export-header">
          <h1 className="export-title">{meeting.title}</h1>
          <p className="export-meta">
            {meeting.location || 'Kein Ort'} · {new Date(meeting.meetingDate).toLocaleDateString('de-DE', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>

        <div className="detail-section">
          <h3 className="section-title">Protokoll</h3>
          <div className="protocol-box">
            <p>{meeting.protocolText || 'Kein Protokolltext vorhanden.'}</p>
          </div>
        </div>

        {meeting.aiSummary && (
          <div className="detail-section">
            <h3 className="section-title">KI-Zusammenfassung</h3>
            <div className="ai-card">
              <div className="ai-card-header">
                <span className="ai-label">Generiert von Google Gemini</span>
              </div>
              <p>{meeting.aiSummary}</p>
            </div>
          </div>
        )}

        {meeting.tasks && meeting.tasks.length > 0 && (
          <div className="detail-section">
            <h3 className="section-title">
              Erkannte Aufgaben ({meeting.tasks.filter(t => t.done).length}/{meeting.tasks.length} erledigt)
            </h3>
            <div className="task-list">
              {meeting.tasks.map((task, i) => (
                <div
                  key={i}
                  className={`task-item ${task.done ? 'task-done' : ''}`}
                  onClick={() => onTaskToggle(meeting.id, i)}
                >
                  <div className={`task-checkbox ${task.done ? 'checked' : ''}`}>
                    {task.done && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </div>
                  <div className="task-content">
                    <p className={`task-desc ${task.done ? 'done-text' : ''}`}>{task.description}</p>
                    <div className="task-meta">
                      {task.assignedTo && <span className="task-tag">{task.assignedTo}</span>}
                      {task.dueDate && task.dueDate !== 'null' && (
                        <span className="task-tag">{task.dueDate}</span>
                      )}
                      <span className={`task-status ${task.status?.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="export-footer">
          <p>Erstellt mit MeetingMind · {new Date().toLocaleDateString('de-DE')}</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [meetings, setMeetings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [meetingStatuses, setMeetingStatuses] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('mm_onboarded'));
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => { loadMeetings(); }, []);

  const handleNewMeeting = useCallback(() => {
    setShowForm(true);
    setActiveNav('meetings');
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'n' || e.key === 'N') handleNewMeeting();
      if (e.key === 'd' || e.key === 'D') { setActiveNav('dashboard'); setShowForm(false); setSelected(null); }
      if (e.key === 'm' || e.key === 'M') { setActiveNav('meetings'); setShowForm(false); }
      if (e.key === 'Escape') { setShowForm(false); setShowShortcuts(false); setSidebarOpen(false); }
      if (e.key === '?') setShowShortcuts(s => !s);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleNewMeeting]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const loadMeetings = async () => {
    try {
      const res = await axios.get(API);
      setMeetings(res.data);
    } catch {
      showToast('Verbindung zum Server fehlgeschlagen.', 'error');
    }
  };

  const createMeeting = async (form) => {
    await axios.post(API, form);
    setShowForm(false);
    setActiveNav('meetings');
    loadMeetings();
    showToast('Meeting erfolgreich erstellt.');
  };

  const analyzeMeeting = async (id) => {
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API}/${id}/analyze`);
      const updatedMeeting = res.data;
      const tasks = (updatedMeeting.tasks || []).map(t => ({ ...t, done: false }));
      setSelected({ ...updatedMeeting, tasks });
      loadMeetings();
      showToast('KI-Analyse erfolgreich abgeschlossen.');
    } catch {
      showToast('KI-Analyse fehlgeschlagen. Bitte später erneut versuchen.', 'error');
    }
    setAnalyzing(false);
  };

  const deleteMeeting = async (id) => {
    if (!window.confirm('Meeting wirklich löschen?')) return;
    await axios.delete(`${API}/${id}`);
    setSelected(null);
    loadMeetings();
    showToast('Meeting wurde gelöscht.', 'info');
  };

  const handleStatusChange = (id, status) => {
    setMeetingStatuses(prev => ({ ...prev, [id]: status }));
    showToast(`Status auf "${status.replace('_', ' ')}" gesetzt.`);
  };

  const handleTaskToggle = (meetingId, taskIndex) => {
    setSelected(prev => {
      const tasks = [...prev.tasks];
      tasks[taskIndex] = { ...tasks[taskIndex], done: !tasks[taskIndex].done };
      return { ...prev, tasks };
    });
  };

  const enrichedSelected = selected ? {
    ...selected,
    manualStatus: meetingStatuses[selected.id] || 'OFFEN',
  } : null;

  const renderMain = () => {
    if (showForm) return <NewMeetingForm key="form" onSave={createMeeting} onCancel={() => setShowForm(false)} />;
    if (activeNav === 'dashboard') return <Dashboard key="dashboard" meetings={meetings} />;
    return (
      <MeetingDetail
        key={selected?.id || 'empty'}
        meeting={enrichedSelected}
        onAnalyze={analyzeMeeting}
        onDelete={deleteMeeting}
        analyzing={analyzing}
        onStatusChange={handleStatusChange}
        onTaskToggle={handleTaskToggle}
      />
    );
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingScreen onFinish={() => {
          localStorage.setItem('mm_onboarded', 'true');
          setShowOnboarding(false);
        }} />
      )}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
      <div className="app-layout">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>

        <Sidebar
          activeNav={activeNav}
          setActiveNav={(nav) => { setActiveNav(nav); setShowForm(false); setSelected(null); }}
          onNewMeeting={handleNewMeeting}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <MeetingList
          meetings={meetings}
          selected={selected}
          onSelect={(m) => {
            const tasks = (m.tasks || []).map(t => ({ ...t, done: false }));
            setSelected({ ...m, tasks });
            setShowForm(false);
            setActiveNav('meetings');
          }}
          search={search}
          setSearch={setSearch}
          onNewMeeting={handleNewMeeting}
        />
        {renderMain()}

        <button className="shortcuts-hint" onClick={() => setShowShortcuts(true)} title="Tastaturkürzel anzeigen">
          ?
        </button>
      </div>
    </>
  );
}
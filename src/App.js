import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:8080/api/meetings';

function App() {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [form, setForm] = useState({
    title: '', location: '', meetingDate: '', protocolText: ''
  });

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    const res = await axios.get(API);
    setMeetings(res.data);
  };

  const createMeeting = async () => {
    await axios.post(API, form);
    setForm({ title: '', location: '', meetingDate: '', protocolText: '' });
    setShowForm(false);
    loadMeetings();
  };

  const analyzeMeeting = async (id) => {
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API}/${id}/analyze`);
      setSelectedMeeting(res.data);
      loadMeetings();
    } catch (e) {
      alert('Analyse fehlgeschlagen: ' + e.message);
    }
    setAnalyzing(false);
  };

  const deleteMeeting = async (id) => {
    await axios.delete(`${API}/${id}`);
    setSelectedMeeting(null);
    loadMeetings();
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🧠 MeetingMind</h1>
        <p>AI-powered meeting protocol tool</p>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + Neues Meeting
        </button>
      </header>

      {showForm && (
        <div className="form-card">
          <h2>Meeting erstellen</h2>
          <input placeholder="Titel" value={form.title}
            onChange={e => setForm({...form, title: e.target.value})} />
          <input placeholder="Ort" value={form.location}
            onChange={e => setForm({...form, location: e.target.value})} />
          <input type="datetime-local" value={form.meetingDate}
            onChange={e => setForm({...form, meetingDate: e.target.value})} />
          <textarea placeholder="Protokolltext..." rows={5} value={form.protocolText}
            onChange={e => setForm({...form, protocolText: e.target.value})} />
          <div className="form-actions">
            <button className="btn-primary" onClick={createMeeting}>Speichern</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Abbrechen</button>
          </div>
        </div>
      )}

      <div className="main-layout">
        <div className="meeting-list">
          <h2>Meetings ({meetings.length})</h2>
          {meetings.length === 0 && <p className="empty">Noch keine Meetings vorhanden.</p>}
          {meetings.map(m => (
            <div key={m.id}
              className={`meeting-card ${selectedMeeting?.id === m.id ? 'active' : ''}`}
              onClick={() => setSelectedMeeting(m)}>
              <h3>{m.title}</h3>
              <p>{m.location}</p>
              <p className="date">{new Date(m.meetingDate).toLocaleDateString('de-DE')}</p>
              {m.aiSummary && <span className="badge">✓ KI-Analyse</span>}
            </div>
          ))}
        </div>

        <div className="meeting-detail">
          {!selectedMeeting ? (
            <div className="empty-detail">
              <p>Wähle ein Meeting aus der Liste</p>
            </div>
          ) : (
            <>
              <div className="detail-header">
                <div>
                  <h2>{selectedMeeting.title}</h2>
                  <p>{selectedMeeting.location} · {new Date(selectedMeeting.meetingDate).toLocaleDateString('de-DE')}</p>
                </div>
                <div className="detail-actions">
                  <button className="btn-ai" onClick={() => analyzeMeeting(selectedMeeting.id)}
                    disabled={analyzing}>
                    {analyzing ? '⏳ Analysiere...' : '🤖 KI-Analyse'}
                  </button>
                  <button className="btn-danger" onClick={() => deleteMeeting(selectedMeeting.id)}>
                    Löschen
                  </button>
                </div>
              </div>

              <div className="section">
                <h3>Protokoll</h3>
                <p>{selectedMeeting.protocolText}</p>
              </div>

              {selectedMeeting.aiSummary && (
                <div className="section ai-section">
                  <h3>🤖 KI-Zusammenfassung</h3>
                  <p>{selectedMeeting.aiSummary}</p>
                </div>
              )}

              {selectedMeeting.tasks && selectedMeeting.tasks.length > 0 && (
                <div className="section">
                  <h3>📋 Aufgaben ({selectedMeeting.tasks.length})</h3>
                  {selectedMeeting.tasks.map((task, i) => (
                    <div key={i} className="task-card">
                      <p>{task.description}</p>
                      <div className="task-meta">
                        <span>👤 {task.assignedTo}</span>
                        {task.dueDate && <span>📅 {task.dueDate}</span>}
                        <span className={`status ${task.status?.toLowerCase()}`}>{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
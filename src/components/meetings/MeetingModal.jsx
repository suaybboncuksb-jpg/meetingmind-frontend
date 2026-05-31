/**
 * MeetingModal.jsx
 * ─────────────────────────────────────────────────────────────
 * Bugfix: participants wird jetzt als Array gesendet, nicht als String.
 *
 * Änderungen:
 *   1. handleSave: participants-String → Array via split/trim/filter
 *   2. Fehlerbehandlung: saubere UI-Meldung, technischer Fehler nur in console.error
 *
 * Felder-Status:
 *  ✅ AN API GESENDET: title, date, participants (Array!), protocol
 *  ⚠️ BACKEND EMPFOHLEN: endDateTime, locationOrLink, meetingType
 *  🔜 NUR FRONTEND:     recurrenceType, reminderMinutesBefore
 */

import { useState }          from 'react';
import { Loader2, X, ChevronDown, Users, Video } from 'lucide-react';

const RECURRENCE_OPTIONS = [
  { value: 'NONE',    label: 'Keine Wiederholung' },
  { value: 'DAILY',   label: 'Täglich'            },
  { value: 'WEEKLY',  label: 'Wöchentlich'        },
  { value: 'MONTHLY', label: 'Monatlich'          },
];

const REMINDER_OPTIONS = [
  { value: 'none', label: 'Keine Erinnerung'   },
  { value: '10',   label: '10 Minuten vorher'  },
  { value: '30',   label: '30 Minuten vorher'  },
  { value: '60',   label: '1 Stunde vorher'    },
  { value: '1440', label: '1 Tag vorher'        },
];

// ── Hilfsfunktionen ───────────────────────────────────────────────────────

function toDateInput(val) {
  if (!val) return '';
  const d = new Date(val);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}

function toTimeInput(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const h = d.getHours(), m = d.getMinutes();
  return h === 0 && m === 0 ? '' : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Wandelt einen kommagetrennten Teilnehmer-String in ein sauberes Array um.
 * "Sarah, Michael, Baha" → ["Sarah", "Michael", "Baha"]
 * " " → []
 */
function parseParticipants(raw) {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);
}

/**
 * Wandelt ein Teilnehmer-Array zurück in einen kommagetrennten String (für das Eingabefeld).
 * ["Sarah", "Michael"] → "Sarah, Michael"
 */
function participantsToString(participants) {
  if (!participants) return '';
  if (Array.isArray(participants)) return participants.join(', ');
  return String(participants);
}

// ─────────────────────────────────────────────────────────────────────────
// HAUPT-KOMPONENTE
// ─────────────────────────────────────────────────────────────────────────

export default function MeetingModal({ mode, initialDate, meeting, onSave, onClose }) {
  const isEdit = mode === 'edit';

  // Formular-Felder
  const [title,        setTitle]        = useState(meeting?.title ?? '');
  const [date,         setDate]         = useState(
    toDateInput(meeting?.date ?? meeting?.startDateTime ?? initialDate) || toDateInput(new Date())
  );
  const [startTime,    setStartTime]    = useState(toTimeInput(meeting?.date ?? meeting?.startDateTime) ?? '');
  const [endTime,      setEndTime]      = useState(toTimeInput(meeting?.endDateTime) ?? '');
  const [meetingType,  setMeetingType]  = useState(meeting?.meetingType ?? 'IN_PERSON');

  // Teilnehmer werden im Feld als String dargestellt, beim Senden als Array übergeben
  const [participants, setParticipants] = useState(
    participantsToString(meeting?.participants)
  );

  const [location,     setLocation]     = useState(meeting?.locationOrLink ?? meeting?.location ?? '');
  const [protocol,     setProtocol]     = useState(meeting?.protocol ?? '');
  const [recurrence,   setRecurrence]   = useState(meeting?.recurrenceType ?? 'NONE');
  const [reminder,     setReminder]     = useState(
    meeting?.reminderMinutesBefore != null ? String(meeting.reminderMinutesBefore) : 'none'
  );

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  // ── Formular absenden ─────────────────────────────────────
  async function handleSave() {
    if (!title.trim()) {
      setError('Bitte einen Titel eingeben.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Datum + Startzeit zu ISO-String kombinieren
      const dateStr = startTime ? `${date}T${startTime}:00` : date;
      const endStr  = endTime   ? `${date}T${endTime}:00`   : null;

      // ── Participants: String → Array ──────────────────────
      // Das Backend erwartet ein Array: ["Sarah", "Michael", "Baha"]
      // Das Eingabefeld liefert einen String: "Sarah, Michael, Baha"
      const participantsArray = parseParticipants(participants);

      await onSave({
        // ✅ Bestehende API-Felder (Backend unterstützt diese bereits):
        title:        title.trim(),
        date:         dateStr,
        participants: participantsArray,   // ARRAY, nicht String
        protocol:     protocol.trim()  || null,

        // ⚠️ Backend-Erweiterung empfohlen (werden ignoriert wenn nicht vorhanden):
        meetingType:    meetingType          || null,
        endDateTime:    endStr,
        locationOrLink: location.trim()     || null,

        // 🔜 Nur Frontend, Backend ignoriert diese Felder aktuell:
        recurrenceType:        recurrence !== 'NONE' ? recurrence : null,
        reminderMinutesBefore: reminder   !== 'none' ? parseInt(reminder, 10) : null,
      });

    } catch (e) {
      // Technischer Fehler nur in der Konsole – nicht im UI anzeigen
      console.error('Meeting-Erstellung fehlgeschlagen:', e);
      setError('Meeting konnte nicht erstellt werden. Bitte prüfe die Eingaben.');
      setSaving(false);
    }
  }

  const isOnline = meetingType === 'ONLINE';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(13,33,55,0.42)', backdropFilter: 'blur(5px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(13,33,55,0.18)] animate-slide-up">

        {/* ── Modal-Header ─────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E5EAF0] sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-[15px] font-bold text-[#111827] tracking-tight">
              {isEdit ? 'Meeting bearbeiten' : 'Neues Meeting anlegen'}
            </h2>
            <p className="text-[12px] text-[#64748B] mt-0.5 leading-relaxed">
              {isEdit
                ? 'Aktualisiere die Angaben zu diesem Meeting.'
                : 'Lege ein neues Meeting an und erfasse bei Bedarf direkt das Protokoll.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-[#E5EAF0] flex items-center justify-center text-[#94A3B8] hover:text-[#111827] hover:bg-[#F5F7FA] transition-all flex-shrink-0 ml-4 mt-0.5"
          >
            <X size={13} />
          </button>
        </div>

        {/* ── Formular ─────────────────────────────────────── */}
        <div className="px-6 py-5 space-y-4">

          {/* Titel */}
          <Field label="Meeting-Titel" required>
            <Input
              value={title}
              onChange={setTitle}
              placeholder="z.B. Q3 Strategy Review"
              autoFocus
            />
          </Field>

          {/* Datum */}
          <Field label="Datum" required>
            <Input type="date" value={date} onChange={setDate} />
          </Field>

          {/* Startzeit + Endzeit */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Startzeit">
              <Input type="time" value={startTime} onChange={setStartTime} />
            </Field>
            <Field label="Endzeit">
              <Input type="time" value={endTime} onChange={setEndTime} />
            </Field>
          </div>

          {/* Meeting-Typ ⚠️ Backend-Erweiterung empfohlen */}
          <Field label="Meeting-Typ" tag="Backend: meetingType">
            <div className="grid grid-cols-2 gap-2">
              <MeetingTypeBtn
                label="Persönliches Meeting"
                icon={Users}
                selected={meetingType === 'IN_PERSON'}
                onClick={() => setMeetingType('IN_PERSON')}
              />
              <MeetingTypeBtn
                label="Online-Meeting"
                icon={Video}
                selected={meetingType === 'ONLINE'}
                onClick={() => setMeetingType('ONLINE')}
              />
            </div>
          </Field>

          {/* Ort / Meeting-Link ⚠️ Backend-Erweiterung empfohlen */}
          <Field
            label={isOnline ? 'Meeting-Link' : 'Ort'}
            hint={isOnline ? 'z.B. https://meet.google.com/...' : 'z.B. Raum 203, Büro Hamburg'}
            tag="Backend: locationOrLink"
          >
            <Input
              value={location}
              onChange={setLocation}
              placeholder={isOnline ? 'Meeting-Link eingeben …' : 'Ort eingeben …'}
            />
          </Field>

          {/* Teilnehmer – Eingabe als String, Versand als Array */}
          <Field
            label="Teilnehmer"
            hint="Kommagetrennt, z.B. Sarah, Michael, Baha"
          >
            <Input
              value={participants}
              onChange={setParticipants}
              placeholder="Sarah, Michael, Baha"
            />
          </Field>

          {/* Protokoll */}
          <Field label="Protokoll">
            <textarea
              value={protocol}
              onChange={e => setProtocol(e.target.value)}
              placeholder="Meeting-Notizen oder Protokolltext …"
              rows={4}
              className="w-full px-3 py-2 border border-[#E5EAF0] bg-[#F8FAFC] rounded-xl text-[13px] text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#1E6FB5]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(30,111,181,0.06)] transition-all duration-150 resize-y min-h-[80px] font-sans"
            />
          </Field>

          {/* Trennlinie */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-[#E5EAF0]" />
            <span className="text-[10.5px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em]">Optionen</span>
            <div className="flex-1 h-px bg-[#E5EAF0]" />
          </div>

          {/* Wiederholung 🔜 Nur Frontend */}
          <Field label="Wiederholung" tag="Nur Frontend – Backend nötig">
            <SelectInput value={recurrence} onChange={setRecurrence} options={RECURRENCE_OPTIONS} />
          </Field>

          {/* Erinnerung 🔜 Nur Frontend */}
          <Field label="Erinnerung" tag="Nur Frontend – Backend nötig">
            <SelectInput value={reminder} onChange={setReminder} options={REMINDER_OPTIONS} />
          </Field>

          {/* Fehlermeldung – sauber, kein technischer Stack-Trace */}
          {error && (
            <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[#E5EAF0] bg-[#F8FAFC] sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium text-[#64748B] border border-[#E5EAF0] bg-white hover:bg-[#F5F7FA] transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-semibold text-white disabled:opacity-60 transition-all duration-150 enabled:hover:-translate-y-px"
            style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {isEdit ? 'Änderungen speichern' : 'Meeting erstellen'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hilfselemente ─────────────────────────────────────────────────────────

function MeetingTypeBtn({ label, icon: Icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
        selected
          ? 'bg-[#EEF5FD] border-[#1E6FB5]/40 text-[#1E6FB5]'
          : 'bg-[#F8FAFC] border-[#E5EAF0] text-[#64748B] hover:bg-white hover:border-[#CBD5E1]'
      }`}
    >
      <Icon size={14} strokeWidth={2} className="flex-shrink-0" />
      <span className="text-[12px] font-semibold leading-tight">{label}</span>
    </button>
  );
}

function Field({ label, required, hint, tag, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <label className="text-[11.5px] font-semibold text-[#64748B] tracking-wide">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {tag && (
          <span className="text-[9.5px] font-semibold text-[#94A3B8] bg-slate-100 border border-[#E5EAF0] px-1.5 py-0.5 rounded uppercase tracking-wide">
            {tag}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-[#94A3B8] mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function Input({ type = 'text', value, onChange, placeholder, autoFocus }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full px-3 py-2 border border-[#E5EAF0] bg-[#F8FAFC] rounded-xl text-[13px] text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#1E6FB5]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(30,111,181,0.06)] transition-all duration-150 font-sans"
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none px-3 py-2 pr-8 border border-[#E5EAF0] bg-[#F8FAFC] rounded-xl text-[13px] text-[#111827] outline-none focus:border-[#1E6FB5]/40 focus:bg-white transition-all duration-150 font-sans cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
    </div>
  );
}

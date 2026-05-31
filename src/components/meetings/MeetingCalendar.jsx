/**
 * MeetingCalendar.jsx
 * ─────────────────────────────────────────────────────────────
 * Monatskalender — reines React, keine externe Library.
 * Verbesserungen v3:
 *   - Meeting-Pills mit Titel (bis zu 2 pro Tag)
 *   - Tages-Panel: Startzeit + Endzeit + Teilnehmerzahl
 *   - Korrekte Bezeichnung „Kalender" (nicht Calender)
 */

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Clock, Users } from 'lucide-react';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS   = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember',
];

// ── Hilfsfunktionen ───────────────────────────────────────────────────────

function isSameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate();
}

function toDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function formatTime(val) {
  const d = toDate(val);
  if (!d) return null;
  const h = d.getHours(), m = d.getMinutes();
  return h === 0 && m === 0 ? null : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function buildCells(year, month) {
  const firstDay    = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow    = (firstDay.getDay() + 6) % 7; // Mo=0

  const cells = [];
  for (let i = startDow - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month, -i),     inMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d),      inMonth: true  });
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++)
    cells.push({ date: new Date(year, month + 1, d),  inMonth: false });

  return cells;
}

function meetingsForDay(meetings, day) {
  return meetings.filter(m => {
    const d = toDate(m.date ?? m.startDateTime);
    return d && isSameDay(d, day);
  });
}

// ─────────────────────────────────────────────────────────────────────────
// HAUPT-KOMPONENTE
// ─────────────────────────────────────────────────────────────────────────

export default function MeetingCalendar({ meetings, onSelectMeeting, onOpenCreate }) {
  const today = new Date();
  const [year,        setYear]        = useState(today.getFullYear());
  const [month,       setMonth]       = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today);

  const cells       = useMemo(() => buildCells(year, month), [year, month]);
  const dayMeetings = useMemo(() => meetingsForDay(meetings, selectedDay), [meetings, selectedDay]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(today);
  }
  function handleDayClick(date) {
    setSelectedDay(date);
    if (date.getMonth() !== month) {
      setYear(date.getFullYear());
      setMonth(date.getMonth());
    }
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Kalender links ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-auto p-6">

        {/* Navigation */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            <NavBtn onClick={prevMonth}><ChevronLeft  size={14} /></NavBtn>
            <NavBtn onClick={nextMonth}><ChevronRight size={14} /></NavBtn>
            <h2 className="text-[15px] font-bold text-[#111827] tracking-tight ml-2">
              {MONTHS[month]} {year}
            </h2>
          </div>
          <button
            onClick={goToday}
            className="text-[11.5px] font-semibold text-[#1E6FB5] border border-[#1E6FB5]/30 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Heute
          </button>
        </div>

        {/* Wochentag-Header */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[10.5px] font-bold text-[#94A3B8] py-1.5 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Tage-Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((cell, i) => {
            const cm = meetingsForDay(meetings, cell.date);
            return (
              <CalendarCell
                key={i}
                date={cell.date}
                inMonth={cell.inMonth}
                isToday={isSameDay(cell.date, today)}
                isSelected={isSameDay(cell.date, selectedDay)}
                meetings={cm}
                onClick={() => handleDayClick(cell.date)}
              />
            );
          })}
        </div>
      </div>

      {/* ── Tages-Panel rechts ─────────────────────────────── */}
      <div className="w-[300px] min-w-[300px] flex flex-col border-l border-[#E5EAF0] bg-[#F8FAFC]">

        {/* Panel Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#E5EAF0] bg-white">
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.12em] mb-0.5">
            Ausgewählter Tag
          </p>
          <p className="text-[14px] font-bold text-[#111827] tracking-tight">
            {selectedDay.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {dayMeetings.length > 0 && (
            <p className="text-[11.5px] text-[#64748B] mt-0.5">
              {dayMeetings.length} {dayMeetings.length === 1 ? 'Meeting' : 'Meetings'}
            </p>
          )}
        </div>

        {/* Meetings des Tages */}
        <div className="flex-1 overflow-y-auto p-4">
          {dayMeetings.length === 0 ? (
            <DayEmptyState />
          ) : (
            <div className="flex flex-col gap-2">
              {dayMeetings.map(m => (
                <DayMeetingCard
                  key={m.id}
                  meeting={m}
                  onClick={() => onSelectMeeting(m.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer-Button */}
        <div className="px-4 py-4 border-t border-[#E5EAF0] bg-white">
          <button
            onClick={() => onOpenCreate(selectedDay)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12.5px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
          >
            <Plus size={13} strokeWidth={2.5} />
            Meeting für diesen Tag erstellen
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Kalender-Zelle ────────────────────────────────────────────────────────

function CalendarCell({ date, inMonth, isToday, isSelected, meetings, onClick }) {
  const isWeekend  = date.getDay() === 0 || date.getDay() === 6;
  const shown      = meetings.slice(0, 2);
  const extra      = meetings.length - 2;

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-stretch p-1 min-h-[68px] rounded-lg text-left
        transition-all duration-100 border
        ${isSelected
          ? 'bg-[#1E6FB5] border-[#1E6FB5] shadow-sm'
          : isToday
            ? 'bg-blue-50/50 border-[#1E6FB5]/35 hover:bg-blue-50'
            : 'border-transparent hover:bg-[#F5F7FA]'
        }
        ${!inMonth ? 'opacity-25' : ''}
      `}
    >
      {/* Tageszahl */}
      <span className={`text-[12px] font-semibold leading-none mb-1 self-end px-0.5 pt-0.5 ${
        isSelected ? 'text-white'
          : isToday ? 'text-[#1E6FB5]'
          : isWeekend ? 'text-[#94A3B8]'
          : 'text-[#111827]'
      }`}>
        {date.getDate()}
      </span>

      {/* Meeting-Pills */}
      <div className="flex flex-col gap-0.5 px-0.5">
        {shown.map(m => (
          <div
            key={m.id}
            className={`truncate rounded text-[8.5px] font-medium px-1 py-0.5 leading-tight ${
              isSelected
                ? 'bg-white/20 text-white'
                : m.analyzed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-blue-50 text-[#1E6FB5] border border-blue-200/60'
            }`}
            title={m.title}
          >
            {m.title}
          </div>
        ))}
        {extra > 0 && (
          <span className={`text-[8px] font-medium px-1 leading-tight ${
            isSelected ? 'text-white/70' : 'text-[#94A3B8]'
          }`}>
            +{extra} weitere
          </span>
        )}
      </div>
    </button>
  );
}

// ── Tages-Panel Sub-Komponenten ───────────────────────────────────────────

function DayEmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="w-10 h-10 bg-white border border-[#E5EAF0] rounded-xl flex items-center justify-center mb-3">
        <CalendarDays size={18} color="#94A3B8" strokeWidth={1.5} />
      </div>
      <p className="text-[12.5px] font-semibold text-[#111827] mb-1">
        Keine Meetings geplant
      </p>
      <p className="text-[11.5px] text-[#64748B] leading-relaxed max-w-[200px]">
        Für diesen Tag sind noch keine Meetings eingetragen.
      </p>
    </div>
  );
}

function DayMeetingCard({ meeting, onClick }) {
  const startTime    = formatTime(meeting.date ?? meeting.startDateTime);
  const endTime      = formatTime(meeting.endDateTime);
  const participants = meeting.participants;
  const pCount       = Array.isArray(participants) ? participants.length
                      : typeof participants === 'string' && participants.trim()
                        ? participants.split(',').length
                        : 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-[#E5EAF0] rounded-xl px-3.5 py-3 hover:border-[#1E6FB5]/35 hover:shadow-sm transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] font-semibold text-[#111827] group-hover:text-[#1E6FB5] transition-colors line-clamp-1 flex-1">
          {meeting.title}
        </p>
        {meeting.analyzed ? (
          <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-1.5 py-0.5 rounded flex-shrink-0 uppercase tracking-wide">
            KI
          </span>
        ) : (
          <span className="text-[9px] text-[#CBD5E1] border border-[#E5EAF0] px-1.5 py-0.5 rounded flex-shrink-0">
            —
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5 mt-1 flex-wrap">
        {(startTime || endTime) && (
          <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
            <Clock size={9.5} strokeWidth={2} />
            {startTime ?? '—'}{endTime ? ` – ${endTime}` : ''} Uhr
          </span>
        )}
        {pCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
            <Users size={9.5} strokeWidth={2} />
            {pCount} {pCount === 1 ? 'Person' : 'Personen'}
          </span>
        )}
      </div>
    </button>
  );
}

function NavBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-md border border-[#E5EAF0] flex items-center justify-center text-[#64748B] hover:bg-[#F5F7FA] hover:text-[#111827] transition-colors"
    >
      {children}
    </button>
  );
}

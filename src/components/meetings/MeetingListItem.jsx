/**
 * MeetingListItem.jsx v4
 * Neu: Meeting-Typ-Badge (Persönlich / Online) und Transkript-Badge.
 */

import { Clock, Users, Video } from 'lucide-react';

function formatDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(val)
    : d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  const h = d.getHours(), m = d.getMinutes();
  return h === 0 && m === 0 ? null : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function getStatusBadge(meeting) {
  // Prüfe ob Transkript vorhanden (verschiedene mögliche Feldnamen)
  const hasTranscript = !!(meeting.transcriptText ?? meeting.transcript);
  if (hasTranscript && !meeting.analyzed) {
    return { label: 'Transkript', cls: 'bg-blue-50 text-[#1E6FB5] border-blue-200' };
  }
  const hasOpenTasks =
    (meeting.openTaskCount > 0) ||
    (meeting.tasks?.filter(t => !t.completed && !t.done).length > 0);
  if (meeting.analyzed && hasOpenTasks) {
    return { label: 'Offene Aufgaben', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (meeting.analyzed) {
    return { label: 'Analysiert', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  return { label: 'Nicht analysiert', cls: 'bg-slate-50 text-[#94A3B8] border-[#E5EAF0]' };
}

function getTaskCount(m) {
  if (m.taskCount  !== undefined) return m.taskCount;
  if (m.analysis?.todos?.length)  return m.analysis.todos.length;
  if (m.tasks?.length)            return m.tasks.length;
  return null;
}

export default function MeetingListItem({ meeting, isSelected, onClick }) {
  const time      = formatTime(meeting.date ?? meeting.startDateTime);
  const taskCount = getTaskCount(meeting);
  const badge     = getStatusBadge(meeting);
  const isOnline  = meeting.meetingType === 'ONLINE';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl mb-0.5 border transition-all duration-100 ${
        isSelected
          ? 'bg-[#EEF5FD] border-[#1E6FB5]/25 shadow-sm'
          : 'border-transparent hover:bg-[#F8FAFC] hover:border-[#E5EAF0]'
      }`}
    >
      {/* Titel + Status */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className={`text-[12.5px] font-semibold leading-snug flex-1 line-clamp-1 ${isSelected ? 'text-[#1E6FB5]' : 'text-[#111827]'}`}>
          {meeting.title}
        </span>
        <span className={`text-[9.5px] font-semibold border px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 whitespace-nowrap ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {/* Datum + Zeit + Meeting-Typ */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-[#94A3B8]">
          {formatDate(meeting.date ?? meeting.startDateTime)}
        </span>
        {time && (
          <span className="flex items-center gap-0.5 text-[11px] text-[#94A3B8]">
            <Clock size={9} strokeWidth={2} />{time}
          </span>
        )}
        {/* Meeting-Typ-Badge */}
        {meeting.meetingType && (
          <span className={`flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded border ${
            isOnline
              ? 'bg-violet-50 text-violet-700 border-violet-200'
              : 'bg-slate-50 text-[#64748B] border-[#E5EAF0]'
          }`}>
            {isOnline
              ? <><Video size={8.5} strokeWidth={2} /> Online</>
              : <><Users size={8.5} strokeWidth={2} /> Persönlich</>
            }
          </span>
        )}
        {taskCount !== null && taskCount > 0 && (
          <span className="ml-auto text-[10px] font-semibold text-[#1E6FB5] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
            {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
          </span>
        )}
      </div>

      {/* Protokoll-Vorschau */}
      {meeting.protocol && (
        <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-1 mt-1">
          {meeting.protocol}
        </p>
      )}
    </button>
  );
}

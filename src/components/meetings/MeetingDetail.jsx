/**
 * MeetingDetail.jsx v5
 * ─────────────────────────────────────────────────────────────
 * Neu:
 *   - PDF-Export integriert
 *   - tasks Prop empfangen
 *   - meetingTasks für PDF gefiltert
 */

import {
  Pencil, Trash2, Users, Calendar, Clock, Sparkles,
  FileText, Loader2, CalendarPlus, Plus, MapPin,
  BrainCircuit, Video, Download,
} from 'lucide-react';
import AiAnalysisPanel from './AiAnalysisPanel.jsx';
import LiveTranscriptionPanel from './LiveTranscriptionPanel.jsx';
import { normalizeAnalysis } from '../../services/meetingApi.js';
import { exportMeetingPdf } from '../../services/pdfExport.js';

function formatDateLong(val) {
  if (!val) return '—';

  const d = new Date(val);

  return isNaN(d.getTime())
      ? String(val)
      : d.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
}

function formatTime(val) {
  if (!val) return null;

  const d = new Date(val);
  if (isNaN(d.getTime())) return null;

  const h = d.getHours();
  const m = d.getMinutes();

  return h === 0 && m === 0
      ? null
      : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function MeetingDetail({
                                        meeting,
                                        tasks = [],
                                        loading,
                                        analyzing,
                                        onAnalyze,
                                        onEdit,
                                        onDelete,
                                        onUpdate,
                                        onOpenCreate,
                                      }) {
  if (loading) {
    return (
        <div className="flex-1 flex items-center justify-center gap-2.5 text-[13px] text-[#64748B] bg-[#F8FAFC]">
          <Loader2 size={17} className="animate-spin text-[#1E6FB5]" />
          Meeting wird geladen …
        </div>
    );
  }

  if (!meeting) {
    return <EmptyDetail onOpenCreate={onOpenCreate} />;
  }

  const startTime = formatTime(meeting.date ?? meeting.startDateTime);
  const endTime = formatTime(meeting.endDateTime);
  const location = meeting.locationOrLink ?? meeting.location ?? null;
  const isOnline = meeting.meetingType === 'ONLINE';
  const analysis = meeting.analysis ? normalizeAnalysis(meeting.analysis) : null;
  const hasAnalysis = !!analysis;

  const meetingTasks = tasks.filter((task) =>
      String(task.meetingId ?? task.meeting?.id ?? '') === String(meeting.id)
  );

  async function handleAcceptTranscript(transcript) {
    if (!onUpdate) return;

    const current = meeting.protocol ?? '';
    const separator = current.trim() ? '\n\n— Transkript —\n' : '';
    const newProtocol = current + separator + transcript;

    try {
      await onUpdate(meeting.id, {
        title: meeting.title,
        date: meeting.date ?? meeting.startDateTime,
        participants: meeting.participants,
        protocol: newProtocol,
        meetingType: meeting.meetingType ?? null,
        locationOrLink: meeting.locationOrLink ?? null,
        endDateTime: meeting.endDateTime ?? null,
      });
    } catch (error) {
      console.error('Protokoll-Update fehlgeschlagen:', error);
    }
  }

  return (
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <div className="max-w-[760px] px-8 py-7">
          <div className="flex justify-end gap-1.5 mb-4">
            <ActionBtn
                title="PDF exportieren"
                onClick={() => exportMeetingPdf(meeting, meetingTasks)}
            >
              <Download size={13} />
            </ActionBtn>

            <ActionBtn title="Bearbeiten" onClick={() => onEdit(meeting)}>
              <Pencil size={13} />
            </ActionBtn>

            <ActionBtn
                title="Löschen"
                danger
                onClick={() => {
                  if (window.confirm(`„${meeting.title}" wirklich löschen?`)) {
                    onDelete(meeting.id);
                  }
                }}
            >
              <Trash2 size={13} />
            </ActionBtn>
          </div>

          <h2 className="text-[20px] font-bold text-[#111827] tracking-tight mb-2.5 leading-snug">
            {meeting.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <MetaChip icon={Calendar}>
              {formatDateLong(meeting.date ?? meeting.startDateTime)}
            </MetaChip>

            {(startTime || endTime) && (
                <MetaChip icon={Clock}>
                  {startTime ?? '—'}
                  {endTime ? ` – ${endTime}` : ''} Uhr
                </MetaChip>
            )}

            {location && (
                <MetaChip icon={MapPin}>
                  {location.startsWith('http') ? (
                      <a
                          href={location}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1E6FB5] hover:underline truncate max-w-[200px]"
                      >
                        {location}
                      </a>
                  ) : (
                      <span>{location}</span>
                  )}
                </MetaChip>
            )}

            <span className="text-[#CBD5E1] text-xs">·</span>

            <span className="text-[11.5px] text-[#94A3B8]">
            {meeting.code}
          </span>

            {meeting.meetingType && (
                <span
                    className={`flex items-center gap-1 text-[10.5px] font-semibold border px-2 py-0.5 rounded-md ${
                        isOnline
                            ? 'bg-violet-50 text-violet-700 border-violet-200'
                            : 'bg-slate-50 text-[#64748B] border-[#E5EAF0]'
                    }`}
                >
              {isOnline ? <Video size={10} /> : <Users size={10} />}
                  {isOnline ? 'Online-Meeting' : 'Persönliches Meeting'}
            </span>
            )}

            {meeting.analyzed ? (
                <span className="ml-auto text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
              Analysiert
            </span>
            ) : (
                <span className="ml-auto text-[10.5px] font-medium text-[#94A3B8] border border-[#E5EAF0] px-2 py-0.5 rounded-md">
              Nicht analysiert
            </span>
            )}
          </div>

          {meeting.participants?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-5">
                <Users size={12} className="text-[#94A3B8] flex-shrink-0" />
                {meeting.participants.map((participant, index) => (
                    <ParticipantPill key={index} name={participant} />
                ))}
              </div>
          )}

          <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm overflow-hidden mb-5">
            <div className="flex items-center gap-2 px-5 py-3 bg-[#F8FAFC] border-b border-[#E5EAF0]">
              <FileText size={12} className="text-[#94A3B8]" />
              <span className="text-[10.5px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
              Protokoll
            </span>
            </div>

            <div className="px-5 py-5 min-h-[80px]">
              {meeting.protocol ? (
                  <p className="text-[13.5px] text-[#111827] leading-[1.9] whitespace-pre-wrap">
                    {meeting.protocol}
                  </p>
              ) : (
                  <p className="text-[13px] text-[#94A3B8] italic">
                    Kein Protokolltext vorhanden.
                  </p>
              )}
            </div>
          </div>

          <div className="mb-5">
            <SectionDivider label="Live-Transkription" />

            <LiveTranscriptionPanel
                meeting={meeting}
                onAcceptTranscript={handleAcceptTranscript}
                onStartAiAnalysis={() => onAnalyze(meeting.id)}
            />
          </div>

          <div>
            <SectionDivider
                label="KI-Analyse"
                badge={hasAnalysis ? 'Analysiert mit KI' : null}
            />

            {!hasAnalysis ? (
                <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm px-6 py-8 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3 border border-[#E5EAF0]">
                    <BrainCircuit size={19} color="#94A3B8" strokeWidth={1.5} />
                  </div>

                  <p className="text-[13.5px] font-semibold text-[#111827] mb-1.5">
                    Noch keine KI-Analyse vorhanden
                  </p>

                  <p className="text-[12.5px] text-[#64748B] max-w-[300px] leading-relaxed mb-4">
                    Starte eine Analyse, um Zusammenfassung, Aufgaben, Entscheidungen und Risiken automatisch zu extrahieren.
                  </p>

                  <button
                      onClick={() => onAnalyze(meeting.id)}
                      disabled={analyzing}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-px transition-all duration-150"
                      style={{ background: 'linear-gradient(135deg, #1E6FB5, #7C3AED)' }}
                  >
                    {analyzing ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Analysiere …
                        </>
                    ) : (
                        <>
                          <Sparkles size={13} />
                          KI-Analyse starten
                        </>
                    )}
                  </button>
                </div>
            ) : (
                <>
                  <button
                      onClick={() => onAnalyze(meeting.id)}
                      disabled={analyzing}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white disabled:opacity-60 hover:-translate-y-px transition-all duration-150 mb-4"
                      style={{ background: 'linear-gradient(135deg, #1E6FB5, #7C3AED)' }}
                  >
                    {analyzing ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Analysiere …
                        </>
                    ) : (
                        <>
                          <Sparkles size={13} />
                          Erneut analysieren
                        </>
                    )}
                  </button>

                  <AiAnalysisPanel analysis={analysis} />
                </>
            )}
          </div>
        </div>
      </div>
  );
}

function SectionDivider({ label, badge }) {
  return (
      <div className="flex items-center gap-3 mb-4">
      <span className="text-[10.5px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
        {label}
      </span>

        <div className="flex-1 h-px bg-[#E5EAF0]" />

        {badge && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#1E6FB5] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
          <Sparkles size={9} />
              {badge}
        </span>
        )}
      </div>
  );
}

function EmptyDetail({ onOpenCreate }) {
  return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-10 bg-[#F8FAFC]">
        <div className="w-12 h-12 bg-white border border-[#E5EAF0] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <CalendarPlus size={22} color="#94A3B8" strokeWidth={1.5} />
        </div>

        <h3 className="text-[15px] font-semibold text-[#111827] mb-1.5">
          Kein Meeting ausgewählt
        </h3>

        <p className="text-[13px] text-[#64748B] max-w-[260px] leading-relaxed mb-1.5">
          Wähle ein Meeting aus der Liste oder erstelle ein neues Meeting.
        </p>

        <p className="text-[12px] text-[#94A3B8] max-w-[240px] leading-relaxed mb-5">
          Nach der Erstellung kannst du Protokolle erfassen, Live-Transkriptionen starten und eine KI-Analyse durchführen.
        </p>

        {onOpenCreate && (
            <button
                onClick={() => onOpenCreate()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
                style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
            >
              <Plus size={13} strokeWidth={2.5} />
              Neues Meeting erstellen
            </button>
        )}
      </div>
  );
}

function ActionBtn({ children, title, danger, onClick }) {
  return (
      <button
          onClick={onClick}
          title={title}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-150 ${
              danger
                  ? 'border-[#E5EAF0] text-[#94A3B8] hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                  : 'border-[#E5EAF0] text-[#94A3B8] hover:bg-[#F5F7FA] hover:text-[#111827]'
          }`}
      >
        {children}
      </button>
  );
}

function MetaChip({ icon: Icon, children }) {
  return (
      <span className="flex items-center gap-1.5 text-[12.5px] text-[#64748B]">
      <Icon size={12} className="text-[#94A3B8] flex-shrink-0" />
        {children}
    </span>
  );
}

function ParticipantPill({ name }) {
  return (
      <div className="flex items-center gap-1.5 bg-white border border-[#E5EAF0] rounded-full px-2.5 py-0.5">
        <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
        >
          {String(name).substring(0, 2).toUpperCase()}
        </div>

        <span className="text-[11.5px] font-medium text-[#111827]">
        {String(name).trim()}
      </span>
      </div>
  );
}
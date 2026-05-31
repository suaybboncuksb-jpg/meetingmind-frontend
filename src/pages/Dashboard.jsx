/**
 * Dashboard.jsx
 * ─────────────────────────────────────────────────────────────
 * Glasoptik-Ebenen (von subtil nach minimal):
 *   1. Seitenhintergrund   – helles Off-White + dezenter radialer Blau-Glow
 *   2. Hero-Card           – dunkles Frosted Glass (navy, backdrop-blur-xl)
 *   3. KPI-Cards           – helles White Glass (bg-white/80, backdrop-blur-md)
 *   4. Hinweis-Banner      – blaues Info Glass (bg-blue-50/70, backdrop-blur-md)
 *   5. Untere Panels       – leicht transparent (bg-white/90, backdrop-blur-sm)
 */

import {
    CalendarDays,
    Sparkles,
    CheckSquare,
    TrendingUp,
    ArrowRight,
    Info,
    User,
    Calendar,
    Plus,
    FileText,
    ListChecks,
    CircleDot,
    CircleCheck,
} from 'lucide-react';

// ── Hilfsfunktionen ───────────────────────────────────────────────────────

function formatDateShort(dateVal) {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    return isNaN(d.getTime())
        ? String(dateVal)
        : d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDay(v) {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '—' : d.getDate();
}

function getMonthShort(v) {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('de-DE', { month: 'short' });
}

// ── Workspace-Zustand berechnen ───────────────────────────────────────────
// A = keine Meetings      B = keine Analyse
// C = offene Tasks        D = alles aufgeräumt

function getDashboardState(meetings, stats, openCount) {
    if (meetings.length === 0) return 'A';
    if (stats.analyzed === 0)  return 'B';
    if (openCount > 0)         return 'C';
    return 'D';
}

function getNextStep(state) {
    const map = {
        A: { label: 'Nächster Schritt', text: 'Erstes Meeting erstellen',  page: 'meetings', isStatus: false },
        B: { label: 'Nächster Schritt', text: 'Meeting analysieren',       page: 'meetings', isStatus: false },
        C: { label: 'Nächster Schritt', text: 'Offene Aufgaben ansehen',   page: 'tasks',    isStatus: false },
        D: { label: 'Workspace-Status', text: 'Aktuell',                   page: null,       isStatus: true  },
    };
    return map[state];
}

function getHintConfig(state) {
    const map = {
        A: { text: 'Erstelle dein erstes Meeting, um Protokolle zu speichern und KI-Analysen zu starten.',                                                         actionLabel: 'Erstes Meeting erstellen', page: 'meetings' },
        B: { text: 'Noch keine KI-Analyse vorhanden. Starte eine Analyse in einem Meeting, um Zusammenfassungen und Aufgaben zu erzeugen.',                         actionLabel: 'Meetings öffnen',          page: 'meetings' },
        C: { text: 'Es liegen offene Aufgaben vor. Überprüfe den aktuellen Stand deiner Aufgabenliste.',                                                            actionLabel: 'Aufgaben ansehen',         page: 'tasks'    },
        D: null,
    };
    return map[state];
}

// ─────────────────────────────────────────────────────────────────────────
// HAUPT-KOMPONENTE
// ─────────────────────────────────────────────────────────────────────────

export default function Dashboard({
                                      meetings = [],
                                      tasks    = [],
                                      stats    = { total: 0, analyzed: 0, openTasks: 0, thisWeek: 0 },
                                      loading  = false,
                                      onSelectMeeting,
                                      onNavigate,
                                  }) {
    const openTasks  = tasks.filter(t => !t.completed && !t.done && t.status !== 'DONE');
    const state      = getDashboardState(meetings, stats, openTasks.length);
    const nextStep   = getNextStep(state);
    const hintConfig = getHintConfig(state);

    const kpis = [
        {
            value:     stats.total,
            label:     'Meetings gesamt',
            subLabel:  stats.total === 0      ? 'Noch kein Meeting angelegt'              : 'Alle erfassten Meetings',
            icon:      CalendarDays,
            iconBg:    'bg-blue-50/80',
            iconColor: '#1E6FB5',
        },
        {
            value:     stats.analyzed,
            label:     'KI-analysiert',
            subLabel:  stats.analyzed === 0   ? 'Keine Analyse vorhanden'                 : 'Meetings mit strukturierter Analyse',
            icon:      Sparkles,
            iconBg:    'bg-violet-50/80',
            iconColor: '#6D28D9',
        },
        {
            value:     stats.openTasks,
            label:     'Offene Aufgaben',
            subLabel:  stats.openTasks === 0  ? 'Keine offenen To-dos'                    : 'Aus Meeting-Analysen extrahiert',
            icon:      CheckSquare,
            iconBg:    'bg-emerald-50/80',
            iconColor: '#047857',
        },
        {
            value:     stats.thisWeek,
            label:     'Diese Woche',
            subLabel:  stats.thisWeek === 0   ? 'Keine Meetings diese Woche'              : 'Meetings im aktuellen Zeitraum',
            icon:      TrendingUp,
            iconBg:    'bg-slate-100/80',
            iconColor: '#475569',
        },
    ];

    return (
        /*
         * ── HINTERGRUND ─────────────────────────────────────────────
         * Basis: helles Off-White/Grau-Verlauf
         * Overlay: radialer Blau-Glow oben rechts (fixed, pointer-events-none)
         * → wirkt hochwertig, ohne bunt zu sein
         */
        <div
            className="flex-1 overflow-y-auto relative"
            style={{ background: 'linear-gradient(160deg, #F5F7FA 0%, #EEF2F7 100%)' }}
        >
            {/* Radialer Glow – dezent, nur sichtbar auf hellen Flächen dahinter */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background: [
                        'radial-gradient(circle at 78% 8%,  rgba(30,111,181,0.09) 0%, transparent 32%)',
                        'radial-gradient(circle at 15% 90%, rgba(30,111,181,0.04) 0%, transparent 25%)',
                    ].join(', '),
                }}
            />

            {/* Content-Container */}
            <div className="relative max-w-[1280px] mx-auto px-8 pt-8 pb-12 space-y-4">

                {/* ── Seitenkopf ─────────────────────────────────── */}
                <div className="pb-1">
                    <p className="text-[11px] font-semibold text-[#1E6FB5] uppercase tracking-[0.12em] mb-1.5">
                        Workspace
                    </p>
                    <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-[13px] text-[#64748B] mt-0.5">
                        Zentrale Übersicht für Meetings, KI-Analysen und Aufgaben.
                    </p>
                </div>

                {/* ── Hero Card ──────────────────────────────────── */}
                <HeroCard nextStep={nextStep} onNavigate={onNavigate} />

                {/* ── KPI Cards ──────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {kpis.map((kpi, i) => (
                        <StatCard key={i} kpi={kpi} loading={loading} />
                    ))}
                </div>

                {/* ── Kontextueller Hinweis ──────────────────────── */}
                {hintConfig && (
                    <DashboardHint config={hintConfig} onNavigate={onNavigate} />
                )}

                {/* ── Zweispaltiger Bereich ──────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <RecentMeetingsPanel
                        meetings={meetings}
                        loading={loading}
                        onSelectMeeting={onSelectMeeting}
                        onNavigate={onNavigate}
                    />
                    <OpenTasksPanel
                        tasks={openTasks}
                        hasMeetings={meetings.length > 0}
                        hasAnalysis={stats.analyzed > 0}
                        onNavigate={onNavigate}
                    />
                </div>

            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────
// HERO CARD
// Dunkles Frosted-Glass-Panel: Navy-Basis + backdrop-blur-xl + feiner Border
// ─────────────────────────────────────────────────────────────────────────

function HeroCard({ nextStep, onNavigate }) {
    return (
        <div
            className="rounded-2xl px-7 py-5 flex items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xl"
            style={{
                background: 'linear-gradient(160deg, rgba(13,33,55,0.97) 0%, rgba(16,42,66,0.94) 100%)',
                border:     '1px solid rgba(255,255,255,0.07)',
                boxShadow:  [
                    '0 8px 32px rgba(13,33,55,0.22)',
                    '0 1px 0 rgba(255,255,255,0.04) inset',
                ].join(', '),
            }}
        >
            {/* Dezenter innerer Glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 90% 50%, rgba(30,111,181,0.08) 0%, transparent 55%)',
                }}
            />

            {/* Linke Seite */}
            <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2.5">
          <span
              className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 px-2.5 py-1 rounded-md"
              style={{
                  background:  'rgba(52,211,153,0.08)',
                  border:      '1px solid rgba(52,211,153,0.14)',
              }}
          >
            <CircleDot size={9} strokeWidth={2.5} />
            Bereit zur Nutzung
          </span>
                </div>

                <h2 className="text-[17px] font-bold text-white tracking-tight mb-1.5">
                    MeetingMind Workspace
                </h2>
                <p className="text-[12.5px] leading-relaxed max-w-xl" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    Erfasse Meeting-Protokolle, starte KI-Analysen und verwalte automatisch
                    erkannte Aufgaben zentral an einem Ort.
                </p>
            </div>

            {/* Rechte Seite – Nächster Schritt */}
            <div
                className="relative z-10 flex-shrink-0 rounded-xl px-5 py-4 min-w-[175px] text-center backdrop-blur-md"
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border:     '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <p
                    className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-2"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                    {nextStep.label}
                </p>

                {nextStep.isStatus ? (
                    <div className="flex items-center justify-center gap-1.5">
                        <CircleCheck size={14} color="#34D399" strokeWidth={2} />
                        <span className="text-[13.5px] font-semibold text-emerald-400">
              {nextStep.text}
            </span>
                    </div>
                ) : (
                    <button
                        onClick={() => onNavigate(nextStep.page)}
                        className="flex items-center justify-center gap-1.5 w-full text-[12.5px] font-semibold text-white/80 hover:text-white transition-colors group"
                    >
                        {nextStep.text}
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────
// STAT CARD (KPI)
// Helles White-Glass: bg-white/80 + backdrop-blur-md + leichter Rand
// ─────────────────────────────────────────────────────────────────────────

function StatCard({ kpi, loading }) {
    const Icon = kpi.icon;

    if (loading) {
        return (
            <div
                className="rounded-xl p-5 animate-pulse backdrop-blur-md"
                style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(226,232,240,0.7)' }}
            >
                <div className="w-9 h-9 bg-slate-200/70 rounded-lg mb-3" />
                <div className="h-6 bg-slate-200/70 rounded-md w-1/3 mb-2" />
                <div className="h-2.5 bg-slate-200/70 rounded-full w-3/5" />
            </div>
        );
    }

    const isEmpty = kpi.value === 0;

    return (
        <div
            className="rounded-xl p-5 flex flex-col gap-3 backdrop-blur-md hover:-translate-y-px transition-all duration-150 cursor-default"
            style={{
                background:  'rgba(255,255,255,0.80)',
                border:      '1px solid rgba(226,232,240,0.65)',
                boxShadow:   '0 1px 3px rgba(13,33,55,0.06), 0 0 0 0.5px rgba(255,255,255,0.8) inset',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(13,33,55,0.09), 0 0 0 0.5px rgba(255,255,255,0.8) inset'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(13,33,55,0.06), 0 0 0 0.5px rgba(255,255,255,0.8) inset'; }}
        >
            <div className={`w-9 h-9 ${kpi.iconBg} rounded-lg flex items-center justify-center backdrop-blur-sm`}>
                <Icon size={17} color={isEmpty ? '#94A3B8' : kpi.iconColor} strokeWidth={2} />
            </div>
            <div>
                <p className={`text-[27px] font-bold leading-none tracking-tight ${isEmpty ? 'text-[#94A3B8]' : 'text-[#111827]'}`}>
                    {kpi.value}
                </p>
                <p className="text-[12.5px] font-semibold text-[#111827] mt-1.5">{kpi.label}</p>
                <p className={`text-[11.5px] mt-0.5 ${isEmpty ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    {kpi.subLabel}
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────
// DASHBOARD HINT
// Blaues Info-Glass: bg-blue-50/70 + backdrop-blur-md + blauer Rand
// ─────────────────────────────────────────────────────────────────────────

function DashboardHint({ config, onNavigate }) {
    return (
        <div
            className="flex items-start gap-3 rounded-xl px-4 py-3 backdrop-blur-md"
            style={{
                background: 'rgba(239,246,255,0.70)',
                border:     '1px solid rgba(147,197,253,0.45)',
            }}
        >
            <Info size={14} color="#1E6FB5" strokeWidth={2} className="flex-shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-[#1e40af] flex-1 leading-relaxed">
                {config.text}
            </p>
            <button
                onClick={() => onNavigate(config.page)}
                className="flex-shrink-0 flex items-center gap-1 text-[12px] font-semibold text-[#1E6FB5] hover:text-[#2B7EC7] transition-colors whitespace-nowrap"
            >
                {config.actionLabel}
                <ArrowRight size={11} />
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────
// RECENT MEETINGS PANEL
// Leichtes White-Glass: bg-white/90 + backdrop-blur-sm
// ─────────────────────────────────────────────────────────────────────────

function RecentMeetingsPanel({ meetings, loading, onSelectMeeting, onNavigate }) {
    const recent = meetings.slice(0, 5);

    return (
        <Panel>
            <PanelHeader
                icon={CalendarDays}
                title="Letzte Meetings"
                count={meetings.length > 0 ? meetings.length : null}
                action={meetings.length > 0 ? { label: 'Alle', onClick: () => onNavigate('meetings') } : null}
            />
            {loading ? (
                <MeetingsSkeleton />
            ) : meetings.length === 0 ? (
                <EmptyPanel
                    icon={CalendarDays}
                    title="Noch keine Meetings vorhanden"
                    description="Erstelle dein erstes Meeting, um Protokolle zu speichern und KI-Analysen zu starten."
                    action={{ label: 'Erstes Meeting erstellen', onClick: () => onNavigate('meetings') }}
                />
            ) : (
                <div className="divide-y divide-slate-100/80">
                    {recent.map(m => (
                        <MeetingRow key={m.id} meeting={m} onClick={() => onSelectMeeting(m.id)} />
                    ))}
                </div>
            )}
        </Panel>
    );
}

function MeetingRow({ meeting, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors duration-100 text-left group"
        >
            <div
                className="w-9 h-9 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(248,250,252,0.9)', border: '1px solid rgba(226,232,240,0.8)' }}
            >
                <span className="text-[13px] font-bold text-[#475569] leading-none">{getDay(meeting.date)}</span>
                <span className="text-[8.5px] font-semibold text-[#94A3B8] uppercase tracking-wide leading-tight">{getMonthShort(meeting.date)}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-[#111827] truncate group-hover:text-[#1E6FB5] transition-colors">
                    {meeting.title}
                </p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    {meeting.code} · {formatDateShort(meeting.date)}
                </p>
            </div>
            {meeting.analyzed ? (
                <span className="flex-shrink-0 text-[10.5px] font-semibold bg-emerald-50/80 text-emerald-700 border border-emerald-200/70 px-2 py-0.5 rounded-md backdrop-blur-sm">
          Analysiert
        </span>
            ) : (
                <span className="flex-shrink-0 text-[10.5px] font-medium text-[#94A3B8] border border-slate-200/70 px-2 py-0.5 rounded-md">
          Ausstehend
        </span>
            )}
        </button>
    );
}

function MeetingsSkeleton() {
    return (
        <div className="divide-y divide-slate-100/80">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                    <div className="w-9 h-9 bg-slate-200/60 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 bg-slate-200/60 rounded-full w-3/5" />
                        <div className="h-2 bg-slate-200/60 rounded-full w-2/5" />
                    </div>
                    <div className="w-14 h-5 bg-slate-200/60 rounded-md" />
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────
// OPEN TASKS PANEL
// ─────────────────────────────────────────────────────────────────────────

function OpenTasksPanel({ tasks, hasMeetings, hasAnalysis, onNavigate }) {
    const visible = tasks.slice(0, 5);

    function getEmptyConfig() {
        if (!hasMeetings || !hasAnalysis) {
            return {
                title:       'Keine offenen Aufgaben',
                description: 'Aufgaben erscheinen hier, sobald ein Meeting analysiert wurde.',
                action:      { label: hasMeetings ? 'Meeting analysieren' : 'Meeting erstellen', onClick: () => onNavigate('meetings') },
            };
        }
        return {
            title:       'Keine offenen Aufgaben',
            description: 'Alle extrahierten Aufgaben wurden abgeschlossen.',
            action:      null,
        };
    }

    return (
        <Panel>
            <PanelHeader
                icon={CheckSquare}
                title="Offene Aufgaben"
                count={tasks.length > 0 ? tasks.length : null}
                action={tasks.length > 0 ? { label: 'Alle', onClick: () => onNavigate('tasks') } : null}
            />
            {tasks.length === 0 ? (
                <EmptyPanel {...getEmptyConfig()} icon={ListChecks} />
            ) : (
                <div className="divide-y divide-slate-100/80">
                    {visible.map((task, i) => <TaskRow key={task.id ?? i} task={task} />)}
                </div>
            )}
        </Panel>
    );
}

function TaskRow({ task }) {
    const title       = task.title ?? task.text ?? task.task ?? 'Aufgabe';
    const owner       = task.owner ?? task.assignee ?? task.responsible ?? '';
    const deadline    = task.deadline ?? task.dueDate ?? task.due ?? '';
    const meetingName = task.meetingTitle ?? task.meeting?.title ?? '';

    return (
        <div className="flex items-start gap-2.5 px-5 py-3 hover:bg-slate-50/80 transition-colors duration-100">
            <div className="w-3.5 h-3.5 rounded border border-slate-300/80 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium text-[#111827] truncate mb-1">{title}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                    {meetingName && (
                        <span className="flex items-center gap-1 text-[10.5px] font-medium text-[#1E6FB5] px-1.5 py-0.5 rounded max-w-[150px] truncate"
                              style={{ background: 'rgba(239,246,255,0.8)', border: '1px solid rgba(147,197,253,0.5)' }}>
              <FileText size={8.5} strokeWidth={2} />{meetingName}
            </span>
                    )}
                    {owner && (
                        <span className="flex items-center gap-1 text-[10.5px] text-[#64748B] px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(226,232,240,0.7)' }}>
              <User size={8.5} strokeWidth={2} />{owner}
            </span>
                    )}
                    {deadline && (
                        <span className="flex items-center gap-1 text-[10.5px] text-[#64748B] px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(226,232,240,0.7)' }}>
              <Calendar size={8.5} strokeWidth={2} />{deadline}
            </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────
// WIEDERVERWENDBARE PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────

/** Panel-Wrapper: leichtes White-Glass, nicht zu transparent */
function Panel({ children }) {
    return (
        <div
            className="rounded-2xl flex flex-col overflow-hidden backdrop-blur-sm"
            style={{
                background: 'rgba(255,255,255,0.90)',
                border:     '1px solid rgba(226,232,240,0.70)',
                boxShadow:  '0 1px 3px rgba(13,33,55,0.05), 0 0 0 0.5px rgba(255,255,255,0.7) inset',
            }}
        >
            {children}
        </div>
    );
}

/** Panel-Header */
function PanelHeader({ icon: Icon, title, count, action }) {
    return (
        <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: '1px solid rgba(226,232,240,0.70)' }}
        >
            <div className="flex items-center gap-2">
                <Icon size={14} color="#64748B" strokeWidth={2} />
                <h3 className="text-[13px] font-semibold text-[#111827]">{title}</h3>
                {count !== null && (
                    <span className="text-[11px] font-semibold bg-slate-100/80 text-[#64748B] px-1.5 py-0.5 rounded">
            {count}
          </span>
                )}
            </div>
            {action && (
                <button
                    onClick={action.onClick}
                    className="flex items-center gap-0.5 text-[12px] font-medium text-[#1E6FB5] hover:text-[#2B7EC7] transition-colors"
                >
                    {action.label} <ArrowRight size={11} />
                </button>
            )}
        </div>
    );
}

/** Empty Panel */
function EmptyPanel({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center text-center px-6 py-8">
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm"
                style={{ background: 'rgba(241,245,249,0.85)', border: '1px solid rgba(226,232,240,0.7)' }}
            >
                <Icon size={17} color="#94A3B8" strokeWidth={1.8} />
            </div>
            <p className="text-[13px] font-semibold text-[#111827] mb-1">{title}</p>
            <p className="text-[12px] text-[#64748B] leading-relaxed max-w-[220px] mb-3.5">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
                    style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
                >
                    <Plus size={12} strokeWidth={2.5} />
                    {action.label}
                </button>
            )}
        </div>
    );
}
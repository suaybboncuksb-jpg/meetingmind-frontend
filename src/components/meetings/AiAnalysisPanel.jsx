/**
 * AiAnalysisPanel.jsx
 * ─────────────────────────────────────────────────────────────
 * Strukturierte KI-Analyse-Cards.
 * Wird nur gerendert wenn analysis-Objekt vorhanden ist.
 * Der "Noch keine Analyse"-Leer-Zustand liegt in MeetingDetail.jsx.
 */

import {
  FileText, CheckSquare, Lightbulb, HelpCircle,
  AlertTriangle, ArrowRight, User, Calendar, BrainCircuit,
} from 'lucide-react';

// ── Abschnitts-Konfiguration ──────────────────────────────────────────────
const SECTIONS = [
  {
    key: 'summary',
    label: 'Zusammenfassung',
    icon: FileText,
    color: '#1E6FB5',
    iconBg: 'bg-blue-50',
    headerBg: 'bg-blue-50/40',
    border: 'border-blue-100',
    titleColor: 'text-blue-700',
    isText: true,
  },
  {
    key: 'todos',
    label: 'To-Dos',
    icon: CheckSquare,
    color: '#6D28D9',
    iconBg: 'bg-violet-50',
    headerBg: 'bg-violet-50/40',
    border: 'border-violet-100',
    titleColor: 'text-violet-700',
    isTodo: true,
  },
  {
    key: 'decisions',
    label: 'Entscheidungen',
    icon: Lightbulb,
    color: '#047857',
    iconBg: 'bg-emerald-50',
    headerBg: 'bg-emerald-50/40',
    border: 'border-emerald-100',
    titleColor: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  {
    key: 'questions',
    label: 'Offene Fragen',
    icon: HelpCircle,
    color: '#0369A1',
    iconBg: 'bg-sky-50',
    headerBg: 'bg-sky-50/40',
    border: 'border-sky-100',
    titleColor: 'text-sky-700',
    dot: 'bg-sky-500',
  },
  {
    key: 'risks',
    label: 'Risiken & Blocker',
    icon: AlertTriangle,
    color: '#B91C1C',
    iconBg: 'bg-red-50',
    headerBg: 'bg-red-50/40',
    border: 'border-red-100',
    titleColor: 'text-red-700',
    dot: 'bg-red-500',
  },
  {
    key: 'nextSteps',
    label: 'Nächste Schritte',
    icon: ArrowRight,
    color: '#B45309',
    iconBg: 'bg-amber-50',
    headerBg: 'bg-amber-50/40',
    border: 'border-amber-100',
    titleColor: 'text-amber-700',
    dot: 'bg-amber-500',
  },
];

// ─────────────────────────────────────────────────────────────────────────
export default function AiAnalysisPanel({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="flex flex-col gap-3">
      {SECTIONS.map(section => {
        const data = analysis[section.key];
        if (!data || (Array.isArray(data) && data.length === 0)) return null;
        return <InsightCard key={section.key} section={section} data={data} />;
      })}

      {/* Gemini-Hinweis */}
      <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] pt-1 border-t border-[#E5EAF0]">
        <BrainCircuit size={11} strokeWidth={1.8} />
        Analysiert mit Google Gemini
      </div>
    </div>
  );
}

// ── Insight Card ─────────────────────────────────────────────────────────

function InsightCard({ section, data }) {
  const Icon  = section.icon;
  const count = Array.isArray(data) ? data.length : null;

  return (
    <div className={`bg-white rounded-xl border ${section.border} shadow-sm overflow-hidden`}>
      <div className={`flex items-center gap-2 px-4 py-2.5 ${section.headerBg} border-b ${section.border}`}>
        <div className={`w-6 h-6 ${section.iconBg} rounded-md flex items-center justify-center flex-shrink-0`}>
          <Icon size={13} color={section.color} strokeWidth={2} />
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-[0.06em] ${section.titleColor}`}>
          {section.label}
        </span>
        {count !== null && (
          <span className="ml-auto text-[10.5px] font-medium text-[#94A3B8]">
            {count} {count === 1 ? 'Eintrag' : 'Einträge'}
          </span>
        )}
      </div>

      <div className="px-4 py-3.5">
        {section.isText && (
          <p className="text-[13px] text-[#111827] leading-relaxed">{data}</p>
        )}
        {section.isTodo && Array.isArray(data) && (
          <div className="flex flex-col divide-y divide-[#F1F5F9]">
            {data.map((item, i) => <TodoRow key={i} item={item} />)}
          </div>
        )}
        {!section.isText && !section.isTodo && Array.isArray(data) && (
          <ul className="flex flex-col gap-2">
            {data.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#111827] leading-snug">
                <span className={`w-1.5 h-1.5 ${section.dot} rounded-full mt-1.5 flex-shrink-0`} />
                <span>
                  {typeof item === 'string'
                    ? item
                    : (item.text ?? item.description ?? JSON.stringify(item))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── To-Do Zeile ───────────────────────────────────────────────────────────

function TodoRow({ item }) {
  const title    = typeof item === 'string' ? item : (item.title ?? item.text ?? item.task ?? String(item));
  const owner    = typeof item === 'object' ? (item.owner    ?? item.assignee   ?? item.responsible ?? '') : '';
  const deadline = typeof item === 'object' ? (item.deadline ?? item.dueDate    ?? item.due          ?? '') : '';
  const priority = typeof item === 'object' ? (item.priority ?? '') : '';

  const priorityStyle =
    priority === 'HOCH'   || priority === 'HIGH'
      ? 'bg-red-50 text-red-700 border-red-200'
      : priority === 'MITTEL' || priority === 'MEDIUM'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-50 text-[#64748B] border-[#E5EAF0]';

  return (
    <div className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
      <input type="checkbox" className="custom-checkbox mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-medium text-[#111827] mb-1.5 leading-snug">{title}</p>
        <div className="flex flex-wrap gap-1.5">
          {priority && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${priorityStyle}`}>
              {priority}
            </span>
          )}
          {owner && (
            <span className="flex items-center gap-1 text-[10.5px] text-[#64748B] bg-slate-50 border border-[#E5EAF0] px-1.5 py-0.5 rounded">
              <User size={9} strokeWidth={2} />{owner}
            </span>
          )}
          {deadline && (
            <span className="flex items-center gap-1 text-[10.5px] text-[#64748B] bg-slate-50 border border-[#E5EAF0] px-1.5 py-0.5 rounded">
              <Calendar size={9} strokeWidth={2} />{deadline}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

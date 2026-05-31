/**
 * MeetingList.jsx v4
 * Kleines Update: Empty-State-Text erwähnt Transkriptionen.
 */

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import MeetingListItem from './MeetingListItem.jsx';

const FILTERS = [
  { id: 'all',      label: 'Alle'             },
  { id: 'analyzed', label: 'Analysiert'       },
  { id: 'pending',  label: 'Nicht analysiert' },
];

export default function MeetingList({ meetings, selectedId, onSelect, onOpenCreate }) {
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = meetings
    .filter(m => {
      if (filter === 'analyzed') return  m.analyzed;
      if (filter === 'pending')  return !m.analyzed;
      return true;
    })
    .filter(m =>
      !query.trim() ||
      (m.title ?? '').toLowerCase().includes(query.toLowerCase()) ||
      (m.code  ?? '').toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div className="flex flex-col w-[285px] min-w-[285px] border-r border-[#E5EAF0] bg-white h-full">

      <div className="px-4 pt-4 pb-3 border-b border-[#E5EAF0]">
        {/* Titelzeile */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-[#111827]">Meetings</span>
            {meetings.length > 0 && (
              <span className="text-[10.5px] font-semibold text-[#64748B] bg-[#F5F7FA] border border-[#E5EAF0] px-1.5 py-0.5 rounded-md">
                {meetings.length}
              </span>
            )}
          </div>
          <button
            onClick={() => onOpenCreate()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-semibold text-[#1E6FB5] bg-blue-50 border border-blue-100/80 hover:bg-blue-100 transition-all duration-150"
          >
            <Plus size={12} strokeWidth={2.5} />
            Neu
          </button>
        </div>

        {/* Suchfeld */}
        <div className="relative mb-3">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Meeting suchen ..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#F5F7FA] border border-[#E5EAF0] rounded-lg text-[12.5px] text-[#111827] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:border-[#1E6FB5]/40 focus:shadow-[0_0_0_3px_rgba(30,111,181,0.06)] transition-all duration-150"
          />
        </div>

        {/* Filter */}
        <div className="grid grid-cols-3 rounded-lg overflow-hidden border border-[#E5EAF0] divide-x divide-[#E5EAF0]">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`py-1.5 text-[11px] font-semibold transition-colors duration-100 ${
                filter === f.id
                  ? 'bg-[#1E6FB5] text-white'
                  : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <EmptyState hasQuery={!!query.trim()} query={query} filter={filter} onOpenCreate={onOpenCreate} />
        ) : (
          filtered.map(m => (
            <MeetingListItem
              key={m.id}
              meeting={m}
              isSelected={selectedId === m.id}
              onClick={() => onSelect(m.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState({ hasQuery, query, filter, onOpenCreate }) {
  if (hasQuery) return (
    <div className="px-4 py-8 text-center">
      <p className="text-[12.5px] font-semibold text-[#111827] mb-1">Keine Ergebnisse</p>
      <p className="text-[11.5px] text-[#94A3B8] leading-relaxed">Kein Meeting enthält „{query}".</p>
    </div>
  );
  if (filter !== 'all') return (
    <div className="px-4 py-8 text-center">
      <p className="text-[12.5px] font-semibold text-[#111827] mb-1">Keine Meetings in dieser Kategorie</p>
      <p className="text-[11.5px] text-[#94A3B8] leading-relaxed">
        {filter === 'analyzed' ? 'Noch kein Meeting wurde analysiert.' : 'Alle Meetings wurden bereits analysiert.'}
      </p>
    </div>
  );
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-[13px] font-semibold text-[#111827] mb-1.5">Noch keine Meetings vorhanden</p>
      <p className="text-[12px] text-[#64748B] leading-relaxed mb-4 max-w-[200px] mx-auto">
        Erstelle dein erstes Meeting, um Protokolle zu speichern, Transkriptionen zu erfassen und KI-Analysen zu starten.
      </p>
      <button
        onClick={() => onOpenCreate()}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
        style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
      >
        <Plus size={12} strokeWidth={2.5} />
        Meeting erstellen
      </button>
    </div>
  );
}

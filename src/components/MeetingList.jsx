import { Search, Plus } from "lucide-react";

function Badge({ meeting }) {
  if (meeting.aiSummary) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Analysiert</span>;
  if (meeting.protocolText) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Offen</span>;
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Entwurf</span>;
}

export default function MeetingList({ meetings, selected, onSelect, onNew, search, setSearch }) {
  const filtered = meetings.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="w-[300px] min-h-screen bg-white border-r border-slate-100 flex flex-col shrink-0">
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-slate-800">
            Meetings <span className="ml-1.5 bg-[#1e6fb5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{meetings.length}</span>
          </h2>
          <button onClick={onNew} className="w-7 h-7 rounded-lg bg-[#1e6fb5] text-white flex items-center justify-center hover:bg-[#175d99] transition-colors">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-[10px] px-3 py-2">
          <Search size={13} className="text-slate-400" />
          <input className="bg-transparent text-[13px] outline-none w-full text-slate-700 placeholder-slate-400"
            placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-[13px]">Keine Meetings gefunden</div>}
        {filtered.map(m => (
          <button key={m.id} onClick={() => onSelect(m)}
            className={`w-full text-left px-4 py-3 border-l-[3px] transition-all
              ${selected?.id === m.id ? "bg-blue-50 border-l-[#1e6fb5]" : "border-l-transparent hover:bg-slate-50"}`}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-[13px] font-semibold text-slate-800 leading-snug line-clamp-1">{m.title}</span>
              <Badge meeting={m} />
            </div>
            <p className="text-[11px] text-slate-400">{m.location || "Kein Ort"} · {new Date(m.meetingDate).toLocaleDateString("de-DE")}</p>
            {m.protocolText && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{m.protocolText.substring(0, 80)}...</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

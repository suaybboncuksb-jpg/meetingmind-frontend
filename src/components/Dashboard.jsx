import { Calendar, Sparkles, CheckSquare, TrendingUp } from "lucide-react";

export default function Dashboard({ meetings, onSelectMeeting }) {
  const analyzed = meetings.filter(m => m.aiSummary).length;
  const totalTasks = meetings.flatMap(m => m.tasks || []).length;
  const recent = meetings.slice(0, 5);

  const stats = [
    { label: "Meetings gesamt", value: meetings.length, icon: Calendar, color: "bg-blue-50 text-[#1e6fb5]" },
    { label: "KI-analysiert", value: analyzed, icon: Sparkles, color: "bg-violet-50 text-violet-600" },
    { label: "Offene Tasks", value: totalTasks, icon: CheckSquare, color: "bg-emerald-50 text-emerald-600" },
    { label: "Diese Woche", value: meetings.filter(m => {
      const d = new Date(m.meetingDate);
      const now = new Date();
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length, icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f7fa] p-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-[14px] text-slate-400">Ubersicht aller Meeting-Aktivitaten</p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-[14px] border border-slate-100 p-5" style={{boxShadow: "0 1px 4px rgba(0,0,0,0.05)"}}>
            <div className={`w-9 h-9 rounded-[10px] ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <p className="text-[28px] font-bold text-slate-900 leading-none mb-1">{value}</p>
            <p className="text-[12px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-[14px] border border-slate-100 overflow-hidden" style={{boxShadow: "0 1px 4px rgba(0,0,0,0.05)"}}>
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-slate-800">Letzte Meetings</h2>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-[13px]">Noch keine Meetings vorhanden.</div>
        ) : (
          <div>
            {recent.map(m => (
              <button key={m.id} onClick={() => onSelectMeeting(m)}
                className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{m.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.location || "Kein Ort"} · {new Date(m.meetingDate).toLocaleDateString("de-DE")}</p>
                </div>
                {m.aiSummary
                  ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Analysiert</span>
                  : m.protocolText
                  ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Offen</span>
                  : <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Entwurf</span>
                }
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

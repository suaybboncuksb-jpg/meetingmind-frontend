import { Pencil, Trash2, Users } from "lucide-react";
import AiInsightCards from "./AiInsightCards";

export default function MeetingDetail({ meeting, onAnalyze, analyzing, onDelete, onEdit }) {
  if (!meeting) return null;
  const participants = (meeting.participants || []).map(p => typeof p === "string" ? p : p?.name).filter(Boolean);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#f5f7fa]">
      <div className="bg-white border-b border-slate-100 px-8 py-5 sticky top-0 z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-bold text-slate-900 mb-1">{meeting.title}</h1>
            <p className="text-[13px] text-slate-400">
              {meeting.location || "Kein Ort"} · {new Date(meeting.meetingDate).toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onEdit} className="p-2 rounded-[9px] border border-slate-200 hover:bg-slate-50 transition-colors">
              <Pencil size={14} className="text-slate-500" />
            </button>
            <button onClick={() => onDelete(meeting.id)} className="p-2 rounded-[9px] border border-red-100 hover:bg-red-50 transition-colors">
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        </div>
        {participants.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <Users size={13} className="text-slate-400" />
            <div className="flex gap-1.5 flex-wrap">
              {participants.map(p => (
                <span key={p} className="text-[11px] bg-blue-50 text-[#1e6fb5] font-medium px-2.5 py-0.5 rounded-full">{p}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="px-8 py-6 flex flex-col gap-6">
        <div className="bg-white rounded-[14px] border border-slate-100 p-5" style={{boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Protokoll</h3>
          <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
            {meeting.protocolText || "Kein Protokolltext vorhanden."}
          </p>
        </div>
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">KI-Analyse</h3>
          <AiInsightCards meeting={meeting} onAnalyze={() => onAnalyze(meeting.id)} analyzing={analyzing} />
        </div>
      </div>
    </div>
  );
}

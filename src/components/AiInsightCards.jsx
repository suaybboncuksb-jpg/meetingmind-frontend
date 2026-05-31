import { Sparkles, CheckSquare, Lightbulb, HelpCircle, AlertTriangle, ArrowRight } from "lucide-react";

const SECTIONS = [
  { key: "decisions", label: "Entscheidungen", icon: Lightbulb, bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", icon_bg: "bg-emerald-100", dot: "bg-emerald-500" },
  { key: "openQuestions", label: "Offene Fragen", icon: HelpCircle, bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", icon_bg: "bg-amber-100", dot: "bg-amber-500" },
  { key: "risks", label: "Risiken & Blocker", icon: AlertTriangle, bg: "bg-red-50", border: "border-red-100", text: "text-red-700", icon_bg: "bg-red-100", dot: "bg-red-500" },
  { key: "nextSteps", label: "Nächste Schritte", icon: ArrowRight, bg: "bg-blue-50", border: "border-blue-100", text: "text-[#1e6fb5]", icon_bg: "bg-blue-100", dot: "bg-[#1e6fb5]" },
];

function parseAiSummary(text) {
  if (!text) return { summary: "", decisions: [], openQuestions: [], risks: [], nextSteps: [] };
  const lines = text.split("\n");
  const result = { summary: "", decisions: [], openQuestions: [], risks: [], nextSteps: [] };
  let current = "summary";
  lines.forEach(line => {
    const l = line.trim();
    if (!l) return;
    if (l.includes("Entscheidungen")) { current = "decisions"; return; }
    if (l.includes("Offene Fragen")) { current = "openQuestions"; return; }
    if (l.includes("Risiken")) { current = "risks"; return; }
    if (l.includes("Nächste Schritte")) { current = "nextSteps"; return; }
    if (l.startsWith("•")) {
      if (Array.isArray(result[current])) result[current].push(l.replace("•", "").trim());
    } else if (current === "summary") {
      result.summary += (result.summary ? " " : "") + l;
    }
  });
  return result;
}

export default function AiInsightCards({ meeting, onAnalyze, analyzing }) {
  const parsed = parseAiSummary(meeting?.aiSummary);
  const hasAnalysis = !!meeting?.aiSummary;

  return (
    <div>
      <div className="mb-5">
        <button onClick={onAnalyze} disabled={analyzing}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-[#1e6fb5] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#175d99] transition-all disabled:opacity-60 shadow-sm">
          {analyzing ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyse läuft...</>
          ) : (
            <><Sparkles size={15} />KI-Analyse starten</>
          )}
        </button>
      </div>

      {!hasAnalysis && !analyzing && (
        <div className="bg-white rounded-[14px] border border-slate-100 p-8 text-center" style={{boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={22} className="text-[#1e6fb5]" />
          </div>
          <p className="text-[14px] font-semibold text-slate-700 mb-1">Noch keine KI-Analyse</p>
          <p className="text-[12px] text-slate-400">Starte die Analyse um Zusammenfassung, Aufgaben und Insights zu erhalten.</p>
        </div>
      )}

      {hasAnalysis && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-[14px] border border-slate-100 overflow-hidden" style={{boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
            <div className="flex items-center gap-2.5 px-5 py-3.5 bg-blue-50 border-b border-blue-100">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Sparkles size={14} className="text-[#1e6fb5]" />
              </div>
              <span className="text-[12px] font-bold text-[#1e6fb5] uppercase tracking-wide">Zusammenfassung</span>
            </div>
            <p className="px-5 py-4 text-[13.5px] text-slate-700 leading-relaxed">{parsed.summary}</p>
          </div>

          {meeting.tasks && meeting.tasks.length > 0 && (
            <div className="bg-white rounded-[14px] border border-violet-100 overflow-hidden" style={{boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
              <div className="flex items-center gap-2.5 px-5 py-3.5 bg-violet-50 border-b border-violet-100">
                <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <CheckSquare size={14} className="text-violet-600" />
                </div>
                <span className="text-[12px] font-bold text-violet-700 uppercase tracking-wide">To-dos ({meeting.tasks.length})</span>
              </div>
              <div className="px-5 py-3 flex flex-col gap-2">
                {meeting.tasks.map((task, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-4 h-4 rounded border-2 border-violet-300 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[13px] text-slate-700">{task.description}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {task.assignedTo && <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{task.assignedTo}</span>}
                        {task.dueDate && task.dueDate !== "null" && <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{task.dueDate}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {SECTIONS.map(({ key, label, icon: Icon, bg, border, text, icon_bg, dot }) => {
            const items = parsed[key];
            if (!items || items.length === 0) return null;
            return (
              <div key={key} className={`bg-white rounded-[14px] border ${border} overflow-hidden`} style={{boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
                <div className={`flex items-center gap-2.5 px-5 py-3.5 ${bg} border-b ${border}`}>
                  <div className={`w-7 h-7 rounded-lg ${icon_bg} flex items-center justify-center`}>
                    <Icon size={14} className={text} />
                  </div>
                  <span className={`text-[12px] font-bold ${text} uppercase tracking-wide`}>{label}</span>
                </div>
                <ul className="px-5 py-3 flex flex-col gap-1.5">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-700 py-1">
                      <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

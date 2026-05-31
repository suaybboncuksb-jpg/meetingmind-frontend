import { LayoutDashboard, Calendar, CheckSquare, Sparkles, Archive, Settings } from "lucide-react";

const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "meetings", icon: Calendar, label: "Meetings" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
  { id: "insights", icon: Sparkles, label: "AI Insights" },
  { id: "archive", icon: Archive, label: "Archive" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ active, setActive }) {
  return (
    <div className="w-[220px] min-h-screen bg-[#0d2137] flex flex-col py-6 px-3 shrink-0">
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 rounded-[9px] bg-[#1e6fb5] flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="text-white font-semibold text-[15px] tracking-tight">MeetingMind</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActive(id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[9px] text-[13.5px] transition-all w-full text-left
              ${active === id ? "bg-[rgba(30,111,181,0.35)] text-white font-medium" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2.5 px-3 pt-4 border-t border-white/10">
        <div className="w-8 h-8 rounded-full bg-[#1e6fb5] flex items-center justify-center text-white text-xs font-semibold">SB</div>
        <div>
          <p className="text-white text-[12px] font-medium">Suayb B.</p>
          <p className="text-white/40 text-[11px]">Administrator</p>
        </div>
      </div>
    </div>
  );
}

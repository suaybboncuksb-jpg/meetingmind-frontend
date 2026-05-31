import { Calendar } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f7fa]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-card flex items-center justify-center mx-auto mb-4">
          <Calendar size={28} className="text-[#1e6fb5]" />
        </div>
        <h3 className="text-[15px] font-semibold text-slate-700 mb-1">Kein Meeting ausgewählt</h3>
        <p className="text-[13px] text-slate-400">Wähle ein Meeting aus der Liste oder erstelle ein neues.</p>
      </div>
    </div>
  );
}

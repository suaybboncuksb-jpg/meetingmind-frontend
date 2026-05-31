/**
 * ConsentModal.jsx
 * ─────────────────────────────────────────────────────────────
 * Pflichtschritt vor dem Start jeder Live-Transkription.
 * Der „Transkription starten"-Button bleibt deaktiviert,
 * bis die Zustimmungs-Checkbox aktiviert wurde.
 *
 * Datenschutzhinweis: Keine Transkription startet ohne diese Bestätigung.
 */

import { useState } from 'react';
import { ShieldCheck, X, Mic } from 'lucide-react';

export default function ConsentModal({ onConfirm, onClose }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(13,33,55,0.45)', backdropFilter: 'blur(5px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-[0_20px_60px_rgba(13,33,55,0.18)] animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} color="#D97706" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#111827] tracking-tight">
                Zustimmung erforderlich
              </h2>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                Datenschutzhinweis vor der Transkription
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-[#E5EAF0] flex items-center justify-center text-[#94A3B8] hover:text-[#111827] hover:bg-[#F5F7FA] transition-all flex-shrink-0 ml-3"
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">

          {/* Hinweis-Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 mb-5">
            <p className="text-[12.5px] text-amber-800 leading-relaxed">
              Bitte bestätige, dass alle Meeting-Teilnehmer über die Live-Transkription
              informiert wurden und ihr Einverständnis erteilt haben.
              Die Transkription darf erst beginnen, wenn diese Bestätigung vorliegt.
            </p>
          </div>

          {/* Was passiert */}
          <div className="mb-5 space-y-2">
            <InfoRow icon={Mic}>
              Gesprochene Inhalte werden über das Mikrofon dieses Geräts erfasst.
            </InfoRow>
            <InfoRow icon={ShieldCheck}>
              Das Transkript wird lokal verarbeitet und nicht an externe Dienste gesendet.
            </InfoRow>
            <InfoRow icon={ShieldCheck}>
              Die Aufnahme kann jederzeit pausiert oder beendet werden.
            </InfoRow>
          </div>

          {/* Zustimmungs-Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#CBD5E1] text-[#1E6FB5] cursor-pointer flex-shrink-0 accent-[#1E6FB5]"
            />
            <span className="text-[13px] text-[#111827] leading-relaxed group-hover:text-[#1E6FB5] transition-colors">
              Ich bestätige, dass alle Teilnehmer über die Live-Transkription informiert
              wurden und ihr Einverständnis erteilt haben.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[#E5EAF0] bg-[#F8FAFC]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium text-[#64748B] border border-[#E5EAF0] bg-white hover:bg-[#F5F7FA] transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={() => confirmed && onConfirm()}
            disabled={!confirmed}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:-translate-y-px"
            style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
          >
            <Mic size={13} strokeWidth={2} />
            Transkription starten
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-2.5 text-[12px] text-[#64748B]">
      <Icon size={13} className="text-[#94A3B8] flex-shrink-0 mt-0.5" strokeWidth={2} />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

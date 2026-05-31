/**
 * LiveTranscriptionPanel.jsx
 * ─────────────────────────────────────────────────────────────
 * Vollständiges Transkriptions-Panel.
 *
 * Zustände:
 *   idle     → „Live-Transkription starten" Button
 *   consent  → ConsentModal wird angezeigt
 *   listening → Transkription läuft (Dauer, Pause, Beenden)
 *   paused   → Pausiert (Fortsetzen, Beenden)
 *   stopped  → Beendet (Transkript anzeigen, ins Protokoll übernehmen, KI-Analyse)
 *
 * Props:
 *   meeting             – aktuelles Meeting-Objekt
 *   onAcceptTranscript  – (transcript: string) => void
 *   onStartAiAnalysis   – () => void
 *   language            – optional, Default 'de-DE'
 */

import { useState }          from 'react';
import { Mic, Pause, Square, FileText, Sparkles, AlertCircle, Play, RotateCcw } from 'lucide-react';
import useSpeechRecognition  from '../../hooks/useSpeechRecognition.js';
import ConsentModal          from './ConsentModal.jsx';

export default function LiveTranscriptionPanel({
  meeting,
  onAcceptTranscript,
  onStartAiAnalysis,
  language = 'de-DE',
}) {
  const [showConsent, setShowConsent] = useState(false);

  const {
    status,
    transcript,
    formattedDuration,
    error,
    isSupported,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useSpeechRecognition();

  // ── Zustimmung bestätigt → Mikrofon starten ─────────────────
  function handleConsentConfirmed() {
    setShowConsent(false);
    start(language);
  }

  // ── Transkript ins Protokoll übernehmen ─────────────────────
  function handleAccept() {
    if (transcript.trim()) {
      onAcceptTranscript(transcript.trim());
    }
  }

  // ── Sprache nicht unterstützt ────────────────────────────────
  if (!isSupported) {
    return (
      <NotSupportedPanel />
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm overflow-hidden">

        {/* Panel-Header */}
        <div className="flex items-center gap-2 px-5 py-3 bg-[#F8FAFC] border-b border-[#E5EAF0]">
          <Mic size={13} className="text-[#94A3B8]" strokeWidth={2} />
          <span className="text-[10.5px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
            Live-Transkription
          </span>

          {/* Status-Indikator */}
          {status === 'listening' && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-semibold text-red-600">Läuft</span>
              <span className="text-[11px] text-[#64748B] ml-1">{formattedDuration}</span>
            </div>
          )}
          {status === 'paused' && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-[11px] font-semibold text-amber-600">Pausiert</span>
              <span className="text-[11px] text-[#64748B] ml-1">{formattedDuration}</span>
            </div>
          )}
          {status === 'stopped' && transcript && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[11px] font-semibold text-emerald-600">Beendet</span>
              <span className="text-[11px] text-[#64748B] ml-1">{formattedDuration}</span>
            </div>
          )}
        </div>

        <div className="px-5 py-4">

          {/* ── IDLE: Einstiegsansicht ──────────────────────── */}
          {status === 'idle' && (
            <IdleView
              meetingType={meeting?.meetingType}
              onStart={() => setShowConsent(true)}
            />
          )}

          {/* ── LISTENING: Transkription läuft ─────────────── */}
          {status === 'listening' && (
            <ActiveView
              transcript={transcript}
              onPause={pause}
              onStop={stop}
              mode="listening"
            />
          )}

          {/* ── PAUSED: Pausiert ────────────────────────────── */}
          {status === 'paused' && (
            <ActiveView
              transcript={transcript}
              onResume={() => resume(language)}
              onStop={stop}
              mode="paused"
            />
          )}

          {/* ── STOPPED: Transkript fertig ──────────────────── */}
          {status === 'stopped' && (
            <StoppedView
              transcript={transcript}
              onAccept={handleAccept}
              onAnalyze={onStartAiAnalysis}
              onReset={reset}
            />
          )}

          {/* Fehleranzeige */}
          {error && (
            <div className="flex items-start gap-2 mt-3 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
              <AlertCircle size={14} color="#DC2626" className="flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-700 leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Consent-Modal */}
      {showConsent && (
        <ConsentModal
          onConfirm={handleConsentConfirmed}
          onClose={() => setShowConsent(false)}
        />
      )}
    </>
  );
}

// ── Sub-Komponenten ───────────────────────────────────────────────────────

function IdleView({ meetingType, onStart }) {
  return (
    <div>
      <p className="text-[13px] text-[#64748B] leading-relaxed mb-3">
        Erfasse gesprochene Inhalte aus persönlichen oder online geführten Meetings
        und übernimm das Transkript anschließend in das Protokoll.
      </p>

      {meetingType === 'ONLINE' && (
        <div className="text-[12px] text-[#64748B] bg-[#F8FAFC] border border-[#E5EAF0] rounded-xl px-3.5 py-2.5 mb-3 leading-relaxed">
          Für Online-Meetings kann die Live-Transkription über das Mikrofon dieses
          Geräts genutzt werden. Direkte Integrationen mit Google Meet, Microsoft
          Teams oder Zoom können später ergänzt werden.
        </div>
      )}

      <button
        onClick={onStart}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
        style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
      >
        <Mic size={14} strokeWidth={2} />
        Live-Transkription starten
      </button>
    </div>
  );
}

function ActiveView({ transcript, onPause, onResume, onStop, mode }) {
  return (
    <div>
      {/* Steuerung */}
      <div className="flex items-center gap-2 mb-3">
        {mode === 'listening' ? (
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E5EAF0] text-[12px] font-semibold text-[#64748B] bg-white hover:bg-[#F5F7FA] transition-colors"
          >
            <Pause size={13} strokeWidth={2} />
            Pausieren
          </button>
        ) : (
          <button
            onClick={onResume}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E5EAF0] text-[12px] font-semibold text-[#1E6FB5] bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <Play size={13} strokeWidth={2} />
            Fortsetzen
          </button>
        )}
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 text-[12px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <Square size={13} strokeWidth={2} />
          Beenden
        </button>
      </div>

      {/* Live-Transkript */}
      <TranscriptBox transcript={transcript} live={mode === 'listening'} />
    </div>
  );
}

function StoppedView({ transcript, onAccept, onAnalyze, onReset }) {
  return (
    <div>
      {/* Aktionen */}
      <div className="flex items-center flex-wrap gap-2 mb-3">
        {transcript && (
          <button
            onClick={onAccept}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #047857, #059669)' }}
          >
            <FileText size={13} strokeWidth={2} />
            Transkript ins Protokoll übernehmen
          </button>
        )}
        <button
          onClick={onAnalyze}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
          style={{ background: 'linear-gradient(135deg, #1E6FB5, #7C3AED)' }}
        >
          <Sparkles size={13} strokeWidth={2} />
          KI-Analyse starten
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E5EAF0] text-[12px] font-medium text-[#64748B] bg-white hover:bg-[#F5F7FA] transition-colors"
        >
          <RotateCcw size={12} strokeWidth={2} />
          Zurücksetzen
        </button>
      </div>

      {/* Fertiges Transkript */}
      {transcript ? (
        <TranscriptBox transcript={transcript} live={false} />
      ) : (
        <p className="text-[12.5px] text-[#94A3B8] italic">
          Kein Transkript erfasst.
        </p>
      )}
    </div>
  );
}

function TranscriptBox({ transcript, live }) {
  return (
    <div className={`rounded-xl border min-h-[100px] max-h-[220px] overflow-y-auto p-3.5 ${
      live
        ? 'bg-[#FAFCFF] border-[#1E6FB5]/20'
        : 'bg-[#F8FAFC] border-[#E5EAF0]'
    }`}>
      {transcript ? (
        <p className="text-[12.5px] text-[#111827] leading-relaxed whitespace-pre-wrap">
          {transcript}
          {live && <span className="animate-pulse text-[#1E6FB5]">▋</span>}
        </p>
      ) : (
        <p className="text-[12px] text-[#94A3B8] italic">
          {live ? 'Warte auf Spracheingabe …' : 'Noch kein Text erfasst.'}
        </p>
      )}
    </div>
  );
}

function NotSupportedPanel() {
  return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={15} color="#D97706" strokeWidth={2} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-[#111827] mb-1">
              Live-Transkription nicht verfügbar
            </p>
            <p className="text-[12.5px] text-[#64748B] leading-relaxed">
              Dieser Browser unterstützt die Live-Transkription derzeit nicht.
              Bitte nutze Google Chrome oder Microsoft Edge.
              Du kannst das Protokoll weiterhin manuell erfassen.
            </p>
          </div>
        </div>
      </div>
  );
}

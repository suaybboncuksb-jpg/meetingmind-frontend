/**
 * useSpeechRecognition.js
 * ─────────────────────────────────────────────────────────────
 * Hook für browserbasierte Live-Transkription via Web Speech API.
 *
 * Unterstützte Browser: Chrome, Edge (vollständig), Firefox/Safari (eingeschränkt).
 * Standard-Sprache: de-DE. Später über `start(lang)` erweiterbar.
 *
 * Status-Zustände:
 *   idle      – bereit, noch nicht gestartet
 *   listening – Transkription läuft
 *   paused    – pausiert (Mikrofon gestoppt, Transkript bleibt)
 *   stopped   – beendet, Transkript verfügbar
 *
 * Datenschutz-Hinweis:
 *   Das Mikrofon wird NICHT ohne expliziten `start()`-Aufruf aktiviert.
 *   Vor `start()` muss der Nutzer die Zustimmung aller Teilnehmer bestätigen.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

export default function useSpeechRecognition() {
  const [status,     setStatus]     = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [duration,   setDuration]   = useState(0);   // Sekunden
  const [error,      setError]      = useState(null);

  // Refs – vermeiden stale closures in asynchronen Callbacks
  const recRef        = useRef(null);  // SpeechRecognition-Instanz
  const timerRef      = useRef(null);  // Intervall für Dauer
  const statusRef     = useRef('idle'); // synchron lesbar in onend-Callback
  const accRef        = useRef('');    // akkumulierter finaler Text
  const elapsedRef    = useRef(0);     // angesammelte Sekunden (Pause-Unterstützung)

  // ── Browser-Unterstützung prüfen ─────────────────────────────
  const isSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // ── Hilfsfunktionen ──────────────────────────────────────────

  function syncStatus(s) {
    statusRef.current = s;
    setStatus(s);
  }

  function startTimer() {
    clearInterval(timerRef.current);
    const sessionStart = Date.now();
    timerRef.current = setInterval(() => {
      setDuration(elapsedRef.current + Math.floor((Date.now() - sessionStart) / 1000));
    }, 500);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  /** Erstellt eine neue SpeechRecognition-Instanz */
  function buildRecognition(lang) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r  = new SR();
    r.lang           = lang;
    r.continuous     = true;
    r.interimResults = true;

    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          accRef.current += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setTranscript(accRef.current + (interim ? ' ' + interim : ''));
    };

    r.onerror = (e) => {
      // 'aborted' ist kein Fehler – passiert beim manuellen Stop
      if (e.error === 'aborted') return;
      const msg = e.error === 'not-allowed'
        ? 'Mikrofonzugriff verweigert. Bitte erlaube den Mikrofonzugriff im Browser.'
        : e.error === 'no-speech'
          ? 'Kein Ton erkannt. Bitte näher ans Mikrofon sprechen.'
          : `Transkriptions-Fehler: ${e.error}`;
      setError(msg);
      syncStatus('stopped');
      stopTimer();
    };

    // Speech Recognition stoppt automatisch nach Stille → neu starten wenn noch aktiv
    r.onend = () => {
      if (statusRef.current === 'listening') {
        try { r.start(); } catch (_) { /* Browser hat die Instanz bereits freigegeben */ }
      }
    };

    return r;
  }

  // ── Öffentliche API ──────────────────────────────────────────

  /** Transkription starten. lang = z.B. 'de-DE', 'en-US', 'fr-FR' */
  const start = useCallback((lang = 'de-DE') => {
    if (!isSupported) return;
    // Reset
    accRef.current  = '';
    elapsedRef.current = 0;
    setTranscript('');
    setDuration(0);
    setError(null);

    const r = buildRecognition(lang);
    recRef.current = r;

    try {
      r.start();
      syncStatus('listening');
      startTimer();
    } catch (e) {
      setError(`Konnte nicht starten: ${e.message}`);
    }
  }, [isSupported]);

  /** Transkription pausieren */
  const pause = useCallback(() => {
    syncStatus('paused'); // ERST Status setzen, dann stop() – sonst startet onend neu
    stopTimer();
    elapsedRef.current = duration;
    if (recRef.current) {
      try { recRef.current.stop(); } catch (_) {}
    }
  }, [duration]);

  /** Transkription fortsetzen */
  const resume = useCallback((lang = 'de-DE') => {
    if (!isSupported) return;
    const r = recRef.current ?? buildRecognition(lang);
    recRef.current = r;
    try {
      r.start();
      syncStatus('listening');
      startTimer();
    } catch (_) {
      // Fallback: neue Instanz
      const fresh = buildRecognition(lang);
      recRef.current = fresh;
      fresh.start();
      syncStatus('listening');
      startTimer();
    }
  }, [isSupported]);

  /** Transkription beenden */
  const stop = useCallback(() => {
    syncStatus('stopped');
    stopTimer();
    elapsedRef.current = duration;
    if (recRef.current) {
      try { recRef.current.stop(); } catch (_) {}
      recRef.current = null;
    }
  }, [duration]);

  /** Komplett zurücksetzen */
  const reset = useCallback(() => {
    syncStatus('idle');
    stopTimer();
    if (recRef.current) {
      try { recRef.current.stop(); } catch (_) {}
      recRef.current = null;
    }
    accRef.current     = '';
    elapsedRef.current = 0;
    setTranscript('');
    setDuration(0);
    setError(null);
  }, []);

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (recRef.current) {
        try { recRef.current.stop(); } catch (_) {}
      }
    };
  }, []);

  // ── Formatierte Dauer ─────────────────────────────────────────
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const formattedDuration = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;

  return {
    status,
    transcript,
    duration,
    formattedDuration,
    error,
    isSupported,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}

/**
 * SettingsPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Professionelle Einstellungsseite für MeetingMind.
 *
 * Alle Einstellungen werden lokal im State gespeichert.
 * TODO-Kommentare zeigen, wo später Backend-Anbindung nötig ist.
 */

import { useState, useCallback } from 'react';
import {
    User,
    Sparkles,
    Mic,
    Shield,
    Bell,
    Plug,
    Monitor,
    ChevronRight,
    Check,
    Info,
    CalendarDays,
    Mail,
    MessageSquare,
    Target,
    LayoutGrid,
    Link2,
    BrainCircuit,
    Activity,
    Database,
    CircleCheck,
    CircleOff,
    Clock,
    Headphones,
} from 'lucide-react';

const SECTIONS = [
    { id: 'general', label: 'Allgemein', icon: User },
    { id: 'ai', label: 'KI & Analyse', icon: Sparkles },
    { id: 'transcription', label: 'Transkription', icon: Mic },
    { id: 'privacy', label: 'Datenschutz', icon: Shield },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'integrations', label: 'Integrationen', icon: Plug },
    { id: 'appearance', label: 'Erscheinungsbild', icon: Monitor },
];

const ANALYSIS_TEMPLATES = [
    { value: 'standard', label: 'Standard Meeting' },
    { value: 'customer', label: 'Kundenmeeting' },
    { value: 'project', label: 'Projektmeeting' },
    { value: 'interview', label: 'Bewerbungsgespräch' },
    { value: 'sprint-review', label: 'Sprint Review' },
];

const INTEGRATIONS = [
    {
        id: 'gcal',
        icon: CalendarDays,
        name: 'Google Calendar',
        desc: 'Meetings automatisch im Kalender synchronisieren.',
        priority: 'Geplant V2',
    },
    {
        id: 'outlook',
        icon: Mail,
        name: 'Microsoft Outlook',
        desc: 'Termine und Einladungen über Outlook verwalten.',
        priority: 'Geplant V2',
    },
    {
        id: 'jira',
        icon: Link2,
        name: 'Jira',
        desc: 'Aufgaben direkt als Jira-Tickets anlegen.',
        priority: 'Geplant V3',
    },
    {
        id: 'trello',
        icon: LayoutGrid,
        name: 'Trello',
        desc: 'Aufgaben auf Trello-Boards verschieben.',
        priority: 'Geplant V3',
    },
    {
        id: 'slack',
        icon: MessageSquare,
        name: 'Slack',
        desc: 'Meeting-Zusammenfassungen in Channels teilen.',
        priority: 'Später',
    },
    {
        id: 'asana',
        icon: Target,
        name: 'Asana',
        desc: 'Tasks in Asana-Projekte übertragen.',
        priority: 'Später',
    },
];

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('general');

    const [general, setGeneral] = useState({
        workspaceName: 'MeetingMind',
        language: 'de',
    });

    const [ai, setAi] = useState({
        analysisLanguage: 'de',
        analysisDepth: 'standard',
        analysisTemplate: 'standard',
        extractTodos: true,
        detectDecisions: true,
        detectRisks: true,
        detectQuestions: true,
        detectNextSteps: true,
    });

    const [transcription, setTranscription] = useState({
        enabled: true,
        language: 'de-DE',
        showConsent: true,
        autoTranscript: false,
        showBrowserHint: true,
    });

    const [privacy, setPrivacy] = useState({
        retentionDays: '90',
    });

    const [notifications, setNotifications] = useState({
        overdueEmail: false,
        dailySummary: false,
        reminderEmail: false,
        afterAnalysis: false,
    });

    const [appearance, setAppearance] = useState({
        theme: 'light',
        compactView: false,
    });

    const [savedSection, setSavedSection] = useState(null);

    const handleSave = useCallback((section) => {
        // TODO: await settingsApi.save(section, values);
        setSavedSection(section);
        setTimeout(() => setSavedSection(null), 2500);
    }, []);

    const update = (setter) => (key) => (val) => {
        setter((prev) => ({ ...prev, [key]: val }));
    };

    function renderContent() {
        const saved = savedSection === activeSection;

        switch (activeSection) {
            case 'general':
                return (
                    <GeneralSection
                        state={general}
                        update={update(setGeneral)}
                        onSave={() => handleSave('general')}
                        saved={saved}
                    />
                );

            case 'ai':
                return (
                    <AiSection
                        state={ai}
                        update={update(setAi)}
                        onSave={() => handleSave('ai')}
                        saved={saved}
                    />
                );

            case 'transcription':
                return (
                    <TranscriptionSection
                        state={transcription}
                        update={update(setTranscription)}
                        onSave={() => handleSave('transcription')}
                        saved={saved}
                    />
                );

            case 'privacy':
                return (
                    <PrivacySection
                        state={privacy}
                        update={update(setPrivacy)}
                    />
                );

            case 'notifications':
                return (
                    <NotifSection
                        state={notifications}
                        update={update(setNotifications)}
                        onSave={() => handleSave('notifications')}
                        saved={saved}
                    />
                );

            case 'integrations':
                return <IntegrationsSection />;

            case 'appearance':
                return (
                    <AppearanceSection
                        state={appearance}
                        update={update(setAppearance)}
                        onSave={() => handleSave('appearance')}
                        saved={saved}
                    />
                );

            default:
                return null;
        }
    }

    return (
        <div className="flex-1 overflow-hidden flex flex-col bg-[#F8FAFC]">
            <div className="flex-shrink-0 px-8 pt-8 pb-5 border-b border-[#E5EAF0] bg-white">
                <p className="text-[10.5px] font-bold text-[#1E6FB5] uppercase tracking-[0.12em] mb-1.5">
                    System
                </p>
                <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">
                    Einstellungen
                </h1>
                <p className="text-[13px] text-[#64748B] mt-1">
                    Konto, Workspace, KI-Analyse und Datenschutz konfigurieren.
                </p>
            </div>

            <div className="flex-1 overflow-hidden flex">
                <nav className="w-[210px] min-w-[210px] border-r border-[#E5EAF0] bg-white overflow-y-auto p-3">
                    {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const active = activeSection === section.id;

                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-left text-[13px] font-medium transition-all duration-150 ${
                                    active
                                        ? 'bg-[#EEF5FD] text-[#1E6FB5]'
                                        : 'text-[#64748B] hover:bg-[#F5F7FA] hover:text-[#111827]'
                                }`}
                            >
                                <Icon
                                    size={15}
                                    strokeWidth={active ? 2 : 1.8}
                                    className="flex-shrink-0"
                                />
                                {section.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="max-w-[820px] space-y-5">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

function GeneralSection({ state, update, onSave, saved }) {
    return (
        <>
            <SectionHeader
                title="Allgemein"
                desc="Profil, Workspace und Systemstatus."
            />

            <SystemStatusCard />

            <Card>
                <CardTitle>Profil</CardTitle>
                <div className="flex items-center gap-4 py-1">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-[18px] font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1E6FB5, #7C3AED)' }}
                    >
                        S
                    </div>
                    <div>
                        <p className="text-[14px] font-bold text-[#111827]">Suayb B.</p>
                        <p className="text-[12.5px] text-[#64748B] mt-0.5">
                            Administrator · MeetingMind Workspace
                        </p>
                    </div>
                </div>
            </Card>

            <Card>
                <CardTitle>Workspace</CardTitle>

                <SettingRow
                    label="Workspace-Name"
                    desc="Wird in der App und in Exporten angezeigt."
                >
                    <input
                        type="text"
                        value={state.workspaceName}
                        onChange={(event) => update('workspaceName')(event.target.value)}
                        className="px-3 py-1.5 border border-[#E5EAF0] bg-[#F8FAFC] rounded-xl text-[13px] text-[#111827] outline-none focus:border-[#1E6FB5]/40 focus:bg-white transition-all w-[200px] font-sans"
                    />
                </SettingRow>

                <Divider />

                <SettingRow
                    label="Sprache"
                    desc="Anzeigesprache der Benutzeroberfläche."
                >
                    <SelectField
                        value={state.language}
                        onChange={update('language')}
                        options={[
                            { value: 'de', label: 'Deutsch' },
                            { value: 'en', label: 'English' },
                        ]}
                    />
                </SettingRow>

                <SaveBar onSave={onSave} saved={saved} />
            </Card>
        </>
    );
}

function SystemStatusCard() {
    const items = [
        {
            label: 'KI-Analyse',
            value: 'Aktiv',
            tone: 'success',
            Icon: BrainCircuit,
        },
        {
            label: 'Live-Transkription',
            value: 'Aktiv',
            tone: 'success',
            Icon: Mic,
        },
        {
            label: 'Consent-first',
            value: 'Aktiv',
            tone: 'success',
            Icon: Shield,
        },
        {
            label: 'Audio-Speicherung',
            value: 'Deaktiviert',
            tone: 'neutral',
            Icon: Database,
        },
        {
            label: 'Integrationen',
            value: 'Geplant',
            tone: 'planned',
            Icon: Plug,
        },
    ];

    return (
        <Card>
            <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                    <CardTitle>Systemstatus</CardTitle>
                    <p className="text-[12.5px] text-[#64748B] -mt-1">
                        Kontrollübersicht für die wichtigsten MeetingMind-Funktionen.
                    </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#EEF5FD] border border-blue-100 flex items-center justify-center">
                    <Activity size={17} color="#1E6FB5" strokeWidth={2} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {items.map((item) => {
                    const Icon = item.Icon;

                    return (
                        <div
                            key={item.label}
                            className="flex items-center justify-between gap-3 bg-[#F8FAFC] border border-[#EEF2F7] rounded-xl px-3.5 py-3"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <Icon size={15} color="#64748B" strokeWidth={1.8} />
                                <span className="text-[12.5px] font-medium text-[#111827] truncate">
                  {item.label}
                </span>
                            </div>
                            <StatusBadge tone={item.tone}>{item.value}</StatusBadge>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

function AiSection({ state, update, onSave, saved }) {
    const isInterviewTemplate = state.analysisTemplate === 'interview';

    return (
        <>
            <SectionHeader
                title="KI & Analyse"
                desc="Konfiguriere, wie MeetingMind Protokolle analysiert."
            />

            <InfoBanner icon={BrainCircuit}>
                Diese Einstellungen bestimmen, wie MeetingMind Protokolle analysiert und Aufgaben extrahiert.
            </InfoBanner>

            <Card>
                <CardTitle>Analyse-Konfiguration</CardTitle>

                <SettingRow
                    label="Analyse-Vorlage"
                    desc="Bestimmt, welche Informationen MeetingMind besonders berücksichtigt."
                >
                    <SelectField
                        value={state.analysisTemplate}
                        onChange={update('analysisTemplate')}
                        options={ANALYSIS_TEMPLATES}
                    />
                </SettingRow>

                {isInterviewTemplate && (
                    <div className="mt-3 mb-1 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 flex items-start gap-2.5">
                        <Info
                            size={14}
                            color="#D97706"
                            strokeWidth={2}
                            className="flex-shrink-0 mt-0.5"
                        />
                        <p className="text-[12.5px] text-amber-800 leading-relaxed">
                            Die KI unterstützt nur bei der strukturierten Dokumentation. Einstellungsentscheidungen bleiben beim Menschen.
                        </p>
                    </div>
                )}

                <Divider />

                <SettingRow
                    label="Analyse-Sprache"
                    desc="Sprache, die die KI für die Analyse verwendet."
                >
                    <SelectField
                        value={state.analysisLanguage}
                        onChange={update('analysisLanguage')}
                        options={[
                            { value: 'de', label: 'Deutsch' },
                            { value: 'en', label: 'English' },
                        ]}
                    />
                </SettingRow>

                <Divider />

                <SettingRow
                    label="Analyse-Tiefe"
                    desc="Bestimmt den Detailgrad der generierten Zusammenfassung."
                >
                    <SelectField
                        value={state.analysisDepth}
                        onChange={update('analysisDepth')}
                        options={[
                            { value: 'short', label: 'Kurz' },
                            { value: 'standard', label: 'Standard' },
                            { value: 'detailed', label: 'Detailliert' },
                        ]}
                    />
                </SettingRow>
            </Card>

            <Card>
                <CardTitle>Erkennungs-Module</CardTitle>

                {[
                    {
                        key: 'extractTodos',
                        label: 'To-dos automatisch extrahieren',
                        desc: 'Erkennt Aufgaben und Verantwortliche.',
                    },
                    {
                        key: 'detectDecisions',
                        label: 'Entscheidungen erkennen',
                        desc: 'Identifiziert getroffene Beschlüsse.',
                    },
                    {
                        key: 'detectRisks',
                        label: 'Risiken erkennen',
                        desc: 'Hebt Risiken und Blocker hervor.',
                    },
                    {
                        key: 'detectQuestions',
                        label: 'Offene Fragen erkennen',
                        desc: 'Listet ungeklärte Punkte auf.',
                    },
                    {
                        key: 'detectNextSteps',
                        label: 'Nächste Schritte erkennen',
                        desc: 'Extrahiert geplante Folgeaktionen.',
                    },
                ].map((item, index, array) => (
                    <div key={item.key}>
                        <SettingRow label={item.label} desc={item.desc}>
                            <Toggle checked={state[item.key]} onChange={update(item.key)} />
                        </SettingRow>
                        {index < array.length - 1 && <Divider />}
                    </div>
                ))}

                <SaveBar onSave={onSave} saved={saved} />
            </Card>
        </>
    );
}

function TranscriptionSection({ state, update, onSave, saved }) {
    const [browserStatus, setBrowserStatus] = useState('not_checked');
    const [microphoneStatus, setMicrophoneStatus] = useState('not_checked');
    const [testHint, setTestHint] = useState(null);

    function checkBrowserSupport() {
        const isSupported =
            typeof window !== 'undefined' &&
            ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

        setBrowserStatus(isSupported ? 'available' : 'unavailable');

        setTestHint(
            isSupported
                ? 'Browser-Unterstützung erkannt. Live-Transkription kann grundsätzlich genutzt werden.'
                : 'Dieser Browser unterstützt Live-Transkription nicht zuverlässig. Bitte nutze Chrome oder Edge.'
        );
    }

    async function testMicrophone() {
        setMicrophoneStatus('checking');

        try {
            if (!navigator?.mediaDevices?.getUserMedia) {
                setMicrophoneStatus('unavailable');
                setTestHint('Mikrofonzugriff wird von diesem Browser nicht unterstützt.');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            stream.getTracks().forEach((track) => track.stop());

            setMicrophoneStatus('available');
            setTestHint('Mikrofon ist bereit. Es wurde keine Aufnahme gespeichert.');
        } catch {
            setMicrophoneStatus('unavailable');
            setTestHint('Mikrofon konnte nicht aktiviert werden. Bitte prüfe die Browser-Berechtigungen.');
        }
    }

    return (
        <>
            <SectionHeader
                title="Transkription"
                desc="Einstellungen für die Live-Protokollierung."
            />

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <Shield
                    size={16}
                    color="#047857"
                    strokeWidth={2}
                    className="flex-shrink-0 mt-0.5"
                />
                <div>
                    <p className="text-[13px] font-semibold text-emerald-800 mb-0.5">
                        Datenschutz-Grundsatz
                    </p>
                    <p className="text-[12.5px] text-emerald-700 leading-relaxed">
                        Live-Transkription darf nur gestartet werden, wenn alle Teilnehmer informiert wurden und zugestimmt haben. MeetingMind aktiviert die Aufnahme nie ohne explizite Bestätigung.
                    </p>
                </div>
            </div>

            <Card>
                <CardTitle>Transkriptions-Test</CardTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <TestStatusTile
                        icon={Monitor}
                        label="Browser-Unterstützung"
                        value={getBrowserStatusLabel(browserStatus)}
                        tone={getStatusTone(browserStatus)}
                    />

                    <TestStatusTile
                        icon={Headphones}
                        label="Mikrofonstatus"
                        value={getMicrophoneStatusLabel(microphoneStatus)}
                        tone={getStatusTone(microphoneStatus)}
                    />
                </div>

                {testHint && (
                    <div className="mb-4 bg-blue-50/70 border border-blue-100 rounded-xl px-3.5 py-3 flex items-start gap-2.5">
                        <Info
                            size={14}
                            color="#1E6FB5"
                            strokeWidth={2}
                            className="flex-shrink-0 mt-0.5"
                        />
                        <p className="text-[12.5px] text-[#1e40af] leading-relaxed">
                            {testHint}
                        </p>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={checkBrowserSupport}
                        className="px-4 py-1.5 rounded-xl border border-[#E5EAF0] bg-white text-[12.5px] font-semibold text-[#111827] hover:bg-[#F5F7FA] transition-colors"
                    >
                        Browser prüfen
                    </button>

                    <button
                        onClick={testMicrophone}
                        className="px-4 py-1.5 rounded-xl text-[12.5px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
                        style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
                    >
                        Mikrofon testen
                    </button>

                    <span className="text-[11.5px] text-[#64748B]">
            Für Live-Transkription werden Chrome oder Edge empfohlen.
          </span>
                </div>
            </Card>

            <Card>
                <CardTitle>Transkriptions-Optionen</CardTitle>

                {[
                    {
                        key: 'enabled',
                        label: 'Live-Transkription aktivieren',
                        desc: 'Schaltet die Transkriptionsfunktion global ein oder aus.',
                    },
                    {
                        key: 'showConsent',
                        label: 'Zustimmungshinweis vor jeder Transkription',
                        desc: 'Zeigt einen Bestätigungsdialog, bevor die Transkription startet. Empfohlen.',
                        locked: true,
                    },
                    {
                        key: 'autoTranscript',
                        label: 'Transkript automatisch ins Protokoll übernehmen',
                        desc: 'Nach Beenden der Transkription wird der Text direkt ins Protokoll geschrieben.',
                    },
                    {
                        key: 'showBrowserHint',
                        label: 'Browser-Hinweis anzeigen',
                        desc: 'Informiert den Nutzer, wenn sein Browser die Transkription nicht unterstützt.',
                    },
                ].map((item, index, array) => (
                    <div key={item.key}>
                        <SettingRow label={item.label} desc={item.desc}>
                            <div className="flex items-center gap-2">
                                <Toggle
                                    checked={state[item.key]}
                                    onChange={item.locked ? undefined : update(item.key)}
                                    disabled={item.locked}
                                />
                                {item.locked && (
                                    <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Empfohlen
                  </span>
                                )}
                            </div>
                        </SettingRow>
                        {index < array.length - 1 && <Divider />}
                    </div>
                ))}
            </Card>

            <Card>
                <CardTitle>Standardsprache</CardTitle>

                <SettingRow
                    label="Transkriptions-Sprache"
                    desc="Wird beim Start der Live-Transkription automatisch verwendet."
                >
                    <SelectField
                        value={state.language}
                        onChange={update('language')}
                        options={[
                            { value: 'de-DE', label: 'Deutsch' },
                            { value: 'en-US', label: 'English (US)' },
                        ]}
                    />
                </SettingRow>

                <SaveBar onSave={onSave} saved={saved} />
            </Card>
        </>
    );
}

function PrivacySection({ state, update }) {
    const [actionHint, setActionHint] = useState(null);

    function handleAction(label) {
        setActionHint(`„${label}” wird später mit dem Backend verbunden.`);
        setTimeout(() => setActionHint(null), 3000);
    }

    return (
        <>
            <SectionHeader
                title="Datenschutz"
                desc="Datenkontrolle und Aufbewahrungseinstellungen."
            />

            <InfoBanner icon={Info}>
                Für Pilot-Versionen werden Lösch- und Exportfunktionen schrittweise backendseitig angebunden.
            </InfoBanner>

            <Card>
                <CardTitle>Datenkontrolle</CardTitle>

                <SettingRow
                    label="Consent-first Transkription"
                    desc="Transkription startet nur nach expliziter Zustimmung aller Teilnehmer."
                >
                    <StatusBadge tone="success">Aktiv</StatusBadge>
                </SettingRow>

                <Divider />

                <SettingRow
                    label="Keine Audio-Dateien speichern"
                    desc="Audio wird nach der Transkription nicht auf dem Server gespeichert."
                >
                    <StatusBadge tone="success">Aktiv</StatusBadge>
                </SettingRow>

                <Divider />

                <SettingRow
                    label="Aufbewahrungsdauer"
                    desc="Wie lange Meetings und Analysen gespeichert werden."
                >
                    <SelectField
                        value={state.retentionDays}
                        onChange={update('retentionDays')}
                        options={[
                            { value: '30', label: '30 Tage' },
                            { value: '60', label: '60 Tage' },
                            { value: '90', label: '90 Tage' },
                            { value: 'manual', label: 'Manuell' },
                        ]}
                    />
                </SettingRow>
            </Card>

            <Card>
                <CardTitle>Daten löschen</CardTitle>

                <p className="text-[12.5px] text-[#64748B] mb-4 leading-relaxed">
                    Löschvorgänge sind dauerhaft. Bitte stelle sicher, dass du Daten nicht mehr benötigst.
                </p>

                {actionHint && (
                    <div className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 text-[12.5px] text-amber-800">
                        <Info size={13} strokeWidth={2} />
                        {actionHint}
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {['Transkripte löschen', 'Analysen löschen', 'Meetings löschen'].map((label) => (
                        <button
                            key={label}
                            onClick={() => handleAction(label)}
                            className="px-4 py-1.5 rounded-xl border border-red-200 text-[12.5px] font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* TODO: await privacyApi.deleteTranscripts() / deleteAnalyses() / deleteMeetings() */}
            </Card>
        </>
    );
}

function NotifSection({ state, update, onSave, saved }) {
    return (
        <>
            <SectionHeader
                title="Benachrichtigungen"
                desc="Wähle, worüber du informiert werden möchtest."
            />

            <InfoBanner icon={Bell}>
                E-Mail-Benachrichtigungen werden später backendseitig aktiviert. Aktuelle Einstellungen werden lokal gespeichert und dienen der Vorbereitung.
            </InfoBanner>

            <Card>
                <CardTitle>Vorbereiteter Status</CardTitle>
                <SettingRow
                    label="E-Mail-Versand"
                    desc="Der Versand ist in der Pilot-Version noch nicht aktiv."
                >
                    <StatusBadge tone="planned">Backend geplant</StatusBadge>
                </SettingRow>
            </Card>

            <Card>
                <CardTitle>Aufgaben & Fristen</CardTitle>

                {[
                    {
                        key: 'overdueEmail',
                        label: 'E-Mail bei überfälligen Aufgaben',
                        desc: 'Benachrichtigung, wenn Aufgaben die Deadline überschreiten.',
                    },
                    {
                        key: 'dailySummary',
                        label: 'Tägliche Aufgabenübersicht',
                        desc: 'Zusammenfassung offener und fälliger Aufgaben jeden Morgen.',
                    },
                    {
                        key: 'reminderEmail',
                        label: 'Reminder vor Deadline',
                        desc: '24 Stunden vor Ablauf einer Aufgaben-Deadline erinnert werden.',
                    },
                ].map((item, index, array) => (
                    <div key={item.key}>
                        <SettingRow label={item.label} desc={item.desc}>
                            <Toggle checked={state[item.key]} onChange={update(item.key)} />
                        </SettingRow>
                        {index < array.length - 1 && <Divider />}
                    </div>
                ))}
            </Card>

            <Card>
                <CardTitle>KI-Analyse</CardTitle>

                <SettingRow
                    label="Benachrichtigung nach KI-Analyse"
                    desc="Erhalte eine Meldung, sobald die Analyse eines Meetings abgeschlossen ist."
                >
                    <Toggle checked={state.afterAnalysis} onChange={update('afterAnalysis')} />
                </SettingRow>

                <SaveBar
                    onSave={onSave}
                    saved={saved}
                    note="Einstellungen werden lokal gespeichert und bei Backend-Aktivierung angewendet."
                />
            </Card>
        </>
    );
}

function IntegrationsSection() {
    const [hints, setHints] = useState({});

    function handleConnect(id) {
        setHints((prev) => ({ ...prev, [id]: true }));
        // Kein echter API-Call.
        // TODO: später OAuth-Flow über Backend starten.
    }

    return (
        <>
            <SectionHeader
                title="Integrationen"
                desc="Verbinde MeetingMind mit deinen bestehenden Werkzeugen."
            />

            <InfoBanner icon={Plug}>
                Integrationen werden schrittweise aktiviert. In der Pilot-Version können Meetings und Aufgaben intern verwaltet werden.
            </InfoBanner>

            <div className="grid grid-cols-1 gap-3">
                {INTEGRATIONS.map((integration) => {
                    const Icon = integration.icon;

                    return (
                        <Card key={integration.id} noPadding>
                            <div className="flex items-center gap-4 p-4">
                                <div className="w-10 h-10 bg-slate-100 border border-[#E5EAF0] rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Icon size={18} color="#64748B" strokeWidth={1.8} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2 mb-0.5">
                                        <p className="text-[13.5px] font-semibold text-[#111827]">
                                            {integration.name}
                                        </p>

                                        <StatusBadge tone={integration.priority === 'Später' ? 'neutral' : 'planned'}>
                                            {integration.priority}
                                        </StatusBadge>
                                    </div>

                                    <p className="text-[12px] text-[#64748B]">
                                        {integration.desc}
                                    </p>

                                    {hints[integration.id] && (
                                        <p className="text-[11.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 mt-2">
                                            Integration wird vorbereitet. In der Pilot-Version können Meetings und Aufgaben intern verwaltet werden.
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleConnect(integration.id)}
                                    className="flex-shrink-0 px-3.5 py-1.5 rounded-xl border border-[#E5EAF0] bg-white text-[12px] font-medium text-[#64748B] hover:bg-[#F5F7FA] transition-colors"
                                >
                                    Vorbereiten
                                </button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}

function AppearanceSection({ state, update, onSave, saved }) {
    return (
        <>
            <SectionHeader
                title="Erscheinungsbild"
                desc="Passe die Darstellung der App an."
            />

            <InfoBanner icon={Monitor}>
                Der vollständige Dark Mode wird in einer späteren Version seitenübergreifend aktiviert.
            </InfoBanner>

            <Card>
                <CardTitle>Design</CardTitle>

                <SettingRow
                    label="Farbschema"
                    desc="Hell ist aktuell aktiv. Dunkel und System werden vorbereitet."
                >
                    <div className="flex gap-2">
                        {[
                            { value: 'light', label: 'Hell', status: 'Aktiv' },
                            { value: 'dark', label: 'Dunkel', status: 'In Vorbereitung' },
                            { value: 'system', label: 'System', status: 'In Vorbereitung' },
                        ].map((item) => (
                            <button
                                key={item.value}
                                onClick={() => update('theme')(item.value)}
                                className={`px-3 py-1.5 rounded-xl border text-[12px] font-medium transition-all duration-150 ${
                                    state.theme === item.value
                                        ? 'bg-[#1E6FB5] text-white border-[#1E6FB5]'
                                        : 'bg-white text-[#64748B] border-[#E5EAF0] hover:bg-[#F5F7FA]'
                                }`}
                                title={item.status}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </SettingRow>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <AppearanceStatus label="Hell" value="Aktiv" tone="success" />
                    <AppearanceStatus label="Dunkel" value="In Vorbereitung" tone="planned" />
                    <AppearanceStatus label="System" value="In Vorbereitung" tone="planned" />
                </div>

                <Divider />

                <SettingRow
                    label="Akzentfarbe"
                    desc="Primärfarbe für Buttons, Links und aktive Elemente."
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-full border-2 border-[#1E6FB5]"
                            style={{ background: '#1E6FB5' }}
                        />
                        <span className="text-[13px] text-[#111827] font-medium">Blau</span>
                        <span className="text-[10.5px] text-[#94A3B8] bg-slate-100 border border-[#E5EAF0] px-1.5 py-0.5 rounded ml-1">
              Standard
            </span>
                    </div>
                </SettingRow>

                <Divider />

                <SettingRow
                    label="Kompakte Ansicht"
                    desc="Reduziert Abstände und zeigt mehr Inhalt auf einmal."
                >
                    <Toggle checked={state.compactView} onChange={update('compactView')} />
                </SettingRow>

                <SaveBar onSave={onSave} saved={saved} />
            </Card>
        </>
    );
}

function SectionHeader({ title, desc }) {
    return (
        <div className="mb-1 pb-1">
            <h2 className="text-[17px] font-bold text-[#111827] tracking-tight">
                {title}
            </h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">
                {desc}
            </p>
        </div>
    );
}

function Card({ children, noPadding = false }) {
    return (
        <div
            className={`bg-white rounded-2xl border border-[#E5EAF0] shadow-sm overflow-hidden ${
                noPadding ? '' : 'px-5 py-4'
            }`}
        >
            {children}
        </div>
    );
}

function CardTitle({ children }) {
    return (
        <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] mb-3">
            {children}
        </p>
    );
}

function SettingRow({ label, desc, children }) {
    return (
        <div className="flex items-center justify-between gap-6 py-1.5">
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#111827]">
                    {label}
                </p>
                {desc && (
                    <p className="text-[12px] text-[#64748B] mt-0.5 leading-relaxed">
                        {desc}
                    </p>
                )}
            </div>
            <div className="flex-shrink-0">{children}</div>
        </div>
    );
}

function Divider() {
    return <div className="h-px bg-[#F1F5F9] my-1" />;
}

function InfoBanner({ icon: Icon, children }) {
    return (
        <div className="flex items-start gap-2.5 bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3">
            <Icon
                size={14}
                color="#1E6FB5"
                strokeWidth={2}
                className="flex-shrink-0 mt-0.5"
            />
            <p className="text-[12.5px] text-[#1e40af] leading-relaxed">
                {children}
            </p>
        </div>
    );
}

function SaveBar({ onSave, saved, note }) {
    return (
        <div className="flex items-center justify-between gap-4 mt-4 pt-3.5 border-t border-[#F1F5F9]">
            {note ? (
                <p className="text-[11.5px] text-[#94A3B8] flex-1">
                    {note}
                </p>
            ) : (
                <div className="flex-1" />
            )}

            <div className="flex items-center gap-2.5">
                {saved && (
                    <span className="flex items-center gap-1 text-[12px] font-medium text-emerald-700">
            <Check size={13} strokeWidth={2.5} />
            Einstellungen gespeichert.
          </span>
                )}

                <button
                    onClick={onSave}
                    className="px-4 py-1.5 rounded-xl text-[12.5px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
                    style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
                >
                    Änderungen speichern
                </button>
            </div>
        </div>
    );
}

function Toggle({ checked, onChange, disabled = false }) {
    return (
        <button
            onClick={() => !disabled && onChange?.(!checked)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
            } ${checked ? 'bg-[#1E6FB5]' : 'bg-[#CBD5E1]'}`}
            type="button"
            disabled={disabled}
        >
            <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    checked ? 'translate-x-4' : 'translate-x-0'
                }`}
            />
        </button>
    );
}

function SelectField({ value, onChange, options }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 border border-[#E5EAF0] bg-[#F8FAFC] rounded-xl text-[13px] text-[#111827] outline-none focus:border-[#1E6FB5]/40 focus:bg-white transition-all font-sans cursor-pointer"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronRight
                size={11}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none rotate-90"
            />
        </div>
    );
}

function StatusBadge({ children, tone = 'neutral' }) {
    const styles = {
        success: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        planned: 'text-blue-700 bg-blue-50 border-blue-100',
        neutral: 'text-[#64748B] bg-slate-100 border-[#E5EAF0]',
        warning: 'text-amber-700 bg-amber-50 border-amber-200',
        danger: 'text-red-700 bg-red-50 border-red-200',
    };

    return (
        <span
            className={`text-[10.5px] font-semibold border px-2 py-0.5 rounded-md whitespace-nowrap ${
                styles[tone] ?? styles.neutral
            }`}
        >
      {children}
    </span>
    );
}

function TestStatusTile({ icon: Icon, label, value, tone }) {
    return (
        <div className="bg-[#F8FAFC] border border-[#EEF2F7] rounded-xl px-3.5 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
                <Icon size={15} color="#64748B" strokeWidth={1.8} />
                <span className="text-[12.5px] font-medium text-[#111827] truncate">
          {label}
        </span>
            </div>
            <StatusBadge tone={tone}>{value}</StatusBadge>
        </div>
    );
}

function AppearanceStatus({ label, value, tone }) {
    return (
        <div className="bg-[#F8FAFC] border border-[#EEF2F7] rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
      <span className="text-[12px] font-medium text-[#111827]">
        {label}
      </span>
            <StatusBadge tone={tone}>{value}</StatusBadge>
        </div>
    );
}

function getBrowserStatusLabel(status) {
    if (status === 'available') return 'Verfügbar';
    if (status === 'unavailable') return 'Nicht verfügbar';
    return 'Nicht geprüft';
}

function getMicrophoneStatusLabel(status) {
    if (status === 'available') return 'Bereit';
    if (status === 'unavailable') return 'Nicht verfügbar';
    if (status === 'checking') return 'Wird geprüft';
    return 'Nicht geprüft';
}

function getStatusTone(status) {
    if (status === 'available') return 'success';
    if (status === 'unavailable') return 'danger';
    if (status === 'checking') return 'planned';
    return 'neutral';
}
import jsPDF from 'jspdf';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 18;
const MAX_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const FOOTER_Y = PAGE_HEIGHT - 18;

function safeText(value, fallback = 'Nicht angegeben') {
    if (value === null || value === undefined) return fallback;

    if (Array.isArray(value)) {
        const cleaned = value
            .map((item) => {
                if (typeof item === 'string') return item.trim();

                if (typeof item === 'object' && item !== null) {
                    return String(
                        item.name ??
                        item.title ??
                        item.task ??
                        item.text ??
                        item.email ??
                        ''
                    ).trim();
                }

                return String(item).trim();
            })
            .filter(Boolean);

        const unique = [...new Set(cleaned)];
        return unique.length > 0 ? unique.join(', ') : fallback;
    }

    const text = String(value).trim();
    return text.length > 0 ? text : fallback;
}

function formatDate(value) {
    if (!value) return 'Nicht angegeben';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function normalizeTaskStatus(status) {
    const value = String(status ?? '').toUpperCase();

    if (value === 'DONE') return 'Erledigt';
    if (value === 'IN_PROGRESS') return 'In Bearbeitung';
    if (value === 'OPEN') return 'Offen';

    return status || 'Offen';
}

function normalizePriority(priority) {
    const value = String(priority ?? '').toUpperCase();

    if (value === 'HIGH' || value === 'HOCH') return 'Hoch';
    if (value === 'MEDIUM' || value === 'MITTEL') return 'Mittel';
    if (value === 'LOW' || value === 'NIEDRIG') return 'Niedrig';

    return priority || 'Nicht angegeben';
}

function getMeetingTitle(meeting) {
    return meeting?.title ?? meeting?.meetingTitle ?? 'Unbekanntes Meeting';
}

function getMeetingId(meeting) {
    return (
        meeting?.id ??
        meeting?.meetingId ??
        meeting?.raw?.id ??
        meeting?.raw?.meetingId ??
        null
    );
}

function getMeetingDate(meeting) {
    return (
        meeting?.date ??
        meeting?.meetingDate ??
        meeting?.startDateTime ??
        meeting?.createdAt ??
        meeting?.raw?.date ??
        meeting?.raw?.meetingDate ??
        meeting?.raw?.startDateTime ??
        null
    );
}

function getMeetingProtocol(meeting) {
    return (
        meeting?.protocol ??
        meeting?.protocolText ??
        meeting?.meetingProtocol ??
        meeting?.minutes ??
        meeting?.notes ??
        meeting?.content ??
        meeting?.transcript ??
        meeting?.transcriptText ??
        meeting?.liveTranscript ??
        meeting?.raw?.protocol ??
        meeting?.raw?.protocolText ??
        meeting?.raw?.meetingProtocol ??
        meeting?.raw?.minutes ??
        meeting?.raw?.notes ??
        meeting?.raw?.content ??
        meeting?.raw?.transcript ??
        meeting?.raw?.transcriptText ??
        meeting?.raw?.liveTranscript ??
        ''
    );
}

function getMeetingAnalysis(meeting) {
    return (
        meeting?.analysis ??
        meeting?.aiAnalysis ??
        meeting?.analysisResult ??
        meeting?.raw?.analysis ??
        meeting?.raw?.aiAnalysis ??
        null
    );
}

function getAiSummary(meeting) {
    const analysis = getMeetingAnalysis(meeting);

    if (typeof analysis === 'string') return analysis;

    return (
        analysis?.summary ??
        analysis?.zusammenfassung ??
        analysis?.aiSummary ??
        meeting?.aiSummary ??
        meeting?.summary ??
        meeting?.raw?.aiSummary ??
        meeting?.raw?.summary ??
        ''
    );
}

function toArray(value) {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {
        return value
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [value];
}

function getAnalysisArray(meeting, keys = []) {
    const analysis = getMeetingAnalysis(meeting);

    if (!analysis || typeof analysis === 'string') return [];

    for (const key of keys) {
        if (analysis[key]) return toArray(analysis[key]);
    }

    return [];
}

function extractSectionFromSummary(summary, sectionTitle) {
    if (!summary || typeof summary !== 'string') return [];

    const sectionNames = [
        'Entscheidungen',
        'Risiken',
        'Risiken / Blocker',
        'Nächste Schritte',
        'Naechste Schritte',
        'Offene Fragen',
        'Aufgaben',
        'To-dos',
    ];

    const escapedTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const nextSections = sectionNames
        .filter((name) => name !== sectionTitle)
        .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');

    const regex = new RegExp(
        `${escapedTitle}:\\s*([\\s\\S]*?)(?=\\n(?:${nextSections}):|$)`,
        'i'
    );

    const match = summary.match(regex);
    if (!match?.[1]) return [];

    return match[1]
        .split('\n')
        .map((line) => line.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean);
}

function getDecisions(meeting) {
    const structured = getAnalysisArray(meeting, ['decisions', 'entscheidungen']);
    if (structured.length > 0) return structured;

    return extractSectionFromSummary(getAiSummary(meeting), 'Entscheidungen');
}

function getRisks(meeting) {
    const structured = getAnalysisArray(meeting, ['risks', 'blockers', 'risiken']);
    if (structured.length > 0) return structured;

    return extractSectionFromSummary(getAiSummary(meeting), 'Risiken');
}

function getNextSteps(meeting) {
    const structured = getAnalysisArray(meeting, [
        'nextSteps',
        'naechsteSchritte',
        'next_steps',
        'nextActions',
    ]);

    if (structured.length > 0) return structured;

    return extractSectionFromSummary(getAiSummary(meeting), 'Nächste Schritte');
}

function getOpenQuestions(meeting) {
    const structured = getAnalysisArray(meeting, [
        'questions',
        'openQuestions',
        'offeneFragen',
    ]);

    if (structured.length > 0) return structured;

    return extractSectionFromSummary(getAiSummary(meeting), 'Offene Fragen');
}

function getTaskTitle(task) {
    return task?.title ?? task?.task ?? task?.name ?? 'Unbenannte Aufgabe';
}

function getTaskOwner(task) {
    return (
        task?.assignedTo ??
        task?.owner ??
        task?.assignee ??
        task?.responsible ??
        'Nicht zugewiesen'
    );
}

function getTaskDeadline(task) {
    return task?.dueDate ?? task?.deadline ?? task?.due_at ?? task?.due ?? null;
}

function getTaskMeetingId(task) {
    return (
        task?.meetingId ??
        task?.meeting_id ??
        task?.meeting?.id ??
        task?.raw?.meetingId ??
        task?.raw?.meeting?.id ??
        null
    );
}

function sanitizeFileName(value) {
    return safeText(value, 'Meeting')
        .replace(/[^\wäöüÄÖÜß\- ]+/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 60);
}

function checkPageBreak(doc, y, neededSpace = 20) {
    if (y + neededSpace < FOOTER_Y) return y;

    doc.addPage();
    return 24;
}

async function loadLogo() {
    try {
        const response = await fetch('/meetingmind-logo.png');

        if (!response.ok) return null;

        const blob = await response.blob();

        return await new Promise((resolve) => {
            const reader = new FileReader();

            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);

            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

function addHeader(doc, meeting, logoDataUrl = null) {
    doc.setFillColor(30, 111, 181);
    doc.rect(0, 0, PAGE_WIDTH, 34, 'F');

    if (logoDataUrl) {
        try {
            doc.addImage(logoDataUrl, 'PNG', MARGIN_X, 8, 14, 14);

            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(17);
            doc.text('MeetingMind', MARGIN_X + 18, 15);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Professionelles Meeting-Protokoll', MARGIN_X + 18, 23);
        } catch {
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('MeetingMind', MARGIN_X, 14);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Professionelles Meeting-Protokoll', MARGIN_X, 22);
        }
    } else {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('MeetingMind', MARGIN_X, 14);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Professionelles Meeting-Protokoll', MARGIN_X, 22);
    }

    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);

    const titleLines = doc.splitTextToSize(getMeetingTitle(meeting), MAX_WIDTH);
    doc.text(titleLines, MARGIN_X, 48);

    let y = 48 + titleLines.length * 6 + 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Datum: ${formatDate(getMeetingDate(meeting))}`, MARGIN_X, y);

    y += 7;

    const location =
        meeting?.location ??
        meeting?.locationOrLink ??
        meeting?.raw?.location ??
        meeting?.raw?.locationOrLink;

    if (location) {
        const locationLines = doc.splitTextToSize(`Ort / Link: ${safeText(location)}`, MAX_WIDTH);
        doc.text(locationLines, MARGIN_X, y);
        y += locationLines.length * 6;
    }

    return y + 8;
}

function addSectionTitle(doc, title, y, neededSpace = 24) {
    y = checkPageBreak(doc, y, neededSpace);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 111, 181);
    doc.text(title, MARGIN_X, y);

    doc.setDrawColor(229, 234, 240);
    doc.line(MARGIN_X, y + 3, PAGE_WIDTH - MARGIN_X, y + 3);

    return y + 10;
}

function addWrappedText(doc, text, x, y, maxWidth = MAX_WIDTH, options = {}) {
    const content = safeText(text, options.fallback ?? 'Nicht angegeben');

    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setFontSize(options.fontSize ?? 10);
    doc.setTextColor(...(options.color ?? [17, 24, 39]));

    const lines = doc.splitTextToSize(content, maxWidth);

    for (const line of lines) {
        y = checkPageBreak(doc, y, 8);
        doc.text(line, x, y);
        y += options.lineHeight ?? 6;
    }

    return y + 2;
}

function addList(doc, items, y, fallback) {
    const list = toArray(items);

    if (list.length === 0) {
        return addWrappedText(doc, fallback, MARGIN_X, y, MAX_WIDTH, {
            color: [100, 116, 139],
        });
    }

    list.forEach((item) => {
        const text =
            typeof item === 'string'
                ? item
                : item.title ?? item.task ?? item.text ?? JSON.stringify(item);

        y = addWrappedText(doc, `• ${text}`, MARGIN_X, y, MAX_WIDTH);
    });

    return y;
}

function addTasks(doc, tasks, y) {
    if (!tasks || tasks.length === 0) {
        return addWrappedText(doc, 'Keine Aufgaben vorhanden.', MARGIN_X, y, MAX_WIDTH, {
            color: [100, 116, 139],
        });
    }

    tasks.forEach((task, index) => {
        y = checkPageBreak(doc, y, 42);

        const boxHeight = 34;

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(229, 234, 240);
        doc.roundedRect(MARGIN_X, y - 4, MAX_WIDTH, boxHeight, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);

        const title = `${index + 1}. ${getTaskTitle(task)}`;
        const titleLines = doc.splitTextToSize(title, MAX_WIDTH - 8);
        doc.text(titleLines, MARGIN_X + 4, y + 2);

        const metaY = y + 10 + Math.max(0, titleLines.length - 1) * 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);

        doc.text(`Verantwortlich: ${safeText(getTaskOwner(task))}`, MARGIN_X + 4, metaY);
        doc.text(`Frist: ${formatDate(getTaskDeadline(task))}`, MARGIN_X + 4, metaY + 6);
        doc.text(`Priorität: ${normalizePriority(task?.priority)}`, MARGIN_X + 90, metaY);
        doc.text(`Status: ${normalizeTaskStatus(task?.status)}`, MARGIN_X + 90, metaY + 6);

        y += boxHeight + 5;
    });

    return y;
}

function addFooter(doc) {
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i += 1) {
        doc.setPage(i);

        doc.setDrawColor(229, 234, 240);
        doc.line(MARGIN_X, PAGE_HEIGHT - 15, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 15);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);

        doc.text('Erstellt mit MeetingMind', MARGIN_X, PAGE_HEIGHT - 9);
        doc.text(`Seite ${i} von ${pageCount}`, PAGE_WIDTH - MARGIN_X - 25, PAGE_HEIGHT - 9);
    }
}

export async function exportMeetingPdf(meeting, tasks = []) {
    if (!meeting) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const logoDataUrl = await loadLogo();

    let y = addHeader(doc, meeting, logoDataUrl);

    const participants = meeting?.participants ?? meeting?.raw?.participants ?? [];

    y = addSectionTitle(doc, 'Meeting-Informationen', y);
    y = addWrappedText(
        doc,
        `Teilnehmer: ${safeText(participants, 'Keine Teilnehmer angegeben')}`,
        MARGIN_X,
        y
    );
    y = addWrappedText(doc, `Exportdatum: ${formatDate(new Date())}`, MARGIN_X, y);

    y = addSectionTitle(doc, '1. Protokoll', y + 4);
    y = addWrappedText(doc, getMeetingProtocol(meeting), MARGIN_X, y, MAX_WIDTH, {
        fallback: 'Kein Protokolltext vorhanden. Prüfe, ob für dieses Meeting ein Protokoll, Transkript oder Notiztext gespeichert wurde.',
    });

    y = addSectionTitle(doc, '2. KI-Zusammenfassung', y + 4);
    y = addWrappedText(doc, getAiSummary(meeting), MARGIN_X, y, MAX_WIDTH, {
        fallback: 'Keine KI-Zusammenfassung vorhanden.',
    });

    const currentMeetingId = getMeetingId(meeting);

    const meetingTasks = tasks.filter((task) => {
        const taskMeetingId = getTaskMeetingId(task);
        if (!currentMeetingId || !taskMeetingId) return false;
        return String(taskMeetingId) === String(currentMeetingId);
    });

    const estimatedTaskSpace = meetingTasks.length > 0 ? 52 : 24;
    y = addSectionTitle(doc, '3. Aufgaben / To-dos', y + 4, estimatedTaskSpace);
    y = addTasks(doc, meetingTasks, y);

    y = addSectionTitle(doc, '4. Entscheidungen', y + 4);
    y = addList(doc, getDecisions(meeting), y, 'Keine Entscheidungen dokumentiert.');

    y = addSectionTitle(doc, '5. Offene Fragen', y + 4);
    y = addList(doc, getOpenQuestions(meeting), y, 'Keine offenen Fragen dokumentiert.');

    y = addSectionTitle(doc, '6. Risiken / Blocker', y + 4);
    y = addList(doc, getRisks(meeting), y, 'Keine Risiken dokumentiert.');

    y = addSectionTitle(doc, '7. Nächste Schritte', y + 4);
    y = addList(doc, getNextSteps(meeting), y, 'Keine nächsten Schritte dokumentiert.');

    addFooter(doc);

    const fileName = `MeetingMind_Protokoll_${sanitizeFileName(getMeetingTitle(meeting))}.pdf`;
    doc.save(fileName);
}
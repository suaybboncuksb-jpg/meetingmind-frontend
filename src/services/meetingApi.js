const BASE_URL = '/api';

async function request(path, options = {}) {
    const res = await fetch(BASE_URL + path, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(errorText || `Server-Fehler: ${res.status}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

export const meetingApi = {
    getMeetings: () => request('/meetings'),

    getMeetingById: (id) =>
        request(`/meetings/${id}`),

    createMeeting: (data) =>
        request('/meetings', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateMeeting: (id, data) =>
        request(`/meetings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteMeeting: (id) =>
        request(`/meetings/${id}`, {
            method: 'DELETE',
        }),

    analyzeMeeting: (id) =>
        request(`/meetings/${id}/analyze`, {
            method: 'POST',
        }),
};

export const taskApi = {
    getTasks: () =>
        request('/tasks'),

    getTasksByMeetingId: (meetingId) =>
        request(`/tasks/meeting/${meetingId}`),

    updateTaskStatus: (id, status) =>
        request(`/tasks/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),

    deleteTask: (id) =>
        request(`/tasks/${id}`, {
            method: 'DELETE',
        }),
};

export function normalizeMeeting(m) {
    const analyzed =
        m.analyzed === true ||
        m.analysisStatus === 'DONE' ||
        Boolean(m.analysis) ||
        Boolean(m.aiSummary);

    return {
        id: m.id ?? m.meetingId,
        title: m.title ?? m.meetingTitle ?? 'Unbekanntes Meeting',
        date: m.date ?? m.meetingDate ?? m.createdAt ?? null,
        code: m.meetingCode ?? `ID-${m.id ?? m.meetingId}`,
        participants: normalizeParticipants(m.participants),
        protocol: m.protocol ?? m.protocolText ?? m.notes ?? m.content ?? '',
        analyzed,
        analysis: m.analysis ?? m.aiAnalysis ?? m.analysisResult ?? m.aiSummary ?? null,
        raw: m,
    };
}

export function normalizeParticipants(participants) {
    if (!participants) return [];

    if (Array.isArray(participants)) {
        return participants.map((participant) =>
            typeof participant === 'string'
                ? participant.trim()
                : participant.name ?? participant.username ?? String(participant)
        );
    }

    if (typeof participants === 'string') {
        return participants
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

export function normalizeAnalysis(analysis) {
    if (!analysis) return null;

    if (typeof analysis === 'string') {
        return {
            summary: analysis,
            todos: [],
            decisions: [],
            questions: [],
            risks: [],
            nextSteps: [],
        };
    }

    return {
        summary: analysis.summary ?? analysis.zusammenfassung ?? '',
        todos: toArray(
            analysis.todos ??
            analysis.tasks ??
            analysis.actionItems ??
            analysis.toDos ??
            []
        ),
        decisions: toArray(
            analysis.decisions ??
            analysis.entscheidungen ??
            []
        ),
        questions: toArray(
            analysis.questions ??
            analysis.openQuestions ??
            analysis.offeneFragen ??
            []
        ),
        risks: toArray(
            analysis.risks ??
            analysis.blockers ??
            analysis.risiken ??
            []
        ),
        nextSteps: toArray(
            analysis.nextSteps ??
            analysis.naechsteSchritte ??
            analysis.next_steps ??
            []
        ),
    };
}

function toArray(value) {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string') {
        return value
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [value];
}
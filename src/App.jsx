import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MeetingsPage from './pages/MeetingsPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { meetingApi, taskApi, normalizeMeeting, normalizeAnalysis } from './services/meetingApi.js';

export default function App() {
    const { loading, isAuthenticated } = useAuth();
    const [authMode, setAuthMode] = useState('login');

    const [page, setPage] = useState('dashboard');
    const [meetings, setMeetings] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    const [loadingMeetings, setLoadingMeetings] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const normalizeListResponse = useCallback((response) => {
        if (Array.isArray(response)) return response;
        return response?.content ?? response?.data ?? [];
    }, []);

    const loadAllData = useCallback(async () => {
        setLoadingMeetings(true);

        try {
            const [meetingsRaw, tasksRaw] = await Promise.allSettled([
                meetingApi.getMeetings(),
                taskApi.getTasks(),
            ]);

            if (meetingsRaw.status === 'fulfilled' && meetingsRaw.value) {
                const list = normalizeListResponse(meetingsRaw.value);
                setMeetings(list.map(normalizeMeeting));
            }

            if (tasksRaw.status === 'fulfilled' && tasksRaw.value) {
                const list = normalizeListResponse(tasksRaw.value);
                setTasks(list);
            }
        } finally {
            setLoadingMeetings(false);
        }
    }, [normalizeListResponse]);

    useEffect(() => {
        if (isAuthenticated) {
            loadAllData();
        }
    }, [isAuthenticated, loadAllData]);

    const stats = useMemo(() => {
        const now = new Date();
        const weekStart = new Date(now);

        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        return {
            total: meetings.length,
            analyzed: meetings.filter((meeting) => meeting.analyzed).length,
            openTasks: tasks.filter(
                (task) =>
                    !task.completed &&
                    !task.done &&
                    task.status !== 'DONE'
            ).length,
            thisWeek: meetings.filter((meeting) => {
                if (!meeting.date) return false;
                return new Date(meeting.date) >= weekStart;
            }).length,
        };
    }, [meetings, tasks]);

    const handleSelectMeeting = useCallback(
        async (id) => {
            setLoadingDetail(true);
            setSelectedMeeting(null);
            setPage('meetings');

            try {
                const raw = await meetingApi.getMeetingById(id);
                const full = normalizeMeeting(raw);

                if (full.analysis) {
                    full.analysis = normalizeAnalysis(full.analysis);
                }

                setSelectedMeeting(full);
            } catch {
                const cached = meetings.find((meeting) => String(meeting.id) === String(id));
                setSelectedMeeting(cached ?? null);
            } finally {
                setLoadingDetail(false);
            }
        },
        [meetings]
    );

    const handleCreateMeeting = useCallback(
        async (formData) => {
            const raw = await meetingApi.createMeeting(formData);
            const newMeeting = normalizeMeeting(raw);

            setMeetings((prev) => [newMeeting, ...prev]);
            await handleSelectMeeting(newMeeting.id);

            return newMeeting;
        },
        [handleSelectMeeting]
    );

    const handleUpdateMeeting = useCallback(async (id, formData) => {
        const raw = await meetingApi.updateMeeting(id, formData);
        const updatedMeeting = normalizeMeeting(raw);

        setMeetings((prev) =>
            prev.map((meeting) =>
                String(meeting.id) === String(id) ? updatedMeeting : meeting
            )
        );

        setSelectedMeeting(updatedMeeting);
    }, []);

    const handleDeleteMeeting = useCallback(
        async (id) => {
            await meetingApi.deleteMeeting(id);

            setMeetings((prev) =>
                prev.filter((meeting) => String(meeting.id) !== String(id))
            );

            if (String(selectedMeeting?.id) === String(id)) {
                setSelectedMeeting(null);
            }

            const tasksRaw = await taskApi.getTasks();
            setTasks(normalizeListResponse(tasksRaw));
        },
        [selectedMeeting, normalizeListResponse]
    );

    const handleAnalyze = useCallback(
        async (id) => {
            setAnalyzing(true);

            try {
                const raw = await meetingApi.analyzeMeeting(id);
                const full = normalizeMeeting(raw);

                full.analysis = normalizeAnalysis(full.analysis ?? raw.analysis ?? raw);
                full.analyzed = true;

                setMeetings((prev) =>
                    prev.map((meeting) =>
                        String(meeting.id) === String(id)
                            ? { ...meeting, ...full, analyzed: true }
                            : meeting
                    )
                );

                setSelectedMeeting(full);

                const tasksRaw = await taskApi.getTasks();
                setTasks(normalizeListResponse(tasksRaw));
            } finally {
                setAnalyzing(false);
            }
        },
        [normalizeListResponse]
    );

    const handleUpdateTaskStatus = useCallback(
        async (taskId, nextStatus) => {
            setTasks((prev) =>
                prev.map((task) =>
                    String(task.id) === String(taskId)
                        ? {
                            ...task,
                            status: nextStatus,
                            completed: nextStatus === 'DONE',
                            done: nextStatus === 'DONE',
                        }
                        : task
                )
            );

            try {
                if (typeof taskApi.updateTaskStatus === 'function') {
                    const updatedTask = await taskApi.updateTaskStatus(taskId, nextStatus);

                    setTasks((prev) =>
                        prev.map((task) =>
                            String(task.id) === String(taskId)
                                ? { ...task, ...updatedTask }
                                : task
                        )
                    );
                }
            } catch (error) {
                console.error('Task-Status konnte nicht gespeichert werden:', error);

                const tasksRaw = await taskApi.getTasks();
                setTasks(normalizeListResponse(tasksRaw));
            }
        },
        [normalizeListResponse]
    );

    const navigate = useCallback((target) => {
        setPage(target);

        if (target !== 'meetings') {
            setSelectedMeeting(null);
        }
    }, []);

    function renderPage() {
        switch (page) {
            case 'dashboard':
                return (
                    <Dashboard
                        meetings={meetings}
                        tasks={tasks}
                        stats={stats}
                        loading={loadingMeetings}
                        onSelectMeeting={handleSelectMeeting}
                        onNavigate={navigate}
                    />
                );

            case 'meetings':
                return (
                    <MeetingsPage
                        meetings={meetings}
                        tasks={tasks}
                        selectedMeeting={selectedMeeting}
                        loadingDetail={loadingDetail}
                        analyzing={analyzing}
                        onSelectMeeting={handleSelectMeeting}
                        onCreateMeeting={handleCreateMeeting}
                        onUpdateMeeting={handleUpdateMeeting}
                        onDeleteMeeting={handleDeleteMeeting}
                        onAnalyze={handleAnalyze}
                    />
                );

            case 'tasks':
                return (
                    <TasksPage
                        tasks={tasks}
                        meetings={meetings}
                        onSelectMeeting={handleSelectMeeting}
                        onNavigate={navigate}
                        onUpdateTaskStatus={handleUpdateTaskStatus}
                    />
                );

            case 'settings':
                return <SettingsPage />;

            default:
                return null;
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <p className="text-[13px] text-[#64748B]">
                    MeetingMind wird geladen …
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return authMode === 'login' ? (
            <LoginPage onShowRegister={() => setAuthMode('register')} />
        ) : (
            <RegisterPage onShowLogin={() => setAuthMode('login')} />
        );
    }

    return (
        <Layout currentPage={page} onNavigate={navigate}>
            {renderPage()}
        </Layout>
    );
}
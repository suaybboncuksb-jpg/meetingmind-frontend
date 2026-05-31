/**
 * TasksPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Stabile Version mit:
 *   - Team-Aufgaben / Meine Aufgaben
 *   - Meine Aufgaben automatisch über eingeloggten User
 *   - Suche, Filter, Gruppierung
 *   - Liste und Kanban
 *   - Detail-Drawer
 *   - lokale manuelle Aufgaben
 *   - dauerhafte Status-Speicherung über onUpdateTaskStatus
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlignLeft,
  AlertCircle,
  ArrowRight,
  Bell,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleCheck,
  Clock,
  Download,
  ExternalLink,
  Flag,
  FolderOpen,
  Info,
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Plus,
  Search,
  Send,
  Sparkles,
  Tag,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const SHOW_DEMO_TASKS = false;

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const DEMO_TASKS = [
  {
    id: 'demo-1',
    title: 'Angebot an Kunden senden',
    owner: 'Sarah',
    deadline: today,
    priority: 'HOCH',
    status: 'OPEN',
    meetingId: 'demo-m1',
    description: 'Finales Angebot gemäß Kundenbriefing ausarbeiten und versenden.',
    _demoMeetingTitle: 'Projekt Kickoff',
  },
  {
    id: 'demo-2',
    title: 'Anforderungen aus Meeting prüfen',
    owner: 'Michael',
    deadline: tomorrow,
    priority: 'MITTEL',
    status: 'IN_PROGRESS',
    meetingId: 'demo-m2',
    description: 'Technische Anforderungen aus dem Kickoff-Meeting validieren.',
    _demoMeetingTitle: 'Kundenmeeting',
  },
  {
    id: 'demo-3',
    title: 'Protokoll finalisieren',
    owner: 'Suayb',
    deadline: null,
    priority: 'NIEDRIG',
    status: 'DONE',
    meetingId: 'demo-m3',
    description: 'Meeting-Protokoll abschließen und im System speichern.',
    _demoMeetingTitle: 'Team Sync',
  },
];

const PRIORITY_META = {
  HOCH: { label: 'Hoch', cls: 'bg-red-50 text-red-700 border-red-200' },
  HIGH: { label: 'Hoch', cls: 'bg-red-50 text-red-700 border-red-200' },
  MITTEL: { label: 'Mittel', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  MEDIUM: { label: 'Mittel', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  NIEDRIG: { label: 'Niedrig', cls: 'bg-slate-50 text-[#64748B] border-[#E5EAF0]' },
  LOW: { label: 'Niedrig', cls: 'bg-slate-50 text-[#64748B] border-[#E5EAF0]' },
};

const KANBAN_COLS = [
  { id: 'open', label: 'Offen', accent: '#1E6FB5', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'in_progress', label: 'In Bearbeitung', accent: '#D97706', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'done', label: 'Erledigt', accent: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

const FILTER_EMPTY = {
  open: { title: 'Keine offenen Aufgaben', desc: 'Aktuell gibt es keine offenen Aufgaben.' },
  today: { title: 'Heute keine Aufgaben fällig', desc: 'Für heute sind keine Aufgaben aus Meetings geplant.' },
  overdue: { title: 'Keine überfälligen Aufgaben', desc: 'Alle offenen Aufgaben sind aktuell im Zeitplan.' },
  done: { title: 'Noch keine erledigten Aufgaben', desc: 'Sobald Aufgaben abgeschlossen werden, erscheinen sie hier.' },
  all: { title: 'Keine Aufgaben gefunden', desc: 'Die Suche lieferte keine Treffer.' },
};

function getTaskId(task) {
  return task?.id ?? task?._id ?? null;
}

function getTaskTitle(task) {
  return task?.title ?? task?.task ?? task?.name ?? 'Unbenannte Aufgabe';
}

function getTaskDescription(task) {
  return task?.description ?? task?.desc ?? task?.context ?? task?.aiContext ?? '';
}

function getTaskDeadline(task) {
  return task?.deadline ?? task?.dueDate ?? task?.due_at ?? task?.due ?? null;
}

function getTaskPriority(task) {
  return String(task?.priority ?? '').toUpperCase();
}

function getTaskMeetingId(task) {
  return task?.meetingId ?? task?.meeting_id ?? task?.meeting?.id ?? null;
}

function getTaskOwner(task) {
  return task?.assignedTo ?? task?.owner ?? task?.assignee ?? task?.responsible ?? '';
}

function getTaskComments(task) {
  return Array.isArray(task?.comments) ? task.comments : [];
}

function isUnassignedOwner(owner) {
  if (!owner) return true;

  const value = String(owner).trim().toLowerCase();

  return (
      value === '' ||
      value === 'nicht zugewiesen' ||
      value === 'unassigned' ||
      value === 'none' ||
      value === '-' ||
      value === '–'
  );
}

function matchesCurrentUser(task, currentUser) {
  if (!currentUser) return false;

  const owner = getTaskOwner(task);

  if (isUnassignedOwner(owner)) return false;

  const normalizedOwner = String(owner).trim().toLowerCase();

  const name = currentUser.name ?? '';
  const email = currentUser.email ?? '';
  const emailName = email.includes('@') ? email.split('@')[0] : '';
  const firstName = name.trim().split(' ')[0] ?? '';

  const possibleUserValues = [name, email, emailName, firstName]
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase());

  return possibleUserValues.some((value) => normalizedOwner === value);
}

function isTaskCompleted(task) {
  return task?.completed === true || task?.done === true || task?.status === 'DONE';
}

function normalizeStatus(task, localStatuses) {
  const id = getTaskId(task);

  if (id && localStatuses[id]) return localStatuses[id];
  if (isTaskCompleted(task)) return 'done';
  if (['IN_PROGRESS', 'DOING', 'in_progress'].includes(task?.status ?? '')) return 'in_progress';

  return 'open';
}

function isToday(value) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
  );
}

function isOverdue(value) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  const todayStart = new Date();

  todayStart.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date < todayStart;
}

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

function sortByUrgency(tasks, localStatuses) {
  return [...tasks].sort((a, b) => {
    const statusA = normalizeStatus(a, localStatuses);
    const statusB = normalizeStatus(b, localStatuses);
    const deadlineA = getTaskDeadline(a);
    const deadlineB = getTaskDeadline(b);
    const overdueA = isOverdue(deadlineA) && statusA !== 'done';
    const overdueB = isOverdue(deadlineB) && statusB !== 'done';
    const todayA = isToday(deadlineA) && statusA !== 'done';
    const todayB = isToday(deadlineB) && statusB !== 'done';

    if (statusA === 'done' && statusB !== 'done') return 1;
    if (statusA !== 'done' && statusB === 'done') return -1;
    if (overdueA && !overdueB) return -1;
    if (!overdueA && overdueB) return 1;
    if (todayA && !todayB) return -1;
    if (!todayA && todayB) return 1;
    if (deadlineA && !deadlineB) return -1;
    if (!deadlineA && deadlineB) return 1;
    if (deadlineA && deadlineB) return new Date(deadlineA) - new Date(deadlineB);

    return 0;
  });
}

function applyFilter(tasks, filter, query, localStatuses, getMeetingTitle) {
  let result = tasks;

  if (filter === 'open') {
    result = result.filter((task) => normalizeStatus(task, localStatuses) === 'open');
  }

  if (filter === 'done') {
    result = result.filter((task) => normalizeStatus(task, localStatuses) === 'done');
  }

  if (filter === 'today') {
    result = result.filter(
        (task) => normalizeStatus(task, localStatuses) !== 'done' && isToday(getTaskDeadline(task))
    );
  }

  if (filter === 'overdue') {
    result = result.filter(
        (task) => normalizeStatus(task, localStatuses) !== 'done' && isOverdue(getTaskDeadline(task))
    );
  }

  if (query.trim()) {
    const q = query.toLowerCase();

    result = result.filter((task) => {
      const values = [
        getTaskTitle(task),
        getTaskDescription(task),
        getTaskOwner(task),
        getTaskPriority(task),
        getMeetingTitle(getTaskMeetingId(task)) ?? '',
      ];

      return values.some((value) => String(value ?? '').toLowerCase().includes(q));
    });
  }

  return result;
}

function groupTasks(tasks, groupBy, getMeetingTitle) {
  if (groupBy === 'none') return [{ label: null, tasks }];

  const groups = {};

  const push = (key, task) => {
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  };

  if (groupBy === 'meeting') {
    tasks.forEach((task) => {
      const meetingId = getTaskMeetingId(task);
      const title = task._demoMeetingTitle ?? (meetingId ? getMeetingTitle(meetingId) : null);

      push(title ?? 'Ohne Meeting-Zuordnung', task);
    });

    return Object.entries(groups).map(([label, group]) => ({ label, tasks: group }));
  }

  if (groupBy === 'owner') {
    tasks.forEach((task) => push(getTaskOwner(task) || 'Nicht zugewiesen', task));
    return Object.entries(groups).map(([label, group]) => ({ label, tasks: group }));
  }

  if (groupBy === 'priority') {
    const bucket = (priority) => {
      if (['HOCH', 'HIGH'].includes(priority)) return 'Hoch';
      if (['MITTEL', 'MEDIUM'].includes(priority)) return 'Mittel';
      if (['NIEDRIG', 'LOW'].includes(priority)) return 'Niedrig';

      return 'Ohne Priorität';
    };

    tasks.forEach((task) => push(bucket(getTaskPriority(task)), task));

    return ['Hoch', 'Mittel', 'Niedrig', 'Ohne Priorität']
        .filter((key) => groups[key])
        .map((label) => ({ label, tasks: groups[label] }));
  }

  return [{ label: null, tasks }];
}

function computeKPIs(tasks, localStatuses) {
  return {
    open: tasks.filter((task) => normalizeStatus(task, localStatuses) === 'open').length,
    dueToday: tasks.filter(
        (task) => normalizeStatus(task, localStatuses) !== 'done' && isToday(getTaskDeadline(task))
    ).length,
    overdue: tasks.filter(
        (task) => normalizeStatus(task, localStatuses) !== 'done' && isOverdue(getTaskDeadline(task))
    ).length,
    done: tasks.filter((task) => normalizeStatus(task, localStatuses) === 'done').length,
  };
}

export default function TasksPage({
                                    tasks = [],
                                    meetings = [],
                                    onSelectMeeting,
                                    onNavigate,
                                    onUpdateTaskStatus,
                                  }) {
  const { currentUser } = useAuth();

  const [view, setView] = useState('list');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [localStatuses, setLocalStatuses] = useState({});
  const [localTasks, setLocalTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [activeTab, setActiveTab] = useState('team');

  const allTasks = useMemo(() => {
    const realTasks = [...tasks, ...localTasks];

    if (SHOW_DEMO_TASKS && realTasks.length === 0) return DEMO_TASKS;

    return realTasks;
  }, [tasks, localTasks]);

  const tabBaseTasks = useMemo(() => {
    if (activeTab === 'team') return allTasks;

    return allTasks.filter((task) => matchesCurrentUser(task, currentUser));
  }, [activeTab, allTasks, currentUser]);

  const getMeetingTitle = useCallback(
      (meetingId) => {
        if (!meetingId) return null;

        const meeting = meetings.find(
            (item) => String(item.id) === String(meetingId) || String(item.meetingId) === String(meetingId)
        );

        return meeting?.title ?? meeting?.meetingTitle ?? null;
      },
      [meetings]
  );

  const kpis = useMemo(() => computeKPIs(tabBaseTasks, localStatuses), [tabBaseTasks, localStatuses]);

  const sortedTasks = useMemo(
      () => sortByUrgency(tabBaseTasks, localStatuses),
      [tabBaseTasks, localStatuses]
  );

  const filteredTasks = useMemo(
      () => applyFilter(sortedTasks, filter, query, localStatuses, getMeetingTitle),
      [filter, getMeetingTitle, localStatuses, query, sortedTasks]
  );

  const analyzedMeetingCount = useMemo(() => {
    const ids = new Set(allTasks.map((task) => getTaskMeetingId(task)).filter(Boolean));
    return ids.size;
  }, [allTasks]);

  const handleStatusChange = useCallback(
      async (taskId, newStatus) => {
        if (!taskId) return;

        const backendStatusMap = {
          open: 'OPEN',
          in_progress: 'IN_PROGRESS',
          done: 'DONE',
        };

        setLocalStatuses((prev) => ({
          ...prev,
          [taskId]: newStatus,
        }));

        if (onUpdateTaskStatus) {
          try {
            await onUpdateTaskStatus(taskId, backendStatusMap[newStatus] ?? newStatus);
          } catch (error) {
            console.error('Status-Update fehlgeschlagen:', error);
          }
        }
      },
      [onUpdateTaskStatus]
  );

  function handleCreateTask(formData) {
    const newTask = {
      id: `local-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      owner: formData.owner,
      deadline: formData.deadline || null,
      priority: formData.priority,
      status: formData.status,
      meetingId: formData.meetingId || null,
      _isLocal: true,
    };

    setLocalTasks((prev) => [newTask, ...prev]);
    setShowNewTask(false);
  }

  function handleTabSwitch(tab) {
    setActiveTab(tab);
    setFilter('all');
    setQuery('');
  }

  const infoText =
      activeTab === 'team'
          ? `Alle Aufgaben aus allen Meetings · ${allTasks.length} ${
              allTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'
          } gesamt`
          : currentUser?.name
              ? `Zeigt deine Aufgaben als: ${currentUser.name}`
              : 'Nur Aufgaben, die deinem eingeloggten Nutzer zugewiesen wurden';

  const cardProps = {
    localStatuses,
    getMeetingTitle,
    onSelectMeeting,
    onStatusChange: handleStatusChange,
    onOpenDrawer: setSelectedTask,
  };

  return (
      <div
          className="flex-1 overflow-y-auto bg-[#F8FAFC]"
          onClick={() => {
            setShowExport(false);
            setShowNotif(false);
          }}
      >
        <div className="px-8 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold text-[#1E6FB5] uppercase tracking-[0.12em] mb-1.5">
                Task Management
              </p>

              <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">
                Aufgaben
              </h1>

              <p className="text-[13px] text-[#64748B] mt-1">
                Verfolge offene To-dos, Verantwortlichkeiten und Fristen aus KI-analysierten Meetings.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 pt-1">
              <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowNewTask(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
                  style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
              >
                <Plus size={13} strokeWidth={2.5} />
                Neue Aufgabe
              </button>

              <div className="relative">
                <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowNotif((value) => !value);
                      setShowExport(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5EAF0] bg-white text-[12px] font-medium text-[#64748B] hover:bg-[#F5F7FA] transition-colors"
                >
                  <Bell size={13} strokeWidth={2} />
                  Benachrichtigungen
                </button>

                {showNotif && <NotifPopover onClose={() => setShowNotif(false)} />}
              </div>

              <div className="relative">
                <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowExport((value) => !value);
                      setShowNotif(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5EAF0] bg-white text-[12px] font-medium text-[#64748B] hover:bg-[#F5F7FA] transition-colors"
                >
                  <Download size={13} strokeWidth={2} />
                  Export
                  <ChevronDown size={11} />
                </button>

                {showExport && <ExportPopover tasks={filteredTasks} />}
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pt-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center bg-white border border-[#E5EAF0] rounded-xl p-1 gap-0.5">
              <TabButton
                  label="Team-Aufgaben"
                  icon={Users}
                  active={activeTab === 'team'}
                  onClick={() => handleTabSwitch('team')}
              />

              <TabButton
                  label="Meine Aufgaben"
                  icon={User}
                  active={activeTab === 'personal'}
                  onClick={() => handleTabSwitch('personal')}
              />
            </div>
          </div>

          <p className="text-[12px] text-[#64748B] mt-2 flex items-center gap-1.5">
            <Info size={11} color="#94A3B8" strokeWidth={2} />
            {infoText}
          </p>
        </div>

        <div className="px-8 pt-4 pb-10 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <KPICard
                label="Offen"
                value={kpis.open}
                icon={ListChecks}
                iconColor="#1E6FB5"
                iconBg="bg-blue-50"
                filterId="open"
                filter={filter}
                setFilter={setFilter}
            />

            <KPICard
                label="Heute fällig"
                value={kpis.dueToday}
                icon={Clock}
                iconColor="#D97706"
                iconBg="bg-amber-50"
                filterId="today"
                filter={filter}
                setFilter={setFilter}
            />

            <KPICard
                label="Überfällig"
                value={kpis.overdue}
                icon={AlertCircle}
                iconColor="#DC2626"
                iconBg="bg-red-50"
                filterId="overdue"
                filter={filter}
                setFilter={setFilter}
                highlight={kpis.overdue > 0}
            />

            <KPICard
                label="Erledigt"
                value={kpis.done}
                icon={CircleCheck}
                iconColor="#059669"
                iconBg="bg-emerald-50"
                filterId="done"
                filter={filter}
                setFilter={setFilter}
            />
          </div>

          <AISourceBanner
              taskCount={activeTab === 'team' ? allTasks.length : tabBaseTasks.length}
              meetingCount={analyzedMeetingCount}
              isPersonalView={activeTab === 'personal'}
              currentUser={currentUser}
          />

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative min-w-[200px] max-w-[280px] flex-1">
              <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
              />

              <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Aufgaben suchen …"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#E5EAF0] rounded-xl text-[13px] text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#1E6FB5]/40 focus:shadow-[0_0_0_3px_rgba(30,111,181,0.06)] transition-all duration-150"
              />
            </div>

            <div className="flex items-center bg-white border border-[#E5EAF0] rounded-xl p-1 gap-0.5">
              {[
                { id: 'all', label: 'Alle' },
                { id: 'open', label: 'Offen' },
                { id: 'today', label: 'Heute' },
                { id: 'overdue', label: 'Überfällig' },
                { id: 'done', label: 'Erledigt' },
              ].map((item) => (
                  <button
                      key={item.id}
                      onClick={() => setFilter(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
                          filter === item.id
                              ? 'bg-[#1E6FB5] text-white shadow-sm'
                              : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F5F7FA]'
                      }`}
                  >
                    {item.label}

                    {item.id === 'all' && tabBaseTasks.length > 0 && (
                        <span
                            className={`ml-1.5 text-[11px] ${
                                filter === 'all' ? 'text-white/70' : 'text-[#94A3B8]'
                            }`}
                        >
                    {tabBaseTasks.length}
                  </span>
                    )}
                  </button>
              ))}
            </div>

            <SelectField
                label="Gruppieren"
                value={groupBy}
                onChange={setGroupBy}
                options={[
                  { value: 'none', label: 'Keine Gruppierung' },
                  { value: 'meeting', label: 'Nach Meeting' },
                  { value: 'owner', label: 'Nach Verantwortlich' },
                  { value: 'priority', label: 'Nach Priorität' },
                ]}
            />

            <div className="ml-auto flex items-center bg-white border border-[#E5EAF0] rounded-xl p-1">
              <ViewTab
                  icon={ListChecks}
                  label="Liste"
                  active={view === 'list'}
                  onClick={() => setView('list')}
              />

              <ViewTab
                  icon={LayoutGrid}
                  label="Kanban"
                  active={view === 'kanban'}
                  onClick={() => setView('kanban')}
              />
            </div>
          </div>

          {allTasks.length === 0 ? (
              <GlobalEmpty onNavigate={onNavigate} />
          ) : activeTab === 'personal' && tabBaseTasks.length === 0 ? (
              <PersonNoTasksEmpty currentUser={currentUser} onNavigate={onNavigate} />
          ) : view === 'list' ? (
              <ListView
                  tasks={filteredTasks}
                  filter={filter}
                  query={query}
                  groupBy={groupBy}
                  getMeetingTitle={getMeetingTitle}
                  onReset={() => {
                    setFilter('all');
                    setQuery('');
                  }}
                  {...cardProps}
              />
          ) : (
              <KanbanView
                  tasks={sortByUrgency(tabBaseTasks, localStatuses)}
                  query={query}
                  getMeetingTitle={getMeetingTitle}
                  {...cardProps}
              />
          )}
        </div>

        {selectedTask && (
            <TaskDetailDrawer
                task={selectedTask}
                meetingTitle={selectedTask._demoMeetingTitle ?? getMeetingTitle(getTaskMeetingId(selectedTask))}
                status={normalizeStatus(selectedTask, localStatuses)}
                onClose={() => setSelectedTask(null)}
                onSelectMeeting={onSelectMeeting}
                onStatusChange={handleStatusChange}
            />
        )}

        {showNewTask && (
            <NewTaskModal
                meetings={meetings}
                defaultOwner={activeTab === 'personal' ? currentUser?.name ?? '' : ''}
                onCreate={handleCreateTask}
                onClose={() => setShowNewTask(false)}
            />
        )}
      </div>
  );
}

function KPICard({
                   label,
                   value,
                   icon: Icon,
                   iconColor,
                   iconBg,
                   filterId,
                   filter,
                   setFilter,
                   highlight = false,
                 }) {
  const active = filter === filterId;

  return (
      <button
          onClick={() => setFilter(active ? 'all' : filterId)}
          className={`bg-white border rounded-2xl px-4 py-3.5 shadow-sm text-left transition-all duration-150 hover:-translate-y-px hover:shadow-md ${
              active
                  ? 'border-[#1E6FB5] ring-2 ring-[#1E6FB5]/10'
                  : highlight
                      ? 'border-red-200'
                      : 'border-[#E5EAF0]'
          }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.06em]">
              {label}
            </p>

            <p className={`text-[24px] font-bold mt-1 ${highlight ? 'text-red-600' : 'text-[#111827]'}`}>
              {value}
            </p>
          </div>

          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon size={18} color={iconColor} strokeWidth={2} />
          </div>
        </div>
      </button>
  );
}

function TabButton({ label, icon: Icon, active, onClick }) {
  return (
      <button
          onClick={onClick}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-all duration-150 ${
              active ? 'bg-[#1E6FB5] text-white shadow-sm' : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F5F7FA]'
          }`}
      >
        <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
        {label}
      </button>
  );
}

function PersonNoTasksEmpty({ currentUser, onNavigate }) {
  const name = currentUser?.name || currentUser?.email || 'deinen Account';

  return (
      <div className="bg-white border border-[#E5EAF0] rounded-2xl shadow-sm flex flex-col items-center text-center px-10 py-12">
        <div className="w-11 h-11 bg-slate-100 border border-[#E5EAF0] rounded-2xl flex items-center justify-center mb-4">
          <CheckSquare size={20} color="#94A3B8" strokeWidth={1.8} />
        </div>

        <p className="text-[14px] font-semibold text-[#111827] mb-2">
          Keine Aufgaben für dich
        </p>

        <p className="text-[13px] text-[#64748B] max-w-[380px] leading-relaxed mb-5">
          Für {name} wurden aktuell keine Aufgaben gefunden. Aufgaben erscheinen hier automatisch,
          wenn sie dir in einem analysierten Meeting zugewiesen wurden.
        </p>

        {onNavigate && (
            <button
                onClick={() => onNavigate('meetings')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
                style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
            >
              Zu Meetings <ArrowRight size={13} />
            </button>
        )}
      </div>
  );
}

function AISourceBanner({ taskCount, meetingCount, isPersonalView, currentUser }) {
  let text;

  if (isPersonalView) {
    const name = currentUser?.name || currentUser?.email || 'deinem Account';

    text =
        taskCount > 0
            ? `${taskCount} ${taskCount === 1 ? 'Aufgabe' : 'Aufgaben'} für ${name} aus KI-Analysen gefunden.`
            : `Aktuell sind keine Aufgaben für ${name} vorhanden.`;
  } else if (taskCount === 0) {
    text =
        'Aufgaben entstehen aus KI-Analysen deiner Meetings. Sobald ein Meeting analysiert wurde, erkennt MeetingMind To-dos, Verantwortliche und nächste Schritte.';
  } else {
    text =
        meetingCount > 0
            ? `MeetingMind hat ${taskCount} ${taskCount === 1 ? 'Aufgabe' : 'Aufgaben'} aus ${meetingCount} ${
                meetingCount === 1 ? 'Meeting' : 'Meetings'
            } erkannt.`
            : `MeetingMind hat ${taskCount} ${taskCount === 1 ? 'Aufgabe' : 'Aufgaben'} aus deinen Meetings erkannt.`;
  }

  return (
      <div className="flex items-start gap-2.5 bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-2.5">
        <Sparkles size={13} color="#1E6FB5" strokeWidth={2} className="flex-shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-[#1e40af] leading-relaxed">
          {text}
        </p>
      </div>
  );
}

function ListView({ tasks, filter, query, groupBy, getMeetingTitle, onReset, ...cardProps }) {
  if (tasks.length === 0) {
    return <FilterEmpty filter={filter} query={query} onReset={onReset} />;
  }

  const groups = groupTasks(tasks, groupBy, getMeetingTitle);

  return (
      <div className="space-y-5">
        {groups.map((group, index) => (
            <div key={index}>
              {group.label && (
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <p className="text-[11.5px] font-bold text-[#64748B] uppercase tracking-[0.08em]">
                      {group.label}
                    </p>

                    <span className="text-[10.5px] text-[#94A3B8] bg-slate-100 border border-[#E5EAF0] px-1.5 py-0.5 rounded">
                {group.tasks.length}
              </span>

                    <div className="flex-1 h-px bg-[#E5EAF0]" />
                  </div>
              )}

              <div className="flex flex-col gap-2">
                {group.tasks.map((task, taskIndex) => (
                    <TaskCard
                        key={getTaskId(task) ?? taskIndex}
                        task={task}
                        getMeetingTitle={getMeetingTitle}
                        {...cardProps}
                    />
                ))}
              </div>
            </div>
        ))}
      </div>
  );
}

function KanbanView({
                      tasks,
                      query,
                      getMeetingTitle,
                      localStatuses,
                      onStatusChange,
                      onOpenDrawer,
                      onSelectMeeting,
                    }) {
  const [draggedId, setDraggedId] = useState(null);

  const visibleTasks = useMemo(() => {
    if (!query.trim()) return tasks;

    const q = query.toLowerCase();

    return tasks.filter((task) => {
      return getTaskTitle(task).toLowerCase().includes(q) || getTaskOwner(task).toLowerCase().includes(q);
    });
  }, [query, tasks]);

  return (
      <div className="grid grid-cols-3 gap-4">
        {KANBAN_COLS.map((col) => {
          const colTasks = visibleTasks.filter((task) => normalizeStatus(task, localStatuses) === col.id);

          return (
              <KanbanCol
                  key={col.id}
                  col={col}
                  tasks={colTasks}
                  draggedId={draggedId}
                  setDraggedId={setDraggedId}
                  getMeetingTitle={getMeetingTitle}
                  localStatuses={localStatuses}
                  onSelectMeeting={onSelectMeeting}
                  onStatusChange={onStatusChange}
                  onOpenDrawer={onOpenDrawer}
              />
          );
        })}
      </div>
  );
}

function KanbanCol({
                     col,
                     tasks,
                     draggedId,
                     setDraggedId,
                     getMeetingTitle,
                     localStatuses,
                     onSelectMeeting,
                     onStatusChange,
                     onOpenDrawer,
                   }) {
  const [over, setOver] = useState(false);

  return (
      <div
          onDragOver={(event) => {
            event.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(event) => {
            event.preventDefault();

            if (draggedId) onStatusChange(draggedId, col.id);

            setDraggedId(null);
            setOver(false);
          }}
          className={`flex flex-col rounded-2xl border min-h-[200px] transition-all duration-150 ${
              over ? `${col.bg} ${col.border}` : 'bg-[#F5F7FA] border-[#E5EAF0]'
          }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.accent }} />
            <span className="text-[12.5px] font-bold text-[#111827]">
            {col.label}
          </span>
          </div>

          <span className="text-[11px] font-semibold text-[#94A3B8] bg-white border border-[#E5EAF0] px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
        </div>

        <div className="flex flex-col gap-2 p-3 flex-1">
          {tasks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-[12px] text-[#94A3B8] text-center">
                  Keine Aufgaben
                </p>
              </div>
          ) : (
              tasks.map((task, index) => (
                  <div
                      key={getTaskId(task) ?? index}
                      draggable
                      onDragStart={(event) => {
                        setDraggedId(getTaskId(task));
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      className={`transition-opacity duration-150 cursor-grab active:cursor-grabbing ${
                          draggedId === getTaskId(task) ? 'opacity-40' : 'opacity-100'
                      }`}
                  >
                    <TaskCard
                        task={task}
                        localStatuses={localStatuses}
                        getMeetingTitle={getMeetingTitle}
                        onSelectMeeting={onSelectMeeting}
                        onStatusChange={onStatusChange}
                        onOpenDrawer={onOpenDrawer}
                    />
                  </div>
              ))
          )}
        </div>
      </div>
  );
}

function TaskCard({
                    task,
                    localStatuses,
                    getMeetingTitle,
                    onSelectMeeting,
                    onStatusChange,
                    onOpenDrawer,
                  }) {
  const status = normalizeStatus(task, localStatuses);
  const title = getTaskTitle(task);
  const description = getTaskDescription(task);
  const owner = getTaskOwner(task);
  const priority = getTaskPriority(task);
  const deadline = getTaskDeadline(task);
  const deadlineFormatted = formatDate(deadline);
  const isDone = status === 'done';
  const overdue = !isDone && isOverdue(deadline);
  const dueToday = !isDone && isToday(deadline);
  const taskId = getTaskId(task);
  const meetingId = getTaskMeetingId(task);
  const meetingTitle = task._demoMeetingTitle ?? getMeetingTitle(meetingId);
  const priorityMeta = PRIORITY_META[priority] ?? null;

  return (
      <div
          onClick={() => onOpenDrawer(task)}
          className={`bg-white rounded-2xl border shadow-sm transition-all duration-150 cursor-pointer group ${
              isDone
                  ? 'border-[#E5EAF0] opacity-65'
                  : overdue
                      ? 'border-red-200 hover:border-red-300 hover:shadow-md'
                      : 'border-[#E5EAF0] hover:border-[#1E6FB5]/35 hover:shadow-md'
          }`}
      >
        <div className="px-4 py-3.5 flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5" onClick={(event) => event.stopPropagation()}>
            <input
                type="checkbox"
                className="custom-checkbox task-checkbox"
                checked={isDone}
                onChange={() => onStatusChange(taskId, isDone ? 'open' : 'done')}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p
                  className={`text-[13px] font-semibold leading-snug ${
                      isDone
                          ? 'line-through text-[#94A3B8]'
                          : 'text-[#111827] group-hover:text-[#1E6FB5] transition-colors'
                  }`}
              >
                {title}
              </p>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {priorityMeta && (
                    <span className={`text-[9.5px] font-bold border px-1.5 py-0.5 rounded uppercase ${priorityMeta.cls}`}>
                  {priorityMeta.label}
                </span>
                )}

                {overdue && <Chip cls="bg-red-50 text-red-700 border-red-200">Überfällig</Chip>}
                {dueToday && <Chip cls="bg-amber-50 text-amber-700 border-amber-200">Heute</Chip>}
              </div>
            </div>

            {description && (
                <p className="text-[12px] text-[#64748B] leading-relaxed line-clamp-2 mb-2">
                  {description}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              {meetingTitle && (
                  <button
                      onClick={(event) => {
                        event.stopPropagation();

                        if (meetingId && onSelectMeeting) onSelectMeeting(meetingId);
                      }}
                      className="text-[11px] font-medium text-[#1E6FB5] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md max-w-[180px] truncate hover:bg-blue-100 transition-colors"
                  >
                    {meetingTitle}
                  </button>
              )}

              {owner && !isUnassignedOwner(owner) && (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#64748B] bg-slate-50 border border-[#E5EAF0] px-2 py-0.5 rounded-md">
                <Avatar name={owner} size={14} />
                    {owner}
              </span>
              )}

              {deadlineFormatted && (
                  <span
                      className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                          overdue
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : dueToday
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-50 text-[#64748B] border-[#E5EAF0]'
                      }`}
                  >
                <Calendar size={9.5} strokeWidth={2} />
                    {deadlineFormatted}
              </span>
              )}

              <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenDrawer(task);
                  }}
                  className="ml-auto text-[11px] font-medium text-[#1E6FB5] hover:text-[#2B7EC7] transition-colors flex-shrink-0"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

function TaskDetailDrawer({
                            task,
                            meetingTitle,
                            status,
                            onClose,
                            onSelectMeeting,
                            onStatusChange,
                          }) {
  const [comments, setComments] = useState(getTaskComments(task));
  const [newComment, setNewComment] = useState('');
  const taskId = getTaskId(task);
  const deadline = getTaskDeadline(task);
  const overdue = status !== 'done' && isOverdue(deadline);
  const dueToday = status !== 'done' && isToday(deadline);
  const priority = getTaskPriority(task);
  const priorityMeta = PRIORITY_META[priority] ?? null;
  const meetingId = getTaskMeetingId(task);
  const owner = getTaskOwner(task);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function addComment() {
    if (!newComment.trim()) return;

    const comment = {
      author: 'Ich',
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, comment]);
    setNewComment('');
  }

  return (
      <>
        <div className="fixed inset-0 z-30 bg-[#0D2137]/20 backdrop-blur-[2px]" onClick={onClose} />

        <div className="fixed right-0 top-0 bottom-0 z-40 w-[400px] max-w-[95vw] bg-white shadow-[−8px_0_40px_rgba(13,33,55,0.12)] flex flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E5EAF0]">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] mb-0.5">
                Aufgabe
              </p>

              <h2 className="text-[14.5px] font-bold text-[#111827] tracking-tight leading-snug">
                {getTaskTitle(task)}
              </h2>
            </div>

            <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5EAF0] text-[#94A3B8] hover:text-[#111827] hover:bg-[#F5F7FA] transition-all flex-shrink-0"
            >
              <X size={13} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Status" icon={CircleCheck}>
                <StatusBadge status={status} />
              </DrawerField>

              <DrawerField label="Priorität" icon={Flag}>
                {priorityMeta ? (
                    <span className={`text-[11px] font-bold border px-2 py-0.5 rounded ${priorityMeta.cls}`}>
                  {priorityMeta.label}
                </span>
                ) : (
                    <span className="text-[12px] text-[#94A3B8]">–</span>
                )}
              </DrawerField>
            </div>

            <DrawerField label="Verantwortlich" icon={User}>
              {owner && !isUnassignedOwner(owner) ? (
                  <div className="flex items-center gap-2">
                    <Avatar name={owner} size={20} />
                    <span className="text-[13px] text-[#111827]">
                  {owner}
                </span>
                  </div>
              ) : (
                  <span className="text-[12.5px] text-[#94A3B8]">
                Nicht zugewiesen
              </span>
              )}
            </DrawerField>

            <DrawerField label="Deadline" icon={Calendar}>
              {formatDate(deadline) ? (
                  <span
                      className={`text-[13px] font-medium ${
                          overdue ? 'text-red-600' : dueToday ? 'text-amber-600' : 'text-[#111827]'
                      }`}
                  >
                {formatDate(deadline)}
                    {overdue ? ' · Überfällig' : dueToday ? ' · Heute' : ''}
              </span>
              ) : (
                  <span className="text-[12.5px] text-[#94A3B8]">
                Kein Datum
              </span>
              )}
            </DrawerField>

            <DrawerField label="Aus Meeting" icon={FolderOpen}>
              {meetingTitle ? (
                  <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#111827]">
                  {meetingTitle}
                </span>

                    {meetingId && onSelectMeeting && (
                        <button
                            onClick={() => onSelectMeeting(meetingId)}
                            className="flex items-center gap-0.5 text-[11px] text-[#1E6FB5] hover:text-[#2B7EC7] transition-colors"
                        >
                          öffnen <ExternalLink size={10} />
                        </button>
                    )}
                  </div>
              ) : (
                  <span className="text-[12.5px] text-[#94A3B8]">
                Kein Meeting verknüpft
              </span>
              )}
            </DrawerField>

            {getTaskDescription(task) && (
                <DrawerField label="Beschreibung" icon={AlignLeft}>
                  <p className="text-[13px] text-[#64748B] leading-relaxed">
                    {getTaskDescription(task)}
                  </p>
                </DrawerField>
            )}

            {(task.aiContext || task.sourceText) && (
                <DrawerField label="KI-Quelle" icon={Sparkles}>
                  <p className="text-[12.5px] text-[#64748B] leading-relaxed bg-blue-50/40 border border-blue-100 rounded-xl px-3 py-2">
                    {task.aiContext ?? task.sourceText}
                  </p>
                </DrawerField>
            )}

            <DrawerField label="Status ändern" icon={Tag}>
              <div className="flex gap-2">
                {[
                  ['open', 'Offen'],
                  ['in_progress', 'In Bearb.'],
                  ['done', 'Erledigt'],
                ].map(([nextStatus, label]) => (
                    <button
                        key={nextStatus}
                        onClick={() => onStatusChange(taskId, nextStatus)}
                        className={`px-2.5 py-1 rounded-lg text-[11.5px] font-semibold border transition-colors ${
                            status === nextStatus
                                ? 'bg-[#1E6FB5] text-white border-[#1E6FB5]'
                                : 'bg-white text-[#64748B] border-[#E5EAF0] hover:bg-[#F5F7FA]'
                        }`}
                    >
                      {label}
                    </button>
                ))}
              </div>
            </DrawerField>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MessageSquare size={12} color="#94A3B8" />

                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
                  Kommentare {comments.length > 0 && `(${comments.length})`}
                </p>
              </div>

              <div className="space-y-2 mb-2">
                {comments.map((comment, index) => (
                    <div key={index} className="bg-[#F8FAFC] rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-semibold text-[#111827]">
                      {comment.author}
                    </span>

                        {comment.createdAt && (
                            <span className="text-[10px] text-[#94A3B8]">
                        {new Date(comment.createdAt).toLocaleDateString('de-DE', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                        )}
                      </div>

                      <p className="text-[12px] text-[#64748B] leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                ))}

                {comments.length === 0 && (
                    <p className="text-[12px] text-[#94A3B8] italic">
                      Noch keine Kommentare.
                    </p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && addComment()}
                    placeholder="Kommentar schreiben …"
                    className="flex-1 px-3 py-1.5 text-[12.5px] bg-[#F8FAFC] border border-[#E5EAF0] rounded-xl text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#1E6FB5]/40 transition-all"
                />

                <button
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1E6FB5] text-white disabled:opacity-40 hover:bg-[#2B7EC7] transition-colors flex-shrink-0"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
  );
}

function NewTaskModal({ meetings, defaultOwner = '', onCreate, onClose }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    owner: defaultOwner,
    deadline: '',
    priority: 'MITTEL',
    status: 'OPEN',
    meetingId: '',
  });

  const [error, setError] = useState('');

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function handleSubmit() {
    if (!form.title.trim()) {
      setError('Bitte einen Titel eingeben.');
      return;
    }

    onCreate(form);
  }

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(13,33,55,0.42)', backdropFilter: 'blur(5px)' }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
      >
        <div className="bg-white rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(13,33,55,0.18)]">
          <div className="flex items-start justify-between px-6 py-5 border-b border-[#E5EAF0]">
            <div>
              <h2 className="text-[15px] font-bold text-[#111827] tracking-tight">
                Neue Aufgabe
              </h2>

              <p className="text-[12px] text-[#64748B] mt-0.5">
                Aufgabe lokal anlegen und Meeting verknüpfen.
              </p>
            </div>

            <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg border border-[#E5EAF0] flex items-center justify-center text-[#94A3B8] hover:text-[#111827] hover:bg-[#F5F7FA] transition-all flex-shrink-0 ml-3"
            >
              <X size={13} />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <ModalField label="Titel *">
              <Input
                  value={form.title}
                  onChange={(value) => set('title', value)}
                  placeholder="Aufgabe beschreiben …"
                  autoFocus
              />
            </ModalField>

            <ModalField label="Beschreibung">
            <textarea
                value={form.description}
                onChange={(event) => set('description', event.target.value)}
                placeholder="Optionaler Kontext …"
                rows={3}
                className="w-full px-3 py-2 border border-[#E5EAF0] bg-[#F8FAFC] rounded-xl text-[13px] text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#1E6FB5]/40 focus:bg-white transition-all resize-y min-h-[70px] font-sans"
            />
            </ModalField>

            <div className="grid grid-cols-2 gap-3">
              <ModalField label="Verantwortlich">
                <Input value={form.owner} onChange={(value) => set('owner', value)} placeholder="Name" />
              </ModalField>

              <ModalField label="Deadline">
                <Input type="date" value={form.deadline} onChange={(value) => set('deadline', value)} />
              </ModalField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ModalField label="Priorität">
                <Select
                    value={form.priority}
                    onChange={(value) => set('priority', value)}
                    options={[
                      { value: 'HOCH', label: 'Hoch' },
                      { value: 'MITTEL', label: 'Mittel' },
                      { value: 'NIEDRIG', label: 'Niedrig' },
                    ]}
                />
              </ModalField>

              <ModalField label="Status">
                <Select
                    value={form.status}
                    onChange={(value) => set('status', value)}
                    options={[
                      { value: 'OPEN', label: 'Offen' },
                      { value: 'IN_PROGRESS', label: 'In Bearbeitung' },
                      { value: 'DONE', label: 'Erledigt' },
                    ]}
                />
              </ModalField>
            </div>

            {meetings.length > 0 && (
                <ModalField label="Meeting verknüpfen">
                  <Select
                      value={form.meetingId}
                      onChange={(value) => set('meetingId', value)}
                      options={[
                        { value: '', label: 'Kein Meeting' },
                        ...meetings.map((meeting) => ({
                          value: meeting.id ?? meeting.meetingId,
                          label: meeting.title ?? meeting.meetingTitle ?? 'Meeting',
                        })),
                      ]}
                  />
                </ModalField>
            )}

            {error && (
                <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {error}
                </p>
            )}
          </div>

          <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-[#E5EAF0] bg-[#F8FAFC]">
            <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium text-[#64748B] border border-[#E5EAF0] bg-white hover:bg-[#F5F7FA] transition-colors"
            >
              Abbrechen
            </button>

            <button
                onClick={handleSubmit}
                className="px-4 py-1.5 rounded-lg text-[12.5px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
                style={{ background: 'linear-gradient(135deg,#1E6FB5,#2B7EC7)' }}
            >
              Aufgabe erstellen
            </button>
          </div>
        </div>
      </div>
  );
}

function NotifPopover({ onClose }) {
  return (
      <div
          className="absolute right-0 top-full mt-1.5 w-[300px] bg-white border border-[#E5EAF0] rounded-2xl shadow-[0_8px_24px_rgba(13,33,55,0.10)] p-4 z-20"
          onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold text-[#111827]">
            Benachrichtigungen
          </p>

          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#64748B]">
            <X size={13} />
          </button>
        </div>

        <p className="text-[12px] text-[#64748B] leading-relaxed mb-3">
          E-Mail-Benachrichtigungen und Reminder werden in einer späteren Version über das Backend aktiviert.
        </p>

        <div className="space-y-2">
          {[
            'Bei überfälligen Aufgaben erinnern',
            'Tägliche Zusammenfassung senden',
            'Verantwortliche per E-Mail informieren',
          ].map((label) => (
              <label key={label} className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <input type="checkbox" disabled className="w-3.5 h-3.5 rounded border-[#CBD5E1]" />
                <span className="text-[12px] text-[#64748B]">
              {label}
            </span>
              </label>
          ))}
        </div>
      </div>
  );
}

function ExportPopover({ tasks }) {
  const [hint, setHint] = useState(null);

  const items = [
    {
      label: 'PDF',
      action: () => setHint(`PDF-Export wird vorbereitet. Aktuelle Auswahl: ${tasks.length} Aufgaben.`),
    },
    {
      label: 'CSV',
      action: () => setHint(`CSV-Export wird vorbereitet. Aktuelle Auswahl: ${tasks.length} Aufgaben.`),
    },
    { label: 'Jira', action: () => setHint('Jira-Integration wird vorbereitet.') },
    { label: 'Asana', action: () => setHint('Asana-Integration wird vorbereitet.') },
    { label: 'Trello', action: () => setHint('Trello-Integration wird vorbereitet.') },
  ];

  return (
      <div
          className="absolute right-0 top-full mt-1.5 w-[240px] bg-white border border-[#E5EAF0] rounded-2xl shadow-[0_8px_24px_rgba(13,33,55,0.10)] overflow-hidden z-20"
          onClick={(event) => event.stopPropagation()}
      >
        {hint ? (
            <div className="p-4">
              <p className="text-[12px] text-[#64748B] leading-relaxed">
                {hint}
              </p>

              <button onClick={() => setHint(null)} className="mt-2 text-[11.5px] text-[#1E6FB5]">
                Zurück
              </button>
            </div>
        ) : (
            items.map((item) => (
                <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full text-left px-4 py-2.5 text-[12.5px] text-[#111827] hover:bg-[#F5F7FA] transition-colors border-b border-[#F1F5F9] last:border-0"
                >
                  {item.label}
                </button>
            ))
        )}
      </div>
  );
}

function GlobalEmpty({ onNavigate }) {
  return (
      <div className="bg-white border border-[#E5EAF0] rounded-2xl shadow-sm flex flex-col items-center text-center px-10 py-14">
        <div className="w-11 h-11 bg-slate-100 border border-[#E5EAF0] rounded-2xl flex items-center justify-center mb-4">
          <ListChecks size={20} color="#94A3B8" strokeWidth={1.8} />
        </div>

        <p className="text-[14px] font-semibold text-[#111827] mb-2">
          Keine Aufgaben vorhanden
        </p>

        <p className="text-[13px] text-[#64748B] max-w-[400px] leading-relaxed mb-5">
          Aufgaben entstehen automatisch, sobald ein Meeting analysiert wurde. Öffne ein Meeting,
          starte die KI-Analyse und MeetingMind extrahiert To-dos, Verantwortliche und nächste Schritte.
        </p>

        {onNavigate && (
            <button
                onClick={() => onNavigate('meetings')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white hover:-translate-y-px transition-all duration-150"
                style={{ background: 'linear-gradient(135deg,#1E6FB5,#2B7EC7)' }}
            >
              Zu Meetings <ArrowRight size={13} />
            </button>
        )}
      </div>
  );
}

function FilterEmpty({ filter, query, onReset }) {
  const { title, desc } = FILTER_EMPTY[filter] ?? FILTER_EMPTY.all;

  return (
      <div className="flex flex-col items-center text-center py-12">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3 border border-[#E5EAF0]">
          <CheckSquare size={18} color="#94A3B8" strokeWidth={1.8} />
        </div>

        <p className="text-[13.5px] font-semibold text-[#111827] mb-1.5">
          {query.trim() ? `Keine Ergebnisse für „${query}”` : title}
        </p>

        {!query.trim() && (
            <p className="text-[12.5px] text-[#64748B] leading-relaxed max-w-xs mb-3">
              {desc}
            </p>
        )}

        <button onClick={onReset} className="text-[12px] font-medium text-[#1E6FB5] hover:text-[#2B7EC7] transition-colors">
          Filter zurücksetzen
        </button>
      </div>
  );
}

function Avatar({ name, size = 18 }) {
  const dimension = `${size}px`;

  return (
      <div
          className="rounded-full bg-[#1E6FB5]/15 text-[#1E6FB5] flex items-center justify-center font-bold flex-shrink-0"
          style={{ width: dimension, height: dimension, fontSize: Math.max(8, size * 0.45) }}
      >
        {String(name ?? '?').charAt(0).toUpperCase()}
      </div>
  );
}

function Chip({ cls, children }) {
  return (
      <span className={`text-[9.5px] font-semibold border px-1.5 py-0.5 rounded whitespace-nowrap ${cls}`}>
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const config =
      {
        open: { cls: 'bg-blue-50 text-[#1E6FB5] border-blue-200', label: 'Offen' },
        in_progress: { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'In Bearbeitung' },
        done: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Erledigt' },
      }[status] ?? { cls: 'bg-slate-50 text-[#64748B] border-[#E5EAF0]', label: status };

  return (
      <span className={`text-[11px] font-semibold border px-2 py-0.5 rounded ${config.cls}`}>
      {config.label}
    </span>
  );
}

function ViewTab({ icon: Icon, label, active, onClick }) {
  return (
      <button
          onClick={onClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
              active ? 'bg-[#1E6FB5] text-white shadow-sm' : 'text-[#64748B] hover:text-[#111827]'
          }`}
      >
        <Icon size={13} strokeWidth={2} />
        {label}
      </button>
  );
}

function DrawerField({ label, icon: Icon, children }) {
  return (
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon size={11} color="#94A3B8" strokeWidth={2} />
          <p className="text-[10.5px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
            {label}
          </p>
        </div>

        {children}
      </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
      <div className="flex items-center gap-1.5">
      <span className="text-[12px] text-[#94A3B8] font-medium flex-shrink-0">
        {label}:
      </span>

        <div className="relative">
          <select
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="appearance-none pl-2.5 pr-6 py-1.5 bg-white border border-[#E5EAF0] rounded-lg text-[12px] text-[#111827] outline-none focus:border-[#1E6FB5]/40 transition-all font-sans cursor-pointer"
          >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
            ))}
          </select>

          <ChevronDown
              size={11}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
          />
        </div>
      </div>
  );
}

function ModalField({ label, children }) {
  return (
      <div>
        <label className="block text-[11.5px] font-semibold text-[#64748B] tracking-wide mb-1.5">
          {label}
        </label>

        {children}
      </div>
  );
}

function Input({ type = 'text', value, onChange, placeholder, autoFocus }) {
  return (
      <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full px-3 py-2 border border-[#E5EAF0] bg-[#F8FAFC] rounded-xl text-[13px] text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#1E6FB5]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(30,111,181,0.06)] transition-all duration-150 font-sans"
      />
  );
}

function Select({ value, onChange, options }) {
  return (
      <div className="relative">
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full appearance-none px-3 py-2 pr-8 border border-[#E5EAF0] bg-[#F8FAFC] rounded-xl text-[13px] text-[#111827] outline-none focus:border-[#1E6FB5]/40 focus:bg-white transition-all font-sans cursor-pointer"
        >
          {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
          ))}
        </select>

        <ChevronDown
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
        />
      </div>
  );
}
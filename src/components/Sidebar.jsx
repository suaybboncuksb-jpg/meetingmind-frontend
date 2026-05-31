import {
    LayoutDashboard,
    CalendarDays,
    CheckSquare,
    Settings,
    LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Workspace' },
    { id: 'meetings', label: 'Meetings', icon: CalendarDays, section: 'Workspace' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, section: 'Workspace' },
    { id: 'settings', label: 'Einstellungen', icon: Settings, section: 'System' },
];

const SECTIONS = [...new Set(NAV_ITEMS.map((item) => item.section))];

function getInitials(nameOrEmail) {
    if (!nameOrEmail) return 'U';

    const cleaned = nameOrEmail.trim();

    if (cleaned.includes('@')) {
        return cleaned.charAt(0).toUpperCase();
    }

    const parts = cleaned.split(' ').filter(Boolean);

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatRole(role) {
    if (!role) return 'User';

    if (role === 'ADMIN') return 'Administrator';
    if (role === 'USER') return 'User';

    return role;
}

export default function Sidebar({ currentPage, onNavigate }) {
    const { currentUser, logout } = useAuth();

    const displayName = currentUser?.name || currentUser?.email || 'User';
    const displayRole = formatRole(currentUser?.role);
    const initials = getInitials(displayName);

    function handleLogout() {
        logout();
    }

    return (
        <aside className="sidebar-gradient flex flex-col w-[220px] min-w-[220px] h-screen shadow-[2px_0_16px_rgba(13,33,55,0.3)] z-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 py-6 border-b border-white/5 mb-2">
                <img
                    src="/meetingmind-logo.png"
                    alt="MeetingMind"
                    className="w-9 h-9 rounded-[10px] object-cover flex-shrink-0 shadow-[0_4px_12px_rgba(30,111,181,0.4)]"
                />

                <span className="text-[15px] font-bold text-white tracking-tight">
          Meeting<span className="text-brand-muted">Mind</span>
        </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 overflow-y-auto">
                {SECTIONS.map((section) => (
                    <div key={section} className="mb-2">
                        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.08em] px-2 py-2 mt-1">
                            {section}
                        </p>

                        {NAV_ITEMS.filter((item) => item.section === section).map((item) => (
                            <NavItem
                                key={item.id}
                                item={item}
                                isActive={currentPage === item.id}
                                onClick={() => onNavigate(item.id)}
                            />
                        ))}
                    </div>
                ))}
            </nav>

            {/* User Card */}
            <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1E6FB5 0%, #2B7EC7 100%)' }}
                    >
                        {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-white/90 truncate">
                            {displayName}
                        </p>
                        <p className="text-[11px] text-white/35 truncate">
                            {displayRole}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        title="Ausloggen"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/10 transition-all duration-150 flex-shrink-0"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ item, isActive, onClick }) {
    const Icon = item.icon;

    return (
        <button
            onClick={onClick}
            className={`
        relative w-full flex items-center gap-2.5 px-3 py-[9px] rounded-xl mb-0.5
        text-[13.5px] font-medium transition-all duration-150 text-left select-none
        ${isActive ? 'nav-active text-white' : 'text-white/50 hover:text-white/85 hover:bg-white/5'}
      `}
        >
            <Icon size={16} className="flex-shrink-0" strokeWidth={isActive ? 2 : 1.8} />
            {item.label}
        </button>
    );
}
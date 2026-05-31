import Sidebar from './Sidebar.jsx';

export default function Layout({ currentPage, onNavigate, children }) {
    return (
        <div className="flex h-screen overflow-hidden bg-surface">
            <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
            <main className="flex-1 overflow-hidden flex flex-col animate-fade-in">
                {children}
            </main>
        </div>
    );
}
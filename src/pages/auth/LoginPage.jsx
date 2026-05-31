import { useState } from 'react';
import { Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginPage({ onShowRegister }) {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err) {
            console.error(err);
            setError('Login fehlgeschlagen. Bitte E-Mail und Passwort prüfen.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
            <div className="w-full max-w-[420px] bg-white border border-[#E5EAF0] rounded-3xl shadow-[0_20px_60px_rgba(13,33,55,0.10)] p-8">
                <div className="flex items-center gap-3 mb-8">
                    <img
                        src="/meetingmind-logo.png"
                        alt="MeetingMind"
                        className="w-12 h-12 rounded-2xl object-cover"
                    />

                    <div>
                        <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">
                            MeetingMind
                        </h1>
                        <p className="text-[13px] text-[#64748B]">
                            AI Meeting Workspace
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-[10.5px] font-bold text-[#1E6FB5] uppercase tracking-[0.12em] mb-1">
                        Willkommen zurück
                    </p>
                    <h2 className="text-[20px] font-bold text-[#111827]">
                        Einloggen
                    </h2>
                    <p className="text-[13px] text-[#64748B] mt-1">
                        Melde dich an, um deine Meetings und Aufgaben zu verwalten.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AuthField
                        icon={Mail}
                        label="E-Mail"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="name@unternehmen.de"
                    />

                    <AuthField
                        icon={Lock}
                        label="Passwort"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Passwort"
                    />

                    {error && (
                        <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-60 hover:-translate-y-px transition-all duration-150"
                        style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
                    >
                        <Sparkles size={14} />
                        {loading ? 'Melde an …' : 'Einloggen'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={onShowRegister}
                        className="text-[12.5px] font-medium text-[#1E6FB5] hover:text-[#2B7EC7]"
                    >
                        Noch keinen Account? Registrieren
                    </button>
                </div>
            </div>
        </div>
    );
}

function AuthField({ icon: Icon, label, type, value, onChange, placeholder }) {
    return (
        <label className="block">
      <span className="block text-[11.5px] font-semibold text-[#64748B] mb-1.5">
        {label}
      </span>

            <div className="relative">
                <Icon
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />

                <input
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-3 py-2.5 border border-[#E5EAF0] bg-[#F8FAFC] rounded-xl text-[13px] text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#1E6FB5]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(30,111,181,0.06)] transition-all"
                />
            </div>
        </label>
    );
}
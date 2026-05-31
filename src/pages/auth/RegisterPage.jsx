import { useState } from 'react';
import { Lock, Mail, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegisterPage({ onShowLogin }) {
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Bitte gib deinen Namen ein.');
            return;
        }

        if (!email.trim()) {
            setError('Bitte gib deine E-Mail-Adresse ein.');
            return;
        }

        if (password.length < 6) {
            setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
            return;
        }

        if (password !== passwordRepeat) {
            setError('Die Passwörter stimmen nicht überein.');
            return;
        }

        setLoading(true);

        try {
            await register(name.trim(), email.trim(), password);
        } catch (err) {
            console.error(err);
            setError('Registrierung fehlgeschlagen. Eventuell ist die E-Mail schon vergeben.');
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
                        Neuer Account
                    </p>
                    <h2 className="text-[20px] font-bold text-[#111827]">
                        Registrieren
                    </h2>
                    <p className="text-[13px] text-[#64748B] mt-1">
                        Erstelle deinen eigenen MeetingMind Workspace.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AuthField
                        icon={User}
                        label="Name"
                        type="text"
                        value={name}
                        onChange={setName}
                        placeholder="Dein Name"
                        autoComplete="name"
                    />

                    <AuthField
                        icon={Mail}
                        label="E-Mail"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="name@unternehmen.de"
                        autoComplete="email"
                    />

                    <AuthField
                        icon={Lock}
                        label="Passwort"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Mindestens 6 Zeichen"
                        autoComplete="new-password"
                    />

                    <AuthField
                        icon={Lock}
                        label="Passwort wiederholen"
                        type="password"
                        value={passwordRepeat}
                        onChange={setPasswordRepeat}
                        placeholder="Passwort erneut eingeben"
                        autoComplete="new-password"
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
                        {loading ? 'Registriere …' : 'Account erstellen'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={onShowLogin}
                        className="text-[12.5px] font-medium text-[#1E6FB5] hover:text-[#2B7EC7]"
                    >
                        Bereits registriert? Einloggen
                    </button>
                </div>
            </div>
        </div>
    );
}

function AuthField({
                       icon: Icon,
                       label,
                       type,
                       value,
                       onChange,
                       placeholder,
                       autoComplete,
                   }) {
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
                    autoComplete={autoComplete}
                    className="w-full pl-9 pr-3 py-2.5 border border-[#E5EAF0] bg-[#F8FAFC] rounded-xl text-[13px] text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#1E6FB5]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(30,111,181,0.06)] transition-all"
                />
            </div>
        </label>
    );
}
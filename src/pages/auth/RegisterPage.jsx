import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthShell, { AuthBrand } from '../../components/AuthShell.jsx';

export default function RegisterPage({ onShowLogin }) {
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);

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
        <AuthShell>
            <AuthBrand />

            <div className="mb-8">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-[#1E6FB5]">
                    Neuer Account
                </p>

                <h2 className="mb-3 text-[36px] font-bold tracking-[-0.045em] text-[#111827]">
                    Registrieren
                </h2>

                <p className="max-w-[390px] text-[16px] leading-[1.75] text-[#64748B]">
                    Erstelle deinen eigenen MeetingMind Workspace.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <GlassInput
                    icon={User}
                    label="Name"
                    type="text"
                    value={name}
                    onChange={setName}
                    placeholder="Dein Name"
                    autoComplete="name"
                />

                <GlassInput
                    icon={Mail}
                    label="E-Mail"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="name@unternehmen.de"
                    autoComplete="email"
                />

                <PasswordInput
                    label="Passwort"
                    value={password}
                    onChange={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    placeholder="Mindestens 6 Zeichen"
                    autoComplete="new-password"
                />

                <PasswordInput
                    label="Passwort wiederholen"
                    value={passwordRepeat}
                    onChange={setPasswordRepeat}
                    showPassword={showPasswordRepeat}
                    setShowPassword={setShowPasswordRepeat}
                    placeholder="Passwort erneut eingeben"
                    autoComplete="new-password"
                />

                {error && (
                    <p className="rounded-2xl border border-red-200 bg-red-50/85 px-4 py-3 text-[13px] text-red-600 shadow-sm">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="auth-primary-button"
                >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/45" />
                    <Sparkles size={17} />
                    {loading ? 'Registriere …' : 'Account erstellen'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <button
                    type="button"
                    onClick={onShowLogin}
                    className="text-[14px] font-semibold text-[#1E6FB5] transition-colors hover:text-[#0D2137]"
                >
                    Bereits registriert? Einloggen
                </button>
            </div>
        </AuthShell>
    );
}

function GlassInput({
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
      <span className="mb-2.5 block text-[13.5px] font-semibold text-[#111827]">
        {label}
      </span>

            <div className="relative">
                <Icon
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />

                <input
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="auth-glass-input pl-12 pr-4"
                />
            </div>
        </label>
    );
}

function PasswordInput({
                           label,
                           value,
                           onChange,
                           showPassword,
                           setShowPassword,
                           placeholder,
                           autoComplete,
                       }) {
    return (
        <div>
            <label className="mb-2.5 block text-[13.5px] font-semibold text-[#111827]">
                {label}
            </label>

            <div className="relative">
                <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />

                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="auth-glass-input pl-12 pr-12"
                />

                <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#1E6FB5]"
                    aria-label={showPassword ? 'Passwort ausblenden' : 'Passwort anzeigen'}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}
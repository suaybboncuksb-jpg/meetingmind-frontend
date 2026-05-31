import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthShell, { AuthBrand } from '../../components/AuthShell.jsx';

export default function LoginPage({ onShowRegister }) {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Bitte gib deine E-Mail-Adresse ein.');
            return;
        }

        if (!password) {
            setError('Bitte gib dein Passwort ein.');
            return;
        }

        setLoading(true);

        try {
            await login(email.trim(), password);
        } catch (err) {
            console.error(err);
            setError('Login fehlgeschlagen. Bitte E-Mail und Passwort prüfen.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthShell>
            <AuthBrand />

            <div className="mb-9">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-[#1E6FB5]">
                    Willkommen zurück
                </p>

                <h2 className="mb-3 text-[36px] font-bold tracking-[-0.045em] text-[#111827]">
                    Einloggen
                </h2>

                <p className="max-w-[390px] text-[16px] leading-[1.75] text-[#64748B]">
                    Melde dich an, um deine Meetings und Aufgaben zu verwalten.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <GlassInput
                    icon={Mail}
                    label="E-Mail"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="name@unternehmen.de"
                    autoComplete="email"
                />

                <div>
                    <label className="mb-2.5 block text-[13.5px] font-semibold text-[#111827]">
                        Passwort
                    </label>

                    <div className="relative">
                        <Lock
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                        />

                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Passwort"
                            autoComplete="current-password"
                            className="auth-glass-input pl-12 pr-12"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#1E6FB5]"
                            aria-label={showPassword ? 'Passwort ausblenden' : 'Passwort anzeigen'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

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
                    {loading ? 'Melde an …' : 'Einloggen'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <button
                    type="button"
                    onClick={onShowRegister}
                    className="text-[14px] font-semibold text-[#1E6FB5] transition-colors hover:text-[#0D2137]"
                >
                    Noch keinen Account? Registrieren
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
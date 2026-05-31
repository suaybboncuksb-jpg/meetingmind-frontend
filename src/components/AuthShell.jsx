import { ShieldCheck } from 'lucide-react';

export default function AuthShell({ children }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#F6F8FB] flex items-center justify-center px-6 py-10">
            {/* Ocean-Light Animated Background */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#FFFFFF_0%,#F7FAFD_36%,#EAF3FF_100%)]" />

            <div className="auth-ocean-orb auth-ocean-orb-1" />
            <div className="auth-ocean-orb auth-ocean-orb-2" />
            <div className="auth-ocean-orb auth-ocean-orb-3" />
            <div className="auth-ocean-wave auth-ocean-wave-1" />
            <div className="auth-ocean-wave auth-ocean-wave-2" />

            {/* Glow behind card */}
            <div className="absolute h-[620px] w-[800px] rounded-full bg-white/70 blur-[95px]" />

            {/* Frosted Glass Card */}
            <div className="relative w-full max-w-[620px] rounded-[38px] border border-white/75 bg-white/[0.58] px-14 py-12 shadow-[0_34px_95px_rgba(13,33,55,0.18)] backdrop-blur-[34px]">
                <div className="pointer-events-none absolute inset-0 rounded-[38px] border border-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.28)]" />
                <div className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                <div className="pointer-events-none absolute -bottom-8 left-12 right-12 h-10 rounded-full bg-[#0D2137]/10 blur-3xl" />

                <div className="relative">
                    {children}

                    <div className="mt-8 flex items-center justify-center gap-2 text-[12.5px] font-medium text-[#64748B]">
                        <ShieldCheck size={14} className="text-[#1E6FB5]" />
                        <span>Secure AI Meeting Workspace</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AuthBrand() {
    return (
        <div className="mb-11 flex items-center gap-5">
            <img
                src="/meetingmind-logo.png"
                alt="MeetingMind"
                className="h-[72px] w-[72px] rounded-[22px] object-cover shadow-[0_16px_34px_rgba(13,33,55,0.24)]"
            />

            <div>
                <h1 className="text-[34px] font-bold leading-none tracking-[-0.045em] text-[#0D2137]">
                    MeetingMind
                </h1>
                <p className="mt-2 text-[16px] tracking-wide text-[#64748B]">
                    AI Meeting Workspace
                </p>
            </div>
        </div>
    );
}
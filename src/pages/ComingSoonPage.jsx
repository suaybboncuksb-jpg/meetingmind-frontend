import { Sparkles, Archive, Settings } from 'lucide-react';

const HEADER_ICONS = { sparkles: Sparkles, archive: Archive, settings: Settings };
const GRADIENTS = {
    sparkles: 'linear-gradient(135deg, #1E3A5F 0%, #1E6FB5 100%)',
    archive:  'linear-gradient(135deg, #334155 0%, #64748B 100%)',
    settings: 'linear-gradient(135deg, #0D2137 0%, #1a3a55 100%)',
};
const SECTION_LABELS = { sparkles: 'Intelligence', archive: 'Verwaltung', settings: 'System' };

export default function ComingSoonPage({ icon = 'sparkles', title, subtitle, features = [] }) {
    const HeaderIcon   = HEADER_ICONS[icon] ?? Sparkles;
    const gradient     = GRADIENTS[icon]    ?? GRADIENTS.sparkles;
    const sectionLabel = SECTION_LABELS[icon] ?? 'System';

    return (
        <div className="flex-1 overflow-y-auto">
            {/* Page Header */}
            <div className="px-8 pt-8">
                <p className="text-[11px] font-semibold text-brand uppercase tracking-[0.1em] mb-1.5">
                    {sectionLabel}
                </p>
                <h1 className="text-[24px] font-bold text-ink tracking-tight">{title}</h1>
                <p className="text-[13px] text-ink-secondary mt-1">{subtitle}</p>
            </div>

            <div className="px-8 pt-6 pb-10 flex flex-col gap-6">

                {/* Empty State Card */}
                <div className="bg-white border border-line rounded-2xl shadow-card flex flex-col items-center text-center px-10 py-12">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                        style={{ background: gradient }}
                    >
                        <HeaderIcon size={26} color="white" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-[16px] font-semibold text-ink mb-2">{title}</h2>
                    <p className="text-[13px] text-ink-secondary max-w-sm leading-relaxed">{subtitle}</p>

                    <div className="flex items-center gap-2 mt-5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[12px] font-medium text-amber-700">In Entwicklung</span>
                    </div>
                </div>

                {/* Feature Preview */}
                {features.length > 0 && (
                    <div>
                        <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.1em] mb-3">
                            Geplante Features
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {features.map((f, i) => (
                                <FeatureCard key={i} feature={f} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function FeatureCard({ feature }) {
    const Icon = feature.Icon;
    return (
        <div className="relative bg-white border border-line rounded-xl p-5 overflow-hidden opacity-55 cursor-not-allowed select-none">
      <span className="absolute top-3 right-3 text-[9px] font-bold text-ink-muted bg-surface border border-line px-2 py-0.5 rounded uppercase tracking-wider">
        Demnächst
      </span>
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                <Icon size={16} color="#64748B" strokeWidth={1.8} />
            </div>
            <p className="text-[13px] font-semibold text-ink mb-1">{feature.title}</p>
            <p className="text-[12px] text-ink-secondary leading-relaxed">{feature.desc}</p>
        </div>
    );
}
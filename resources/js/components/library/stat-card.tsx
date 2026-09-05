import type { LucideIcon } from 'lucide-react';
import { TrendingUp } from 'lucide-react';

type Tone = 'blue' | 'amber' | 'green' | 'violet';

const TONES: Record<Tone, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-600 dark:text-violet-400' },
};

export function StatCard({
    label,
    value,
    delta,
    icon: Icon,
    tone = 'blue',
}: {
    label: string;
    value: string | number;
    delta?: string;
    icon: LucideIcon;
    tone?: Tone;
}) {
    const t = TONES[tone];

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${t.bg}`}>
                    <Icon className={`size-6 ${t.text}`} />
                </div>
            </div>
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
            <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
            </p>
            {delta && (
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingUp className="size-4" />
                    {delta}
                </p>
            )}
        </div>
    );
}

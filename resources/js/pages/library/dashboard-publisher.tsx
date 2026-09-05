import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Download, Eye, FileEdit, Library, Users } from 'lucide-react';
import { StatCard } from '@/components/library/stat-card';
import { TrendChart } from '@/components/library/trend-chart';
import type { TrendPoint } from '@/components/library/trend-chart';

type TopRow = {
    id: number;
    title: string;
    type: string | null;
    status: string;
    value: number;
};

type LatestRow = {
    id: number;
    title: string;
    type: string | null;
    status: string;
    created_at: string;
};

type Props = {
    stats: {
        totalCollections: number;
        published: number;
        draft: number;
        totalRead: number;
        totalDownload: number;
        totalVisitor: number;
    };
    trends: {
        reading: TrendPoint[];
        download: TrendPoint[];
        visitor: TrendPoint[];
    };
    topRead: TopRow[];
    latest: LatestRow[];
    period: string;
};

const PERIODS = [
    { key: 'daily', label: 'Harian' },
    { key: 'weekly', label: 'Mingguan' },
    { key: 'monthly', label: 'Bulanan' },
    { key: 'yearly', label: 'Tahunan' },
];

const STATUS_LABEL: Record<string, string> = {
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
};

const STATUS_TONE: Record<string, string> = {
    published: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    draft: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    archived: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800',
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                {title}
            </h2>
            {children}
        </div>
    );
}

export default function DashboardPublisher({
    stats,
    trends,
    topRead,
    latest,
    period,
}: Props) {
    const user = usePage().props.auth?.user ?? null;

    const changePeriod = (next: string) => {
        router.get('/library', { period: next }, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Ikhtisar" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            Halo, {user?.name} 👋
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Ringkasan performa koleksi yang Anda terbitkan.
                        </p>
                    </div>
                    <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                        {PERIODS.map((p) => (
                            <button
                                key={p.key}
                                type="button"
                                onClick={() => changePeriod(p.key)}
                                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                                    period === p.key
                                        ? 'bg-sl-primary text-white shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard label="Total Koleksi" value={stats.totalCollections} icon={Library} tone="blue" />
                    <StatCard label="Published" value={stats.published} icon={CheckCircle2} tone="green" />
                    <StatCard label="Draft / Menunggu" value={stats.draft} icon={FileEdit} tone="amber" />
                    <StatCard label="Total Dibaca" value={stats.totalRead} icon={Eye} tone="violet" />
                    <StatCard label="Total Diunduh" value={stats.totalDownload} icon={Download} tone="amber" />
                    <StatCard label="Total Pengunjung" value={stats.totalVisitor} icon={Users} tone="blue" />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <Card title="Tren Bacaan">
                        <TrendChart points={trends.reading} />
                    </Card>
                    <Card title="Tren Unduhan">
                        <TrendChart points={trends.download} />
                    </Card>
                    <Card title="Tren Pengunjung">
                        <TrendChart points={trends.visitor} />
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card title="Koleksi Terpopuler Anda">
                        {topRead.length === 0 ? (
                            <p className="text-sm text-neutral-400">Belum ada data.</p>
                        ) : (
                            <div className="space-y-3">
                                {topRead.map((row, i) => (
                                    <div key={row.id} className="flex items-center gap-3">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500 dark:bg-neutral-800">
                                            {i + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                                {row.title}
                                            </p>
                                            <span
                                                className={`mt-0.5 inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_TONE[row.status] ?? ''}`}
                                            >
                                                {STATUS_LABEL[row.status] ?? row.status}
                                            </span>
                                        </div>
                                        <span className="shrink-0 text-xs font-semibold text-sl-primary">
                                            {row.value.toLocaleString('id-ID')} dibaca
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card title="Koleksi Terbaru Anda">
                        {latest.length === 0 ? (
                            <p className="text-sm text-neutral-400">Belum ada data.</p>
                        ) : (
                            <div className="space-y-3">
                                {latest.map((row) => (
                                    <div key={row.id} className="flex items-start gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                                {row.title}
                                            </p>
                                            <p className="text-xs text-neutral-400">{row.type}</p>
                                        </div>
                                        <span className="shrink-0 text-xs text-neutral-400">
                                            {row.created_at}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}

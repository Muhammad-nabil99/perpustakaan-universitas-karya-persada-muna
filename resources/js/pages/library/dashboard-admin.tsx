import { Head, router } from '@inertiajs/react';
import {
    BookMarked,
    Download,
    Eye,
    GraduationCap,
    Library,
    ShieldAlert,
    Users,
} from 'lucide-react';
import { BarChart } from '@/components/library/bar-chart';
import type { BarDatum } from '@/components/library/bar-chart';
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
    author: string | null;
    status: string;
    created_at: string;
};

type Props = {
    stats: {
        totalCollections: number;
        totalBooks: number;
        totalTheses: number;
        totalRead: number;
        totalDownload: number;
        totalVisitor: number;
        totalUsers: number;
        pendingModeration: number;
    };
    charts: {
        byType: BarDatum[];
        byCategory: BarDatum[];
        byFaculty: BarDatum[];
        byDepartment: BarDatum[];
    };
    trends: {
        reading: TrendPoint[];
        download: TrendPoint[];
        visitor: TrendPoint[];
    };
    topRead: TopRow[];
    topDownloaded: TopRow[];
    latest: LatestRow[];
    period: string;
};

const PERIODS = [
    { key: 'daily', label: 'Harian' },
    { key: 'weekly', label: 'Mingguan' },
    { key: 'monthly', label: 'Bulanan' },
    { key: 'yearly', label: 'Tahunan' },
];

const TRENDS = [
    { key: 'reading', label: 'Tren Bacaan' },
    { key: 'download', label: 'Tren Unduhan' },
    { key: 'visitor', label: 'Tren Pengunjung' },
] as const;

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

export default function DashboardAdmin({
    stats,
    charts,
    trends,
    topRead,
    topDownloaded,
    latest,
    period,
}: Props) {
    const changePeriod = (next: string) => {
        router.get('/library', { period: next }, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Ikhtisar Platform" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            Ikhtisar Platform
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Analitik menyeluruh untuk seluruh repositori digital.
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

                {/* Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total Koleksi" value={stats.totalCollections} icon={Library} tone="blue" />
                    <StatCard label="Total Buku" value={stats.totalBooks} icon={BookMarked} tone="green" />
                    <StatCard label="Total Skripsi" value={stats.totalTheses} icon={GraduationCap} tone="violet" />
                    <StatCard label="Menunggu Moderasi" value={stats.pendingModeration} icon={ShieldAlert} tone="amber" />
                    <StatCard label="Total Dibaca" value={stats.totalRead} icon={Eye} tone="blue" />
                    <StatCard label="Total Diunduh" value={stats.totalDownload} icon={Download} tone="amber" />
                    <StatCard label="Total Pengunjung" value={stats.totalVisitor} icon={Users} tone="violet" />
                    <StatCard label="Total Pengguna" value={stats.totalUsers} icon={Users} tone="green" />
                </div>

                {/* Trends */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    {TRENDS.map((t) => (
                        <Card key={t.key} title={t.label}>
                            <TrendChart points={trends[t.key]} />
                        </Card>
                    ))}
                </div>

                {/* Breakdown charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card title="Koleksi per Tipe">
                        <BarChart data={charts.byType} />
                    </Card>
                    <Card title="Koleksi per Kategori">
                        <BarChart data={charts.byCategory} />
                    </Card>
                    <Card title="Koleksi per Fakultas">
                        <BarChart data={charts.byFaculty} />
                    </Card>
                    <Card title="Koleksi per Program Studi">
                        <BarChart data={charts.byDepartment} />
                    </Card>
                </div>

                {/* Top lists */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card title="Paling Banyak Dibaca">
                        <TopList rows={topRead} unit="dibaca" />
                    </Card>
                    <Card title="Paling Banyak Diunduh">
                        <TopList rows={topDownloaded} unit="unduhan" />
                    </Card>
                    <Card title="Koleksi Terbaru">
                        <div className="space-y-3">
                            {latest.length === 0 && (
                                <p className="text-sm text-neutral-400">Belum ada data.</p>
                            )}
                            {latest.map((row) => (
                                <div key={row.id} className="flex items-start gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                            {row.title}
                                        </p>
                                        <p className="truncate text-xs text-neutral-400">
                                            {row.type} · {row.author}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs text-neutral-400">
                                        {row.created_at}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}

function TopList({ rows, unit }: { rows: TopRow[]; unit: string }) {
    if (rows.length === 0) {
        return <p className="text-sm text-neutral-400">Belum ada data.</p>;
    }

    return (
        <div className="space-y-3">
            {rows.map((row, i) => (
                <div key={row.id} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500 dark:bg-neutral-800">
                        {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                            {row.title}
                        </p>
                        <p className="text-xs text-neutral-400">{row.type}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-sl-primary">
                        {row.value.toLocaleString('id-ID')} {unit}
                    </span>
                </div>
            ))}
        </div>
    );
}

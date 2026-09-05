import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import MaterialIcon from '@/components/perpustakaan/material-icon';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';
import type { DashboardInvitation } from '@/types';

type Props = {
    pendingInvitations?: DashboardInvitation[];
};

/* --- Mock dashboard data (to be wired to the backend analytics later) ------- */

const STATS = [
    {
        label: 'Total Buku',
        value: '12,548',
        delta: '+28 bulan ini',
        icon: 'book_2',
        tone: 'green' as const,
        spark: [8, 12, 10, 16, 14, 20, 24],
    },
    {
        label: 'Total Pengunjung',
        value: '5,321',
        delta: '+12% dari bulan lalu',
        icon: 'group',
        tone: 'blue' as const,
        spark: [10, 9, 14, 12, 18, 16, 22],
    },
    {
        label: 'Buku Dibaca',
        value: '14,235',
        delta: '+18% dari bulan lalu',
        icon: 'visibility',
        tone: 'purple' as const,
        spark: [6, 10, 8, 13, 12, 17, 21],
    },
    {
        label: 'Unduhan Buku',
        value: '8,592',
        delta: '+22% dari bulan lalu',
        icon: 'download',
        tone: 'orange' as const,
        spark: [7, 8, 11, 10, 15, 18, 20],
    },
];

const TOP_CATEGORIES = [
    { name: 'Computer Science', reads: '4,320', pct: 100, icon: 'computer' },
    { name: 'Engineering', reads: '3,102', pct: 72, icon: 'settings' },
    { name: 'Business', reads: '2,201', pct: 51, icon: 'work' },
    { name: 'Education', reads: '1,823', pct: 42, icon: 'school' },
    { name: 'Law', reads: '1,502', pct: 35, icon: 'balance' },
];

const POPULAR_BOOKS = [
    { title: 'Introduction to Artificial Intelligence', category: 'Computer Science', reads: 850, downloads: 620 },
    { title: 'Database Systems: Concepts & Design', category: 'Computer Science', reads: 702, downloads: 540 },
    { title: 'Web Programming with Modern JavaScript', category: 'Programming', reads: 695, downloads: 510 },
    { title: 'Machine Learning: A Practical Approach', category: 'Computer Science', reads: 640, downloads: 485 },
    { title: 'Operating System Concepts', category: 'Computer Science', reads: 612, downloads: 430 },
];

const RECENT_ACTIVITIES = [
    { name: 'John Doe', action: 'membaca', book: 'Machine Learning: A Practical Approach', type: 'read' as const, time: '10:25' },
    { name: 'Aisyah', action: 'mengunduh', book: 'Laravel 10 Guide', type: 'download' as const, time: '10:40' },
    { name: 'Michael Kim', action: 'membaca', book: 'Database Systems: Concepts & Design', type: 'read' as const, time: '10:55' },
    { name: 'Nur Farah', action: 'mengunduh', book: 'Clean Architecture', type: 'download' as const, time: '11:08' },
    { name: 'Rizky Setiawan', action: 'membaca', book: 'Introduction to AI', type: 'read' as const, time: '11:15' },
];

const TREND_POINTS = [
    { label: 'Sen', value: 400 },
    { label: 'Sel', value: 600 },
    { label: 'Rab', value: 720 },
    { label: 'Kam', value: 1024 },
    { label: 'Jum', value: 680 },
    { label: 'Sab', value: 590 },
    { label: 'Min', value: 840 },
];

const TREND_RANGES = ['Hari', 'Minggu', 'Bulan', 'Tahun'];

const STAT_TONES: Record<
    'green' | 'blue' | 'purple' | 'orange',
    { bg: string; text: string; stroke: string }
> = {
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', stroke: 'stroke-emerald-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', stroke: 'stroke-blue-500' },
    purple: { bg: 'bg-violet-50', text: 'text-violet-600', stroke: 'stroke-violet-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', stroke: 'stroke-orange-500' },
};

const AVATAR_TONES = [
    'bg-blue-100 text-blue-700',
    'bg-orange-100 text-orange-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
];

function Sparkline({ data, className }: { data: number[]; className: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 24 - ((v - min) / range) * 22 - 1;

            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-8 w-24">
            <polyline
                points={points}
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

function ReadingTrendChart() {
    const width = 640;
    const height = 260;
    const padX = 40;
    const padY = 20;
    const max = 1200;
    const stepX = (width - padX * 2) / (TREND_POINTS.length - 1);
    const yFor = (v: number) => height - padY - (v / max) * (height - padY * 2);
    const xFor = (i: number) => padX + i * stepX;

    const line = TREND_POINTS.map((p, i) => `${xFor(i)},${yFor(p.value)}`).join(' ');
    const area = `${padX},${height - padY} ${line} ${xFor(TREND_POINTS.length - 1)},${height - padY}`;
    const gridValues = [0, 200, 400, 600, 800, 1000, 1200];

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
            <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
            </defs>

            {gridValues.map((g) => (
                <g key={g}>
                    <line
                        x1={padX}
                        x2={width - padX}
                        y1={yFor(g)}
                        y2={yFor(g)}
                        className="stroke-neutral-200 dark:stroke-neutral-700"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                    />
                    <text
                        x={padX - 8}
                        y={yFor(g) + 4}
                        textAnchor="end"
                        className="fill-neutral-400 text-[10px]"
                    >
                        {g.toLocaleString()}
                    </text>
                </g>
            ))}

            <polygon points={area} fill="url(#trendFill)" />
            <polyline
                points={line}
                fill="none"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {TREND_POINTS.map((p, i) => (
                <g key={p.label}>
                    <circle cx={xFor(i)} cy={yFor(p.value)} r={4} fill="#10b981" />
                    <circle cx={xFor(i)} cy={yFor(p.value)} r={7} fill="#10b981" fillOpacity="0.15" />
                    <text
                        x={xFor(i)}
                        y={height - 2}
                        textAnchor="middle"
                        className="fill-neutral-500 text-[11px]"
                    >
                        {p.label}
                    </text>
                </g>
            ))}
        </svg>
    );
}

export default function Dashboard({ pendingInvitations = [] }: Props) {
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );
    const [range, setRange] = useState('Minggu');
    const getInitials = useInitials();
    const user = usePage().props.auth?.user ?? null;
    const firstName = user?.name?.split(/\s+/)[0] ?? 'Pengguna';

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <>
            <Head title="Dashboard" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Greeting header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            Selamat Datang, {user?.name ?? firstName} 👋
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Selamat datang kembali di Perpustakaan Digital. Berikut yang
                            terjadi di perpustakaan Anda hari ini.
                        </p>
                    </div>
                    <div className="text-sm md:text-right">
                        <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 md:justify-end">
                            <MaterialIcon name="calendar_today" className="text-[18px] text-neutral-400" />
                            <span className="font-medium">{today}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-neutral-400 md:justify-end">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>Terakhir disinkronkan 2 menit lalu</span>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {STATS.map((stat) => {
                        const tone = STAT_TONES[stat.tone];

                        return (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone.bg}`}>
                                        <MaterialIcon name={stat.icon} className={`text-[24px] ${tone.text}`} />
                                    </div>
                                    <Sparkline data={stat.spark} className={tone.stroke} />
                                </div>
                                <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                                    {stat.label}
                                </p>
                                <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                                    {stat.value}
                                </p>
                                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
                                    <MaterialIcon name="trending_up" className="text-[16px]" />
                                    {stat.delta}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Reading trend + Top categories */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MaterialIcon name="show_chart" className="text-[22px] text-sl-primary" />
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                    Tren Bacaan
                                </h2>
                            </div>
                            <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                                {TREND_RANGES.map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRange(r)}
                                        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                                            range === r
                                                ? 'bg-emerald-500 text-white shadow-sm'
                                                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ReadingTrendChart />
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MaterialIcon name="bookmark" className="text-[20px] text-sl-primary" />
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                    Kategori Teratas
                                </h2>
                            </div>
                            <button className="text-sm font-medium text-sl-primary hover:underline">
                                Lihat semua
                            </button>
                        </div>
                        <div className="space-y-5">
                            {TOP_CATEGORIES.map((cat) => (
                                <div key={cat.name} className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                        <MaterialIcon name={cat.icon} className="text-[18px] text-sl-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                                {cat.name}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <div
                                                className="h-1.5 rounded-full bg-emerald-500"
                                                style={{ width: `${cat.pct}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="flex-shrink-0 text-xs text-neutral-500">
                                        {cat.reads} Bacaan
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Popular books + Recent activities */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MaterialIcon name="local_fire_department" className="text-[22px] text-orange-500" />
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                    Buku Terpopuler
                                </h2>
                            </div>
                            <button className="text-sm font-medium text-sl-primary hover:underline">
                                Lihat semua buku
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[520px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-400 dark:border-neutral-800">
                                        <th className="py-2 pr-2 font-medium">#</th>
                                        <th className="py-2 pr-2 font-medium">Judul Buku</th>
                                        <th className="py-2 pr-2 font-medium">Kategori</th>
                                        <th className="py-2 pr-2 font-medium">Dibaca</th>
                                        <th className="py-2 font-medium">Unduhan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {POPULAR_BOOKS.map((book, i) => (
                                        <tr
                                            key={book.title}
                                            className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60"
                                        >
                                            <td className="py-3 pr-2 text-neutral-500">{i + 1}</td>
                                            <td className="py-3 pr-2 font-medium text-neutral-800 dark:text-neutral-100">
                                                {book.title}
                                            </td>
                                            <td className="py-3 pr-2">
                                                <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                    {book.category}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-2 font-semibold text-emerald-600">
                                                {book.reads}
                                            </td>
                                            <td className="py-3 font-semibold text-orange-500">
                                                {book.downloads}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MaterialIcon name="format_list_bulleted" className="text-[20px] text-sl-primary" />
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                                    Aktivitas Terbaru
                                </h2>
                            </div>
                            <button className="text-sm font-medium text-sl-primary hover:underline">
                                Lihat semua
                            </button>
                        </div>
                        <div className="space-y-4">
                            {RECENT_ACTIVITIES.map((act, i) => (
                                <div key={`${act.name}-${act.time}`} className="flex items-center gap-3">
                                    <div
                                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_TONES[i % AVATAR_TONES.length]}`}
                                    >
                                        {getInitials(act.name)}
                                    </div>
                                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <MaterialIcon
                                            name={act.type === 'read' ? 'visibility' : 'download'}
                                            className={`text-[14px] ${act.type === 'read' ? 'text-sl-primary' : 'text-orange-500'}`}
                                        />
                                    </div>
                                    <p className="min-w-0 flex-1 text-sm text-neutral-600 dark:text-neutral-300">
                                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                                            {act.name}
                                        </span>{' '}
                                        {act.action} "{act.book}"
                                    </p>
                                    <span className="flex-shrink-0 text-xs text-neutral-400">
                                        {act.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});

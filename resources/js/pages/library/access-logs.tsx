import { Head, router } from '@inertiajs/react';
import { Download, Eye, MousePointerClick } from 'lucide-react';

type LogRow = {
    id: number;
    actor: string;
    collection: string;
    action: 'read' | 'download' | 'visit';
    ip: string | null;
    timestamp: string;
};

type Paginator = {
    data: LogRow[];
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    logs: Paginator;
    isGlobal: boolean;
};

const ACTION_META: Record<
    LogRow['action'],
    { label: string; tone: string; Icon: typeof Eye }
> = {
    read: {
        label: 'Dibaca',
        tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        Icon: Eye,
    },
    download: {
        label: 'Diunduh',
        tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        Icon: Download,
    },
    visit: {
        label: 'Dikunjungi',
        tone: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
        Icon: MousePointerClick,
    },
};

export default function AccessLogs({ logs, isGlobal }: Props) {
    return (
        <>
            <Head title={isGlobal ? 'Riwayat Akses Global' : 'Riwayat Akses'} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                        {isGlobal ? 'Riwayat Akses Global' : 'Riwayat Akses'}
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {isGlobal
                            ? `Setiap peristiwa baca, unduh, dan kunjungan di seluruh platform (${logs.total} entri).`
                            : 'Siapa yang membaca atau mengunduh koleksi Anda.'}
                    </p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-400 dark:border-neutral-800">
                                <th className="px-4 py-3 font-medium">Pengguna / Tamu</th>
                                <th className="px-4 py-3 font-medium">Koleksi</th>
                                <th className="px-4 py-3 font-medium">Aksi</th>
                                <th className="px-4 py-3 font-medium">IP</th>
                                <th className="px-4 py-3 font-medium">Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-neutral-400">
                                        Belum ada aktivitas.
                                    </td>
                                </tr>
                            )}
                            {logs.data.map((log) => {
                                const meta = ACTION_META[log.action];

                                return (
                                    <tr
                                        key={log.id}
                                        className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60"
                                    >
                                        <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-100">
                                            {log.actor}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500">
                                            {log.collection}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${meta.tone}`}
                                            >
                                                <meta.Icon className="size-3.5" />
                                                {meta.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-400">
                                            {log.ip ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500">
                                            {log.timestamp}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {logs.last_page > 1 && (
                    <div className="flex flex-wrap justify-center gap-1">
                        {logs.links.map((link, i) => (
                            <button
                                key={i}
                                type="button"
                                disabled={!link.url}
                                onClick={() =>
                                    link.url &&
                                    router.get(link.url, {}, { preserveState: true, preserveScroll: true })
                                }
                                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                                    link.active
                                        ? 'bg-sl-primary text-white'
                                        : 'text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 dark:hover:bg-neutral-800'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

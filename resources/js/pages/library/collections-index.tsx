import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    CheckCircle2,
    Eye,
    PlusCircle,
    Search,
    Star,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ConfirmActionModal from '@/components/library/confirm-action-modal';
import type {ConfirmActionState} from '@/components/library/confirm-action-modal';

type Row = {
    id: number;
    slug: string;
    title: string;
    author: string;
    type: string | null;
    category: string | null;
    faculty: string | null;
    owner: string | null;
    status: string;
    featured: boolean;
    year: string | null;
    read_count: number;
    download_count: number;
};

type Paginator = {
    data: Row[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Filters = {
    search: string;
    type: string;
    category: string;
    faculty: string;
    year: string;
    status: string;
};

type Option = { id: number; name: string };

type Props = {
    collections: Paginator;
    canModerate: boolean;
    filters: Filters;
    options: {
        types: Option[];
        categories: Option[];
        faculties: Option[];
    };
};

const STATUS_LABEL: Record<string, string> = {
    draft: 'Menunggu Persetujuan',
    published: 'Terbit',
    archived: 'Diarsipkan',
};

const STATUS_TONE: Record<string, string> = {
    published: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    draft: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    archived: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
};

const STATUS_TABS = [
    { key: '', label: 'Semua' },
    { key: 'draft', label: 'Menunggu Persetujuan' },
    { key: 'published', label: 'Terbit' },
    { key: 'archived', label: 'Diarsipkan' },
];

export default function CollectionsIndex({
    collections,
    canModerate,
    filters,
    options,
}: Props) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    // Local override for client-side action errors and for dismissing a toast.
    const [override, setOverride] = useState<{
        kind: 'success' | 'error';
        text: string;
    } | null>(null);
    const [dismissed, setDismissed] = useState<string | null>(null);
    const first = useRef(true);

    // Surface server flash (moderation result / session expired) or a local
    // action error as a dismissible toast — derived, not synced into an effect.
    const flashMessage: { kind: 'success' | 'error'; text: string } | null = flash?.success
        ? { kind: 'success', text: flash.success }
        : flash?.error
          ? { kind: 'error', text: flash.error }
          : null;

    const toast =
        override ?? (flashMessage && flashMessage.text !== dismissed ? flashMessage : null);

    // Auto-dismiss whichever toast is currently visible after a few seconds.
    useEffect(() => {
        if (!toast) {
            return;
        }

        const timer = setTimeout(() => {
            setOverride(null);
            setDismissed(toast.text);
        }, 4000);

        return () => clearTimeout(timer);
    }, [toast]);

    const dismissToast = () => {
        setOverride(null);

        if (toast) {
            setDismissed(toast.text);
        }
    };

    const applyFilters = (next: Partial<Filters>) => {
        const merged = { ...filters, search, ...next };
        const query = Object.fromEntries(
            Object.entries(merged).filter(([, v]) => v !== '' && v != null),
        );

        router.get('/library/collections', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (first.current) {
            first.current = false;

            return;
        }

        const timer = setTimeout(() => applyFilters({ search }), 300);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);

    const act = (id: number, action: 'publish' | 'archive' | 'unarchive' | 'feature') => {
        router.patch(
            `/library/collections/${id}/${action}`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onError: () =>
                    setOverride({
                        kind: 'error',
                        text: 'Gagal memproses koleksi. Silakan coba lagi.',
                    }),
            },
        );
    };

    const remove = (row: Row) => {
        router.delete(`/library/collections/${row.id}`, {
            preserveScroll: true,
            // Reload the collection list from the server so the deleted row can
            // never linger in a stale client state.
            preserveState: false,
            onError: () =>
                setOverride({
                    kind: 'error',
                    text: 'Gagal menghapus koleksi. Silakan coba lagi.',
                }),
        });
    };

    // The book title, emphasised inside a confirmation prompt.
    const named = (title: string) => <strong className="text-neutral-700 dark:text-neutral-200">&ldquo;{title}&rdquo;</strong>;

    // Approve / archive / delete each open a themed confirmation modal first.
    const confirmPublish = (row: Row) =>
        setConfirmAction({
            icon: CheckCircle2,
            tone: 'emerald',
            title: 'Setujui koleksi ini?',
            description: <>Koleksi {named(row.title)} akan diterbitkan dan tampil di katalog publik.</>,
            confirmLabel: 'Ya, Setujui',
            onConfirm: () => act(row.id, 'publish'),
        });

    const confirmArchive = (row: Row) =>
        setConfirmAction({
            icon: Archive,
            tone: 'amber',
            title: 'Arsipkan koleksi ini?',
            description: <>Koleksi {named(row.title)} akan disembunyikan dari katalog publik. Anda bisa memulihkannya kapan saja.</>,
            confirmLabel: 'Ya, Arsipkan',
            onConfirm: () => act(row.id, 'archive'),
        });

    const confirmDelete = (row: Row) =>
        setConfirmAction({
            icon: Trash2,
            tone: 'red',
            title: 'Hapus koleksi ini?',
            description: <>Koleksi {named(row.title)} akan dihapus. Tindakan ini tidak dapat langsung dibatalkan.</>,
            confirmLabel: 'Ya, Hapus',
            onConfirm: () => remove(row),
        });

    const selectClass =
        'h-10 rounded-lg border border-neutral-200 bg-transparent px-3 text-sm focus:border-sl-primary focus:ring-0 dark:border-neutral-700';

    return (
        <>
            <Head title={canModerate ? 'Katalog Semua Koleksi' : 'Koleksi Saya'} />

            <ConfirmActionModal
                action={confirmAction}
                onOpenChange={(open) => !open && setConfirmAction(null)}
            />

            {toast && (
                <div
                    className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
                        toast.kind === 'success'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                    }`}
                    role="status"
                >
                    {toast.kind === 'success' ? (
                        <CheckCircle2 className="size-4 shrink-0" />
                    ) : (
                        <X className="size-4 shrink-0" />
                    )}
                    <span>{toast.text}</span>
                    <button
                        type="button"
                        onClick={dismissToast}
                        className="ml-1 rounded p-0.5 transition-colors hover:bg-white/20"
                        aria-label="Tutup"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>
            )}

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            {canModerate ? 'Katalog Semua Koleksi' : 'Koleksi Saya'}
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {canModerate
                                ? `Kelola dan moderasi ${collections.total} koleksi di platform.`
                                : `Anda memiliki ${collections.total} koleksi.`}
                        </p>
                    </div>
                    <Link
                        href="/library/collections/upload"
                        className="inline-flex items-center gap-2 rounded-lg bg-sl-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        <PlusCircle className="size-4" />
                        Unggah Koleksi
                    </Link>
                </div>

                {/* Filter & Search */}
                <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul, penulis, kata kunci, atau ISBN..."
                                className="h-10 w-full rounded-lg border border-neutral-200 bg-transparent pr-3 pl-9 text-sm focus:border-sl-primary focus:ring-0 focus:outline-none dark:border-neutral-700"
                            />
                        </div>

                        <select
                            value={filters.type ?? ''}
                            onChange={(e) => applyFilters({ type: e.target.value })}
                            className={`${selectClass} md:w-40`}
                        >
                            <option value="">Semua Tipe</option>
                            {options.types.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.category ?? ''}
                            onChange={(e) => applyFilters({ category: e.target.value })}
                            className={`${selectClass} md:w-48`}
                        >
                            <option value="">Semua Kategori</option>
                            {options.categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.faculty ?? ''}
                            onChange={(e) => applyFilters({ faculty: e.target.value })}
                            className={`${selectClass} md:w-48`}
                        >
                            <option value="">Semua Fakultas</option>
                            {options.faculties.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-1 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => applyFilters({ status: tab.key })}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    (filters.status ?? '') === tab.key
                                        ? 'bg-sl-primary text-white'
                                        : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <table className="w-full min-w-[860px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-400 dark:border-neutral-800">
                                <th className="px-4 py-3 font-medium">Judul</th>
                                <th className="px-4 py-3 font-medium">Tipe</th>
                                <th className="px-4 py-3 font-medium">Kategori</th>
                                {canModerate && <th className="px-4 py-3 font-medium">Pemilik</th>}
                                <th className="px-4 py-3 font-medium">Tahun</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Dibaca</th>
                                <th className="px-4 py-3 text-right font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={canModerate ? 8 : 7}
                                        className="px-4 py-10 text-center text-neutral-400"
                                    >
                                        Tidak ada koleksi yang cocok dengan filter.
                                    </td>
                                </tr>
                            )}
                            {collections.data.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60"
                                >
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-100">
                                            {row.featured && (
                                                <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                                            )}
                                            {row.title}
                                        </span>
                                        <span className="text-xs text-neutral-400">
                                            {row.author}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500">
                                        {row.type ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500">
                                        {row.category ?? '—'}
                                        {row.faculty && (
                                            <span className="block text-xs text-neutral-400">
                                                {row.faculty}
                                            </span>
                                        )}
                                    </td>
                                    {canModerate && (
                                        <td className="px-4 py-3 text-neutral-500">
                                            {row.owner ?? '—'}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-neutral-500">
                                        {row.year ?? '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_TONE[row.status] ?? ''}`}
                                        >
                                            {STATUS_LABEL[row.status] ?? row.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500">
                                        {row.read_count}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {canModerate && row.status === 'draft' && (
                                                <>
                                                    <a
                                                        href={`/library/collections/${row.id}/preview`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        Tinjau
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmPublish(row)}
                                                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-600"
                                                    >
                                                        <CheckCircle2 className="size-3.5" />
                                                        Setujui
                                                    </button>
                                                </>
                                            )}

                                            {canModerate && row.status === 'published' && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => act(row.id, 'feature')}
                                                        className={`rounded-md p-1.5 transition-colors ${
                                                            row.featured
                                                                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                                                : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                                        }`}
                                                        aria-label="Unggulan"
                                                    >
                                                        <Star
                                                            className={`size-4 ${row.featured ? 'fill-amber-400' : ''}`}
                                                        />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmArchive(row)}
                                                        className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                        aria-label="Arsipkan"
                                                    >
                                                        <Archive className="size-4" />
                                                    </button>
                                                </>
                                            )}

                                            {canModerate && row.status === 'archived' && (
                                                <button
                                                    type="button"
                                                    onClick={() => act(row.id, 'unarchive')}
                                                    className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-600"
                                                >
                                                    <ArchiveRestore className="size-3.5" />
                                                    Pulihkan
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => confirmDelete(row)}
                                                className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
                                                aria-label="Hapus"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {collections.last_page > 1 && (
                    <div className="flex flex-wrap justify-center gap-1">
                        {collections.links.map((link, i) => (
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

import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import MaterialIcon from '@/components/perpustakaan/material-icon';
import PerpustakaanLayout from '@/layouts/perpustakaan-layout';

type Result = {
    id: number;
    slug: string;
    title: string;
    author: string;
    type: string | null;
    category: string | null;
    year: string | null;
    description: string | null;
    cover: string | null;
    featured: boolean;
    read_count: number;
};

type Paginator = {
    data: Result[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Filters = {
    search: string;
    category: string;
    type: string;
    faculty: string;
    year: string;
    sort: string;
};

type Props = {
    results: Paginator;
    filters: Filters;
    options: {
        categories: Array<{ slug: string; name: string; is_child: boolean }>;
        types: Array<{ slug: string; name: string }>;
        faculties: Array<{ id: number; name: string }>;
        years: Array<string | number>;
    };
};

const SORTS = [
    { key: 'relevance', label: 'Relevansi' },
    { key: 'newest', label: 'Terbaru' },
    { key: 'popular', label: 'Terpopuler' },
];

const TYPE_ICON: Record<string, string> = {
    Buku: 'menu_book',
    Skripsi: 'school',
    Jurnal: 'article',
    Modul: 'inventory_2',
    Prosiding: 'groups',
    'Laporan Penelitian': 'science',
};

const typeIcon = (type: string | null) => (type && TYPE_ICON[type]) || 'description';

/** Real uploaded cover, or a typed gradient placeholder. */
function Cover({ item }: { item: Result }) {
    if (item.cover) {
        return (
            <img
                className="h-full w-full object-cover"
                alt={item.title}
                src={`/storage/${item.cover}`}
            />
        );
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-sl-primary to-sl-primary-container p-2 text-center">
            <MaterialIcon
                name={typeIcon(item.type)}
                className="text-[28px] text-white/50"
            />
            <p className="mt-1 line-clamp-3 text-[10px] font-semibold text-white/90">
                {item.title}
            </p>
        </div>
    );
}

export default function Pencarian({ results, filters, options }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const first = useRef(true);

    /** Merge one changed filter into the current set and re-query the server. */
    const applyFilters = (next: Partial<Filters>) => {
        const merged = { ...filters, search, ...next };
        const query = Object.fromEntries(
            Object.entries(merged).filter(([, v]) => v !== '' && v != null),
        );

        router.get('/pencarian', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Debounce the search box so we don't query on every keystroke.
    useEffect(() => {
        if (first.current) {
            first.current = false;

            return;
        }

        const timer = setTimeout(() => applyFilters({ search }), 300);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const selectClass =
        'h-10 w-full appearance-none rounded-sm border border-sl-outline-variant bg-sl-surface px-3 pr-10 text-sl-label-md focus:border-sl-primary focus:ring-0';

    return (
        <PerpustakaanLayout
            active="search"
            mainClassName="px-sl-margin-mobile pt-14 pb-20 md:px-sl-margin-desktop md:pb-10"
        >
            <Head title="Pencarian Koleksi" />

            {/* Sticky search + filters */}
            <div className="sticky top-14 z-40 -mx-sl-margin-mobile border-b border-sl-outline-variant/30 bg-sl-surface/95 px-sl-margin-mobile py-sl-stack-md backdrop-blur-sm md:-mx-sl-margin-desktop md:px-sl-margin-desktop">
                <div className="flex flex-col gap-4">
                    <div className="group relative">
                        <MaterialIcon
                            name="search"
                            className="absolute top-1/2 left-4 -translate-y-1/2 text-sl-outline transition-colors group-focus-within:text-sl-primary"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-14 w-full rounded-sm border border-sl-outline-variant bg-sl-surface-container-low pr-4 pl-12 text-sl-body-md transition-all focus:border-sl-primary focus:ring-0 focus:outline-none"
                            placeholder="Cari judul, penulis, kata kunci, atau ISBN..."
                            type="text"
                        />
                    </div>

                    <div className="flex flex-wrap gap-sl-stack-sm">
                        {/* Category (slug-based; roots roll up their children) */}
                        <div className="relative min-w-[140px] flex-1">
                            <select
                                value={filters.category ?? ''}
                                onChange={(e) =>
                                    applyFilters({ category: e.target.value })
                                }
                                className={selectClass}
                            >
                                <option value="">Semua Kategori</option>
                                {options.categories.map((c) => (
                                    <option key={c.slug} value={c.slug}>
                                        {c.is_child ? `- ${c.name}` : c.name}
                                    </option>
                                ))}
                            </select>
                            <MaterialIcon
                                name="expand_more"
                                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[20px] text-sl-outline"
                            />
                        </div>

                        {/* Collection type */}
                        <div className="relative min-w-[140px] flex-1">
                            <select
                                value={filters.type ?? ''}
                                onChange={(e) => applyFilters({ type: e.target.value })}
                                className={selectClass}
                            >
                                <option value="">Semua Tipe</option>
                                {options.types.map((t) => (
                                    <option key={t.slug} value={t.slug}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                            <MaterialIcon
                                name="expand_more"
                                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[20px] text-sl-outline"
                            />
                        </div>

                        {/* Faculty */}
                        <div className="relative min-w-[140px] flex-1">
                            <select
                                value={filters.faculty ?? ''}
                                onChange={(e) =>
                                    applyFilters({ faculty: e.target.value })
                                }
                                className={selectClass}
                            >
                                <option value="">Semua Fakultas</option>
                                {options.faculties.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                            <MaterialIcon
                                name="expand_more"
                                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[20px] text-sl-outline"
                            />
                        </div>

                        {/* Year */}
                        <div className="relative min-w-[140px] flex-1">
                            <select
                                value={filters.year ?? ''}
                                onChange={(e) => applyFilters({ year: e.target.value })}
                                className={selectClass}
                            >
                                <option value="">Semua Tahun</option>
                                {options.years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                            <MaterialIcon
                                name="expand_more"
                                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[20px] text-sl-outline"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Results header */}
            <div className="mt-sl-stack-md mb-sl-stack-sm flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sl-headline-md text-sl-on-surface">
                    Hasil Pencarian ({results.total})
                </h2>
                <div className="flex items-center gap-2 text-sl-label-sm tracking-wider text-sl-outline uppercase">
                    Urutkan:
                    <div className="flex gap-1">
                        {SORTS.map((s) => (
                            <button
                                key={s.key}
                                type="button"
                                onClick={() => applyFilters({ sort: s.key })}
                                className={`rounded-sm px-2 py-1 text-sl-label-sm normal-case transition-colors ${
                                    (filters.sort ?? 'relevance') === s.key
                                        ? 'bg-sl-primary font-bold text-sl-on-primary'
                                        : 'text-sl-on-surface-variant hover:bg-sl-surface-container-low'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results grid */}
            {results.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-sl-outline-variant py-16 text-center">
                    <MaterialIcon
                        name="search_off"
                        className="text-[48px] text-sl-outline"
                    />
                    <p className="mt-3 text-sl-body-lg text-sl-on-surface">
                        Tidak ada koleksi yang cocok
                    </p>
                    <p className="mt-1 text-sl-body-md text-sl-on-surface-variant">
                        Coba ubah kata kunci atau filter Anda.
                    </p>
                </div>
            ) : (
                <div className="mt-4 grid grid-cols-1 gap-sl-gutter md:grid-cols-2 lg:grid-cols-3">
                    {results.data.map((item) => (
                        <Link
                            href={`/buku/${item.slug}`}
                            key={item.id}
                            className="group flex cursor-pointer gap-4 rounded-sm border border-sl-outline-variant bg-sl-surface p-4 transition-all duration-200 hover:border-sl-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                        >
                            <div className="h-36 w-24 flex-shrink-0 overflow-hidden rounded-sm border border-sl-outline-variant/30 bg-sl-surface-container shadow-sm">
                                <Cover item={item} />
                            </div>
                            <div className="flex min-w-0 flex-col justify-between py-1">
                                <div>
                                    <h3 className="line-clamp-2 text-sl-headline-sm-mobile leading-tight font-semibold text-sl-on-surface transition-colors group-hover:text-sl-primary">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 line-clamp-1 text-sl-label-md text-sl-on-surface-variant">
                                        {item.author}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        <span className="inline-flex items-center rounded-sm bg-sl-primary/10 px-2 py-0.5 text-sl-label-sm text-sl-primary">
                                            {item.type ?? 'Koleksi'}
                                        </span>
                                        {item.category && (
                                            <span className="inline-flex items-center rounded-sm bg-sl-secondary-container px-2 py-0.5 text-sl-label-sm text-sl-on-secondary-container">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-3">
                                    {item.year && (
                                        <span className="text-sl-label-sm text-sl-outline">
                                            Terbit: {item.year}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-0.5 text-sl-label-sm text-sl-outline">
                                        <MaterialIcon
                                            name="visibility"
                                            className="text-[14px]"
                                        />
                                        {item.read_count}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {results.last_page > 1 && (
                <div className="mt-sl-stack-lg flex flex-wrap justify-center gap-1 pb-sl-stack-lg">
                    {results.links.map((link, i) => (
                        <button
                            key={i}
                            type="button"
                            disabled={!link.url}
                            onClick={() =>
                                link.url &&
                                router.get(
                                    link.url,
                                    {},
                                    { preserveState: true, preserveScroll: true },
                                )
                            }
                            className={`rounded-sm px-3 py-2 text-sl-label-md transition-colors ${
                                link.active
                                    ? 'bg-sl-primary text-sl-on-primary'
                                    : 'text-sl-on-surface-variant hover:bg-sl-surface-container-low disabled:opacity-40'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </PerpustakaanLayout>
    );
}

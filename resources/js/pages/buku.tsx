import { Head, Link, usePage } from '@inertiajs/react';
import MaterialIcon from '@/components/perpustakaan/material-icon';
import PerpustakaanLayout from '@/layouts/perpustakaan-layout';

type RelatedItem = {
    id: number;
    slug: string;
    title: string;
    author: string;
    type: string | null;
    cover: string | null;
};

type CollectionDetail = {
    id: number;
    slug: string;
    title: string;
    author: string;
    type: string | null;
    category: string | null;
    year: string | null;
    cover: string | null;
    featured: boolean;
    read_count: number;
    download_count: number;
    isbn: string | null;
    pages: number | null;
    keywords: string | null;
    fullDescription: string | null;
    faculty: string | null;
    department: string | null;
    language: string | null;
    publisher: string | null;
    file: string | null;
};

type Props = {
    collection: CollectionDetail;
    related: RelatedItem[];
};

const TYPE_ICON: Record<string, string> = {
    Buku: 'menu_book',
    Skripsi: 'school',
    Jurnal: 'article',
    Modul: 'inventory_2',
    Prosiding: 'groups',
    'Laporan Penelitian': 'science',
};

const typeIcon = (type: string | null) => (type && TYPE_ICON[type]) || 'description';

/** The real uploaded cover, or a typed gradient placeholder. */
function Cover({
    cover,
    title,
    type,
}: {
    cover: string | null;
    title: string;
    type: string | null;
}) {
    if (cover) {
        return (
            <img
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt={title}
                src={`/storage/${cover}`}
            />
        );
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-sl-primary to-sl-primary-container p-6 text-center">
            <MaterialIcon name={typeIcon(type)} className="text-[64px] text-white/50" />
            <p className="mt-3 line-clamp-4 text-sm font-semibold text-white/90">
                {title}
            </p>
        </div>
    );
}

export default function Buku({ collection, related }: Props) {
    const user = usePage().props.auth?.user ?? null;

    // Only the specs that actually have a value — a Thesis has no ISBN/publisher.
    const specs = [
        { label: 'Tipe', value: collection.type },
        { label: 'ISBN', value: collection.isbn },
        { label: 'Halaman', value: collection.pages ? `${collection.pages} Halaman` : null },
        { label: 'Bahasa', value: collection.language },
        { label: 'Penerbit', value: collection.publisher },
        { label: 'Tahun Terbit', value: collection.year },
        { label: 'Fakultas', value: collection.faculty },
        { label: 'Program Studi', value: collection.department },
    ].filter((s) => s.value);

    // Reading and downloading require login (the routes are auth-guarded).
    // - Guest: navigate this tab to the guarded URL; Laravel's auth middleware
    //   stores it as the "intended" URL and redirects to /login, then Fortify
    //   returns the user here after they sign in.
    // - Logged-in: read opens the PDF in a new tab, download stays in this tab.
    const access = (mode: 'baca' | 'unduh') => {
        const target = `/buku/${collection.slug}/${mode}`;

        if (!user) {
            window.location.href = target;

            return;
        }

        if (mode === 'baca') {
            window.open(target, '_blank', 'noopener');
        } else {
            window.location.href = target;
        }
    };

    return (
        <PerpustakaanLayout
            active="my-books"
            detailBar
            mainClassName="px-sl-margin-mobile pt-20 pb-28 md:px-sl-margin-desktop"
        >
            <Head title={collection.title} />

            <div className="grid grid-cols-1 gap-sl-gutter md:grid-cols-12">
                {/* Cover */}
                <div className="md:col-span-5 lg:col-span-4">
                    <div className="group relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-sl-outline-variant/30 bg-sl-surface-container shadow-sm">
                        <Cover
                            cover={collection.cover}
                            title={collection.title}
                            type={collection.type}
                        />
                        {collection.featured && (
                            <div className="absolute top-4 right-4 rounded-sm bg-sl-secondary-container px-3 py-1 text-sl-label-sm font-bold text-sl-on-secondary-container shadow-sm">
                                Unggulan
                            </div>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-sl-stack-md md:col-span-7 lg:col-span-8">
                    <section className="flex flex-col gap-1">
                        <h1 className="text-sl-headline-md tracking-tight text-sl-on-surface">
                            {collection.title}
                        </h1>
                        <p className="text-sl-body-lg text-sl-on-surface-variant">
                            Oleh{' '}
                            <span className="font-semibold text-sl-primary">
                                {collection.author}
                            </span>
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1 text-sl-label-md text-sl-on-surface-variant">
                                <MaterialIcon name="visibility" className="text-[18px]" />
                                <span>{collection.read_count} dibaca</span>
                            </div>
                            <div className="h-4 w-px bg-sl-outline-variant" />
                            <div className="flex items-center gap-1 text-sl-label-md text-sl-on-surface-variant">
                                <MaterialIcon name="download" className="text-[18px]" />
                                <span>{collection.download_count} unduhan</span>
                            </div>
                            {collection.category && (
                                <>
                                    <div className="h-4 w-px bg-sl-outline-variant" />
                                    <div className="flex items-center gap-1 text-sl-label-md text-sl-on-surface-variant">
                                        <MaterialIcon
                                            name="category"
                                            className="text-[18px]"
                                        />
                                        <span>{collection.category}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    <div className="h-px w-full bg-sl-outline-variant/30" />

                    {/* Synopsis */}
                    <section className="flex flex-col gap-sl-stack-sm">
                        <h2 className="text-sl-headline-sm text-sl-on-surface">Sinopsis</h2>
                        <p className="text-justify text-sl-body-md leading-relaxed text-sl-on-surface-variant">
                            {collection.fullDescription ??
                                'Belum ada deskripsi untuk koleksi ini.'}
                        </p>
                    </section>

                    {/* Specifications — only fields that exist for this type */}
                    <section className="grid grid-cols-2 gap-sl-gutter rounded-xl border border-sl-outline-variant/20 bg-sl-surface-container-low p-6 lg:grid-cols-4">
                        {specs.map((spec) => (
                            <div key={spec.label} className="flex flex-col">
                                <span className="text-sl-label-sm tracking-wider text-sl-on-surface-variant uppercase">
                                    {spec.label}
                                </span>
                                <span className="text-sl-label-md font-bold text-sl-on-surface">
                                    {spec.value}
                                </span>
                            </div>
                        ))}
                    </section>

                    {collection.keywords && (
                        <section className="border-t border-sl-outline-variant/30 pt-4">
                            <h3 className="mb-2 text-sl-label-md font-bold text-sl-on-surface">
                                Kata Kunci
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {collection.keywords.split(',').map((kw) => (
                                    <span
                                        key={kw}
                                        className="rounded-full bg-sl-surface-container px-3 py-1 text-sl-label-sm text-sl-on-surface-variant"
                                    >
                                        {kw.trim()}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Related collections — same category */}
            {related.length > 0 && (
                <section className="mt-sl-stack-lg mb-10">
                    <h3 className="mb-6 text-sl-headline-sm text-sl-on-surface">
                        Koleksi Terkait
                    </h3>
                    <div className="grid grid-cols-2 gap-sl-gutter md:grid-cols-4">
                        {related.map((item) => (
                            <Link
                                href={`/buku/${item.slug}`}
                                key={item.id}
                                className="group cursor-pointer"
                            >
                                <div className="mb-3 aspect-[3/4] overflow-hidden rounded-lg border border-sl-outline-variant/30 shadow-sm">
                                    <Cover
                                        cover={item.cover}
                                        title={item.title}
                                        type={item.type}
                                    />
                                </div>
                                <h4 className="line-clamp-2 text-sl-label-md text-sl-on-surface">
                                    {item.title}
                                </h4>
                                <p className="line-clamp-1 text-sl-label-sm text-sl-on-surface-variant">
                                    {item.author}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Fixed bottom action bar */}
            <div className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-between border-t border-sl-outline-variant bg-sl-surface px-sl-margin-mobile shadow-sm">
                <div className="flex flex-col">
                    <span className="text-sl-label-sm text-sl-on-surface-variant">
                        {collection.type ?? 'Koleksi'} Digital
                    </span>
                    <span className="text-sl-label-md font-bold text-sl-secondary">
                        Gratis untuk Anggota
                    </span>
                </div>
                {collection.file ? (
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => access('baca')}
                            className="flex items-center gap-2 rounded-lg bg-sl-primary px-8 py-3 font-bold text-sl-on-primary shadow-sm transition-transform duration-150 hover:bg-sl-primary/90 active:scale-95"
                        >
                            <MaterialIcon name="menu_book" />
                            Baca
                        </button>
                        <button
                            type="button"
                            onClick={() => access('unduh')}
                            className="flex items-center gap-2 rounded-lg bg-sl-secondary-container px-8 py-3 font-bold text-sl-on-secondary-container shadow-sm transition-transform duration-150 hover:bg-sl-secondary-container/90 active:scale-95"
                        >
                            <MaterialIcon name="download" />
                            Unduh
                        </button>
                    </div>
                ) : (
                    <span className="rounded-lg bg-sl-surface-container px-8 py-3 font-bold text-sl-outline">
                        Berkas belum tersedia
                    </span>
                )}
            </div>
        </PerpustakaanLayout>
    );
}

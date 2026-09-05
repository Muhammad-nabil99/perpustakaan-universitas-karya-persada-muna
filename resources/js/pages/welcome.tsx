import { Head, Link, useForm } from '@inertiajs/react';
import MaterialIcon from '@/components/perpustakaan/material-icon';
import PerpustakaanLayout from '@/layouts/perpustakaan-layout';

/* --- Props: everything comes from the real collections catalog ------------- */

type CategoryCard = {
    id: number;
    name: string;
    slug: string;
    children: string[];
    count: number;
};

type CollectionCard = {
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

type Props = {
    categories: CategoryCard[];
    trending: CollectionCard[];
    latest: CollectionCard[];
    stats: {
        totalCollections: number;
        totalRead: number;
    };
};

/**
 * Icon + accent per root category. Falls back gracefully, so a category the
 * admin adds later still renders correctly without a code change.
 */
const CATEGORY_STYLE: Record<string, { icon: string; accent: string }> = {
    umum: { icon: 'auto_stories', accent: 'from-blue-600 to-blue-400' },
    fakultas: { icon: 'school', accent: 'from-indigo-600 to-violet-400' },
    penelitian: { icon: 'science', accent: 'from-emerald-600 to-teal-400' },
    repository: { icon: 'inventory_2', accent: 'from-amber-600 to-orange-400' },
    arsip: { icon: 'archive', accent: 'from-slate-600 to-slate-400' },
    referensi: { icon: 'menu_book', accent: 'from-rose-600 to-pink-400' },
    'e-learning': { icon: 'cast_for_education', accent: 'from-cyan-600 to-sky-400' },
};

const FALLBACK_STYLE = { icon: 'category', accent: 'from-neutral-600 to-neutral-400' };

const styleFor = (slug: string) => CATEGORY_STYLE[slug] ?? FALLBACK_STYLE;

/** Icon per collection type (Buku, Skripsi, Jurnal, ...). */
const TYPE_ICON: Record<string, string> = {
    Buku: 'menu_book',
    Skripsi: 'school',
    Jurnal: 'article',
    Modul: 'inventory_2',
    Prosiding: 'groups',
    'Laporan Penelitian': 'science',
};

const typeIcon = (type: string | null) =>
    (type && TYPE_ICON[type]) || 'description';

/** Cover artwork: the real uploaded cover, or a typed placeholder. */
function Cover({
    item,
    className,
}: {
    item: CollectionCard;
    className?: string;
}) {
    if (item.cover) {
        return (
            <img
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${className ?? ''}`}
                alt={item.title}
                src={`/storage/${item.cover}`}
            />
        );
    }

    return (
        <div
            className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-sl-primary to-sl-primary-container p-4 text-center transition-transform duration-500 group-hover:scale-105 ${className ?? ''}`}
        >
            <MaterialIcon
                name={typeIcon(item.type)}
                className="text-[40px] text-white/50"
            />
            <p className="mt-2 line-clamp-3 text-xs font-semibold text-white/90">
                {item.title}
            </p>
        </div>
    );
}

export default function Welcome({ categories, trending, latest, stats }: Props) {
    const search = useForm({ search: '' });

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        search.get('/pencarian', { preserveState: true });
    };

    return (
        <PerpustakaanLayout
            active="home"
            mainClassName="mt-14 px-sl-margin-mobile py-sl-stack-md md:px-sl-margin-desktop"
        >
            <Head title="Beranda" />

            {/* Hero + Search */}
            <section className="relative mb-sl-stack-lg flex min-h-[400px] items-center justify-center overflow-hidden rounded-xl p-8 text-center">
                <div className="absolute inset-0 z-0 bg-sl-primary-container">
                    <img
                        className="h-full w-full object-cover opacity-20 mix-blend-overlay"
                        alt="Interior perpustakaan yang megah"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2DP6mc5urFPZZjbexPQ6_N7mCVutAlTzGx_J98fpYzYHFdMfqbhV_TVeWVcfZzQbiPra38h3-fAx7hSYWrFbRM4s-vCqD8qn0Sn3DTDbN4zTvxllsteUNSG5Anm6OAW_4k5cIPkL7hTDyd5BUxX_gk6llNkRN_dbexPWIDVlXuhJZz4gq4bdOzdgjKc1Cx65YPmAE197JWAivejZx31QyvLvmlLGazKpcO3_tAeyHuIo_omIU6FJIYwDzzGzAVnq1lMQEBbdssYs7"
                    />
                </div>
                <div className="relative z-10 w-full max-w-3xl">
                    <h2 className="mb-sl-stack-sm text-sl-display-lg-mobile text-white drop-shadow-md md:text-sl-display-lg">
                        Temukan Wawasan Hebat Berikutnya
                    </h2>
                    <p className="mx-auto mb-sl-stack-md max-w-xl text-sl-body-lg text-white/90">
                        Jelajahi {stats.totalCollections.toLocaleString('id-ID')} koleksi
                        digital — buku, skripsi, jurnal, dan arsip penelitian dari
                        Universitas Karya Persada Muna.
                    </p>
                    <form
                        onSubmit={submitSearch}
                        className="relative flex h-14 items-center rounded-lg border border-sl-outline-variant bg-sl-surface p-1 shadow-sm transition-all focus-within:border-sl-primary focus-within:ring-2 focus-within:ring-sl-primary/20"
                    >
                        <MaterialIcon name="search" className="px-4 text-sl-outline" />
                        <input
                            value={search.data.search}
                            onChange={(e) => search.setData('search', e.target.value)}
                            className="flex-grow border-none bg-transparent text-sl-body-md text-sl-on-surface placeholder:text-sl-on-surface-variant focus:ring-0"
                            placeholder="Cari berdasarkan judul, penulis, atau ISBN..."
                            type="text"
                        />
                        <button
                            type="submit"
                            className="ml-1 h-full rounded-lg bg-sl-secondary-container px-6 text-sl-label-md font-bold text-sl-on-secondary-container transition-transform hover:scale-[1.02] active:scale-95"
                        >
                            Cari
                        </button>
                    </form>
                </div>
            </section>

            {/* Categories — the real, admin-managed category tree */}
            <section className="mb-sl-stack-lg">
                <div className="mb-sl-stack-md flex items-end justify-between">
                    <h3 className="text-sl-headline-md text-sl-on-surface">
                        Jelajahi Berdasarkan Kategori
                    </h3>
                    <Link
                        href="/pencarian"
                        className="text-sl-label-md text-sl-primary hover:underline"
                    >
                        Lihat Semua Kategori
                    </Link>
                </div>

                {categories.length === 0 ? (
                    <p className="text-sl-body-md text-sl-on-surface-variant">
                        Belum ada kategori.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-sl-gutter md:grid-cols-3 lg:grid-cols-5">
                        {categories.map((cat) => {
                            const style = styleFor(cat.slug);

                            return (
                                <Link
                                    key={cat.id}
                                    href={`/pencarian?category=${cat.slug}`}
                                    className="group relative flex min-h-[9rem] cursor-pointer flex-col justify-between overflow-hidden rounded-lg border border-sl-outline-variant p-4"
                                >
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${style.accent} opacity-90 transition-transform duration-500 group-hover:scale-110`}
                                    />
                                    <div className="relative flex items-start justify-between">
                                        <MaterialIcon
                                            name={style.icon}
                                            className="text-[32px] text-white/90"
                                        />
                                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-sl-label-sm text-white">
                                            {cat.count}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <p className="text-sl-headline-sm text-white">
                                            {cat.name}
                                        </p>
                                        <p className="line-clamp-1 text-sl-label-sm text-white/80">
                                            {cat.children.length > 0
                                                ? cat.children.join(' · ')
                                                : `${cat.count} koleksi`}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Trending — most-read published collections */}
            <section className="mb-sl-stack-lg">
                <div className="mb-sl-stack-md flex items-center gap-2">
                    <MaterialIcon name="trending_up" className="text-sl-secondary" />
                    <h3 className="text-sl-headline-md text-sl-on-surface">
                        Paling Banyak Dibaca
                    </h3>
                </div>

                {trending.length === 0 ? (
                    <p className="text-sl-body-md text-sl-on-surface-variant">
                        Belum ada koleksi yang dipublikasikan.
                    </p>
                ) : (
                    <div className="hide-scrollbar flex gap-sl-gutter overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible lg:grid-cols-5">
                        {trending.map((item) => (
                            <Link
                                href={`/buku/${item.slug}`}
                                key={item.id}
                                className="group flex min-w-[200px] flex-shrink-0 cursor-pointer flex-col md:w-full md:min-w-0 md:flex-shrink"
                            >
                                <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-lg border border-sl-outline-variant bg-sl-surface-container-low shadow-sm transition-shadow group-hover:shadow-md">
                                    <Cover item={item} />
                                    {item.featured && (
                                        <div className="absolute top-2 right-2 rounded-sm bg-sl-secondary-container px-2 py-1 text-[10px] font-bold text-sl-on-secondary-container uppercase">
                                            Unggulan
                                        </div>
                                    )}
                                </div>
                                <h4 className="mb-1 line-clamp-2 text-[16px] font-semibold text-sl-on-surface">
                                    {item.title}
                                </h4>
                                <p className="mb-2 line-clamp-1 text-sl-label-md text-sl-on-surface-variant">
                                    {item.author}
                                </p>
                                <div className="flex flex-wrap items-center gap-1">
                                    <span className="rounded bg-sl-primary/10 px-2 py-0.5 text-[10px] font-bold text-sl-primary">
                                        {item.type ?? 'Koleksi'}
                                    </span>
                                    <span className="flex items-center gap-0.5 text-[10px] text-sl-on-surface-variant">
                                        <MaterialIcon
                                            name="visibility"
                                            className="text-[12px]"
                                        />
                                        {item.read_count}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Latest — newest published collections */}
            <section className="mb-sl-stack-lg flex flex-col gap-sl-gutter md:flex-row">
                <div className="flex flex-col justify-between rounded-xl bg-sl-primary p-8 text-white md:w-1/3">
                    <div>
                        <h3 className="mb-4 text-sl-display-lg-mobile">
                            Koleksi Terbaru
                        </h3>
                        <p className="mb-8 text-sl-body-md opacity-80">
                            Tambahan terbaru di repositori kami — hasil penelitian,
                            skripsi mahasiswa, dan referensi akademik pilihan.
                        </p>
                    </div>
                    <Link
                        href="/pencarian"
                        className="self-start rounded-lg bg-white px-6 py-3 text-sl-label-md font-bold text-sl-primary transition-all hover:bg-opacity-90"
                    >
                        Telusuri Semua
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-sl-gutter sm:grid-cols-2 md:w-2/3">
                    {latest.length === 0 && (
                        <p className="text-sl-body-md text-sl-on-surface-variant">
                            Belum ada koleksi terbaru.
                        </p>
                    )}
                    {latest.map((item) => (
                        <Link
                            href={`/buku/${item.slug}`}
                            key={item.id}
                            className="group flex cursor-pointer gap-4 rounded-lg border border-sl-outline-variant bg-sl-surface p-4 transition-colors hover:border-sl-primary"
                        >
                            <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded shadow-sm">
                                <Cover item={item} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold tracking-wider text-sl-primary uppercase">
                                    {item.category ?? item.type ?? 'Koleksi'}
                                </span>
                                <h4 className="mt-1 mb-1 line-clamp-2 text-[18px] font-semibold text-sl-on-surface">
                                    {item.title}
                                </h4>
                                <p className="line-clamp-2 text-sm text-sl-on-surface-variant">
                                    {item.description ?? item.author}
                                </p>
                                {item.year && (
                                    <p className="mt-1 text-xs text-sl-outline">
                                        {item.year}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Newsletter / community */}
            <section className="rounded-xl border border-sl-outline-variant bg-sl-surface-container p-8 text-center md:p-12">
                <h3 className="mb-2 text-sl-headline-md text-sl-on-surface">
                    Bergabung dengan Komunitas Akademik
                </h3>
                <p className="mx-auto mb-8 max-w-2xl text-sl-body-md text-sl-on-surface-variant">
                    Dapatkan pemberitahuan koleksi baru, akses awal ke arsip digital,
                    dan undangan ke seminar akademik kampus.
                </p>
                <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:flex-row">
                    <input
                        className="flex-grow rounded-lg border border-sl-outline-variant px-4 py-3 focus:border-sl-primary focus:ring-0"
                        placeholder="Masukkan email Anda"
                        type="email"
                    />
                    <button className="rounded-lg bg-sl-primary px-8 py-3 text-sl-label-md font-bold text-white transition-colors hover:bg-sl-primary-container">
                        Berlangganan
                    </button>
                </div>
            </section>

            <SiteFooter />
        </PerpustakaanLayout>
    );
}

function SiteFooter() {
    return (
        <footer className="mt-sl-stack-lg border-t border-sl-outline-variant pt-12 pb-24 md:pb-12">
            <div className="mb-12 grid grid-cols-1 gap-sl-gutter md:grid-cols-4">
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <MaterialIcon name="menu_book" className="text-sl-primary" />
                        <h4 className="text-[20px] font-bold text-sl-primary">
                            Perpustakaan UKPM
                        </h4>
                    </div>
                    <p className="text-sm text-sl-on-surface-variant">
                        Pusat repositori digital Universitas Karya Persada Muna.
                    </p>
                </div>
                <FooterColumn
                    title="Sumber Daya"
                    links={[
                        'Arsip Digital',
                        'Jurnal Akademik',
                        'Skripsi Mahasiswa',
                        'Laporan Penelitian',
                    ]}
                />
                <FooterColumn
                    title="Komunitas"
                    links={['Seminar', 'Kelompok Baca', 'Sukarelawan', 'Donasi']}
                />
                <div>
                    <h5 className="mb-4 font-bold text-sl-on-surface">Kontak</h5>
                    <ul className="space-y-2 text-sm text-sl-on-surface-variant">
                        <li className="flex items-center gap-2">
                            <MaterialIcon name="mail" className="text-sm" />
                            perpustakaan@ukpm.ac.id
                        </li>
                        <li className="flex items-center gap-2">
                            <MaterialIcon name="location_on" className="text-sm" />
                            Raha, Kabupaten Muna
                        </li>
                    </ul>
                </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-sl-outline-variant pt-8 text-xs text-sl-on-surface-variant md:flex-row">
                <p>
                    © {new Date().getFullYear()} Perpustakaan Universitas Karya Persada
                    Muna. Hak cipta dilindungi.
                </p>
                <div className="flex gap-6">
                    <a className="hover:text-sl-primary" href="#">
                        Kebijakan Privasi
                    </a>
                    <a className="hover:text-sl-primary" href="#">
                        Ketentuan Layanan
                    </a>
                    <a className="hover:text-sl-primary" href="#">
                        Aksesibilitas
                    </a>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
    return (
        <div>
            <h5 className="mb-4 font-bold text-sl-on-surface">{title}</h5>
            <ul className="space-y-2 text-sm text-sl-on-surface-variant">
                {links.map((link) => (
                    <li key={link}>
                        <a
                            className="transition-colors hover:text-sl-primary"
                            href="#"
                        >
                            {link}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

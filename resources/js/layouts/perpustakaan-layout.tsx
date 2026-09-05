import { Link, usePage } from '@inertiajs/react';
import MaterialIcon from '@/components/perpustakaan/material-icon';
import { cn } from '@/lib/utils';
import { login, register } from '@/routes';

/**
 * Every page identifies its active section by one of these keys. It's kept
 * separate from NAV_ITEMS so pages can pass active="profile" / "my-books" even
 * when those links aren't rendered in the main navbar.
 */
export type PerpustakaanNavKey = 'home' | 'search' | 'my-books' | 'profile';

type NavItem = {
    key: PerpustakaanNavKey;
    label: string;
    href: string;
    icon: string;
};

/** Destinations rendered in the desktop navbar + mobile bottom nav, in order. */
const NAV_ITEMS: NavItem[] = [
    { key: 'home', label: 'Beranda', href: '/', icon: 'home' },
    { key: 'search', label: 'Pencarian', href: '/pencarian', icon: 'search' },
    // { key: 'my-books', label: 'Buku Saya', href: '/profil', icon: 'book_5' },
    // { key: 'profile', label: 'Profil', href: '/profil', icon: 'person' },
];

type Props = {
    children: React.ReactNode;
    /** Which nav entry is highlighted as active. */
    active?: PerpustakaanNavKey;
    /**
     * When true, the top bar shows a back button + share/bookmark actions
     * instead of the full navbar (used on the book detail page).
     */
    detailBar?: boolean;
    /** Extra classes for the <main> wrapper (padding overrides per page). */
    mainClassName?: string;
};

/**
 * Shared chrome for the public Perpustakaan UKPM pages: a fixed TopAppBar with
 * desktop navigation and a mobile BottomNavBar. All links use Inertia <Link>
 * to preserve SPA transitions.
 */
export default function PerpustakaanLayout({
    children,
    active = 'home',
    detailBar = false,
    mainClassName,
}: Props) {
    return (
        <div className="min-h-screen bg-sl-background font-sl text-sl-on-background">
            <TopAppBar active={active} detailBar={detailBar} />

            <main className={cn('mx-auto max-w-sl-max', mainClassName)}>
                {children}
            </main>

            <BottomNavBar active={active} />
        </div>
    );
}

function TopAppBar({
    active,
    detailBar,
}: {
    active: PerpustakaanNavKey;
    detailBar: boolean;
}) {
    // `auth.user` is shared on every page (null when the visitor is a guest).
    const user = usePage().props.auth?.user ?? null;

    return (
        <header className="fixed top-0 left-0 z-50 flex h-14 w-full items-center justify-between border-b border-sl-outline-variant bg-sl-surface px-sl-margin-mobile md:px-sl-margin-desktop">
            {detailBar ? (
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="flex items-center gap-4 text-sl-primary transition-opacity active:opacity-80"
                >
                    <MaterialIcon name="arrow_back" />
                    <span className="text-sl-headline-sm-mobile font-bold">
                        Perpustakaan Universitas Karya Persada Muna
                    </span>
                </button>
            ) : (
                <Link href="/" className="flex items-center gap-2">
                    <img
                        src="/favicon.png"
                        alt="Logo Perpustakaan Universitas Karya Persada Muna"
                        className="h-10 w-10"
                    />
                    <h1 className="text-sl-headline-sm-mobile font-bold text-sl-primary md:text-sm w-1/2">
                        Perpustakaan Universitas Karya Persada Muna
                    </h1>
                </Link>
            )}

            {!detailBar && (
                <nav className="hidden h-full items-center gap-sl-stack-md md:flex">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={cn(
                                'flex h-full items-center px-2 text-sm transition-colors',
                                active === item.key
                                    ? 'border-b-2 border-sl-primary font-bold text-sl-primary'
                                    : 'text-sl-on-surface-variant hover:bg-sl-surface-container-low',
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            )}

            <div className="flex items-center gap-3">
                {detailBar ? (
                    <>
                        <button
                            type="button"
                            className="text-sl-primary transition-opacity active:opacity-80"
                        >
                            <MaterialIcon name="share" />
                        </button>
                        <button
                            type="button"
                            className="text-sl-primary transition-opacity active:opacity-80"
                        >
                            <MaterialIcon name="bookmark" />
                        </button>
                    </>
                ) : user ? (
                    // Sudah login: tampilkan tombol menuju dashboard.
                    <Link
                        href="/library"
                        className="inline-flex items-center gap-2 rounded-sm bg-sl-primary px-4 py-1.5 text-sl-label-md font-bold text-sl-on-primary transition-opacity hover:opacity-90 active:scale-95"
                    >
                        <MaterialIcon name="dashboard" className="text-[18px]" />
                        Dashboard
                    </Link>
                ) : (
                    // Belum login / belum registrasi: tampilkan tombol Masuk & Daftar.
                    <>
                        <Link
                            href={login()}
                            className="hidden rounded-sm px-4 py-1.5 text-sl-label-md text-sl-primary transition-colors hover:bg-sl-surface-container-low sm:inline-flex"
                        >
                            Masuk
                        </Link>
                        <Link
                            href={register()}
                            className="rounded-sm bg-sl-primary px-4 py-1.5 text-sl-label-md font-bold text-sl-on-primary transition-opacity hover:opacity-90 active:scale-95"
                        >
                            Daftar
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}

function BottomNavBar({ active }: { active: PerpustakaanNavKey }) {
    const user = usePage().props.auth?.user ?? null;

    return (
        <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-sl-outline-variant bg-sl-surface px-sl-margin-mobile shadow-sm md:hidden">
            {NAV_ITEMS.map((item) => {
                const isActive = active === item.key;

                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center justify-center transition-transform duration-150 active:scale-95',
                            isActive
                                ? 'font-bold text-sl-primary'
                                : 'text-sl-on-surface-variant',
                        )}
                    >
                        <MaterialIcon name={item.icon} filled={isActive} />
                        <span className="text-sl-label-sm">{item.label}</span>
                    </Link>
                );
            })}

            {/* Entri terakhir bergantung status login: Dashboard vs Masuk. */}
            {user ? (
                <Link
                    href="/library"
                    className="flex flex-col items-center justify-center text-sl-on-surface-variant transition-transform duration-150 active:scale-95"
                >
                    <MaterialIcon name="dashboard" />
                    <span className="text-sl-label-sm">Dashboard</span>
                </Link>
            ) : (
                <Link
                    href={login()}
                    className="flex flex-col items-center justify-center text-sl-on-surface-variant transition-transform duration-150 active:scale-95"
                >
                    <MaterialIcon name="login" />
                    <span className="text-sl-label-sm">Masuk</span>
                </Link>
            )}
        </nav>
    );
}

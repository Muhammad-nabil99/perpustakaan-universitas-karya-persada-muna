import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Database,
    History,
    LayoutGrid,
    PlusCircle,
    Search,
    ShieldCheck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

/**
 * Role-based navigation. Contributors (publishers) and super admins share the
 * first three modules (data is scoped per-role on the backend); the remaining
 * items are super-admin-only. Readers get none of them — the backend blocks
 * those routes, so showing the links would only lead to a 403.
 */
function navItemsForRole(role: string | undefined): NavItem[] {
    const shared: NavItem[] = [
        { title: 'Dashboard', href: '/library', icon: LayoutGrid },
    ];

    // Pembaca browse the public catalog instead of the management area.
    if (role === 'reader') {
        return [
            { title: 'Katalog', href: '/', icon: BookOpen },
            { title: 'Pencarian', href: '/pencarian', icon: Search },
        ];
    }

    if (role === 'super_admin') {
        return [
            ...shared,
            { title: 'Katalog Semua Koleksi', href: '/library/collections', icon: BookOpen },
            { title: 'Unggah Koleksi', href: '/library/collections/upload', icon: PlusCircle },
            { title: 'Riwayat Akses Global', href: '/library/access-logs', icon: History },
            { title: 'Master Data', href: '/library/master/collection-types', icon: Database },
            { title: 'Kelola User', href: '/library/users', icon: Users },
        ];
    }

    return [
        ...shared,
        { title: 'Koleksi Saya', href: '/library/collections', icon: BookOpen },
        { title: 'Unggah Koleksi', href: '/library/collections/upload', icon: PlusCircle },
        { title: 'Riwayat Akses', href: '/library/access-logs', icon: History },
    ];
}

export function AppSidebar() {
    const user = usePage().props.auth?.user ?? null;
    const isSuperAdmin = user?.role === 'super_admin';

    const mainNavItems = navItemsForRole(user?.role);

    const roleLabel = isSuperAdmin
        ? 'Super Admin'
        : user?.role === 'reader'
          ? 'Pembaca'
          : 'Kontributor';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/library" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label={roleLabel} />
                {isSuperAdmin && (
                    <div className="mt-2 flex items-center gap-2 px-4 text-xs text-sidebar-foreground/60">
                        <ShieldCheck className="size-3.5" />
                        <span>Akses penuh platform</span>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

import { Head, router } from '@inertiajs/react';
import { Ban, BookOpen, ShieldCheck, UserCheck } from 'lucide-react';

type Role = 'reader' | 'publisher' | 'super_admin';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: Role;
    is_blocked: boolean;
    collections_count: number;
    joined: string;
};

/** Badge + dropdown labels for each role, least → most privileged. */
const ROLES: { value: Role; label: string; badge: string }[] = [
    {
        value: 'reader',
        label: 'Pembaca',
        badge: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    },
    {
        value: 'publisher',
        label: 'Kontributor',
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    },
    {
        value: 'super_admin',
        label: 'Super Admin',
        badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    },
];

type Props = {
    users: UserRow[];
};

export default function UsersIndex({ users }: Props) {
    const toggleBlock = (user: UserRow) => {
        router.put(
            `/library/users/${user.id}`,
            { is_blocked: !user.is_blocked },
            { preserveScroll: true },
        );
    };

    const changeRole = (user: UserRow, role: Role) => {
        if (role === user.role) return;

        router.put(`/library/users/${user.id}`, { role }, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Kelola User" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                        Kelola User
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Kelola seluruh pengguna terdaftar: blokir, ubah peran.
                    </p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-400 dark:border-neutral-800">
                                <th className="px-4 py-3 font-medium">Nama</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Peran</th>
                                <th className="px-4 py-3 font-medium">Koleksi</th>
                                <th className="px-4 py-3 font-medium">Bergabung</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60"
                                >
                                    <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-100">
                                        {user.name}
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500">{user.email}</td>
                                    <td className="px-4 py-3">
                                        {(() => {
                                            const role =
                                                ROLES.find((r) => r.value === user.role) ??
                                                ROLES[0];
                                            const Icon =
                                                user.role === 'super_admin'
                                                    ? ShieldCheck
                                                    : user.role === 'publisher'
                                                      ? UserCheck
                                                      : BookOpen;

                                            return (
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${role.badge}`}
                                                >
                                                    <Icon className="size-3.5" /> {role.label}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500">{user.collections_count}</td>
                                    <td className="px-4 py-3 text-neutral-500">{user.joined}</td>
                                    <td className="px-4 py-3">
                                        {user.is_blocked ? (
                                            <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                                Diblokir
                                            </span>
                                        ) : (
                                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                Aktif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                value={user.role}
                                                onChange={(e) =>
                                                    changeRole(user, e.target.value as Role)
                                                }
                                                aria-label={`Peran untuk ${user.name}`}
                                                className="rounded-md border border-neutral-200 bg-transparent px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                            >
                                                {ROLES.map((role) => (
                                                    <option key={role.value} value={role.value}>
                                                        {role.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => toggleBlock(user)}
                                                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                                                    user.is_blocked
                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                        : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
                                                }`}
                                            >
                                                <Ban className="size-3.5" />
                                                {user.is_blocked ? 'Buka Blokir' : 'Blokir'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

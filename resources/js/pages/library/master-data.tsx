import { Head, Link, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { useState } from 'react';

type Field = {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'boolean' | 'select';
    required?: boolean;
    optionsFrom?: string;
};

type Row = Record<string, unknown> & {
    id: number;
    deleted_at: string | null;
};

/** Values a master-data form field can hold. */
type FormValue = string | number | boolean | null;

type Props = {
    resource: string;
    label: string;
    fields: Field[];
    options: Record<string, Array<{ id: number; name: string }>>;
    rows: Row[];
    menu: Array<{ key: string; label: string }>;
};

/**
 * One page serving every master-data module. The table columns and the form
 * inputs are generated from the `fields` schema the backend registry sends, so
 * adding a new master-data module needs no change here.
 */
export default function MasterData({
    resource,
    label,
    fields,
    options,
    rows,
    menu,
}: Props) {
    const [editing, setEditing] = useState<Row | null>(null);
    const [showForm, setShowForm] = useState(false);

    const blank: Record<string, FormValue> = Object.fromEntries(
        fields.map((f) => [f.name, f.type === 'boolean' ? true : '']),
    );

    const form = useForm<Record<string, FormValue>>(blank);

    const openCreate = () => {
        form.setData(blank);
        form.clearErrors();
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (row: Row) => {
        const data: Record<string, FormValue> = Object.fromEntries(
            fields.map((f) => [
                f.name,
                (row[f.name] as FormValue) ?? (f.type === 'boolean' ? false : ''),
            ]),
        );

        form.setData(data);
        form.clearErrors();
        setEditing(row);
        setShowForm(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const onSuccess = () => setShowForm(false);

        if (editing) {
            form.put(`/library/master/${resource}/${editing.id}`, { onSuccess });
        } else {
            form.post(`/library/master/${resource}`, { onSuccess });
        }
    };

    const remove = (row: Row) => {
        if (confirm(`Hapus data ini? Data dapat dipulihkan kembali.`)) {
            router.delete(`/library/master/${resource}/${row.id}`, {
                preserveScroll: true,
            });
        }
    };

    const restore = (row: Row) => {
        router.patch(
            `/library/master/${resource}/${row.id}/restore`,
            {},
            { preserveScroll: true },
        );
    };

    const renderCell = (row: Row, field: Field) => {
        const value = row[field.name];

        if (field.type === 'boolean') {
            return value ? (
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Ya
                </span>
            ) : (
                <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800">
                    Tidak
                </span>
            );
        }

        if (field.type === 'select') {
            return (row[`${field.name}_label`] as string) ?? '—';
        }

        return (value as string) || '—';
    };

    return (
        <>
            <Head title={`Master Data — ${label}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                        Master Data
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Kelola data acuan sistem tanpa mengubah kode program.
                    </p>
                </div>

                {/* Resource switcher */}
                <div className="flex flex-wrap gap-2">
                    {menu.map((item) => (
                        <Link
                            key={item.key}
                            href={`/library/master/${item.key}`}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                item.key === resource
                                    ? 'bg-sl-primary text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                        {label}
                    </h2>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-lg bg-sl-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        <Plus className="size-4" />
                        Tambah {label}
                    </button>
                </div>

                {/* Form (inline card) */}
                {showForm && (
                    <form
                        onSubmit={submit}
                        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-bold text-neutral-800 dark:text-neutral-100">
                                {editing ? `Edit ${label}` : `Tambah ${label}`}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {fields.map((field) => (
                                <div
                                    key={field.name}
                                    className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                                >
                                    <label
                                        htmlFor={field.name}
                                        className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
                                    >
                                        {field.label}
                                        {field.required && <span className="text-red-500"> *</span>}
                                    </label>

                                    {field.type === 'boolean' ? (
                                        <label className="mt-2 flex cursor-pointer items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(form.data[field.name])}
                                                onChange={(e) =>
                                                    form.setData(field.name, e.target.checked)
                                                }
                                                className="size-4 rounded border-neutral-300"
                                            />
                                            <span className="text-sm text-neutral-500">
                                                {field.label}
                                            </span>
                                        </label>
                                    ) : field.type === 'select' ? (
                                        <select
                                            id={field.name}
                                            value={String(form.data[field.name] ?? '')}
                                            onChange={(e) => form.setData(field.name, e.target.value)}
                                            className="mt-1 block h-10 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm dark:border-neutral-700"
                                        >
                                            <option value="">— Tidak ada —</option>
                                            {(options[field.name] ?? [])
                                                .filter((opt) => opt.id !== editing?.id)
                                                .map((opt) => (
                                                    <option key={opt.id} value={opt.id}>
                                                        {opt.name}
                                                    </option>
                                                ))}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            id={field.name}
                                            rows={3}
                                            value={String(form.data[field.name] ?? '')}
                                            onChange={(e) => form.setData(field.name, e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                                        />
                                    ) : (
                                        <input
                                            id={field.name}
                                            type="text"
                                            value={String(form.data[field.name] ?? '')}
                                            onChange={(e) => form.setData(field.name, e.target.value)}
                                            className="mt-1 block h-10 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm dark:border-neutral-700"
                                        />
                                    )}

                                    {form.errors[field.name] && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors[field.name]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm dark:border-neutral-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-lg bg-sl-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                )}

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-400 dark:border-neutral-800">
                                {fields.map((field) => (
                                    <th key={field.name} className="px-4 py-3 font-medium">
                                        {field.label}
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-right font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={fields.length + 1}
                                        className="px-4 py-10 text-center text-neutral-400"
                                    >
                                        Belum ada data.
                                    </td>
                                </tr>
                            )}
                            {rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={`border-b border-neutral-100 last:border-0 dark:border-neutral-800/60 ${
                                        row.deleted_at ? 'opacity-50' : ''
                                    }`}
                                >
                                    {fields.map((field) => (
                                        <td
                                            key={field.name}
                                            className="px-4 py-3 text-neutral-600 dark:text-neutral-300"
                                        >
                                            {renderCell(row, field)}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {row.deleted_at ? (
                                                <button
                                                    type="button"
                                                    onClick={() => restore(row)}
                                                    className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                >
                                                    <RotateCcw className="size-3.5" />
                                                    Pulihkan
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(row)}
                                                        className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                        aria-label="Edit"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(row)}
                                                        className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
                                                        aria-label="Hapus"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </>
                                            )}
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

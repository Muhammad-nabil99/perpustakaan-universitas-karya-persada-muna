import { Head, useForm } from '@inertiajs/react';
import { Check, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

type TypeOption = {
    id: number;
    name: string;
    requires_publisher: boolean;
    requires_isbn: boolean;
};

type CategoryOption = {
    id: number;
    name: string;
    requires_faculty: boolean;
};

type Option = { id: number; name: string };
type DepartmentOption = Option & { faculty_id: number };

type Props = {
    options: {
        types: TypeOption[];
        categories: CategoryOption[];
        faculties: Option[];
        departments: DepartmentOption[];
        languages: Option[];
        publishers: Option[];
    };
};

/** The five accordion sections of the upload form. */
type SectionKey = 'main' | 'classification' | 'metadata' | 'files' | 'settings';

function Section({
    title,
    index,
    open,
    onToggle,
    children,
}: {
    title: string;
    index: number;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
                <span className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-sl-primary text-xs font-bold text-white">
                        {index + 1}
                    </span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-100">
                        {title}
                    </span>
                </span>
                <ChevronDown
                    className={`size-5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <div className="border-t border-neutral-100 px-6 py-5 dark:border-neutral-800">
                    {children}
                </div>
            )}
        </div>
    );
}

function Field({
    label,
    required,
    error,
    hint,
    className,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>
            {children}
            {error ? (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            ) : (
                hint && (
                    <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}

const inputClass =
    'mt-1 block h-10 w-full rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:border-sl-primary focus:ring-0 focus:outline-none dark:border-neutral-700';

/** Values a collection form field can hold. */
type FormValue = string | boolean | File | null;

export default function CollectionUpload({ options }: Props) {
    const [open, setOpen] = useState<SectionKey>('main');

    const form = useForm<Record<string, FormValue>>({
        title: '',
        author: '',
        collection_type_id: '',
        publisher_id: '',
        published_year: '',
        published_date: '',
        isbn: '',
        description: '',
        collection_category_id: '',
        faculty_id: '',
        department_id: '',
        keywords: '',
        language_id: '',
        pages: '',
        cover: null,
        file: null,
        status: 'draft',
        featured: false,
    });

    // --- Dynamic UI behaviour, driven purely by master-data flags ------------
    const selectedType = useMemo(
        () => options.types.find((t) => String(t.id) === String(form.data.collection_type_id)),
        [options.types, form.data.collection_type_id],
    );

    const selectedCategory = useMemo(
        () =>
            options.categories.find(
                (c) => String(c.id) === String(form.data.collection_category_id),
            ),
        [options.categories, form.data.collection_category_id],
    );

    // Book → show Publisher + ISBN. Thesis → hide them. No type names hardcoded.
    const showPublisher = selectedType?.requires_publisher ?? false;
    const showIsbn = selectedType?.requires_isbn ?? false;

    // A faculty-flagged category reveals Faculty, and picking one reveals Department.
    const showFaculty = selectedCategory?.requires_faculty ?? false;

    const departmentsForFaculty = useMemo(
        () =>
            options.departments.filter(
                (d) => String(d.faculty_id) === String(form.data.faculty_id),
            ),
        [options.departments, form.data.faculty_id],
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/library/collections', { forceFormData: true });
    };

    const toggle = (key: SectionKey) => setOpen((cur) => (cur === key ? cur : key));

    return (
        <>
            <Head title="Unggah Koleksi" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                        Unggah Koleksi
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Isi setiap bagian. Field akan menyesuaikan tipe & kategori
                        koleksi yang Anda pilih.
                    </p>
                </div>

                <form onSubmit={submit} className="max-w-4xl space-y-4">
                    {/* --- Section 1: Informasi Utama --- */}
                    <Section
                        title="Informasi Utama"
                        index={0}
                        open={open === 'main'}
                        onToggle={() => toggle('main')}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Judul Koleksi" required error={form.errors.title}>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={String(form.data.title)}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                />
                            </Field>

                            <Field label="Penulis" required error={form.errors.author}>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={String(form.data.author)}
                                    onChange={(e) => form.setData('author', e.target.value)}
                                />
                            </Field>

                            <Field
                                label="Tipe Koleksi"
                                required
                                error={form.errors.collection_type_id}
                            >
                                <select
                                    className={inputClass}
                                    value={String(form.data.collection_type_id)}
                                    onChange={(e) =>
                                        form.setData('collection_type_id', e.target.value)
                                    }
                                >
                                    <option value="">— Pilih tipe —</option>
                                    {options.types.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Tahun Terbit"
                                required
                                error={form.errors.published_year}
                            >
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min={1900}
                                    max={new Date().getFullYear() + 1}
                                    placeholder="contoh: 2024"
                                    className={inputClass}
                                    value={String(form.data.published_year)}
                                    onChange={(e) =>
                                        form.setData('published_year', e.target.value)
                                    }
                                />
                            </Field>

                            <Field
                                label="Tanggal Terbit"
                                hint="Opsional — isi bila tanggal pastinya diketahui."
                                error={form.errors.published_date}
                            >
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={String(form.data.published_date)}
                                    onChange={(e) =>
                                        form.setData('published_date', e.target.value)
                                    }
                                />
                            </Field>

                            {/* Conditional: only for types that require a publisher. */}
                            {showPublisher && (
                                <Field label="Penerbit" required error={form.errors.publisher_id}>
                                    <select
                                        className={inputClass}
                                        value={String(form.data.publisher_id)}
                                        onChange={(e) =>
                                            form.setData('publisher_id', e.target.value)
                                        }
                                    >
                                        <option value="">— Pilih penerbit —</option>
                                        {options.publishers.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            )}

                            {/* Conditional: only for types that require an ISBN. */}
                            {showIsbn && (
                                <Field label="ISBN" required error={form.errors.isbn}>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={String(form.data.isbn)}
                                        onChange={(e) => form.setData('isbn', e.target.value)}
                                    />
                                </Field>
                            )}

                            <Field
                                label="Sinopsis"
                                className="sm:col-span-2"
                                error={form.errors.description}
                            >
                                <textarea
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                                    value={String(form.data.description)}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                />
                            </Field>
                        </div>
                    </Section>

                    {/* --- Section 2: Klasifikasi --- */}
                    <Section
                        title="Klasifikasi Koleksi"
                        index={1}
                        open={open === 'classification'}
                        onToggle={() => toggle('classification')}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                                label="Kategori Koleksi"
                                required
                                className="sm:col-span-2"
                                error={form.errors.collection_category_id}
                            >
                                <select
                                    className={inputClass}
                                    value={String(form.data.collection_category_id)}
                                    onChange={(e) => {
                                        form.setData('collection_category_id', e.target.value);
                                        // Reset the cascade when the category changes.
                                        form.setData('faculty_id', '');
                                        form.setData('department_id', '');
                                    }}
                                >
                                    <option value="">— Pilih kategori —</option>
                                    {options.categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            {/* Conditional: category flagged as requiring a faculty. */}
                            {showFaculty && (
                                <Field label="Fakultas" required error={form.errors.faculty_id}>
                                    <select
                                        className={inputClass}
                                        value={String(form.data.faculty_id)}
                                        onChange={(e) => {
                                            form.setData('faculty_id', e.target.value);
                                            form.setData('department_id', '');
                                        }}
                                    >
                                        <option value="">— Pilih fakultas —</option>
                                        {options.faculties.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            )}

                            {/* Cascade: department only after a faculty is chosen. */}
                            {showFaculty && form.data.faculty_id !== '' && (
                                <Field
                                    label="Program Studi"
                                    required
                                    error={form.errors.department_id}
                                >
                                    <select
                                        className={inputClass}
                                        value={String(form.data.department_id)}
                                        onChange={(e) =>
                                            form.setData('department_id', e.target.value)
                                        }
                                    >
                                        <option value="">— Pilih program studi —</option>
                                        {departmentsForFaculty.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            )}
                        </div>
                    </Section>

                    {/* --- Section 3: Metadata --- */}
                    <Section
                        title="Metadata"
                        index={2}
                        open={open === 'metadata'}
                        onToggle={() => toggle('metadata')}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                                label="Keywords"
                                className="sm:col-span-2"
                                error={form.errors.keywords}
                            >
                                <input
                                    type="text"
                                    placeholder="pisahkan dengan koma"
                                    className={inputClass}
                                    value={String(form.data.keywords)}
                                    onChange={(e) => form.setData('keywords', e.target.value)}
                                />
                            </Field>

                            <Field label="Bahasa" error={form.errors.language_id}>
                                <select
                                    className={inputClass}
                                    value={String(form.data.language_id)}
                                    onChange={(e) => form.setData('language_id', e.target.value)}
                                >
                                    <option value="">— Pilih bahasa —</option>
                                    {options.languages.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Jumlah Halaman" error={form.errors.pages}>
                                <input
                                    type="number"
                                    min={1}
                                    className={inputClass}
                                    value={String(form.data.pages)}
                                    onChange={(e) => form.setData('pages', e.target.value)}
                                />
                            </Field>
                        </div>
                    </Section>

                    {/* --- Section 4: File --- */}
                    <Section
                        title="File"
                        index={3}
                        open={open === 'files'}
                        onToggle={() => toggle('files')}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Upload Cover" error={form.errors.cover}>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="mt-1 block w-full text-sm text-neutral-500 file:mr-3 file:rounded-md file:border-0 file:bg-sl-primary file:px-3 file:py-1.5 file:text-white"
                                    onChange={(e) =>
                                        form.setData('cover', e.target.files?.[0] ?? null)
                                    }
                                />
                            </Field>

                            <Field label="Upload PDF / EPUB" error={form.errors.file}>
                                <input
                                    type="file"
                                    accept=".pdf,.epub"
                                    className="mt-1 block w-full text-sm text-neutral-500 file:mr-3 file:rounded-md file:border-0 file:bg-sl-primary file:px-3 file:py-1.5 file:text-white"
                                    onChange={(e) =>
                                        form.setData('file', e.target.files?.[0] ?? null)
                                    }
                                />
                                <p className="mt-1 text-xs text-neutral-400">
                                    Ukuran file dihitung otomatis setelah diunggah.
                                </p>
                            </Field>
                        </div>
                    </Section>

                    {/* --- Section 5: Pengaturan --- */}
                    <Section
                        title="Pengaturan"
                        index={4}
                        open={open === 'settings'}
                        onToggle={() => toggle('settings')}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Status" error={form.errors.status}>
                                <select
                                    className={inputClass}
                                    value={String(form.data.status)}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                                <p className="mt-1 text-xs text-neutral-400">
                                    Publisher: koleksi selalu masuk sebagai Draft hingga
                                    disetujui admin.
                                </p>
                            </Field>

                            <Field label="Featured" error={form.errors.featured}>
                                <label className="mt-2 flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(form.data.featured)}
                                        onChange={(e) => form.setData('featured', e.target.checked)}
                                        className="size-4 rounded border-neutral-300"
                                    />
                                    <span className="text-sm text-neutral-500">
                                        Tandai sebagai koleksi unggulan
                                    </span>
                                </label>
                            </Field>
                        </div>
                    </Section>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-sl-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                            <Check className="size-4" />
                            {form.processing ? 'Menyimpan...' : 'Simpan Koleksi'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

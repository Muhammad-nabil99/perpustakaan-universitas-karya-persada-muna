<?php

namespace App\Http\Requests;

use App\Models\Collection;
use App\Models\CollectionCategory;
use App\Models\CollectionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validation for the 5-section upload form. The rules adapt to the chosen
 * collection type and category, mirroring the dynamic UI: a Book requires a
 * publisher + ISBN, a Thesis does not; a faculty-flagged category requires
 * faculty + department.
 */
class StoreCollectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Section 1 — Informasi Utama
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'collection_type_id' => ['required', 'exists:collection_types,id'],
            'publisher_id' => [
                Rule::requiredIf(fn () => $this->typeRequiresPublisher()),
                'nullable',
                'exists:publishers,id',
            ],
            // Contributors always supply a year; the exact date is optional.
            'published_year' => [
                'required',
                'integer',
                'min:1900',
                'max:'.((int) date('Y') + 1),
            ],
            'published_date' => ['nullable', 'date'],
            'isbn' => [
                Rule::requiredIf(fn () => $this->typeRequiresIsbn()),
                'nullable',
                'string',
                'max:30',
            ],
            'description' => ['nullable', 'string'],

            // Section 2 — Klasifikasi
            'collection_category_id' => ['required', 'exists:collection_categories,id'],
            'faculty_id' => [
                Rule::requiredIf(fn () => $this->categoryRequiresFaculty()),
                'nullable',
                'exists:faculties,id',
            ],
            'department_id' => [
                Rule::requiredIf(fn () => $this->categoryRequiresFaculty()),
                'nullable',
                'exists:departments,id',
            ],

            // Section 3 — Metadata
            'keywords' => ['nullable', 'string', 'max:255'],
            'language_id' => ['nullable', 'exists:languages,id'],
            'pages' => ['nullable', 'integer', 'min:1'],

            // Section 4 — File
            'cover' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
            'file' => ['nullable', 'file', 'mimes:pdf,epub', 'max:51200'],

            // Section 5 — Pengaturan
            'status' => ['required', Rule::in([
                Collection::STATUS_DRAFT,
                Collection::STATUS_PUBLISHED,
                Collection::STATUS_ARCHIVED,
            ])],
            'featured' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'publisher_id.required' => 'Penerbit wajib diisi untuk tipe koleksi ini.',
            'isbn.required' => 'ISBN wajib diisi untuk tipe koleksi ini.',
            'faculty_id.required' => 'Fakultas wajib dipilih untuk kategori ini.',
            'department_id.required' => 'Program Studi wajib dipilih untuk kategori ini.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Inertia sends multipart form data (forceFormData for the file upload),
        // so `featured` arrives as the string "true"/"false", which the boolean
        // rule rejects. Normalise it to a real boolean before validating.
        $this->merge([
            'featured' => filter_var(
                $this->input('featured', false),
                FILTER_VALIDATE_BOOLEAN
            ),
        ]);

        // Publishers can never self-publish; their uploads always start as draft.
        if ($this->user()->isPublisher()) {
            $this->merge(['status' => Collection::STATUS_DRAFT]);
        }
    }

    private function typeRequiresPublisher(): bool
    {
        return (bool) $this->collectionType()?->requires_publisher;
    }

    private function typeRequiresIsbn(): bool
    {
        return (bool) $this->collectionType()?->requires_isbn;
    }

    private function collectionType(): ?CollectionType
    {
        return CollectionType::find($this->input('collection_type_id'));
    }

    private function categoryRequiresFaculty(): bool
    {
        $category = CollectionCategory::with('parent')
            ->find($this->input('collection_category_id'));

        return (bool) $category?->requiresFaculty();
    }
}

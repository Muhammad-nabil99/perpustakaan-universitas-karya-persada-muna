<?php

namespace App\Services;

use App\Models\CollectionCategory;
use App\Models\CollectionType;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Language;
use App\Models\Publisher;
use App\Repositories\Eloquent\BaseRepository;
use App\Repositories\Eloquent\CollectionCategoryRepository;
use App\Repositories\Eloquent\CollectionTypeRepository;
use App\Repositories\Eloquent\DepartmentRepository;
use App\Repositories\Eloquent\FacultyRepository;
use App\Repositories\Eloquent\LanguageRepository;
use App\Repositories\Eloquent\PublisherRepository;
use Illuminate\Validation\Rule;

/**
 * Single registry describing every master-data resource: its label, model,
 * repository, validation rules and the field schema the React CRUD page renders.
 *
 * Adding a seventh master-data module means adding one entry here — the routes,
 * controller, and UI table/form all adapt automatically.
 */
class MasterDataRegistry
{
    /**
     * @return array<string, array<string, mixed>>
     */
    public function all(): array
    {
        return [
            'collection-types' => [
                'label' => 'Tipe Koleksi',
                'model' => CollectionType::class,
                'repository' => CollectionTypeRepository::class,
                'fields' => [
                    ['name' => 'name', 'label' => 'Nama', 'type' => 'text', 'required' => true],
                    ['name' => 'description', 'label' => 'Deskripsi', 'type' => 'textarea'],
                    ['name' => 'requires_publisher', 'label' => 'Wajib Penerbit', 'type' => 'boolean'],
                    ['name' => 'requires_isbn', 'label' => 'Wajib ISBN', 'type' => 'boolean'],
                    ['name' => 'status', 'label' => 'Aktif', 'type' => 'boolean'],
                ],
            ],

            'collection-categories' => [
                'label' => 'Kategori Koleksi',
                'model' => CollectionCategory::class,
                'repository' => CollectionCategoryRepository::class,
                // parent_id turns this into a self-referencing tree.
                'parentOf' => 'collection-categories',
                'fields' => [
                    ['name' => 'name', 'label' => 'Nama', 'type' => 'text', 'required' => true],
                    ['name' => 'parent_id', 'label' => 'Induk', 'type' => 'select', 'optionsFrom' => 'collection-categories'],
                    ['name' => 'description', 'label' => 'Deskripsi', 'type' => 'textarea'],
                    ['name' => 'requires_faculty', 'label' => 'Wajib Fakultas', 'type' => 'boolean'],
                    ['name' => 'status', 'label' => 'Aktif', 'type' => 'boolean'],
                ],
            ],

            'faculties' => [
                'label' => 'Fakultas',
                'model' => Faculty::class,
                'repository' => FacultyRepository::class,
                'fields' => [
                    ['name' => 'name', 'label' => 'Nama', 'type' => 'text', 'required' => true],
                    ['name' => 'code', 'label' => 'Kode', 'type' => 'text', 'required' => true],
                    ['name' => 'description', 'label' => 'Deskripsi', 'type' => 'textarea'],
                    ['name' => 'status', 'label' => 'Aktif', 'type' => 'boolean'],
                ],
            ],

            'departments' => [
                'label' => 'Program Studi',
                'model' => Department::class,
                'repository' => DepartmentRepository::class,
                'fields' => [
                    ['name' => 'name', 'label' => 'Nama', 'type' => 'text', 'required' => true],
                    ['name' => 'faculty_id', 'label' => 'Fakultas', 'type' => 'select', 'optionsFrom' => 'faculties', 'required' => true],
                    ['name' => 'accreditation', 'label' => 'Akreditasi', 'type' => 'text'],
                    ['name' => 'status', 'label' => 'Aktif', 'type' => 'boolean'],
                ],
            ],

            'languages' => [
                'label' => 'Bahasa',
                'model' => Language::class,
                'repository' => LanguageRepository::class,
                'fields' => [
                    ['name' => 'name', 'label' => 'Nama', 'type' => 'text', 'required' => true],
                    ['name' => 'code', 'label' => 'Kode', 'type' => 'text', 'required' => true],
                    ['name' => 'status', 'label' => 'Aktif', 'type' => 'boolean'],
                ],
            ],

            'publishers' => [
                'label' => 'Penerbit',
                'model' => Publisher::class,
                'repository' => PublisherRepository::class,
                'fields' => [
                    ['name' => 'name', 'label' => 'Nama', 'type' => 'text', 'required' => true],
                    ['name' => 'address', 'label' => 'Alamat', 'type' => 'text'],
                    ['name' => 'website', 'label' => 'Website', 'type' => 'text'],
                    ['name' => 'status', 'label' => 'Aktif', 'type' => 'boolean'],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function get(string $resource): array
    {
        $config = $this->all()[$resource] ?? null;

        abort_if($config === null, 404, "Master data \"{$resource}\" tidak dikenal.");

        return $config;
    }

    public function repository(string $resource): BaseRepository
    {
        return app($this->get($resource)['repository']);
    }

    /**
     * Validation rules derived from the field schema, so rules never drift
     * from the form.
     *
     * @return array<string, mixed>
     */
    public function rules(string $resource, ?int $ignoreId = null): array
    {
        $config = $this->get($resource);
        $table = (new $config['model'])->getTable();
        $rules = [];

        foreach ($config['fields'] as $field) {
            $name = $field['name'];
            $required = ($field['required'] ?? false) ? 'required' : 'nullable';

            $rules[$name] = match ($field['type']) {
                'boolean' => ['boolean'],
                'select' => [$required, Rule::exists($this->tableFor($field['optionsFrom']), 'id')],
                'textarea' => [$required, 'string'],
                default => [$required, 'string', 'max:255'],
            };
        }

        // Codes must stay unique across the table.
        if (isset($rules['code'])) {
            $rules['code'][] = Rule::unique($table, 'code')->ignore($ignoreId)->whereNull('deleted_at');
        }

        return $rules;
    }

    private function tableFor(string $resource): string
    {
        $config = $this->get($resource);

        return (new $config['model'])->getTable();
    }

    /**
     * Options for every `select` field on a resource's form.
     *
     * @return array<string, array<int, array{id: int, name: string}>>
     */
    public function selectOptions(string $resource): array
    {
        $options = [];

        foreach ($this->get($resource)['fields'] as $field) {
            if (($field['type'] ?? null) !== 'select') {
                continue;
            }

            $source = $field['optionsFrom'];

            $options[$field['name']] = $this->repository($source)
                ->all()
                ->map(fn ($row) => ['id' => $row->id, 'name' => $row->name])
                ->values()
                ->all();
        }

        return $options;
    }
}

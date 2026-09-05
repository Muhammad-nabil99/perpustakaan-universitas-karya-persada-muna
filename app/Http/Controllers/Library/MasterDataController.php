<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Services\MasterDataRegistry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * One controller for all six master-data modules. The resource is a URL segment
 * resolved through MasterDataRegistry, so the admin can manage Collection Type,
 * Category, Faculty, Department, Language and Publisher — and any module added
 * to the registry later — without new code.
 */
class MasterDataController extends Controller
{
    public function __construct(
        private readonly MasterDataRegistry $registry,
    ) {}

    public function index(string $resource): Response
    {
        $config = $this->registry->get($resource);
        $repository = $this->registry->repository($resource);

        return Inertia::render('library/master-data', [
            'resource' => $resource,
            'label' => $config['label'],
            'fields' => $config['fields'],
            'options' => $this->registry->selectOptions($resource),
            'rows' => $repository->all(withTrashed: true)->map(function ($row) use ($config) {
                $data = [
                    'id' => $row->id,
                    'deleted_at' => $row->deleted_at?->format('d M Y'),
                ];

                foreach ($config['fields'] as $field) {
                    $data[$field['name']] = $row->{$field['name']};
                }

                // Human-readable label for any select (e.g. the parent / faculty name).
                foreach ($config['fields'] as $field) {
                    if (($field['type'] ?? null) === 'select') {
                        $relation = str_replace('_id', '', $field['name']);
                        $relation = $relation === 'parent' ? 'parent' : Str::camel($relation);
                        $data[$field['name'].'_label'] = $row->{$relation}?->name;
                    }
                }

                return $data;
            })->values(),
            'menu' => collect($this->registry->all())
                ->map(fn ($cfg, $key) => ['key' => $key, 'label' => $cfg['label']])
                ->values(),
        ]);
    }

    public function store(Request $request, string $resource): RedirectResponse
    {
        $data = $request->validate($this->registry->rules($resource));

        $this->registry->repository($resource)->create($data);

        return back()->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, string $resource, int $id): RedirectResponse
    {
        $data = $request->validate($this->registry->rules($resource, ignoreId: $id));

        $repository = $this->registry->repository($resource);
        $model = $repository->find($id);

        abort_if($model === null, 404);

        $repository->update($model, $data);

        return back()->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy(string $resource, int $id): RedirectResponse
    {
        $repository = $this->registry->repository($resource);
        $model = $repository->find($id);

        abort_if($model === null, 404);

        $repository->delete($model);

        return back()->with('success', 'Data dihapus (dapat dipulihkan).');
    }

    public function restore(string $resource, int $id): RedirectResponse
    {
        $this->registry->repository($resource)->restore($id);

        return back()->with('success', 'Data dipulihkan.');
    }
}

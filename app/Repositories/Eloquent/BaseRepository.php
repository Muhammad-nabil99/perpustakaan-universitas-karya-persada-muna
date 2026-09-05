<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\RepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Eloquent implementation of the shared repository contract. Every master-data
 * repository extends this and only declares its model, so the six master-data
 * modules get full CRUD + soft-delete/restore without duplicated code.
 *
 * @template TModel of Model
 *
 * @implements RepositoryInterface<TModel>
 */
abstract class BaseRepository implements RepositoryInterface
{
    /**
     * @return class-string<TModel>
     */
    abstract protected function model(): string;

    /**
     * Columns eager-loaded / ordered by default. Override where needed.
     */
    protected function defaultOrder(): string
    {
        return 'name';
    }

    /**
     * @return Builder<TModel>
     */
    protected function query(bool $withTrashed = false)
    {
        $query = $this->model()::query();

        if ($withTrashed) {
            $query->withTrashed();
        }

        return $query;
    }

    public function all(bool $withTrashed = false): Collection
    {
        return $this->query($withTrashed)
            ->orderBy($this->defaultOrder())
            ->get();
    }

    public function active(): Collection
    {
        return $this->query()
            ->where('status', true)
            ->orderBy($this->defaultOrder())
            ->get();
    }

    public function find(int $id): ?Model
    {
        return $this->query(withTrashed: true)->find($id);
    }

    public function create(array $data): Model
    {
        return $this->model()::create($data);
    }

    public function update(Model $model, array $data): Model
    {
        $model->update($data);

        return $model->refresh();
    }

    public function delete(Model $model): bool
    {
        return (bool) $model->delete();
    }

    public function restore(int $id): bool
    {
        $model = $this->query(withTrashed: true)->findOrFail($id);

        return (bool) $model->restore();
    }
}

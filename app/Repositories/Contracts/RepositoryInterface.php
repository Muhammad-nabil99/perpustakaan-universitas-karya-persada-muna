<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Base repository contract shared by every master-data repository.
 *
 * @template TModel of Model
 */
interface RepositoryInterface
{
    /**
     * @return Collection<int, TModel>
     */
    public function all(bool $withTrashed = false): Collection;

    /**
     * Only rows with status = true — used to populate the public dropdowns.
     *
     * @return Collection<int, TModel>
     */
    public function active(): Collection;

    /**
     * @return TModel|null
     */
    public function find(int $id): ?Model;

    /**
     * @param  array<string, mixed>  $data
     * @return TModel
     */
    public function create(array $data): Model;

    /**
     * @param  TModel  $model
     * @param  array<string, mixed>  $data
     * @return TModel
     */
    public function update(Model $model, array $data): Model;

    /**
     * @param  TModel  $model
     */
    public function delete(Model $model): bool;

    public function restore(int $id): bool;
}

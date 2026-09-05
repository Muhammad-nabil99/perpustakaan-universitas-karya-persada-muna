<?php

namespace App\Repositories\Eloquent;

use App\Models\CollectionCategory;
use Illuminate\Support\Collection;

/**
 * @extends BaseRepository<CollectionCategory>
 */
class CollectionCategoryRepository extends BaseRepository
{
    protected function model(): string
    {
        return CollectionCategory::class;
    }

    /**
     * The full category tree (roots with their children eager-loaded).
     *
     * @return Collection<int, CollectionCategory>
     */
    public function tree(bool $withTrashed = false): Collection
    {
        return $this->query($withTrashed)
            ->whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->orderBy('name')])
            ->orderBy('name')
            ->get();
    }

    /**
     * Flat list of active categories with their parent loaded — used to build
     * the "Parent › Child" labels in the upload form dropdown.
     *
     * @return Collection<int, CollectionCategory>
     */
    public function activeWithParent(): Collection
    {
        return $this->query()
            ->where('status', true)
            ->with('parent:id,name,requires_faculty')
            ->orderBy('name')
            ->get();
    }
}

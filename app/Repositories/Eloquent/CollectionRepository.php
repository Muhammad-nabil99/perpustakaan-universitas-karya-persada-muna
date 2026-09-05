<?php

namespace App\Repositories\Eloquent;

use App\Models\Collection as CollectionModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Query layer for collections, including the combined-filter search strategy
 * from CLAUDE.md (title, author, keywords, ISBN, faculty, department, year,
 * language, type, category — all combinable).
 *
 * @extends BaseRepository<CollectionModel>
 */
class CollectionRepository extends BaseRepository
{
    protected function model(): string
    {
        return CollectionModel::class;
    }

    protected function defaultOrder(): string
    {
        return 'title';
    }

    /**
     * Paginated, filtered list.
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, CollectionModel>
     */
    public function search(array $filters, ?User $scopeTo = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = CollectionModel::query()->with([
            'type:id,name',
            'category:id,name',
            'faculty:id,name',
            'department:id,name',
            'language:id,name',
            'publisher:id,name',
            'creator:id,name',
        ]);

        // Publishers only ever see their own uploads.
        if ($scopeTo !== null) {
            $query->where('created_by', $scopeTo->id);
        }

        $this->applyFilters($query, $filters);

        return $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param  Builder<CollectionModel>  $query
     * @param  array<string, mixed>  $filters
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        // Free-text across title, author, keywords and ISBN.
        if (! blank($filters['search'] ?? null)) {
            $term = '%'.$filters['search'].'%';

            $query->where(fn (Builder $q) => $q
                ->where('title', 'like', $term)
                ->orWhere('author', 'like', $term)
                ->orWhere('keywords', 'like', $term)
                ->orWhere('isbn', 'like', $term));
        }

        $exactFilters = [
            'type' => 'collection_type_id',
            'category' => 'collection_category_id',
            'faculty' => 'faculty_id',
            'department' => 'department_id',
            'language' => 'language_id',
            'publisher' => 'publisher_id',
            'status' => 'status',
        ];

        foreach ($exactFilters as $key => $column) {
            if (! blank($filters[$key] ?? null)) {
                $query->where($column, $filters[$key]);
            }
        }

        if (! blank($filters['year'] ?? null)) {
            $query->whereYear('published_date', $filters['year']);
        }
    }
}

<?php

namespace App\Services;

use App\Models\AccessLog;
use App\Models\Collection;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Dashboard analytics (CLAUDE.md "Dashboard Analytics"). Results are cached
 * briefly because these aggregates are read far more often than they change.
 */
class DashboardService
{
    private const CACHE_TTL = 300; // 5 minutes

    /**
     * Platform-wide analytics for the super admin.
     *
     * @return array<string, mixed>
     */
    public function forSuperAdmin(string $period = 'daily'): array
    {
        return Cache::remember("dashboard:admin:{$period}", self::CACHE_TTL, fn () => [
            'stats' => $this->globalStats(),
            'charts' => [
                'byType' => $this->countBy('collection_type_id', 'type'),
                'byCategory' => $this->countBy('collection_category_id', 'category'),
                'byFaculty' => $this->countBy('faculty_id', 'faculty'),
                'byDepartment' => $this->countBy('department_id', 'department'),
            ],
            'trends' => $this->trends($period),
            'topRead' => $this->topList('read_count'),
            'topDownloaded' => $this->topList('download_count'),
            'latest' => $this->latest(),
        ]);
    }

    /**
     * Analytics scoped strictly to the collections this publisher uploaded.
     *
     * @return array<string, mixed>
     */
    public function forPublisher(User $user, string $period = 'daily'): array
    {
        $ids = $user->collections()->pluck('id')->all();

        return [
            'stats' => [
                'totalCollections' => count($ids),
                'published' => $user->collections()->where('status', Collection::STATUS_PUBLISHED)->count(),
                'draft' => $user->collections()->where('status', Collection::STATUS_DRAFT)->count(),
                'totalRead' => (int) $user->collections()->sum('read_count'),
                'totalDownload' => (int) $user->collections()->sum('download_count'),
                'totalVisitor' => (int) $user->collections()->sum('visitor_count'),
            ],
            'trends' => $this->trends($period, $ids),
            'topRead' => $this->topList('read_count', $ids),
            'latest' => $this->latest($ids),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function globalStats(): array
    {
        $byType = Collection::query()
            ->join('collection_types', 'collections.collection_type_id', '=', 'collection_types.id')
            ->select('collection_types.slug', DB::raw('COUNT(*) as total'))
            ->groupBy('collection_types.slug')
            ->pluck('total', 'slug');

        return [
            'totalCollections' => Collection::count(),
            'totalBooks' => (int) ($byType['buku'] ?? 0),
            'totalTheses' => (int) ($byType['skripsi'] ?? 0),
            'totalRead' => (int) Collection::sum('read_count'),
            'totalDownload' => (int) Collection::sum('download_count'),
            'totalVisitor' => (int) Collection::sum('visitor_count'),
            'totalUsers' => User::count(),
            'pendingModeration' => Collection::where('status', Collection::STATUS_DRAFT)->count(),
        ];
    }

    /**
     * Collection counts grouped by a foreign key, resolved to the related name.
     *
     * @return array<int, array{label: string, value: int}>
     */
    private function countBy(string $column, string $relation): array
    {
        return Collection::query()
            ->whereNotNull($column)
            ->with("{$relation}:id,name")
            ->select($column, DB::raw('COUNT(*) as total'))
            ->groupBy($column)
            ->get()
            ->map(fn (Collection $row) => [
                'label' => $row->{$relation}?->name ?? '—',
                'value' => (int) $row->total,
            ])
            ->sortByDesc('value')
            ->values()
            ->all();
    }

    /**
     * Visitor / download / reading trend over the chosen period.
     *
     * @param  array<int>|null  $collectionIds
     * @return array<string, array<int, array{label: string, value: int}>>
     */
    private function trends(string $period, ?array $collectionIds = null): array
    {
        return [
            'reading' => $this->trendFor(AccessLog::ACTION_READ, $period, $collectionIds),
            'download' => $this->trendFor(AccessLog::ACTION_DOWNLOAD, $period, $collectionIds),
            'visitor' => $this->trendFor(AccessLog::ACTION_VISIT, $period, $collectionIds),
        ];
    }

    /**
     * @param  array<int>|null  $collectionIds
     * @return array<int, array{label: string, value: int}>
     */
    private function trendFor(string $action, string $period, ?array $collectionIds): array
    {
        [$buckets, $sqlFormat, $labelFormat] = match ($period) {
            'yearly' => [5, '%Y', 'Y'],
            'monthly' => [12, '%Y-%m', 'M'],
            'weekly' => [8, '%x-%v', '\\WW'],
            default => [7, '%Y-%m-%d', 'D'],
        };

        $start = match ($period) {
            'yearly' => Carbon::today()->subYears($buckets - 1)->startOfYear(),
            'monthly' => Carbon::today()->subMonths($buckets - 1)->startOfMonth(),
            'weekly' => Carbon::today()->subWeeks($buckets - 1)->startOfWeek(),
            default => Carbon::today()->subDays($buckets - 1),
        };

        $query = AccessLog::query()
            ->where('action', $action)
            ->where('created_at', '>=', $start);

        if ($collectionIds !== null) {
            $query->whereIn('collection_id', $collectionIds);
        }

        $counts = $query
            ->select(DB::raw("DATE_FORMAT(created_at, '{$sqlFormat}') as bucket"), DB::raw('COUNT(*) as total'))
            ->groupBy('bucket')
            ->pluck('total', 'bucket');

        $trend = [];

        for ($i = 0; $i < $buckets; $i++) {
            $date = match ($period) {
                'yearly' => $start->copy()->addYears($i),
                'monthly' => $start->copy()->addMonths($i),
                'weekly' => $start->copy()->addWeeks($i),
                default => $start->copy()->addDays($i),
            };

            $key = match ($period) {
                'yearly' => $date->format('Y'),
                'monthly' => $date->format('Y-m'),
                'weekly' => $date->format('o-W'),
                default => $date->toDateString(),
            };

            $trend[] = [
                'label' => $date->translatedFormat($labelFormat),
                'value' => (int) ($counts[$key] ?? 0),
            ];
        }

        return $trend;
    }

    /**
     * @param  array<int>|null  $collectionIds
     * @return array<int, array<string, mixed>>
     */
    private function topList(string $column, ?array $collectionIds = null): array
    {
        $query = Collection::query()->with('type:id,name')->orderByDesc($column)->limit(5);

        if ($collectionIds !== null) {
            $query->whereIn('id', $collectionIds);
        }

        return $query->get()->map(fn (Collection $c) => [
            'id' => $c->id,
            'title' => $c->title,
            'type' => $c->type?->name,
            'status' => $c->status,
            'value' => (int) $c->{$column},
        ])->all();
    }

    /**
     * @param  array<int>|null  $collectionIds
     * @return array<int, array<string, mixed>>
     */
    private function latest(?array $collectionIds = null): array
    {
        $query = Collection::query()->with(['type:id,name', 'creator:id,name'])->latest()->limit(5);

        if ($collectionIds !== null) {
            $query->whereIn('id', $collectionIds);
        }

        return $query->get()->map(fn (Collection $c) => [
            'id' => $c->id,
            'title' => $c->title,
            'type' => $c->type?->name,
            'author' => $c->creator?->name,
            'status' => $c->status,
            'created_at' => $c->created_at?->diffForHumans(),
        ])->all();
    }
}

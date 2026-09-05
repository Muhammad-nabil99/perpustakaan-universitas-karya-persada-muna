<?php

namespace App\Http\Controllers;

use App\Models\AccessLog;
use App\Models\Collection;
use App\Models\CollectionCategory;
use App\Models\CollectionType;
use App\Models\Faculty;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * The public landing page (Beranda). Everything shown here comes from the real
 * `collections` table and the admin-managed category tree — no hardcoded lists.
 */
class PublicCatalogController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('welcome', [
            'categories' => $this->rootCategories(),
            'trending' => $this->trending(),
            'latest' => $this->latest(),
            'stats' => [
                'totalCollections' => Collection::published()->count(),
                'totalRead' => (int) Collection::published()->sum('read_count'),
            ],
        ]);
    }

    /**
     * Public catalog search (Pencarian). Combinable filters per CLAUDE.md:
     * free text (title / author / keywords / ISBN), collection type, category,
     * faculty, department, language and year.
     */
    public function search(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->query('search', '')),
            'category' => (string) $request->query('category', ''),
            'type' => (string) $request->query('type', ''),
            'faculty' => (string) $request->query('faculty', ''),
            'year' => (string) $request->query('year', ''),
            'sort' => (string) $request->query('sort', 'relevance'),
        ];

        $query = Collection::published()->with(['type:id,name', 'category:id,name']);

        if ($filters['search'] !== '') {
            $term = '%'.$filters['search'].'%';

            $query->where(fn (Builder $q) => $q
                ->where('title', 'like', $term)
                ->orWhere('author', 'like', $term)
                ->orWhere('keywords', 'like', $term)
                ->orWhere('isbn', 'like', $term));
        }

        // Category is filtered by slug and rolls up the whole branch, so
        // ?category=fakultas also matches Ilmu Kesehatan / Hukum / Pendidikan.
        if ($filters['category'] !== '') {
            $category = CollectionCategory::where('slug', $filters['category'])->first();

            if ($category !== null) {
                $ids = CollectionCategory::where('parent_id', $category->id)
                    ->pluck('id')
                    ->push($category->id);

                $query->whereIn('collection_category_id', $ids);
            }
        }

        if ($filters['type'] !== '') {
            $query->whereHas('type', fn ($q) => $q->where('slug', $filters['type']));
        }

        if ($filters['faculty'] !== '') {
            $query->where('faculty_id', $filters['faculty']);
        }

        if ($filters['year'] !== '') {
            $query->whereYear('published_date', $filters['year']);
        }

        match ($filters['sort']) {
            'newest' => $query->latest('published_date'),
            'popular' => $query->orderByDesc('read_count'),
            default => $query->orderByDesc('featured')->orderByDesc('read_count'),
        };

        $results = $query->paginate(9)->withQueryString();
        $results->through(fn (Collection $c) => $this->present($c));

        return Inertia::render('pencarian', [
            'results' => $results,
            'filters' => $filters,
            'options' => [
                'categories' => CollectionCategory::where('status', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug', 'parent_id'])
                    ->map(fn ($c) => [
                        'slug' => $c->slug,
                        'name' => $c->name,
                        'is_child' => $c->parent_id !== null,
                    ])
                    ->all(),
                'types' => CollectionType::where('status', true)
                    ->orderBy('name')
                    ->get(['name', 'slug'])
                    ->all(),
                'faculties' => Faculty::where('status', true)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                    ->all(),
                'years' => Collection::published()
                    ->selectRaw('DISTINCT YEAR(published_date) as year')
                    ->whereNotNull('published_date')
                    ->orderByDesc('year')
                    ->pluck('year')
                    ->all(),
            ],
        ]);
    }

    /**
     * Public detail page for one published collection.
     */
    public function show(Collection $collection): Response
    {
        abort_unless($collection->status === Collection::STATUS_PUBLISHED, 404);

        $collection->load([
            'type:id,name',
            'category:id,name',
            'faculty:id,name',
            'department:id,name',
            'language:id,name',
            'publisher:id,name',
        ]);

        // Count the visit.
        $collection->increment('visitor_count');

        $related = Collection::published()
            ->where('id', '!=', $collection->id)
            ->where('collection_category_id', $collection->collection_category_id)
            ->with(['type:id,name', 'category:id,name'])
            ->limit(4)
            ->get()
            ->map(fn (Collection $c) => $this->present($c))
            ->all();

        return Inertia::render('buku', [
            'collection' => [
                ...$this->present($collection),
                'isbn' => $collection->isbn,
                'pages' => $collection->pages,
                'keywords' => $collection->keywords,
                'fullDescription' => $collection->description,
                'faculty' => $collection->faculty?->name,
                'department' => $collection->department?->name,
                'language' => $collection->language?->name,
                'publisher' => $collection->publisher?->name,
                'file' => $collection->file,
                'download_count' => $collection->download_count,
            ],
            'related' => $related,
        ]);
    }

    /**
     * Force-download a published collection's file as an attachment. Auth is
     * required (route middleware). The download counter rises at most once per
     * user per collection — see recordUniqueAccess().
     */
    public function download(Request $request, Collection $collection): StreamedResponse
    {
        $disk = $this->assertReadableFile($collection);

        $this->recordUniqueAccess($request, $collection, AccessLog::ACTION_DOWNLOAD, 'download_count');

        $extension = pathinfo($collection->file, PATHINFO_EXTENSION);
        $filename = str($collection->title)->slug().'.'.$extension;

        return $disk->download($collection->file, $filename);
    }

    /**
     * Stream the file inline so it opens in the browser's PDF viewer instead of
     * downloading. Auth required; read counter rises at most once per user.
     */
    public function read(Request $request, Collection $collection): StreamedResponse
    {
        $disk = $this->assertReadableFile($collection);

        $this->recordUniqueAccess($request, $collection, AccessLog::ACTION_READ, 'read_count');

        return $disk->response($collection->file, null, [
            'Content-Disposition' => 'inline; filename="'.str($collection->title)->slug().'.pdf"',
        ]);
    }

    /**
     * Shared guard for read/download: the collection must be published and its
     * file must exist on disk. Returns the storage disk for the caller to use.
     */
    private function assertReadableFile(Collection $collection): Filesystem
    {
        abort_unless($collection->status === Collection::STATUS_PUBLISHED, 404);
        abort_if($collection->file === null, 404, 'Berkas tidak tersedia.');

        $disk = Storage::disk('public');

        abort_unless($disk->exists($collection->file), 404, 'Berkas tidak ditemukan.');

        return $disk;
    }

    /**
     * Log the access and bump the matching counter only the first time this user
     * reads/downloads this collection — so a person counts once no matter how
     * many times they come back. Repeat events are still logged (for history)
     * but do not move the counter.
     */
    private function recordUniqueAccess(
        Request $request,
        Collection $collection,
        string $action,
        string $counter,
    ): void {
        $userId = $request->user()->id;

        $isFirstTime = ! $collection->accessLogs()
            ->where('user_id', $userId)
            ->where('action', $action)
            ->exists();

        $collection->accessLogs()->create([
            'user_id' => $userId,
            'session_id' => $request->session()->getId(),
            'action' => $action,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($isFirstTime) {
            $collection->increment($counter);
        }
    }

    /**
     * The top-level category tree (Umum, Fakultas, Penelitian, Repository,
     * Arsip, ...). The count rolls up each root's children, so "Umum" reports
     * everything filed under Komputer / Bahasa / Ekonomi too.
     *
     * @return array<int, array<string, mixed>>
     */
    private function rootCategories(): array
    {
        return CollectionCategory::query()
            ->whereNull('parent_id')
            ->where('status', true)
            ->with('children:id,parent_id,name')
            ->orderBy('name')
            ->get()
            ->map(function (CollectionCategory $root) {
                $ids = $root->children->pluck('id')->push($root->id);

                return [
                    'id' => $root->id,
                    'name' => $root->name,
                    'slug' => $root->slug,
                    'children' => $root->children->pluck('name')->all(),
                    'count' => Collection::published()
                        ->whereIn('collection_category_id', $ids)
                        ->count(),
                ];
            })
            ->all();
    }

    /**
     * Most-read published collections.
     *
     * @return array<int, array<string, mixed>>
     */
    private function trending(): array
    {
        return Collection::published()
            ->with(['type:id,name', 'category:id,name'])
            ->orderByDesc('read_count')
            ->limit(5)
            ->get()
            ->map(fn (Collection $c) => $this->present($c))
            ->all();
    }

    /**
     * Newest published collections ("Fresh from the presses").
     *
     * @return array<int, array<string, mixed>>
     */
    private function latest(): array
    {
        return Collection::published()
            ->with(['type:id,name', 'category:id,name'])
            ->latest('published_date')
            ->limit(4)
            ->get()
            ->map(fn (Collection $c) => $this->present($c))
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Collection $c): array
    {
        return [
            'id' => $c->id,
            'slug' => $c->slug,
            'title' => $c->title,
            'author' => $c->author,
            'type' => $c->type?->name,
            'category' => $c->category?->name,
            'year' => $c->published_date?->format('Y'),
            'description' => $c->description ? str($c->description)->limit(120)->value() : null,
            'cover' => $c->cover,
            'featured' => $c->featured,
            'read_count' => $c->read_count,
        ];
    }
}

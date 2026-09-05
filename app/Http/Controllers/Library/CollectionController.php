<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCollectionRequest;
use App\Models\Collection;
use App\Repositories\Eloquent\CollectionCategoryRepository;
use App\Repositories\Eloquent\CollectionRepository;
use App\Repositories\Eloquent\CollectionTypeRepository;
use App\Repositories\Eloquent\DepartmentRepository;
use App\Repositories\Eloquent\FacultyRepository;
use App\Repositories\Eloquent\LanguageRepository;
use App\Repositories\Eloquent\PublisherRepository;
use App\Services\CollectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Thin controller: all persistence goes through repositories, all business
 * rules through CollectionService.
 */
class CollectionController extends Controller
{
    public function __construct(
        private readonly CollectionService $service,
        private readonly CollectionRepository $collections,
        private readonly CollectionTypeRepository $types,
        private readonly CollectionCategoryRepository $categories,
        private readonly FacultyRepository $faculties,
        private readonly DepartmentRepository $departments,
        private readonly LanguageRepository $languages,
        private readonly PublisherRepository $publishers,
    ) {}

    /**
     * "Koleksi Saya" (publisher, scoped) / "Katalog Semua Koleksi" (super admin).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $filters = $request->only([
            'search', 'type', 'category', 'faculty', 'department',
            'language', 'year', 'status',
        ]);

        $paginator = $this->collections->search(
            filters: $filters,
            scopeTo: $user->isPublisher() ? $user : null,
        );

        $paginator->through(fn (Collection $c) => [
            'id' => $c->id,
            'slug' => $c->slug,
            'title' => $c->title,
            'author' => $c->author,
            'type' => $c->type?->name,
            'category' => $c->category?->name,
            'faculty' => $c->faculty?->name,
            'owner' => $c->creator?->name,
            'status' => $c->status,
            'featured' => $c->featured,
            'year' => $c->published_date?->format('Y'),
            'read_count' => $c->read_count,
            'download_count' => $c->download_count,
        ]);

        return Inertia::render('library/collections-index', [
            'collections' => $paginator,
            'canModerate' => $user->isSuperAdmin(),
            'filters' => array_merge([
                'search' => '', 'type' => '', 'category' => '',
                'faculty' => '', 'year' => '', 'status' => '',
            ], array_filter($filters, fn ($v) => $v !== null)),
            'options' => $this->formOptions(),
        ]);
    }

    /** The 5-section upload form. */
    public function create(): Response
    {
        return Inertia::render('library/collection-upload', [
            'options' => $this->formOptions(),
        ]);
    }

    public function store(StoreCollectionRequest $request): RedirectResponse
    {
        $this->service->create($request->validated(), $request->user());

        // 303 See Other: after a POST, Inertia must follow the redirect with a
        // GET. A plain 302 makes it replay the POST against the GET-only index
        // route, which 405s and leaves the user stuck on the upload form.
        return redirect()
            ->route('library.collections.index')
            ->with('success', 'Koleksi berhasil diunggah.')
            ->setStatusCode(303);
    }

    public function publish(Request $request, Collection $collection): RedirectResponse
    {
        $this->service->publish($collection, $request->user());

        return back()->with('success', "Koleksi \"{$collection->title}\" telah dipublikasikan.");
    }

    public function archive(Request $request, Collection $collection): RedirectResponse
    {
        $this->service->archive($collection, $request->user());

        return back()->with('success', "Koleksi \"{$collection->title}\" telah diarsipkan.");
    }

    public function unarchive(Request $request, Collection $collection): RedirectResponse
    {
        $this->service->unarchive($collection, $request->user());

        return back()->with('success', "Koleksi \"{$collection->title}\" telah dipulihkan.");
    }

    /**
     * Preview the uploaded file inline (in the browser) so an admin can inspect
     * a draft before approving it. Unlike the public read route, this ignores
     * the published status — but it stays super-admin-only via the route.
     */
    public function preview(Collection $collection): StreamedResponse
    {
        abort_if($collection->file === null, 404, 'Berkas tidak tersedia.');

        $disk = Storage::disk('public');

        abort_unless($disk->exists($collection->file), 404, 'Berkas tidak ditemukan.');

        return $disk->response($collection->file, null, [
            'Content-Disposition' => 'inline; filename="'.str($collection->title)->slug().'.pdf"',
        ]);
    }

    public function feature(Request $request, Collection $collection): RedirectResponse
    {
        $this->service->toggleFeatured($collection, $request->user());

        return back()->with('success', 'Status unggulan diperbarui.');
    }

    public function destroy(Request $request, Collection $collection): RedirectResponse
    {
        $this->service->delete($collection, $request->user());

        return back()->with('success', 'Koleksi dihapus.');
    }

    /**
     * Every dropdown in the app is fed from master data — never hardcoded.
     * `requires_*` flags travel with the options so the React form can drive its
     * conditional fields without knowing any type/category names.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'types' => $this->types->active()->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'requires_publisher' => $t->requires_publisher,
                'requires_isbn' => $t->requires_isbn,
            ])->values(),

            'categories' => $this->categories->activeWithParent()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->parent ? "{$c->parent->name} › {$c->name}" : $c->name,
                'requires_faculty' => $c->requiresFaculty(),
            ])->values(),

            'faculties' => $this->faculties->active()->map(fn ($f) => [
                'id' => $f->id,
                'name' => $f->name,
            ])->values(),

            // Sent whole so the Faculty → Department cascade is instant client-side.
            'departments' => $this->departments->allWithFaculty()
                ->where('status', true)
                ->map(fn ($d) => [
                    'id' => $d->id,
                    'name' => $d->name,
                    'faculty_id' => $d->faculty_id,
                ])->values(),

            'languages' => $this->languages->active()->map(fn ($l) => [
                'id' => $l->id,
                'name' => $l->name,
            ])->values(),

            'publishers' => $this->publishers->active()->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
            ])->values(),
        ];
    }
}

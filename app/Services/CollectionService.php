<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\User;
use App\Repositories\Eloquent\CollectionRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Business logic for collections: file handling, ownership rules, publishing
 * workflow. Controllers stay thin and never touch Eloquent directly.
 */
class CollectionService
{
    public function __construct(
        private readonly CollectionRepository $collections,
    ) {}

    /**
     * Create a collection on behalf of a user, storing the uploaded files and
     * deriving file metadata (size, and page count when we can read it).
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, User $author): Collection
    {
        $data['created_by'] = $author->id;
        $data = $this->handleFiles($data);

        return $this->collections->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Collection $collection, array $data, User $editor): Collection
    {
        $this->assertCanManage($collection, $editor);

        $data['updated_by'] = $editor->id;
        $data = $this->handleFiles($data, $collection);

        return $this->collections->update($collection, $data);
    }

    public function delete(Collection $collection, User $actor): void
    {
        $this->assertCanManage($collection, $actor);

        // Soft delete — files are kept so the record can be restored.
        $this->collections->delete($collection);
    }

    /** Publish a draft (super-admin moderation). */
    public function publish(Collection $collection, User $actor): Collection
    {
        $this->assertIsSuperAdmin($actor);

        return $this->collections->update($collection, [
            'status' => Collection::STATUS_PUBLISHED,
            'updated_by' => $actor->id,
        ]);
    }

    /** Take a collection down from the public catalog. */
    public function archive(Collection $collection, User $actor): Collection
    {
        $this->assertIsSuperAdmin($actor);

        return $this->collections->update($collection, [
            'status' => Collection::STATUS_ARCHIVED,
            'updated_by' => $actor->id,
        ]);
    }

    /** Restore an archived collection back to the public catalog. */
    public function unarchive(Collection $collection, User $actor): Collection
    {
        $this->assertIsSuperAdmin($actor);

        return $this->collections->update($collection, [
            'status' => Collection::STATUS_PUBLISHED,
            'updated_by' => $actor->id,
        ]);
    }

    public function toggleFeatured(Collection $collection, User $actor): Collection
    {
        $this->assertIsSuperAdmin($actor);

        return $this->collections->update($collection, [
            'featured' => ! $collection->featured,
            'updated_by' => $actor->id,
        ]);
    }

    /**
     * Move uploaded files to storage and record their metadata. Replacing a
     * file deletes the old one so storage doesn't grow unbounded.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function handleFiles(array $data, ?Collection $existing = null): array
    {
        $cover = $data['cover'] ?? null;
        $file = $data['file'] ?? null;

        if ($cover instanceof UploadedFile) {
            if ($existing?->cover) {
                Storage::disk('public')->delete($existing->cover);
            }

            $data['cover'] = $cover->store('covers', 'public');
        } else {
            unset($data['cover']);
        }

        if ($file instanceof UploadedFile) {
            if ($existing?->file) {
                Storage::disk('public')->delete($existing->file);
            }

            $data['file'] = $file->store('collections', 'public');
            $data['file_size'] = $file->getSize();
        } else {
            unset($data['file']);
        }

        return $data;
    }

    /** Publishers may only manage their own collections; super admins any. */
    private function assertCanManage(Collection $collection, User $user): void
    {
        if ($user->isPublisher() && $collection->created_by !== $user->id) {
            abort(403);
        }
    }

    private function assertIsSuperAdmin(User $user): void
    {
        abort_unless($user->isSuperAdmin(), 403);
    }
}

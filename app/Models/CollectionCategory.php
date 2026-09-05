<?php

namespace App\Models;

use App\Concerns\HasSlug;
use App\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * Master data: hierarchical category tree (parent_id). New branches can be
 * added by the admin without any code change.
 *
 * @property int $id
 * @property int|null $parent_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property bool $requires_faculty
 * @property bool $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read CollectionCategory|null $parent
 * @property-read EloquentCollection<int, CollectionCategory> $children
 */
#[Fillable(['parent_id', 'name', 'slug', 'description', 'requires_faculty', 'status'])]
class CollectionCategory extends Model
{
    use HasSlug, LogsActivity, SoftDeletes;

    /**
     * @return BelongsTo<CollectionCategory, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * @return HasMany<CollectionCategory, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * @return HasMany<Collection, $this>
     */
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Whether this category (or any ancestor) requires a faculty selection.
     * Drives the dynamic Faculty → Department reveal in the upload form.
     */
    public function requiresFaculty(): bool
    {
        return $this->requires_faculty || (bool) $this->parent?->requiresFaculty();
    }

    protected function casts(): array
    {
        return [
            'requires_faculty' => 'boolean',
            'status' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}

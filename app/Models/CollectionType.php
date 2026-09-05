<?php

namespace App\Models;

use App\Concerns\HasSlug;
use App\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * Master data: the kind of a collection (Book, Thesis, Journal, Module, ...).
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property bool $requires_publisher
 * @property bool $requires_isbn
 * @property bool $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['name', 'slug', 'description', 'requires_publisher', 'requires_isbn', 'status'])]
class CollectionType extends Model
{
    use HasSlug, LogsActivity, SoftDeletes;

    /**
     * @return HasMany<Collection, $this>
     */
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    protected function casts(): array
    {
        return [
            'requires_publisher' => 'boolean',
            'requires_isbn' => 'boolean',
            'status' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}

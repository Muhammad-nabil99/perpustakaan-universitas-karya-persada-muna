<?php

namespace App\Models;

use App\Concerns\HasSlug;
use App\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * The one generic entity for every digital item: Book, Thesis, Journal, Module,
 * Proceeding, Research Report, ... The kind is data, not code — it lives in
 * `collection_type_id`, so new kinds need no schema or code change.
 *
 * @property int $id
 * @property int $created_by
 * @property int|null $updated_by
 * @property int $collection_type_id
 * @property int|null $collection_category_id
 * @property int|null $faculty_id
 * @property int|null $department_id
 * @property int|null $language_id
 * @property int|null $publisher_id
 * @property string $title
 * @property string $slug
 * @property string $author
 * @property string|null $isbn
 * @property Carbon|null $published_date
 * @property int|null $published_year
 * @property string|null $description
 * @property string|null $keywords
 * @property string|null $cover
 * @property string|null $file
 * @property int|null $pages
 * @property int|null $file_size
 * @property string $status
 * @property bool $featured
 * @property int $read_count
 * @property int $download_count
 * @property int $visitor_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read User $creator
 * @property-read CollectionType $type
 * @property-read CollectionCategory|null $category
 */
#[Fillable([
    'created_by',
    'updated_by',
    'collection_type_id',
    'collection_category_id',
    'faculty_id',
    'department_id',
    'language_id',
    'publisher_id',
    'title',
    'slug',
    'author',
    'isbn',
    'published_date',
    'published_year',
    'description',
    'keywords',
    'cover',
    'file',
    'pages',
    'file_size',
    'status',
    'featured',
])]
class Collection extends Model
{
    use HasSlug, LogsActivity, SoftDeletes;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_ARCHIVED = 'archived';

    /** Slug is derived from the title, not the default `name`. */
    public function slugSource(): string
    {
        return 'title';
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * @return BelongsTo<CollectionType, $this>
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(CollectionType::class, 'collection_type_id');
    }

    /**
     * @return BelongsTo<CollectionCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(CollectionCategory::class, 'collection_category_id');
    }

    /**
     * @return BelongsTo<Faculty, $this>
     */
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * @return BelongsTo<Language, $this>
     */
    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class);
    }

    /**
     * @return BelongsTo<Publisher, $this>
     */
    public function publisher(): BelongsTo
    {
        return $this->belongsTo(Publisher::class);
    }

    /**
     * @return HasMany<AccessLog, $this>
     */
    public function accessLogs(): HasMany
    {
        return $this->hasMany(AccessLog::class);
    }

    /**
     * Live on the public catalog.
     *
     * @param  Builder<Collection>  $query
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', self::STATUS_PUBLISHED);
    }

    protected function casts(): array
    {
        return [
            'published_date' => 'date',
            'featured' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}

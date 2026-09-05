<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Auto Slug (CLAUDE.md "Extra Features"). Generates a unique slug from the
 * model's source column on create, and regenerates it when that column changes.
 *
 * Models may override `slugSource()` to slug from a column other than `name`.
 */
trait HasSlug
{
    protected static function bootHasSlug(): void
    {
        static::creating(function (Model $model) {
            if (blank($model->slug)) {
                $model->slug = static::generateUniqueSlug($model->{$model->slugSource()});
            }
        });

        static::updating(function (Model $model) {
            if ($model->isDirty($model->slugSource()) && blank($model->getOriginal('slug')) === false) {
                $model->slug = static::generateUniqueSlug(
                    $model->{$model->slugSource()},
                    $model->getKey(),
                );
            }
        });
    }

    /** The column the slug is derived from. */
    public function slugSource(): string
    {
        return 'name';
    }

    protected static function generateUniqueSlug(string $value, ?int $excludeId = null): string
    {
        $base = Str::slug($value);
        $slug = $base;
        $suffix = 1;

        while (static::slugExists($slug, $excludeId)) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    protected static function slugExists(string $slug, ?int $excludeId): bool
    {
        // Soft-deleted rows still occupy the unique slug index, so they must be
        // counted. `withTrashed()` is a dynamic scope, not a real method, so
        // method_exists() can't detect it — check the trait instead.
        $usesSoftDeletes = in_array(
            SoftDeletes::class,
            class_uses_recursive(static::class),
            true,
        );

        $query = $usesSoftDeletes
            ? static::withTrashed()->where('slug', $slug)
            : static::query()->where('slug', $slug);

        if ($excludeId !== null) {
            $query->whereKeyNot($excludeId);
        }

        return $query->exists();
    }
}

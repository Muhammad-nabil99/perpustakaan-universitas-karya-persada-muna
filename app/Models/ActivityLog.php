<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * Audit trail entry written by the LogsActivity trait.
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $event
 * @property string $subject_type
 * @property int $subject_id
 * @property string|null $description
 * @property array<string, mixed>|null $properties
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $user
 */
#[Fillable([
    'user_id',
    'event',
    'subject_type',
    'subject_id',
    'description',
    'properties',
])]
class ActivityLog extends Model
{
    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The model this entry describes (a Collection or any master-data record).
     *
     * @return MorphTo<Model, $this>
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    protected function casts(): array
    {
        return [
            'properties' => 'array',
        ];
    }
}

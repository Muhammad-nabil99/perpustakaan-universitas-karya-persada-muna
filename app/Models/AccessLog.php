<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A read / download / visit event on a collection.
 *
 * @property int $id
 * @property int $collection_id
 * @property int|null $user_id
 * @property string|null $session_id
 * @property string $action
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection $collection
 * @property-read User|null $user
 */
#[Fillable([
    'collection_id',
    'user_id',
    'session_id',
    'action',
    'ip_address',
    'user_agent',
])]
class AccessLog extends Model
{
    public const ACTION_READ = 'read';

    public const ACTION_DOWNLOAD = 'download';

    public const ACTION_VISIT = 'visit';

    /**
     * @return BelongsTo<Collection, $this>
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    /**
     * The user who performed the action (null for anonymous guests).
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

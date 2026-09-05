<?php

namespace App\Concerns;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Activity Log / Audit Trail (CLAUDE.md "Extra Features"). Records create,
 * update, delete and restore events with a before/after snapshot of the
 * columns that actually changed.
 */
trait LogsActivity
{
    protected static function bootLogsActivity(): void
    {
        static::created(fn (Model $model) => $model->recordActivity('created', [
            'new' => $model->getAttributes(),
        ]));

        static::updated(function (Model $model) {
            $changes = $model->getChanges();
            unset($changes['updated_at']);

            if ($changes === []) {
                return;
            }

            $model->recordActivity('updated', [
                'old' => array_intersect_key($model->getOriginal(), $changes),
                'new' => $changes,
            ]);
        });

        static::deleted(fn (Model $model) => $model->recordActivity('deleted'));

        if (method_exists(static::class, 'restored')) {
            static::restored(fn (Model $model) => $model->recordActivity('restored'));
        }
    }

    /**
     * @param  array<string, mixed>  $properties
     */
    public function recordActivity(string $event, array $properties = []): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'event' => $event,
            'subject_type' => static::class,
            'subject_id' => $this->getKey(),
            'description' => $this->activityDescription($event),
            'properties' => $properties === [] ? null : $properties,
        ]);
    }

    protected function activityDescription(string $event): string
    {
        $label = class_basename(static::class);
        $name = $this->title ?? $this->name ?? $this->getKey();

        return "{$label} \"{$name}\" {$event}";
    }
}

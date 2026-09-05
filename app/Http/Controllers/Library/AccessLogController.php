<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccessLogController extends Controller
{
    /**
     * "Riwayat Akses" — publishers see logs only for their own collections;
     * super admins see the platform-wide "Riwayat Akses Global".
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = AccessLog::query()
            ->with(['user:id,name', 'collection:id,title,created_by'])
            ->latest();

        if ($user->isPublisher()) {
            $query->whereHas('collection', fn ($q) => $q->where('created_by', $user->id));
        }

        $logs = $query->paginate(25)->withQueryString();

        $logs->through(fn (AccessLog $log) => [
            'id' => $log->id,
            'actor' => $log->user?->name ?? 'Tamu',
            'collection' => $log->collection?->title ?? '-',
            'action' => $log->action,
            'ip' => $log->ip_address,
            'timestamp' => $log->created_at?->format('d M Y, H:i'),
        ]);

        return Inertia::render('library/access-logs', [
            'logs' => $logs,
            'isGlobal' => $user->isSuperAdmin(),
        ]);
    }
}

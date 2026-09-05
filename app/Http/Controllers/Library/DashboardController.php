<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboard,
    ) {}

    /**
     * Role-aware dashboard. Super admins get platform-wide analytics; publishers
     * get analytics scoped strictly to the collections they uploaded.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // Pembaca have no management dashboard — send them to the public catalog.
        if ($user->isReader()) {
            return redirect()->route('home');
        }

        $period = $request->query('period', 'daily');

        if (! in_array($period, ['daily', 'weekly', 'monthly', 'yearly'], true)) {
            $period = 'daily';
        }

        if ($user->isSuperAdmin()) {
            return Inertia::render('library/dashboard-admin', [
                ...$this->dashboard->forSuperAdmin($period),
                'period' => $period,
            ]);
        }

        return Inertia::render('library/dashboard-publisher', [
            ...$this->dashboard->forPublisher($user, $period),
            'period' => $period,
        ]);
    }
}

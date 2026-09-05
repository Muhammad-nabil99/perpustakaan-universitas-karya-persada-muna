<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * "Kelola User" — super-admin-only list of all registered users.
     */
    public function index(): Response
    {
        $users = User::query()
            ->withCount('collections')
            ->latest()
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_blocked' => $user->is_blocked,
                'collections_count' => $user->collections_count,
                'joined' => $user->created_at?->format('d M Y'),
            ]);

        return Inertia::render('library/users-index', [
            'users' => $users,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['sometimes', Rule::in(User::ROLES)],
            'is_blocked' => ['sometimes', 'boolean'],
        ]);

        // Guard: an admin cannot demote or block their own account.
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Anda tidak dapat mengubah akun Anda sendiri.');
        }

        $user->update($validated);

        return back()->with('success', 'Data pengguna diperbarui.');
    }
}

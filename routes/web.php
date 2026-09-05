<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Library\AccessLogController;
use App\Http\Controllers\Library\CollectionController;
use App\Http\Controllers\Library\DashboardController as LibraryDashboardController;
use App\Http\Controllers\Library\MasterDataController;
use App\Http\Controllers\Library\UserManagementController;
use App\Http\Controllers\PublicCatalogController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

// Landing page — served from the real collections catalog.
Route::get('/', [PublicCatalogController::class, 'home'])->name('home');

// Public Perpustakaan UKPM catalog pages (Beranda is '/', above). These are
// declared before the {current_team} group so their fixed paths win over the
// team-slug wildcard.
Route::get('/pencarian', [PublicCatalogController::class, 'search'])->name('pencarian');

// Public detail page for a single published collection (bound by slug).
Route::get('/buku/{collection}', [PublicCatalogController::class, 'show'])->name('buku.show');

// Reading and downloading require login. Guests are redirected to /login and
// returned here afterwards (Fortify's "intended" redirect). Each counter rises
// at most once per user per collection.
Route::middleware('auth')->group(function () {
    Route::get('/buku/{collection}/baca', [PublicCatalogController::class, 'read'])->name('buku.read');
    Route::get('/buku/{collection}/unduh', [PublicCatalogController::class, 'download'])->name('buku.download');
});

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

/*
 * Digital library RBAC dashboard & modules. All routes require auth; the role
 * middleware restricts super-admin-only modules. Publisher-vs-admin data scoping
 * is handled inside each controller.
 */
Route::middleware(['auth'])->prefix('library')->name('library.')->group(function () {
    Route::get('/', LibraryDashboardController::class)->name('dashboard');

    // Contributor modules — Pembaca (reader) has no access to these at all.
    // Data is further scoped by role inside the controller/service: a publisher
    // only ever sees their own collections.
    Route::middleware('role:publisher,super_admin')->group(function () {
        Route::get('collections', [CollectionController::class, 'index'])->name('collections.index');
        Route::get('collections/upload', [CollectionController::class, 'create'])->name('collections.create');
        Route::post('collections', [CollectionController::class, 'store'])->name('collections.store');
        // Bind by id: the admin catalog is keyed by id, whereas the Collection model
        // routes by slug for public SEO URLs (/buku/{slug}).
        Route::delete('collections/{collection:id}', [CollectionController::class, 'destroy'])->name('collections.destroy');
        Route::get('access-logs', [AccessLogController::class, 'index'])->name('access-logs.index');
    });

    // Super-admin-only: moderation, master data, user management.
    Route::middleware('role:super_admin')->group(function () {
        Route::get('collections/{collection:id}/preview', [CollectionController::class, 'preview'])->name('collections.preview');
        Route::patch('collections/{collection:id}/publish', [CollectionController::class, 'publish'])->name('collections.publish');
        Route::patch('collections/{collection:id}/archive', [CollectionController::class, 'archive'])->name('collections.archive');
        Route::patch('collections/{collection:id}/unarchive', [CollectionController::class, 'unarchive'])->name('collections.unarchive');
        Route::patch('collections/{collection:id}/feature', [CollectionController::class, 'feature'])->name('collections.feature');

        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
        Route::put('users/{user}', [UserManagementController::class, 'update'])->name('users.update');

        // Master Data (dynamic superadmin data — no code change to extend).
        Route::prefix('master')->name('master.')->group(function () {
            Route::get('{resource}', [MasterDataController::class, 'index'])->name('index');
            Route::post('{resource}', [MasterDataController::class, 'store'])->name('store');
            Route::put('{resource}/{id}', [MasterDataController::class, 'update'])->name('update');
            Route::delete('{resource}/{id}', [MasterDataController::class, 'destroy'])->name('destroy');
            Route::patch('{resource}/{id}/restore', [MasterDataController::class, 'restore'])->name('restore');
        });
    });
});

require __DIR__.'/settings.php';

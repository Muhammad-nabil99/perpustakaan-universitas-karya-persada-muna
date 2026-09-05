<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * RBAC guarantees for the three roles:
 *   reader     (Pembaca)               — search, read, download only
 *   publisher  (Mahasiswa Kontributor) — may upload
 *   super_admin                        — full access
 */
test('a newly registered user defaults to the reader role', function () {
    $user = User::create([
        'name' => 'Mahasiswa Baru',
        'email' => 'baru@example.com',
        'password' => 'password',
    ]);

    // Re-read: the in-memory instance has no `role` until the DB default applies.
    $user = $user->fresh();

    expect($user->role)->toBe(User::ROLE_READER)
        ->and($user->isReader())->toBeTrue()
        ->and($user->canContribute())->toBeFalse();
});

test('a reader cannot open the upload form', function () {
    $reader = User::factory()->create(['role' => User::ROLE_READER]);

    $this->actingAs($reader)
        ->get('/library/collections/upload')
        ->assertForbidden();
});

test('a reader cannot post a new collection', function () {
    $reader = User::factory()->create(['role' => User::ROLE_READER]);

    $this->actingAs($reader)
        ->post('/library/collections', ['title' => 'Percobaan'])
        ->assertForbidden();
});

test('a reader cannot browse the management catalog or access logs', function () {
    $reader = User::factory()->create(['role' => User::ROLE_READER]);

    $this->actingAs($reader)->get('/library/collections')->assertForbidden();
    $this->actingAs($reader)->get('/library/access-logs')->assertForbidden();
});

test('a reader hitting the library dashboard is sent to the public catalog', function () {
    $reader = User::factory()->create(['role' => User::ROLE_READER]);

    $this->actingAs($reader)
        ->get('/library')
        ->assertRedirect(route('home'));
});

test('a contributor can still reach the upload form', function () {
    $contributor = User::factory()->create(['role' => User::ROLE_PUBLISHER]);

    $this->actingAs($contributor)
        ->get('/library/collections/upload')
        ->assertOk();
});

test('an admin can promote a reader to contributor', function () {
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);
    $reader = User::factory()->create(['role' => User::ROLE_READER]);

    $this->actingAs($admin)
        ->put("/library/users/{$reader->id}", ['role' => User::ROLE_PUBLISHER])
        ->assertRedirect();

    expect($reader->fresh()->role)->toBe(User::ROLE_PUBLISHER);
});

test('a reader cannot promote themselves', function () {
    $reader = User::factory()->create(['role' => User::ROLE_READER]);

    $this->actingAs($reader)
        ->put("/library/users/{$reader->id}", ['role' => User::ROLE_SUPER_ADMIN])
        ->assertForbidden();

    expect($reader->fresh()->role)->toBe(User::ROLE_READER);
});

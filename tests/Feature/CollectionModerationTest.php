<?php

use App\Models\Collection;
use App\Models\CollectionCategory;
use App\Models\CollectionType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * A minimal draft collection with the master-data rows it needs. Kept local so
 * the moderation flow can be exercised without a full seeder.
 */
function draftCollection(User $owner): Collection
{
    $type = CollectionType::create([
        'name' => 'Buku',
        'slug' => 'buku-'.uniqid(),
        'status' => true,
    ]);

    $category = CollectionCategory::create([
        'name' => 'Umum',
        'slug' => 'umum-'.uniqid(),
        'status' => true,
    ]);

    return Collection::create([
        'title' => 'Draft Under Review',
        'slug' => 'draft-under-review-'.uniqid(),
        'author' => 'Publisher Author',
        'collection_type_id' => $type->id,
        'collection_category_id' => $category->id,
        'status' => Collection::STATUS_DRAFT,
        'created_by' => $owner->id,
    ]);
}

test('super admin can approve (publish) a publisher draft', function () {
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);
    $publisher = User::factory()->create(['role' => User::ROLE_PUBLISHER]);
    $draft = draftCollection($publisher);

    $response = $this
        ->actingAs($admin)
        ->patch("/library/collections/{$draft->id}/publish");

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($draft->fresh()->status)->toBe(Collection::STATUS_PUBLISHED);
});

test('publisher cannot approve collections', function () {
    $publisher = User::factory()->create(['role' => User::ROLE_PUBLISHER]);
    $draft = draftCollection($publisher);

    $this
        ->actingAs($publisher)
        ->patch("/library/collections/{$draft->id}/publish")
        ->assertForbidden();

    expect($draft->fresh()->status)->toBe(Collection::STATUS_DRAFT);
});

test('flash message is shared to inertia so the admin sees feedback', function () {
    $admin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);

    $this
        ->actingAs($admin)
        ->get('/library/collections')
        ->assertInertia(fn ($page) => $page->has('flash'));
});

<?php

namespace App\Repositories\Eloquent;

use App\Models\CollectionType;

/**
 * @extends BaseRepository<CollectionType>
 */
class CollectionTypeRepository extends BaseRepository
{
    protected function model(): string
    {
        return CollectionType::class;
    }
}

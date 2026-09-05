<?php

namespace App\Repositories\Eloquent;

use App\Models\Publisher;

/**
 * @extends BaseRepository<Publisher>
 */
class PublisherRepository extends BaseRepository
{
    protected function model(): string
    {
        return Publisher::class;
    }
}

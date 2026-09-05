<?php

namespace App\Repositories\Eloquent;

use App\Models\Faculty;

/**
 * @extends BaseRepository<Faculty>
 */
class FacultyRepository extends BaseRepository
{
    protected function model(): string
    {
        return Faculty::class;
    }
}

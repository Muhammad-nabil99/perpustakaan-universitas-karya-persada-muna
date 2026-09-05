<?php

namespace App\Repositories\Eloquent;

use App\Models\Language;

/**
 * @extends BaseRepository<Language>
 */
class LanguageRepository extends BaseRepository
{
    protected function model(): string
    {
        return Language::class;
    }
}

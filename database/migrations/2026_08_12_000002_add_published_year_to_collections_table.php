<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Contributors supply a publication YEAR, not always an exact date. Storing
     * it as its own indexed column keeps "search by year" a plain indexed
     * lookup instead of a YEAR(published_date) expression that cannot use an
     * index, and lets a collection record a year even when the full date is
     * unknown.
     */
    public function up(): void
    {
        Schema::table('collections', function (Blueprint $table) {
            $table->unsignedSmallInteger('published_year')->nullable()->after('published_date');
            $table->index('published_year');
        });

        // Backfill existing rows from the date they already carry.
        DB::table('collections')
            ->whereNotNull('published_date')
            ->update(['published_year' => DB::raw('YEAR(published_date)')]);
    }

    public function down(): void
    {
        Schema::table('collections', function (Blueprint $table) {
            $table->dropIndex(['published_year']);
            $table->dropColumn('published_year');
        });
    }
};

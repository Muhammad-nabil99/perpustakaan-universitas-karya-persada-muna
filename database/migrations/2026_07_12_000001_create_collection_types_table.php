<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Master data: collection types (Book, Thesis, Journal, Module, ...).
     * Adding a new type is pure data entry — no source-code change required.
     *
     * `requires_publisher` / `requires_isbn` drive the dynamic upload form:
     * a Book shows Publisher+ISBN, a Thesis hides them.
     */
    public function up(): void
    {
        Schema::create('collection_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('requires_publisher')->default(true);
            $table->boolean('requires_isbn')->default(true);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_types');
    }
};

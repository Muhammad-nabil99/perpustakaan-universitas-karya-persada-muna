<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Master data: hierarchical collection categories (parent_id).
     *
     *   Umum ── Komputer / Bahasa / Ekonomi
     *   Fakultas ── Ilmu Kesehatan / Hukum / Pendidikan
     *   Penelitian, Repository, Arsip, ...
     *
     * `requires_faculty` is the data-driven flag behind the dynamic UI: picking
     * a category with this flag reveals the Faculty → Department selects. New
     * categories can be added by the admin without touching source code.
     */
    public function up(): void
    {
        Schema::create('collection_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('collection_categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('requires_faculty')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_categories');
    }
};

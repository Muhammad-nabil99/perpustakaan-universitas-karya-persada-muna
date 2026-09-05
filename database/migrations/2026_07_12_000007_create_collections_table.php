<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The single generic entity for every kind of digital item: Book, Thesis,
     * Journal, Module, Proceeding, Research Report, ... The kind is decided by
     * `collection_type_id` (master data), so supporting a new kind requires no
     * schema change — exactly the "future ready" requirement in CLAUDE.md.
     */
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();

            // Ownership / audit trail.
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            // Classification (all master-data driven, all nullable where optional).
            $table->foreignId('collection_type_id')->constrained()->cascadeOnDelete();
            $table->foreignId('collection_category_id')->nullable()->constrained('collection_categories')->nullOnDelete();
            $table->foreignId('faculty_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('language_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('publisher_id')->nullable()->constrained()->nullOnDelete();

            // Core metadata.
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('author');
            $table->string('isbn')->nullable();
            $table->date('published_date')->nullable();
            $table->text('description')->nullable();
            $table->string('keywords')->nullable();

            // Files.
            $table->string('cover')->nullable();
            $table->string('file')->nullable();
            $table->unsignedInteger('pages')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();

            // Settings. Draft → Published → Archived (CLAUDE.md), plus moderation.
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->boolean('featured')->default(false);

            // Denormalised counters (kept in sync from access_logs).
            $table->unsignedBigInteger('read_count')->default(0);
            $table->unsignedBigInteger('download_count')->default(0);
            $table->unsignedBigInteger('visitor_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['created_by', 'status']);
            $table->index('collection_type_id');
            $table->index('collection_category_id');
            $table->index('faculty_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};

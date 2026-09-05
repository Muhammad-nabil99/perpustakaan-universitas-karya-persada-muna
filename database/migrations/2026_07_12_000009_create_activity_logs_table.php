<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Activity log / audit trail (CLAUDE.md "Extra Features"). Records who did
     * what to which model, with a before/after snapshot of the changed columns.
     * Polymorphic so it covers collections and every master-data table.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('event'); // created | updated | deleted | restored
            $table->morphs('subject'); // subject_type + subject_id
            $table->string('description')->nullable();
            $table->json('properties')->nullable(); // { old: {...}, new: {...} }

            $table->timestamps();

            $table->index('event');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};

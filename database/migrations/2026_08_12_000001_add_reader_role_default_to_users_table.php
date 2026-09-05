<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Introduce the third RBAC role: 'reader' (Pembaca / mahasiswa umum).
     *
     * Registration previously fell through to the column default of 'publisher',
     * which meant every self-registered account could upload. Readers can only
     * search, read and download; an admin promotes them to 'publisher'
     * (Mahasiswa Kontributor) from the user management screen.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('reader')->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('publisher')->change();
        });
    }
};

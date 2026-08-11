<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['institute_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('institute_id')->nullable(false)->change();
            $table->foreign('institute_id')->references('id')->on('institutes')->cascadeOnDelete();

            if (! Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }

            if (! Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('active')->after('role');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['institute_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('institute_id')->nullable()->change();
            $table->foreign('institute_id')->references('id')->on('institutes')->nullOnDelete();
            $table->dropColumn(['phone', 'status']);
        });
    }
};

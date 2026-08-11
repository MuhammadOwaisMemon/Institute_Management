<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('institutes', function (Blueprint $table) {
            if (Schema::hasColumn('institutes', 'slug')) {
                $table->dropUnique('institutes_slug_unique');
                $table->dropColumn('slug');
            }

            if (Schema::hasColumn('institutes', 'is_active')) {
                $table->dropColumn('is_active');
            }

            if (! Schema::hasColumn('institutes', 'short_name')) {
                $table->string('short_name')->nullable()->after('name');
            }

            if (! Schema::hasColumn('institutes', 'logo')) {
                $table->string('logo')->nullable()->after('short_name');
            }

            if (! Schema::hasColumn('institutes', 'country')) {
                $table->string('country')->default('Pakistan')->after('city');
            }

            if (! Schema::hasColumn('institutes', 'currency')) {
                $table->string('currency')->default('PKR')->after('country');
            }

            if (! Schema::hasColumn('institutes', 'timezone')) {
                $table->string('timezone')->default('Asia/Karachi')->after('currency');
            }

            if (! Schema::hasColumn('institutes', 'receipt_footer')) {
                $table->text('receipt_footer')->nullable()->after('timezone');
            }

            if (! Schema::hasColumn('institutes', 'status')) {
                $table->string('status')->default('active')->after('receipt_footer');
            }
        });
    }

    public function down(): void
    {
        Schema::table('institutes', function (Blueprint $table) {
            $table->string('slug')->unique()->after('name');
            $table->boolean('is_active')->default(true)->after('city');
            $table->dropColumn([
                'short_name',
                'logo',
                'country',
                'currency',
                'timezone',
                'receipt_footer',
                'status',
            ]);
        });
    }
};

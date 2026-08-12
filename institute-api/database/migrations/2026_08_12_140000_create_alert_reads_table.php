<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alert_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institute_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('alert_key');
            $table->timestamp('read_at');
            $table->timestamps();

            $table->unique(['user_id', 'alert_key']);
            $table->index(['institute_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alert_reads');
    }
};

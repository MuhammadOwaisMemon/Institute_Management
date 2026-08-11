<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institute_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('batch_code')->nullable();
            $table->date('start_date');
            $table->date('expected_end_date')->nullable();
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('capacity')->nullable();
            $table->string('room')->nullable();
            $table->json('weekdays');
            $table->string('status')->default('upcoming');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['institute_id', 'status']);
            $table->index(['institute_id', 'course_id']);
            $table->index(['institute_id', 'teacher_id']);
            $table->unique(['institute_id', 'batch_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institute_id')->constrained()->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->date('attendance_date');
            $table->string('status');
            $table->text('remarks')->nullable();
            $table->foreignId('marked_by')->constrained('users');
            $table->timestamps();
            $table->unique(['batch_id', 'student_id', 'attendance_date']);
            $table->index(['institute_id', 'attendance_date']);
        });
    }
    public function down(): void { Schema::dropIfExists('attendances'); }
};

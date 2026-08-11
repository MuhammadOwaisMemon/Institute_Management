<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institute_id')->constrained()->cascadeOnDelete();
            $table->string('student_code');
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('father_guardian_name')->nullable();
            $table->string('gender')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('cnic_bform')->nullable();
            $table->string('phone');
            $table->string('alternate_phone')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('photo')->nullable();
            $table->date('joining_date');
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['institute_id', 'student_code']);
            $table->index(['institute_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};

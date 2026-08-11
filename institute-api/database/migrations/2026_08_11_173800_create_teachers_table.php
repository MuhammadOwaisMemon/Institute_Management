<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institute_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employee_code')->nullable();
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('gender')->nullable();
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('cnic')->nullable();
            $table->text('address')->nullable();
            $table->date('joining_date')->nullable();
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['institute_id', 'status']);
            $table->unique(['institute_id', 'employee_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};

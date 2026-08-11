<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institute_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('duration_value')->nullable();
            $table->string('duration_unit')->nullable();
            $table->decimal('standard_fee', 12, 2);
            $table->decimal('admission_fee', 12, 2)->default(0);
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['institute_id', 'status']);
            $table->unique(['institute_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};

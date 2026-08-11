<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institute_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('installment_id')->nullable()->constrained('fee_installments')->nullOnDelete();
            $table->string('receipt_number');
            $table->decimal('amount', 12, 2);
            $table->date('payment_date');
            $table->string('payment_method');
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('received_by')->constrained('users');
            $table->timestamps();
            $table->unique(['institute_id', 'receipt_number']);
            $table->index(['institute_id', 'payment_date']);
        });
    }
    public function down(): void { Schema::dropIfExists('payments'); }
};

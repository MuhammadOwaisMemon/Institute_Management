<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->index(['institute_id', 'joining_date'], 'students_inst_join_idx');
            $table->index(['institute_id', 'phone'], 'students_inst_phone_idx');
            $table->index(['institute_id', 'first_name'], 'students_inst_first_idx');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->index(['institute_id', 'name'], 'courses_inst_name_idx');
        });

        Schema::table('batches', function (Blueprint $table) {
            $table->index(['institute_id', 'status', 'start_date'], 'batches_inst_status_start_idx');
            $table->index(['institute_id', 'status', 'expected_end_date'], 'batches_inst_status_end_idx');
            $table->index(['institute_id', 'status', 'start_time'], 'batches_inst_status_time_idx');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->index(['institute_id', 'enrollment_date'], 'enroll_inst_date_idx');
            $table->index(['institute_id', 'course_id', 'enrollment_date'], 'enroll_inst_course_date_idx');
            $table->index(['institute_id', 'batch_id', 'enrollment_date'], 'enroll_inst_batch_date_idx');
        });

        Schema::table('fee_installments', function (Blueprint $table) {
            $table->index(['institute_id', 'enrollment_id'], 'fees_inst_enroll_idx');
            $table->index(['institute_id', 'due_date'], 'fees_inst_due_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index(['institute_id', 'enrollment_id'], 'payments_inst_enroll_idx');
            $table->index(['institute_id', 'student_id'], 'payments_inst_student_idx');
            $table->index(['institute_id', 'payment_method', 'payment_date'], 'payments_inst_method_date_idx');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->index(['institute_id', 'batch_id', 'attendance_date'], 'att_inst_batch_date_idx');
            $table->index(['institute_id', 'student_id', 'attendance_date'], 'att_inst_student_date_idx');
        });

        Schema::table('exam_results', function (Blueprint $table) {
            $table->index(['institute_id', 'student_id'], 'exam_results_inst_student_idx');
            $table->index(['institute_id', 'exam_id'], 'exam_results_inst_exam_idx');
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->index(['institute_id', 'student_id', 'issue_date'], 'cert_inst_student_issue_idx');
            $table->index(['institute_id', 'course_id', 'issue_date'], 'cert_inst_course_issue_idx');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index(['institute_id', 'created_at'], 'activity_inst_created_idx');
            $table->index(['institute_id', 'action', 'created_at'], 'activity_inst_action_created_idx');
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('activity_inst_action_created_idx');
            $table->dropIndex('activity_inst_created_idx');
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->dropIndex('cert_inst_course_issue_idx');
            $table->dropIndex('cert_inst_student_issue_idx');
        });

        Schema::table('exam_results', function (Blueprint $table) {
            $table->dropIndex('exam_results_inst_exam_idx');
            $table->dropIndex('exam_results_inst_student_idx');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('att_inst_student_date_idx');
            $table->dropIndex('att_inst_batch_date_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_inst_method_date_idx');
            $table->dropIndex('payments_inst_student_idx');
            $table->dropIndex('payments_inst_enroll_idx');
        });

        Schema::table('fee_installments', function (Blueprint $table) {
            $table->dropIndex('fees_inst_due_idx');
            $table->dropIndex('fees_inst_enroll_idx');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropIndex('enroll_inst_batch_date_idx');
            $table->dropIndex('enroll_inst_course_date_idx');
            $table->dropIndex('enroll_inst_date_idx');
        });

        Schema::table('batches', function (Blueprint $table) {
            $table->dropIndex('batches_inst_status_time_idx');
            $table->dropIndex('batches_inst_status_end_idx');
            $table->dropIndex('batches_inst_status_start_idx');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropIndex('courses_inst_name_idx');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex('students_inst_first_idx');
            $table->dropIndex('students_inst_phone_idx');
            $table->dropIndex('students_inst_join_idx');
        });
    }
};

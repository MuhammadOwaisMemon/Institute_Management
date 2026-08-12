<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\FeeInstallment;
use App\Models\Institute;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        DB::transaction(function (): void {
            $institute = $this->institute();
            $users = $this->users($institute);
            $teachers = $this->teachers($institute, $users);
            $courses = $this->courses($institute);
            $batches = $this->batches($institute, $courses, $teachers);
            $students = $this->students($institute);
            $enrollments = $this->enrollments($institute, $courses, $batches, $students);

            $this->installmentsAndPayments($institute, $users['receptionist'], $enrollments);
            $this->attendance($institute, $users['receptionist'], $enrollments);
            $this->examsAndResults($institute, $batches, $enrollments);
            $this->certificates($institute, $enrollments);
        });
    }

    private function institute(): Institute
    {
        return Institute::query()->updateOrCreate(
            ['id' => 1],
            [
                'name' => 'Bright Future Institute',
                'short_name' => 'BFI',
                'phone' => '021 3488 1122',
                'email' => 'info@brightfuture.test',
                'address' => 'Main University Road, Gulshan-e-Iqbal',
                'city' => 'Karachi',
                'country' => 'Pakistan',
                'currency' => 'PKR',
                'timezone' => 'Asia/Karachi',
                'receipt_footer' => 'Thank you for choosing Bright Future Institute.',
                'status' => 'active',
            ],
        );
    }

    /**
     * @return array<string, User>
     */
    private function users(Institute $institute): array
    {
        $users = [
            'admin' => ['name' => 'Ayesha Siddiqui', 'email' => 'admin@brightfuture.test', 'role' => 'admin'],
            'receptionist' => ['name' => 'Hina Javed', 'email' => 'reception@brightfuture.test', 'role' => 'receptionist'],
            'teacher_english' => ['name' => 'Sara Ahmed', 'email' => 'sara.ahmed@brightfuture.test', 'role' => 'teacher'],
            'teacher_computer' => ['name' => 'Bilal Khan', 'email' => 'bilal.khan@brightfuture.test', 'role' => 'teacher'],
            'teacher_design' => ['name' => 'Nadia Farooq', 'email' => 'nadia.farooq@brightfuture.test', 'role' => 'teacher'],
        ];

        return collect($users)->mapWithKeys(fn (array $user, string $key) => [
            $key => User::query()->updateOrCreate(
                ['email' => $user['email']],
                [
                    'institute_id' => $institute->id,
                    'name' => $user['name'],
                    'phone' => match ($key) {
                        'admin' => '0300 110 1001',
                        'receptionist' => '0300 110 1002',
                        'teacher_english' => '0300 110 1003',
                        'teacher_computer' => '0300 110 1004',
                        default => '0300 110 1005',
                    },
                    'role' => $user['role'],
                    'status' => 'active',
                    'password' => 'password123',
                ],
            ),
        ])->all();
    }

    /**
     * @param array<string, User> $users
     * @return array<string, Teacher>
     */
    private function teachers(Institute $institute, array $users): array
    {
        $teachers = [
            'english' => ['user' => 'teacher_english', 'code' => 'TCH-001', 'first' => 'Sara', 'last' => 'Ahmed', 'gender' => 'female', 'specialty' => 'English language and IELTS speaking'],
            'computer' => ['user' => 'teacher_computer', 'code' => 'TCH-002', 'first' => 'Bilal', 'last' => 'Khan', 'gender' => 'male', 'specialty' => 'Computer basics, MS Office, and web fundamentals'],
            'design' => ['user' => 'teacher_design', 'code' => 'TCH-003', 'first' => 'Nadia', 'last' => 'Farooq', 'gender' => 'female', 'specialty' => 'Graphic designing and creative portfolio training'],
        ];

        return collect($teachers)->mapWithKeys(fn (array $teacher, string $key) => [
            $key => Teacher::query()->updateOrCreate(
                ['institute_id' => $institute->id, 'employee_code' => $teacher['code']],
                [
                    'user_id' => $users[$teacher['user']]->id,
                    'first_name' => $teacher['first'],
                    'last_name' => $teacher['last'],
                    'gender' => $teacher['gender'],
                    'phone' => $users[$teacher['user']]->phone,
                    'email' => $users[$teacher['user']]->email,
                    'cnic' => null,
                    'address' => 'Karachi, Pakistan',
                    'joining_date' => '2025-11-15',
                    'status' => 'active',
                    'notes' => $teacher['specialty'],
                ],
            ),
        ])->all();
    }

    /**
     * @return array<string, Course>
     */
    private function courses(Institute $institute): array
    {
        $courses = [
            'spoken_english' => ['Spoken English', 'ENG-SPOKEN', 12000, 1000, 3, 'months'],
            'ielts' => ['IELTS Preparation', 'IELTS', 25000, 1500, 8, 'weeks'],
            'basic_computer' => ['Basic Computer', 'COMP-BASIC', 10000, 500, 2, 'months'],
            'ms_office' => ['MS Office', 'MS-OFFICE', 15000, 500, 10, 'weeks'],
            'graphic_design' => ['Graphic Designing', 'GD', 30000, 1500, 4, 'months'],
            'web_development' => ['Web Development', 'WEB-DEV', 45000, 2000, 6, 'months'],
        ];

        return collect($courses)->mapWithKeys(fn (array $course, string $key) => [
            $key => Course::query()->updateOrCreate(
                ['institute_id' => $institute->id, 'code' => $course[1]],
                [
                    'name' => $course[0],
                    'description' => "{$course[0]} practical training with assignments and progress tracking.",
                    'duration_value' => $course[4],
                    'duration_unit' => $course[5],
                    'standard_fee' => $course[2],
                    'admission_fee' => $course[3],
                    'status' => 'active',
                ],
            ),
        ])->all();
    }

    /**
     * @param array<string, Course> $courses
     * @param array<string, Teacher> $teachers
     * @return array<string, Batch>
     */
    private function batches(Institute $institute, array $courses, array $teachers): array
    {
        $batches = [
            'spoken_evening' => ['Spoken English Evening', 'B-SE-2608', 'spoken_english', 'english', '2026-08-03', '2026-10-30', '18:00', '19:30', ['monday', 'wednesday', 'friday'], 'active', 'Room 1'],
            'ielts_morning' => ['IELTS Morning', 'B-IELTS-2608', 'ielts', 'english', '2026-08-10', '2026-10-05', '10:00', '12:00', ['monday', 'wednesday', 'friday'], 'active', 'Room 2'],
            'computer_afternoon' => ['Basic Computer Afternoon', 'B-BC-2608', 'basic_computer', 'computer', '2026-08-01', '2026-09-30', '15:00', '16:30', ['tuesday', 'thursday', 'saturday'], 'active', 'Lab 1'],
            'office_weekend' => ['MS Office Weekend', 'B-MSO-2608', 'ms_office', 'computer', '2026-08-15', '2026-10-24', '11:00', '13:00', ['saturday', 'sunday'], 'upcoming', 'Lab 2'],
            'design_evening' => ['Graphic Designing Evening', 'B-GD-2607', 'graphic_design', 'design', '2026-07-01', '2026-10-31', '17:00', '19:00', ['tuesday', 'thursday'], 'active', 'Design Lab'],
            'web_completed' => ['Web Development Spring', 'B-WEB-2602', 'web_development', 'computer', '2026-02-01', '2026-07-31', '19:00', '21:00', ['monday', 'wednesday'], 'completed', 'Lab 3'],
        ];

        return collect($batches)->mapWithKeys(fn (array $batch, string $key) => [
            $key => Batch::query()->updateOrCreate(
                ['institute_id' => $institute->id, 'batch_code' => $batch[1]],
                [
                    'course_id' => $courses[$batch[2]]->id,
                    'teacher_id' => $teachers[$batch[3]]->id,
                    'name' => $batch[0],
                    'start_date' => $batch[4],
                    'expected_end_date' => $batch[5],
                    'start_time' => $batch[6],
                    'end_time' => $batch[7],
                    'capacity' => 24,
                    'room' => $batch[10],
                    'weekdays' => $batch[8],
                    'status' => $batch[9],
                    'notes' => 'Demo batch for development and reporting.',
                ],
            ),
        ])->all();
    }

    /**
     * @return array<string, Student>
     */
    private function students(Institute $institute): array
    {
        $students = [
            ['STD-00001', 'Ali', 'Raza', 'male', '0301 220 1001', 'Muhammad Raza', '2026-02-01', 'completed'],
            ['STD-00002', 'Fatima', 'Noor', 'female', '0301 220 1002', 'Imran Noor', '2026-02-05', 'completed'],
            ['STD-00003', 'Hassan', 'Ali', 'male', '0301 220 1003', 'Akhtar Ali', '2026-07-01', 'active'],
            ['STD-00004', 'Maham', 'Khan', 'female', '0301 220 1004', 'Faisal Khan', '2026-07-03', 'active'],
            ['STD-00005', 'Usman', 'Tariq', 'male', '0301 220 1005', 'Tariq Mahmood', '2026-08-01', 'active'],
            ['STD-00006', 'Areeba', 'Shah', 'female', '0301 220 1006', 'Naveed Shah', '2026-08-03', 'active'],
            ['STD-00007', 'Danish', 'Iqbal', 'male', '0301 220 1007', 'Iqbal Hussain', '2026-08-04', 'active'],
            ['STD-00008', 'Sana', 'Yousuf', 'female', '0301 220 1008', 'Yousuf Ahmed', '2026-08-05', 'active'],
            ['STD-00009', 'Zain', 'Malik', 'male', '0301 220 1009', 'Kashif Malik', '2026-08-06', 'active'],
            ['STD-00010', 'Iqra', 'Bashir', 'female', '0301 220 1010', 'Bashir Ahmed', '2026-08-08', 'active'],
            ['STD-00011', 'Hamza', 'Saeed', 'male', '0301 220 1011', 'Saeed Anwar', '2026-08-10', 'active'],
            ['STD-00012', 'Mariam', 'Aslam', 'female', '0301 220 1012', 'Aslam Javed', '2026-08-11', 'active'],
            ['STD-00013', 'Omer', 'Farooq', 'male', '0301 220 1013', 'Farooq Ahmed', '2026-07-10', 'dropped'],
            ['STD-00014', 'Laiba', 'Imran', 'female', '0301 220 1014', 'Imran Qureshi', '2026-08-12', 'active'],
            ['STD-00015', 'Ahmed', 'Nadeem', 'male', '0301 220 1015', 'Nadeem Siddiqui', '2026-08-12', 'active'],
            ['STD-00016', 'Kiran', 'Saleem', 'female', '0301 220 1016', 'Saleem Akram', '2026-07-15', 'active'],
            ['STD-00017', 'Saad', 'Mehmood', 'male', '0301 220 1017', 'Mehmood Khan', '2026-08-02', 'active'],
            ['STD-00018', 'Nimra', 'Tahir', 'female', '0301 220 1018', 'Tahir Abbas', '2026-08-09', 'active'],
        ];

        return collect($students)->mapWithKeys(fn (array $student) => [
            $student[0] => Student::query()->updateOrCreate(
                ['institute_id' => $institute->id, 'student_code' => $student[0]],
                [
                    'first_name' => $student[1],
                    'last_name' => $student[2],
                    'father_guardian_name' => $student[5],
                    'gender' => $student[3],
                    'date_of_birth' => '2004-05-12',
                    'cnic_bform' => null,
                    'phone' => $student[4],
                    'alternate_phone' => null,
                    'guardian_phone' => '0302 330 '.substr($student[0], -4),
                    'email' => strtolower($student[1].'.'.$student[2]).'@example.test',
                    'address' => 'Karachi, Pakistan',
                    'city' => 'Karachi',
                    'joining_date' => $student[6],
                    'status' => $student[7],
                    'notes' => 'Fictional demo student.',
                ],
            ),
        ])->all();
    }

    /**
     * @param array<string, Course> $courses
     * @param array<string, Batch> $batches
     * @param array<string, Student> $students
     * @return array<string, Enrollment>
     */
    private function enrollments(Institute $institute, array $courses, array $batches, array $students): array
    {
        $items = [
            ['E-001', 'STD-00001', 'web_development', 'web_completed', '2026-02-01', 45000, 2000, null, 0, 'completed', '2026-07-31'],
            ['E-002', 'STD-00002', 'web_development', 'web_completed', '2026-02-05', 45000, 2000, 'fixed', 3000, 'completed', '2026-07-31'],
            ['E-003', 'STD-00003', 'graphic_design', 'design_evening', '2026-07-01', 30000, 1500, 'fixed', 1500, 'active', null],
            ['E-004', 'STD-00004', 'graphic_design', 'design_evening', '2026-07-03', 30000, 1500, null, 0, 'active', null],
            ['E-005', 'STD-00005', 'basic_computer', 'computer_afternoon', '2026-08-01', 10000, 500, null, 0, 'active', null],
            ['E-006', 'STD-00006', 'spoken_english', 'spoken_evening', '2026-08-03', 12000, 1000, 'percentage', 10, 'active', null],
            ['E-007', 'STD-00007', 'spoken_english', 'spoken_evening', '2026-08-04', 12000, 1000, null, 0, 'active', null],
            ['E-008', 'STD-00008', 'ielts', 'ielts_morning', '2026-08-05', 25000, 1500, 'fixed', 2000, 'active', null],
            ['E-009', 'STD-00009', 'ielts', 'ielts_morning', '2026-08-06', 25000, 1500, null, 0, 'active', null],
            ['E-010', 'STD-00010', 'basic_computer', 'computer_afternoon', '2026-08-08', 10000, 500, null, 0, 'active', null],
            ['E-011', 'STD-00011', 'ms_office', 'office_weekend', '2026-08-10', 15000, 500, null, 0, 'active', null],
            ['E-012', 'STD-00012', 'spoken_english', 'spoken_evening', '2026-08-11', 12000, 1000, 'fixed', 1000, 'active', null],
            ['E-013', 'STD-00013', 'graphic_design', 'design_evening', '2026-07-10', 30000, 1500, null, 0, 'dropped', null],
            ['E-014', 'STD-00014', 'web_development', 'web_completed', '2026-08-12', 45000, 2000, 'percentage', 5, 'active', null],
            ['E-015', 'STD-00015', 'ms_office', 'office_weekend', '2026-08-12', 15000, 500, null, 0, 'active', null],
            ['E-016', 'STD-00016', 'graphic_design', 'design_evening', '2026-07-15', 30000, 1500, 'fixed', 2500, 'active', null],
            ['E-017', 'STD-00017', 'basic_computer', 'computer_afternoon', '2026-08-02', 10000, 500, null, 0, 'active', null],
            ['E-018', 'STD-00018', 'ielts', 'ielts_morning', '2026-08-09', 25000, 1500, 'fixed', 1500, 'active', null],
        ];

        return collect($items)->mapWithKeys(function (array $item) use ($institute, $courses, $batches, $students) {
            $subtotal = $item[5] + $item[6];
            $discount = $item[7] === 'percentage' ? ($subtotal * $item[8] / 100) : $item[8];

            return [
                $item[0] => Enrollment::query()->updateOrCreate(
                    [
                        'institute_id' => $institute->id,
                        'student_id' => $students[$item[1]]->id,
                        'batch_id' => $batches[$item[3]]->id,
                    ],
                    [
                        'course_id' => $courses[$item[2]]->id,
                        'enrollment_date' => $item[4],
                        'agreed_course_fee' => $item[5],
                        'admission_fee' => $item[6],
                        'discount_type' => $item[7],
                        'discount_value' => $item[8],
                        'final_course_fee' => $subtotal - $discount,
                        'status' => $item[9],
                        'completion_date' => $item[10],
                        'notes' => 'Demo enrollment.',
                    ],
                ),
            ];
        })->all();
    }

    /**
     * @param array<string, Enrollment> $enrollments
     */
    private function installmentsAndPayments(Institute $institute, User $receiver, array $enrollments): void
    {
        $receipt = 1;

        foreach ($enrollments as $key => $enrollment) {
            $finalFee = (float) $enrollment->final_course_fee;
            $firstAmount = round($finalFee * 0.5, 2);
            $secondAmount = $finalFee - $firstAmount;

            $first = FeeInstallment::query()->updateOrCreate(
                ['institute_id' => $institute->id, 'enrollment_id' => $enrollment->id, 'title' => 'First Installment'],
                ['due_date' => $enrollment->enrollment_date->copy()->addDays(5)->toDateString(), 'amount' => $firstAmount, 'paid_amount' => 0, 'status' => 'pending'],
            );
            $second = FeeInstallment::query()->updateOrCreate(
                ['institute_id' => $institute->id, 'enrollment_id' => $enrollment->id, 'title' => 'Final Installment'],
                ['due_date' => $enrollment->enrollment_date->copy()->addDays(30)->toDateString(), 'amount' => $secondAmount, 'paid_amount' => 0, 'status' => 'pending'],
            );

            $paid = match ($key) {
                'E-001', 'E-002' => $finalFee,
                'E-003', 'E-005', 'E-006', 'E-008', 'E-010', 'E-012', 'E-016', 'E-017' => $firstAmount,
                'E-004' => 10000,
                'E-007', 'E-009', 'E-018' => 5000,
                default => 0,
            };

            $remainingPayment = $paid;
            foreach ([$first, $second] as $installment) {
                $amountForInstallment = min($remainingPayment, (float) $installment->amount);
                $remainingPayment -= $amountForInstallment;

                $installment->paid_amount = $amountForInstallment;
                $installment->status = $amountForInstallment >= (float) $installment->amount
                    ? 'paid'
                    : ($amountForInstallment > 0 ? 'partially_paid' : ($installment->due_date->isPast() ? 'overdue' : 'pending'));
                $installment->save();
            }

            if ($paid <= 0) {
                continue;
            }

            Payment::query()->updateOrCreate(
                ['institute_id' => $institute->id, 'receipt_number' => 'RCP-'.str_pad((string) $receipt++, 6, '0', STR_PAD_LEFT)],
                [
                    'student_id' => $enrollment->student_id,
                    'enrollment_id' => $enrollment->id,
                    'installment_id' => $first->id,
                    'amount' => min($paid, $firstAmount),
                    'payment_date' => $enrollment->enrollment_date->copy()->addDays(2)->toDateString(),
                    'payment_method' => match ($receipt % 4) {
                        0 => 'bank_transfer',
                        1 => 'jazzcash',
                        2 => 'easypaisa',
                        default => 'cash',
                    },
                    'reference_number' => null,
                    'notes' => 'Demo payment.',
                    'received_by' => $receiver->id,
                ],
            );

            if ($paid > $firstAmount) {
                Payment::query()->updateOrCreate(
                    ['institute_id' => $institute->id, 'receipt_number' => 'RCP-'.str_pad((string) $receipt++, 6, '0', STR_PAD_LEFT)],
                    [
                        'student_id' => $enrollment->student_id,
                        'enrollment_id' => $enrollment->id,
                        'installment_id' => $second->id,
                        'amount' => $paid - $firstAmount,
                        'payment_date' => $enrollment->enrollment_date->copy()->addDays(35)->toDateString(),
                        'payment_method' => 'cash',
                        'reference_number' => null,
                        'notes' => 'Demo payment.',
                        'received_by' => $receiver->id,
                    ],
                );
            }
        }
    }

    /**
     * @param array<string, Enrollment> $enrollments
     */
    private function attendance(Institute $institute, User $marker, array $enrollments): void
    {
        $dates = ['2026-08-05', '2026-08-07', '2026-08-10', '2026-08-12'];

        foreach ($enrollments as $enrollment) {
            if ($enrollment->status !== 'active' || $enrollment->enrollment_date->toDateString() > '2026-08-12') {
                continue;
            }

            foreach ($dates as $index => $date) {
                if ($enrollment->enrollment_date->toDateString() > $date) {
                    continue;
                }

                Attendance::query()->updateOrCreate(
                    ['batch_id' => $enrollment->batch_id, 'student_id' => $enrollment->student_id, 'attendance_date' => $date],
                    [
                        'institute_id' => $institute->id,
                        'status' => (($enrollment->student_id + $index) % 9 === 0) ? 'absent' : ((($enrollment->student_id + $index) % 7 === 0) ? 'leave' : 'present'),
                        'remarks' => null,
                        'marked_by' => $marker->id,
                    ],
                );
            }
        }
    }

    /**
     * @param array<string, Batch> $batches
     * @param array<string, Enrollment> $enrollments
     */
    private function examsAndResults(Institute $institute, array $batches, array $enrollments): void
    {
        $examMap = [
            'spoken_evening' => ['Spoken English Monthly Test', '2026-08-12', 100, 50],
            'ielts_morning' => ['IELTS Mock Test 1', '2026-08-12', 100, 60],
            'computer_afternoon' => ['Computer Basics Practical', '2026-08-09', 50, 25],
            'design_evening' => ['Design Tools Assessment', '2026-08-08', 100, 50],
            'web_completed' => ['Final Project Evaluation', '2026-07-25', 100, 50],
        ];

        foreach ($examMap as $batchKey => $examData) {
            $exam = Exam::query()->updateOrCreate(
                ['institute_id' => $institute->id, 'batch_id' => $batches[$batchKey]->id, 'title' => $examData[0]],
                ['exam_date' => $examData[1], 'total_marks' => $examData[2], 'passing_marks' => $examData[3], 'status' => 'completed'],
            );

            foreach ($enrollments as $enrollment) {
                if ((int) $enrollment->batch_id !== (int) $batches[$batchKey]->id || in_array($enrollment->status, ['cancelled', 'dropped'], true)) {
                    continue;
                }

                $obtained = min((float) $exam->total_marks, 34 + (($enrollment->student_id * 7) % ((int) $exam->total_marks - 30)));
                $percentage = round(($obtained / (float) $exam->total_marks) * 100, 2);

                ExamResult::query()->updateOrCreate(
                    ['exam_id' => $exam->id, 'student_id' => $enrollment->student_id],
                    [
                        'institute_id' => $institute->id,
                        'obtained_marks' => $obtained,
                        'percentage' => $percentage,
                        'grade' => $percentage >= 80 ? 'A' : ($percentage >= 65 ? 'B' : ($percentage >= 50 ? 'C' : 'Needs Improvement')),
                        'remarks' => $percentage >= 50 ? 'Satisfactory progress.' : 'Needs extra practice.',
                    ],
                );
            }
        }
    }

    /**
     * @param array<string, Enrollment> $enrollments
     */
    private function certificates(Institute $institute, array $enrollments): void
    {
        $number = 1;

        foreach ($enrollments as $enrollment) {
            if ($enrollment->status !== 'completed') {
                continue;
            }

            Certificate::query()->updateOrCreate(
                ['institute_id' => $institute->id, 'enrollment_id' => $enrollment->id],
                [
                    'student_id' => $enrollment->student_id,
                    'course_id' => $enrollment->course_id,
                    'certificate_number' => 'CERT-2026-'.str_pad((string) $number++, 5, '0', STR_PAD_LEFT),
                    'issue_date' => '2026-08-01',
                    'completion_date' => $enrollment->completion_date?->toDateString() ?? '2026-07-31',
                    'remarks' => 'Successfully completed the course requirements.',
                ],
            );
        }
    }
}

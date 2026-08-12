<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Institute;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_bulk_attendance_can_be_saved_and_edited(): void
    {
        $i=Institute::factory()->create(); $u=User::factory()->create(['institute_id'=>$i->id,'role'=>'admin']);
        $s=Student::factory()->create(['institute_id'=>$i->id]); $c=Course::factory()->create(['institute_id'=>$i->id]); $b=Batch::factory()->forInstitute($i)->create(['course_id'=>$c->id]);
        Enrollment::create(['institute_id'=>$i->id,'student_id'=>$s->id,'course_id'=>$c->id,'batch_id'=>$b->id,'enrollment_date'=>'2026-08-01','agreed_course_fee'=>100,'admission_fee'=>0,'discount_value'=>0,'final_course_fee'=>100,'status'=>'active']);
        $payload=['batch_id'=>$b->id,'attendance_date'=>'2026-08-11','records'=>[['student_id'=>$s->id,'status'=>'present']]];
        $this->actingAs($u)->postJson('/api/attendance',$payload)->assertOk();
        $payload['records'][0]['status']='absent';
        $this->actingAs($u)->postJson('/api/attendance',$payload)->assertOk();
        $this->assertDatabaseCount('attendances',1);
        $this->assertDatabaseHas('attendances',['student_id'=>$s->id,'status'=>'absent']);
    }

    public function test_teacher_cannot_access_unassigned_batch(): void
    {
        $i=Institute::factory()->create(); $u=User::factory()->create(['institute_id'=>$i->id,'role'=>'teacher']);
        $other=Batch::factory()->forInstitute($i)->create();
        $this->actingAs($u)->getJson("/api/attendance/students?batch_id={$other->id}&attendance_date=2026-08-11")->assertForbidden();
    }

    public function test_duplicate_students_in_attendance_payload_are_rejected(): void
    {
        $i=Institute::factory()->create(); $u=User::factory()->create(['institute_id'=>$i->id,'role'=>'admin']);
        $s=Student::factory()->create(['institute_id'=>$i->id]); $c=Course::factory()->create(['institute_id'=>$i->id]); $b=Batch::factory()->forInstitute($i)->create(['course_id'=>$c->id]);
        Enrollment::create(['institute_id'=>$i->id,'student_id'=>$s->id,'course_id'=>$c->id,'batch_id'=>$b->id,'enrollment_date'=>'2026-08-01','agreed_course_fee'=>100,'admission_fee'=>0,'discount_value'=>0,'final_course_fee'=>100,'status'=>'active']);

        $this->actingAs($u)->postJson('/api/attendance', [
            'batch_id' => $b->id,
            'attendance_date' => '2026-08-11',
            'records' => [
                ['student_id' => $s->id, 'status' => 'present'],
                ['student_id' => $s->id, 'status' => 'absent'],
            ],
        ])->assertUnprocessable()->assertJsonValidationErrors(['records.0.student_id']);

        $this->assertDatabaseCount('attendances', 0);
    }
}

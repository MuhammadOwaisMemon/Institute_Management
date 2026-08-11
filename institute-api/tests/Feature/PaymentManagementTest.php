<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\FeeInstallment;
use App\Models\Institute;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentManagementTest extends TestCase
{
    use RefreshDatabase;
    private function setupEnrollment(): array {
        $i=Institute::factory()->create(); $u=User::factory()->create(['institute_id'=>$i->id,'role'=>'admin']);
        $e=Enrollment::create(['institute_id'=>$i->id,'student_id'=>Student::factory()->create(['institute_id'=>$i->id])->id,'course_id'=>Course::factory()->create(['institute_id'=>$i->id])->id,'batch_id'=>Batch::factory()->forInstitute($i)->create()->id,'enrollment_date'=>'2026-08-11','agreed_course_fee'=>1000,'admission_fee'=>0,'discount_value'=>0,'final_course_fee'=>1000,'status'=>'active']);
        $inst=FeeInstallment::create(['institute_id'=>$i->id,'enrollment_id'=>$e->id,'title'=>'Full','due_date'=>'2026-08-20','amount'=>1000,'status'=>'pending']);
        return [$u,$e,$inst];
    }
    public function test_payment_generates_receipt_and_updates_installment(): void {
        [$u,$e,$inst]=$this->setupEnrollment();
        $this->actingAs($u)->postJson('/api/payments',['enrollment_id'=>$e->id,'installment_id'=>$inst->id,'amount'=>400,'payment_date'=>'2026-08-11','payment_method'=>'cash'])->assertCreated()->assertJsonPath('data.receipt_number','RCP-000001');
        $this->assertDatabaseHas('fee_installments',['id'=>$inst->id,'status'=>'partially_paid','paid_amount'=>400]);
    }
    public function test_overpayment_is_blocked(): void {
        [$u,$e,$inst]=$this->setupEnrollment();
        $this->actingAs($u)->postJson('/api/payments',['enrollment_id'=>$e->id,'installment_id'=>$inst->id,'amount'=>1200,'payment_date'=>'2026-08-11','payment_method'=>'cash'])->assertUnprocessable();
    }
}

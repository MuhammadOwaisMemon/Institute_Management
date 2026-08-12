import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQuery } from "@/test/render-with-query";
import { AdmissionPage } from "./admission-page";
import { createEnrollment } from "./admissions-api";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/features/students/students-api", () => ({
  getStudents: vi.fn().mockResolvedValue({
    data: [{ id: 7, student_code: "STD-00007", full_name: "Ali Ahmed", first_name: "Ali", last_name: "Ahmed", phone: "03001111111" }],
  }),
}));
vi.mock("@/features/courses/courses-api", () => ({
  getCourses: vi.fn().mockResolvedValue({
    data: [{ id: 3, name: "Spoken English", standard_fee: "10000.00", admission_fee: "1000.00", status: "active" }],
  }),
}));
vi.mock("@/features/batches/batches-api", () => ({
  getBatches: vi.fn().mockResolvedValue({
    data: [{ id: 9, name: "Evening Batch", course_id: 3, status: "active" }],
  }),
}));
vi.mock("./admissions-api", async () => {
  const actual = await vi.importActual<typeof import("./admissions-api")>("./admissions-api");
  return {
    ...actual,
    createEnrollment: vi.fn().mockResolvedValue({
      id: 15,
      enrollment_date: "2026-08-12",
      agreed_course_fee: "10000.00",
      admission_fee: "1000.00",
      discount_type: "fixed",
      discount_value: "500.00",
      final_course_fee: "10500.00",
      status: "active",
      notes: null,
      student: { id: 7, full_name: "Ali Ahmed" },
      course: { id: 3, name: "Spoken English" },
      batch: { id: 9, name: "Evening Batch" },
    }),
  };
});

describe("AdmissionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enables enrollment only after required fields and submits fee payload", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AdmissionPage />);

    const confirm = screen.getByRole("button", { name: /confirm enrollment/i });
    expect(confirm).toBeDisabled();

    await user.type(screen.getByLabelText(/find student/i), "Ali");
    await screen.findByText("STD-00007 - Ali Ahmed");
    await user.selectOptions(screen.getByLabelText(/^student$/i), "7");
    await screen.findByText("Spoken English");
    await user.selectOptions(screen.getByLabelText(/^course$/i), "3");
    await screen.findByText("Evening Batch");
    await user.selectOptions(screen.getByLabelText(/batch/i), "9");
    await user.selectOptions(screen.getByLabelText(/^discount$/i), "fixed");
    await user.clear(screen.getByLabelText(/discount value/i));
    await user.type(screen.getByLabelText(/discount value/i), "500");

    expect(screen.getByText(/PKR 10,500/)).toBeInTheDocument();
    expect(confirm).toBeEnabled();

    await user.click(confirm);

    await waitFor(() => expect(createEnrollment).toHaveBeenCalled());
    expect(vi.mocked(createEnrollment).mock.calls[0]?.[0]).toEqual(expect.objectContaining({
      student_id: 7,
      course_id: 3,
      batch_id: 9,
      agreed_course_fee: 10000,
      admission_fee: 1000,
      discount_type: "fixed",
      discount_value: 500,
      status: "active",
    }));
  });
});

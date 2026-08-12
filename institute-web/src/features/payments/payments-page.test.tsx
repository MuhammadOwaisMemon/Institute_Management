import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQuery } from "@/test/render-with-query";
import { PaymentsPage } from "./payments-page";
import { receivePayment } from "./payments-api";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("./payments-api", async () => {
  const actual = await vi.importActual<typeof import("./payments-api")>("./payments-api");
  return {
    ...actual,
    getPayments: vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
    receivePayment: vi.fn().mockResolvedValue({ id: 1, receipt_number: "RCP-000001" }),
  };
});

describe("PaymentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits receive payment payload after required fields are filled", async () => {
    const user = userEvent.setup();
    renderWithQuery(<PaymentsPage />);

    const receive = screen.getByRole("button", { name: /receive/i });
    expect(receive).toBeDisabled();

    await user.type(screen.getByLabelText(/enrollment id/i), "42");
    await user.clear(screen.getByLabelText(/^amount$/i));
    await user.type(screen.getByLabelText(/^amount$/i), "750");
    const paymentDate = screen.getAllByLabelText(/payment date/i)[0];
    await user.clear(paymentDate);
    await user.type(paymentDate, "2026-08-12");
    await user.selectOptions(screen.getByLabelText(/^method$/i), "bank_transfer");

    expect(receive).toBeEnabled();
    await user.click(receive);

    await waitFor(() => expect(receivePayment).toHaveBeenCalled());
    expect(vi.mocked(receivePayment).mock.calls[0]?.[0]).toEqual({
      enrollment_id: 42,
      installment_id: null,
      amount: 750,
      payment_date: "2026-08-12",
      payment_method: "bank_transfer",
    });
  });
});

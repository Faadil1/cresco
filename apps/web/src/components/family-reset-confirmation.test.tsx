import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { FamilyResetConfirmation } from "./family-reset-confirmation";

function Harness({ confirmed = vi.fn() }: { confirmed?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Start a new Family</button>
      <FamilyResetConfirmation
        open={open}
        title="Start a new Family session?"
        onCancel={() => setOpen(false)}
        onConfirm={() => { confirmed(); setOpen(false); }}
      />
    </>
  );
}

describe("Family global reset confirmation", () => {
  it("explains BOTH imaginary ledgers and the default simulated Key before allowing reset", () => {
    const confirmed = vi.fn();
    render(<Harness confirmed={confirmed} />);
    fireEvent.click(screen.getByRole("button", { name: "Start a new Family" }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.textContent).toContain("100 pretend credits");
    expect(dialog.textContent).toContain("$1,000 imaginary USD paper portfolio");
    expect(dialog.textContent).toContain("15 credits per choice and 60 per period");
    expect(dialog.textContent).toContain("There is no undo");
    expect(document.activeElement).toBe(screen.getByTestId("family-reset-cancel"));
    expect(confirmed).not.toHaveBeenCalled();
  });

  it("Cancel, Escape and backdrop never call the destructive action and restore focus", () => {
    const confirmed = vi.fn();
    render(<Harness confirmed={confirmed} />);
    const trigger = screen.getByRole("button", { name: "Start a new Family" });
    // fireEvent.click does not focus the trigger as a real pointer click does.
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByTestId("family-reset-cancel"));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("alertdialog")).toBeNull();

    fireEvent.click(trigger);
    fireEvent.mouseDown(screen.getByTestId("family-reset-backdrop"));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(confirmed).not.toHaveBeenCalled();
  });

  it("keeps Tab focus inside the dialog and confirms exactly once", () => {
    const confirmed = vi.fn();
    render(<Harness confirmed={confirmed} />);
    fireEvent.click(screen.getByRole("button", { name: "Start a new Family" }));
    const cancel = screen.getByTestId("family-reset-cancel");
    const confirm = screen.getByTestId("family-reset-confirm");
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(confirm);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(cancel);
    fireEvent.click(confirm);
    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});

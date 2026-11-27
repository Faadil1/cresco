"use client";

import { useEffect, useId, useRef } from "react";

type FamilyResetConfirmationProps = {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Explicit confirmation for Family's destructive, in-memory GLOBAL reset.
 * A simulated Parent/My Key is never real identity or account authorization.
 * This dialog changes no state itself; only the caller's Confirm action can reset.
 */
export function FamilyResetConfirmation({
  open, title, onCancel, onConfirm,
}: FamilyResetConfirmationProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmHandled = useRef(false);

  useEffect(() => {
    if (!open) return;
    confirmHandled.current = false;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      const buttons = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
      if (!buttons.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-navy-strong/70 p-4"
      data-testid="family-reset-backdrop"
      onMouseDown={event => { if (event.target === event.currentTarget) onCancel(); }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-testid="family-reset-dialog"
        className="w-full max-w-lg rounded-[22px] border border-line bg-surface p-5 text-navy-strong shadow-xl md:p-7"
      >
        <h2 id={titleId} className="font-display text-[24px] leading-tight md:text-[28px]">{title}</h2>
        <div id={descriptionId} className="mt-3 space-y-3 text-[13px] leading-6">
          <p>This clears your unsaved 100 pretend credits, lessons, requests, receipts and progress.</p>
          <p>The simulated Parent/My Key returns to its starting limits: <strong>15 credits per choice and 60 per period</strong>.</p>
          <p>Your separate <strong>$1,000 imaginary USD paper portfolio</strong> also restarts. All entered prices, pretend holdings and activity will be erased.</p>
          <p className="font-semibold">There is no undo. No real money, accounts or trades are involved.</p>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            data-testid="family-reset-cancel"
            onClick={onCancel}
            className="min-h-11 rounded-full bg-navy-strong px-5 py-2 text-[13px] font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
          >Cancel - keep my progress</button>
          <button
            type="button"
            data-testid="family-reset-confirm"
            onClick={() => {
              if (confirmHandled.current) return;
              confirmHandled.current = true;
              onConfirm();
            }}
            className="min-h-11 rounded-full border border-line bg-transparent px-5 py-2 text-[13px] font-bold text-navy-strong hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
          >Reset the whole Family demo</button>
        </div>
      </div>
    </div>
  );
}

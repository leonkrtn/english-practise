"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Modal({
  open,
  title,
  body,
  onCancel,
  onConfirm,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  destructive = false,
}: {
  open: boolean;
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  /** Colours the confirm button red — for actions that can't be undone from the UI. */
  destructive?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent showCloseButton={false} className="rounded-[18px] p-6 sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-ink-soft leading-relaxed">{body}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mx-0 mb-0 mt-1.5 rounded-none border-t-0 bg-transparent p-0 flex-row gap-2.5">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1 h-auto rounded-full bg-line-soft hover:bg-line text-ink font-semibold py-3.5 text-[15px]"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className={
              "flex-1 h-auto rounded-full text-white font-semibold py-3.5 text-[15px] " +
              (destructive ? "bg-red hover:bg-red-dark" : "bg-blue hover:bg-blue-dark")
            }
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

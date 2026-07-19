"use client";

export default function Modal({
  open,
  title,
  body,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[100] p-5" onClick={onCancel}>
      <div className="bg-white rounded-[18px] p-6 max-w-[380px] w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[17px] font-semibold mb-2.5">{title}</h3>
        <p className="text-sm text-ink-soft leading-relaxed mb-4.5">{body}</p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="flex-1 rounded-full bg-line-soft hover:bg-line text-ink font-semibold py-3.5 text-[15px] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-full bg-blue hover:bg-blue-dark text-white font-semibold py-3.5 text-[15px] transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

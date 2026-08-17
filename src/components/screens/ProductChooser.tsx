"use client";

import { BookOpen, Calculator } from "lucide-react";
import type { Product } from "@/lib/product";

export default function ProductChooser({ onChoose }: { onChoose: (product: Product) => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[22px] font-extrabold tracking-tight bg-gradient-to-r from-blue via-blue-dark to-purple bg-clip-text text-transparent mb-1">
            PRACTISE
          </div>
          <div className="text-[14px] text-ink-faint">Womit möchtest du üben?</div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onChoose("english")}
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-left bg-card border border-line-soft shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-blue-light text-blue">
              <BookOpen size={22} />
            </span>
            <div className="min-w-0">
              <div className="text-[16px] font-bold text-ink">Englisch</div>
              <div className="text-[12.5px] text-ink-faint">Vokabeln, Grammatik, Idioms, Reading, Tests</div>
            </div>
          </button>
          <button
            onClick={() => onChoose("finance")}
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-left bg-card border border-line-soft shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-green-light text-green">
              <Calculator size={22} />
            </span>
            <div className="min-w-0">
              <div className="text-[16px] font-bold text-ink">Finance</div>
              <div className="text-[12.5px] text-ink-faint">Corporate Finance, Mathe-Vokabeln, Differentiation</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * @author: @dorianbaffier
 * @description: Shimmer Text
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Text_01Props {
  text: string;
  className?: string;
}

/** Trimmed to a plain inline element (no centering wrapper, no fixed text size) so it drops into
 * existing compact layouts — the original component hard-codes a `p-8` centering block and
 * `text-3xl`, which only suits a hero usage. */
export default function ShimmerText({
  text = "Text Shimmer",
  className,
}: Text_01Props) {
  return (
    <motion.span
      animate={{
        backgroundPosition: ["200% center", "-200% center"],
      }}
      className={cn(
        "inline-block bg-[length:200%_100%] bg-gradient-to-r from-ink via-ink-faint to-ink bg-clip-text text-transparent",
        className
      )}
      transition={{
        duration: 2.5,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      }}
    >
      {text}
    </motion.span>
  );
}

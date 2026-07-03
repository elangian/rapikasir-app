import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../ui/utils";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  side?: "left" | "bottom";
  /** Accessible label for the dialog. */
  title: string;
  className?: string;
  children: ReactNode;
}

/**
 * Lightweight animated drawer used for the mobile nav (left) and the POS cart
 * (bottom). Built on motion instead of vaul to avoid ref/aria warnings and to
 * keep full control over the brutalist styling.
 */
export function MobileDrawer({
  open,
  onClose,
  side = "left",
  title,
  className,
  children,
}: MobileDrawerProps) {
  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const isBottom = side === "bottom";

  const panelInitial = isBottom ? { y: "100%" } : { x: "-100%" };
  const panelAnimate = isBottom ? { y: 0 } : { x: 0 };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelInitial}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className={cn(
              "absolute overflow-hidden",
              isBottom
                ? "inset-x-0 bottom-0 max-h-[85vh] rounded-t-lg border-t-2 border-border"
                : "inset-y-0 left-0 w-[280px] max-w-[85vw] border-r-2 border-border",
              className,
            )}
          >
            {isBottom && (
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-border/40" />
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

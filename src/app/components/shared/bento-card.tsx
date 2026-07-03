import type { ReactNode } from "react";
import { cn } from "../ui/utils";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  /** Background surface variant. */
  tone?: "card" | "amber" | "green" | "primary";
  /** Apply the offset brutalist shadow (for key cards). */
  raised?: boolean;
}

const TONE: Record<NonNullable<BentoCardProps["tone"]>, string> = {
  card: "bg-card",
  amber: "bg-block-amber",
  green: "bg-block-green",
  primary: "bg-primary text-primary-foreground",
};

export function BentoCard({ children, className, tone = "card", raised = false }: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-md border-2 border-border p-5 transition-all duration-150",
        "hover:-translate-y-0.5 hover:border-accent",
        TONE[tone],
        raised && "shadow-brutal",
        className,
      )}
    >
      {children}
    </div>
  );
}

import { Lock } from "lucide-react";
import { Link } from "react-router";
import { cn } from "../ui/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface TierLockProps {
  requiredTier: string;
  /** Optional message shown in the tooltip. */
  message?: string;
  className?: string;
}

/**
 * Overlay that covers a locked feature. Appears with a 150ms fade on hover
 * and shows an "Upgrade" tooltip. Wrap it as a sibling of the locked content
 * inside a `relative` container.
 */
export function TierLock({ requiredTier, message, className }: TierLockProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/paket"
            className={cn(
              "absolute inset-0 z-10 flex flex-col items-center justify-center gap-2",
              "bg-background/70 opacity-0 backdrop-blur-[2px] transition-opacity duration-150 hover:opacity-100",
              "cursor-pointer rounded-md",
              className,
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-accent text-accent-foreground shadow-brutal-sm">
              <Lock className="size-4" />
            </span>
            <span className="rounded-md border-2 border-border bg-card px-2 py-0.5 text-xs font-medium">
              Fitur {requiredTier}
            </span>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="border-2 border-border bg-primary text-primary-foreground">
          {message ?? `Upgrade ke ${requiredTier} untuk membuka fitur ini`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Small pill badge marking a locked/premium feature inline. */
export function TierBadge({ tier, className }: { tier: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border-2 border-border bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground",
        className,
      )}
    >
      <Lock className="size-2.5" />
      {tier}
    </span>
  );
}

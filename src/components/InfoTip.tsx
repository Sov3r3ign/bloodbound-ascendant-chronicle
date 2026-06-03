import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function InfoTip({
  title,
  children,
  size = 14,
}: {
  title?: string;
  children: React.ReactNode;
  size?: number;
}) {
  const body = (
    <div className="max-w-xs space-y-1.5 p-1">
      {title && (
        <div className="font-display text-[10px] tracking-[0.3em] text-arcane">
          {title.toUpperCase()}
        </div>
      )}
      <div className="font-serif text-xs leading-relaxed text-foreground/90">
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: tooltip on hover */}
      <span className="hidden sm:inline-flex">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={title ? `About ${title}` : "More info"}
                className="inline-flex items-center justify-center rounded-full border border-arcane/40 bg-arcane/10 p-0.5 text-arcane/80 transition-colors hover:border-arcane hover:bg-arcane/20 hover:text-arcane focus:outline-none focus-visible:ring-1 focus-visible:ring-arcane"
              >
                <Info size={size} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="border border-arcane/40 bg-popover text-popover-foreground shadow-rune"
            >
              {body}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>

      {/* Mobile: popover on tap */}
      <span className="inline-flex sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={title ? `About ${title}` : "More info"}
              className="inline-flex items-center justify-center rounded-full border border-arcane/40 bg-arcane/10 p-0.5 text-arcane/80"
            >
              <Info size={size} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            className="w-auto border border-arcane/40 bg-popover shadow-rune"
          >
            {body}
          </PopoverContent>
        </Popover>
      </span>
    </>
  );
}

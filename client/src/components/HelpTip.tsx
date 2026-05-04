import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface HelpTipProps {
  /** The help text to show on hover */
  text: string;
  /** Optional: where to show the tooltip (default: "top") */
  side?: "top" | "bottom" | "left" | "right";
  /** Optional: icon size in pixels (default: 14) */
  size?: number;
  /** Optional: extra class names for the icon wrapper */
  className?: string;
}

/**
 * HelpTip — a small ❓ icon that shows a tooltip on hover.
 * Usage: <HelpTip text="This field does X" />
 */
export default function HelpTip({ text, side = "top", size = 14, className = "" }: HelpTipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center justify-center cursor-help text-gray-400 hover:text-emerald-500 transition-colors ${className}`}
            tabIndex={-1}
            aria-label={text}
          >
            <HelpCircle style={{ width: size, height: size }} />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-xs text-xs leading-relaxed z-[9999] bg-gray-900 text-gray-100 border-gray-700 shadow-xl"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

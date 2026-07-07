import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingProps {
  /** Display variant */
  variant?: "spinner" | "skeleton" | "fullpage";
  /** Additional class names */
  className?: string;
  /** Message to display below the spinner */
  message?: string;
}

/**
 * Reusable loading component with multiple display variants.
 */
export function Loading({ variant = "spinner", className, message }: LoadingProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-5/6" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (variant === "fullpage") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }

  // Default: spinner
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
}

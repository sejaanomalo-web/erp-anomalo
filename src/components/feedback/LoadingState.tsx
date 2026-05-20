import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  linhas?: number;
  className?: string;
}

export function LoadingState({ linhas = 5, className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col gap-sm", className)}>
      {Array.from({ length: linhas }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

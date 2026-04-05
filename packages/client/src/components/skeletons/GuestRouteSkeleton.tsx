import { Skeleton } from "@/components/skeletons/Skeleton";

/** Minimal shell for lazy route code-splitting (guest branch). */
export function GuestRouteSkeleton() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="glass-header h-16 sticky top-0 z-20" />
      <div className="p-6 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

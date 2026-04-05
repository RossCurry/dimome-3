import { Skeleton } from "@/components/skeletons/Skeleton";

export function OwnerRouteSkeleton() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="glass-header h-14 sticky top-0 z-20" />
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}

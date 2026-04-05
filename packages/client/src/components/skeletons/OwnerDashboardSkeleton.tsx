import { Skeleton } from "@/components/skeletons/Skeleton";

export function OwnerDashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex gap-6 items-center p-6 rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]"
          >
            <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

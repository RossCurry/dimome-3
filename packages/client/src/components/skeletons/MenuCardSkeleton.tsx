import { Skeleton } from "@/components/skeletons/Skeleton";

export function MenuCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-[var(--shadow-ambient)]">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-6 w-20 mt-2" />
      </div>
    </div>
  );
}

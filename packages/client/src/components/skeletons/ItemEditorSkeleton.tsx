import { Skeleton } from "@/components/skeletons/Skeleton";

export function ItemEditorSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-surface-container-lowest rounded-2xl p-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-8 space-y-4">
          <Skeleton className="h-8 w-56" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}

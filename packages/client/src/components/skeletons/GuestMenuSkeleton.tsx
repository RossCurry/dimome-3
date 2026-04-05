import { Skeleton } from "@/components/skeletons/Skeleton";
import { MenuCardSkeleton } from "@/components/skeletons/MenuCardSkeleton";

export function GuestMenuSkeleton() {
  return (
    <div className="min-h-screen bg-surface pb-28">
      <div className="glass-header sticky top-0 z-20 px-6 py-4">
        <div className="flex justify-between items-center mb-4 max-w-lg mx-auto">
          <Skeleton className="h-8 w-40 bg-white/20" />
          <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
        </div>
        <Skeleton className="h-12 w-full max-w-lg mx-auto rounded-xl bg-white/15" />
      </div>
      <div className="px-6 pt-4 flex gap-2 overflow-hidden max-w-lg mx-auto">
        <Skeleton className="h-10 w-16 rounded-full shrink-0 bg-surface-container-high" />
        <Skeleton className="h-10 w-24 rounded-full shrink-0" />
        <Skeleton className="h-10 w-20 rounded-full shrink-0" />
        <Skeleton className="h-10 w-20 rounded-full shrink-0" />
      </div>
      <div className="px-6 py-6 grid gap-4 max-w-lg mx-auto">
        <MenuCardSkeleton />
        <MenuCardSkeleton />
        <MenuCardSkeleton />
      </div>
    </div>
  );
}

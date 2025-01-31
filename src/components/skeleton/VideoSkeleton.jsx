import { Skeleton } from "@/components/ui/skeleton"

export function VideoSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        <div className="flex flex-col flex-1">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-3 w-3/4" />
          <div className="flex items-center gap-1 mt-1">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </div>
    </div>
  )
}


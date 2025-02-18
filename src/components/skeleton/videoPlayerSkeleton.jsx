import { Skeleton } from "@/components/ui/skeleton"

export function VideoSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 relative">
      {/* Video Player Container */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
        <Skeleton className="aspect-video w-full rounded-lg" />
      </div>

      {/* Video Info */}
      <div className="mt-4 space-y-4">
        {/* Title */}
        <Skeleton className="h-7 w-3/4" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Channel Info */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-24 ml-4 rounded-lg" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
            <div className="flex gap-1">
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-12 rounded-full" />
            </div>
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}


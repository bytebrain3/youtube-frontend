import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50">
      <div className="container mx-auto p-4 max-w-5xl">
       

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-800 rounded-md">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-20 w-36" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


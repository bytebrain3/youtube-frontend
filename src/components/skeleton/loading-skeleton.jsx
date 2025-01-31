import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50">
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            <Skeleton className="h-8 w-36" />
          </h1>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            <p>
              <Skeleton className="h-4 w-20" />
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm" className="gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </Button>
            <Button variant="secondary" size="sm" className="gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </Button>
          </div>
        </div>
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


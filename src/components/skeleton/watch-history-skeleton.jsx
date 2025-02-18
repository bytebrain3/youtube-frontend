import { Skeleton } from "@/components/ui/skeleton"
import { Search, Trash2, Pause, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function WatchHistorySkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-900 text-black dark:text-white">
      <div className="flex">
        <div className="flex-1 max-w-6xl mx-auto p-4">
         

          <div className="space-y-3 pr-4">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="flex items-start space-x-4">
                <Skeleton className="h-24 w-40 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


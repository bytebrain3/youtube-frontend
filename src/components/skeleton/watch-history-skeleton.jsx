import { Skeleton } from "@/components/ui/skeleton"
import { Search, Trash2, Pause, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function WatchHistorySkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-900 text-black dark:text-white">
      <div className="flex">
        <div className="flex-1 max-w-6xl mx-auto p-4">
          <div className="flex justify-end gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search watch history"
                className="pl-10 bg-neutral-200 dark:bg-zinc-900 border-none text-black dark:text-white placeholder:text-gray-900 dark:placeholder:text-gray-400"
                disabled
              />
            </div>
            <Button variant="ghost" size="icon" disabled>
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" disabled>
              <Pause className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" disabled>
              <Settings2 className="h-5 w-5" />
            </Button>
          </div>

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


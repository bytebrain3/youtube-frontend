import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProfileSkeleton() {
  return (
    <div className="w-full min-h-screen bg-background">
      {/* Banner Skeleton */}
      <Skeleton className="w-full h-[240px]" />

      {/* Profile Info Skeleton */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-start gap-6 -mt-6 mb-6">
          <Skeleton className="w-[128px] h-[128px] rounded-full border-4 border-background" />
          <div className="flex-1 mt-6 space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
          <div className="flex gap-2 mt-6">
            <Skeleton className="h-10 w-[140px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
        </div>

        {/* Navigation Skeleton */}
        <Tabs defaultValue="home" className="w-full">
          <TabsList>
            <TabsTrigger value="home" disabled>
              <Skeleton className="h-4 w-16" />
            </TabsTrigger>
            <TabsTrigger value="playlists" disabled>
              <Skeleton className="h-4 w-16" />
            </TabsTrigger>
            <TabsTrigger value="community" disabled>
              <Skeleton className="h-4 w-16" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content Area Skeleton */}
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}


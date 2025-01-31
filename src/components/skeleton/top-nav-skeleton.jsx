import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"

const SearchBarSkeleton = () => {
  return (
    <div className="flex items-center max-w-[732px] w-full">
      <div className="flex w-full max-w-[632px]">
        <Skeleton className="h-10 w-full rounded-l-full" />
        <Skeleton className="h-10 w-10 rounded-l-none rounded-r-full" />
      </div>
      <Skeleton className="ml-2 h-10 w-10 rounded-full" />
    </div>
  )
}

const UploadVideoSkeleton = () => {
  return <Skeleton className="h-10 w-36 rounded-3xl" />
}

const NotificationBellSkeleton = () => {
  return <Skeleton className="h-10 w-10 rounded-full" />
}

const UserMenuSkeleton = () => {
  return <Skeleton className="h-8 w-8 rounded-full" />
}

export function TopNavSkeleton() {
  return (
    <header className="sticky top-0 z-50 flex h-14 w-screen items-center bg-sidebar justify-between border-b px-4">
      <div className="flex items-center gap-4 relative">
        <SidebarTrigger className="fixed left-4" />
        <Skeleton className="ml-8 h-6 w-24" /> {/* YouTube logo placeholder */}
      </div>

      <div className="flex flex-1 justify-center">
        <SearchBarSkeleton />
      </div>

      <div className="flex items-center gap-2">
        <UploadVideoSkeleton />
        <NotificationBellSkeleton />
        <UserMenuSkeleton />
      </div>
    </header>
  )
}


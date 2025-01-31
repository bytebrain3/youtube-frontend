"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Shuffle } from "lucide-react"
import { VideoCard } from "@/components/video-card"
import { useSession, signIn } from "next-auth/react"
import { LoadingSkeleton } from "@/components/skeleton/loading-skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"



export default function PlaylistPage() {
  const { data: session, status } = useSession()
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (session?.user?.id) {
      setIsLoading(true)
      fetch(`/api/likedVideo?id=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setVideos(data.videos || [])
          setIsLoading(false)
        })
        .catch((error) => {
          console.error(error)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [session?.user?.id, status])

  if (status === "loading") {
    return <LoadingSkeleton />
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-zinc-900">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
            Please log in to view your playlist
          </h1>
          <Button onClick={() => signIn("github", { callbackUrl: "/" })}>Log In with GitHub</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="mx-auto p-4 sm:p-6 max-w-5xl w-full sm:border sm:rounded-lg">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Liked videos</h1>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            <p>{videos.length} videos • No views • Updated today</p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Play all</span>
              <span className="sm:hidden">Play</span>
            </Button>
            <Button variant="secondary" size="sm" className="gap-2">
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">Shuffle</span>
              <span className="sm:hidden">Mix</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-6 hidden">
          <TabsList className="bg-transparent border-b border-zinc-200 dark:border-zinc-700 w-full justify-start h-auto p-0">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 data-[state=active]:bg-transparent px-4 py-2"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 data-[state=active]:bg-transparent px-4 py-2"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger
              value="shorts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-50 data-[state=active]:bg-transparent px-4 py-2"
            >
              Shorts
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <LoadingSkeleton />
        ) : videos.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold mb-2">Your playlist is empty</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Start liking videos to add them to your playlist!</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-270px)] sm:h-[calc(100vh-300px)]">
            <div className="space-y-4 lg:px-8">
              {videos.map((video, index) => (
                <VideoCard key={video._id} video={video} index={index + 1} setVideos={setVideos} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}


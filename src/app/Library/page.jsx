"use client"
import React, { useState, useEffect, useCallback } from 'react'
import VideoCard from '@/components/videoCard'
import axios from 'axios'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

const Setting = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [watched, setWatched] = useState([])
  const [liked, setLiked] = useState([])
  const [watchLater, setWatchLater] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (url, setter) => {
    if (!session?.user?.id) return
    try {
      const res = await axios.get(`${url}?id=${session.user.id}`)
      setter(res.data.data || res.data.videos || [])
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error)
    }
  }, [session])

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      await Promise.all([
        fetchData('/api/get-watch-history', setWatched),
        fetchData('/api/likedVideo', setLiked),
        fetchData('/api/get-watch-later', setWatchLater)
      ])
      setLoading(false)
    }

    if (session?.user?.id) {
      fetchAllData()
    }
  }, [session, fetchData])

  const VideoSection = ({ title, videos, emptyMessage, viewAllPath }) => (
    <section className="w-full">
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl md:text-2xl font-semibold truncate mr-2'>{title}</h2>
        <Button 
          variant="ghost"
          onClick={() => router.push(viewAllPath)}
          className='text-blue-500 hover:text-blue-600 whitespace-nowrap'
        >
          View all <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-md border p-4">
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
          {loading ? (
            Array(10).fill(0).map((_, index) => (
              <Skeleton key={index} className="w-full h-[200px]" />
            ))
          ) : videos.length > 0 ? (
            videos.map((video) => (
              <div key={video._id} className="w-full">
                <VideoCard
                  videoId={video.videoId}
                  thumbnail={video.thumbnailUrl}
                  title={video.title}
                  channel={video.channel_name}
                  channelImage={video.channel_icon}
                  views={video.views}
                  uploadDate={video.createdAt}
                  duration={video.duration}
                  username={video.channel_username}
                />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full">{emptyMessage}</p>
          )}
        </div>
      </ScrollArea>
    </section>
  )

  return (
    <div className='w-full min-h-screen p-2 sm:p-4 space-y-6 sm:space-y-8 pb-20'> {/* Added pb-20 for bottom padding */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="liked">Liked Videos</TabsTrigger>
          <TabsTrigger value="watchLater">Watch Later</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <VideoSection 
            title="Watch History" 
            videos={watched} 
            emptyMessage="No watch history found"
            viewAllPath="/watch-history"
          />
        </TabsContent>
        <TabsContent value="liked">
          <VideoSection 
            title="Liked Videos" 
            videos={liked} 
            emptyMessage="No liked videos found"
            viewAllPath="/liked-video"
          />
        </TabsContent>
        <TabsContent value="watchLater">
          <VideoSection 
            title="Watch Later" 
            videos={watchLater} 
            emptyMessage="No videos in watch later"
            viewAllPath="/watch-later"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Setting

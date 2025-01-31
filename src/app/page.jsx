"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import VideoCard from "@/components/videoCard";
import { useEffect, useState } from "react";
import { VideoSkeleton } from "@/components/skeleton/VideoSkeleton";
import { Suspense } from "react";
import { YouTubeSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import MobileNav from "@/components/MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTop from "@/components/MobileTop";

const MobileComponents = () => {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <>
      <MobileTop />
      <MobileNav />
    </>
  );
};

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/videos");
        const data = await response.json();
        if (data.success) {
          setVideos(data.data);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <SidebarProvider defaultOpen={false}>
      <YouTubeSidebar />
      <SidebarInset className="flex-grow">
        <main>
          <Suspense fallback={null}>
            <MobileComponents />
          </Suspense>
          <div className="lg:pt-16">
            <div className="flex flex-col h-screen">
              <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pb-32 lg:pb-0 md:pb-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 space-y-3 gap-4 p-4 pt-4 lg:pt-2">
                    {isLoading
                      ? Array.from({ length: 10 }).map((_, i) => (
                          <VideoSkeleton key={i} />
                        ))
                      : videos.map((video) => (
                          <VideoCard
                            key={video._id}
                            videoId={video.videoId}
                            thumbnail={video.thumbnailUrl}
                            title={video.title}
                            channel={video.channel_name}
                            channelImage={video.channel_icon}
                            views={video.views}
                            uploadDate={video.createdAt}
                            duration={video.duration}
                          />
                        ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

"use client";

import { Search, Trash2, Pause, Settings2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoHistoryItem } from "@/components/video-history-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { WatchHistorySkeleton } from "@/components/skeleton/watch-history-skeleton";
import axios from "axios";


export default function WatchHistoryPage() {
  const { data: session, status } = useSession();
  const [historyItems, setHistoryItems] = useState([]);
  const [isPausedWatchHistory, setIsPausedWatchHistory] = useState(false);
  const [loading, setLoading] = useState(true); // Initialize as true

  useEffect(() => {
    // Update loading state based on session status
    if (status === "loading") {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    const fetchUserWatchHistory = async () => {
      try {
        setLoading(true);
        if (session?.user?.id) {
          const response = await fetch(
            `/api/get-watch-later?id=${session.user.id}`
          );
          const data = await response.json();

          if (!response.ok) {
            console.error("Error:", data.message);
            setHistoryItems([]);
            return;
          }
          
          setHistoryItems(data.data || []);
          setIsPausedWatchHistory(data.pausWatchedHistory);
        }
      } catch (error) {
        console.error("Error fetching watch history:", error);
        setHistoryItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchUserWatchHistory();
    }
  }, [session?.user?.id]);

  const removeHistoryItem = async (videoId) => {
    try {
        const response = await fetch("/api/update-watch-later", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                videoId: videoId,
                id: session?.user?.id 
            }),
        });
        
        const data = await response.json();
        if (response.ok) {
            setHistoryItems(data.data || []);
        } else {
            console.error("Error removing item:", data.message);
        }
    } catch (error) {
        console.error("Error removing item:", error);
    }
  };

  const pauseWatchHistory = async () => {
    try {
      const res = await fetch("/api/pause-watched-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session?.user?.id }),
      });
      const data = await res.json();
      setIsPausedWatchHistory(data.pausWatchedHistory);
    } catch (error) {
      console.error("Error pausing watch history:", error);
    }
  };

  const removeAllWatchHistory = async () => {
    try {
      const res = await fetch("/api/remove-all-watched-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session?.user?.id }),
      });
      const data = await res.json();
      setHistoryItems(data.watchHistory);
    } catch (error) {
      console.error("Error removing all watch history:", error);
    }
  };

  if (loading) {
    return <WatchHistorySkeleton />;
  }
  if (!session) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        Please log in to view your watch history.
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-black">
      <div className="flex h-full">
        <div className="flex-1 w-full">
          {/* Mobile Search Header */}
          <div className="flex items-center gap-4 p-2 sticky top-0 bg-white dark:bg-black z-10 border-b dark:border-zinc-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search watch history"
                className="pl-10 bg-neutral-100 dark:bg-zinc-900 border-none text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 h-10 rounded-full"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-600 dark:text-neutral-400"
              >
                <Settings2 className="h-5 w-5" />
                <span className="sr-only">Manage all history</span>
              </Button>
              <div className="flex flex-row gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:rounded-lg shadow-lg "
                >

                  <Trash2 size={18} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your watch history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={removeAllWatchHistory}>
                    <Trash2 /> Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="ghost"
              size="icon"
              onClick={pauseWatchHistory}
              className="rounded-lg shadow-lg "

            >
              {isPausedWatchHistory ? (
                <Play className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </Button>
          </div>
            </div>
          </div>

          {/* Video List */}
          <ScrollArea className="h-[calc(100vh-60px)] pb-16 w-full">
            <div className="space-y-3 py-2 px-1 sm:px-4 w-full">
              {historyItems.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No videos in watch later
                </div>
              ) : (
                <div className="max-w-[800px] mx-auto px-2">
                  {historyItems.map((item) => (
                    <VideoHistoryItem
                      key={item._id}
                      video={{
                        videoId: item._id,
                        title: item.title,
                        thumbnailUrl: item.thumbnailUrl,
                        channel: item.channel_name,
                        channelImage: item.channel_icon,
                        views: item.views,
                        uploadDate: item.createdAt,
                        duration: item.duration,
                        username: item.channel_username
                      }}
                      onRemove={() => removeHistoryItem(item._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Mobile Action Buttons - Fixed at Bottom */}
          
        </div>
      </div>
    </div>
  );
}

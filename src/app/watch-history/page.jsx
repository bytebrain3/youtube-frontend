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
            `/api/get-watch-history?id=${session.user.id}`
          );
          const data = await response.json();
          setHistoryItems(data.data);
          setIsPausedWatchHistory(data.pausWatchedHistory);
        }
      } catch (error) {
        console.error("Error fetching watch history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchUserWatchHistory();
    }
  }, [session?.user?.id]);

  const removeHistoryItem = (videoId) => {
    setHistoryItems((prev) => prev.filter((item) => item.videoId !== videoId));
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
    <div className="w-screen min-h-screen">
      <div className="flex">
        <div className="flex-1 max-w-7xl mx-auto p-4">
          <div className="flex justify-end gap-4 mb-6 ">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search watch history"
                className="pl-10 bg-neutral-200 dark:bg-zinc-900 border-none text-black dark:text-white placeholder:text-gray-900 dark:placeholder:text-gray-400"
              />
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-neutral-400 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  <Trash2 size={18} />
                  <span className="sr-only">Clear all watch history</span>
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
              className="text-neutral-400 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              {isPausedWatchHistory ? (
                <Play className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
              <span className="sr-only">Pause watch history</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              <Settings2 className="h-5 w-5" />
              <span className="sr-only">Manage all history</span>
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-10px)] lg:h-[calc(100vh-150px)]  pb-4 bg-red-50">
            <div className="space-y-3 py-4 px-24">
              {historyItems.map((item) => (
                <VideoHistoryItem
                  key={item.videoId}
                  video={item}
                  onRemove={removeHistoryItem}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

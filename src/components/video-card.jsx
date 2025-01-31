"use client";
import { useState, useEffect } from "react";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
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
} from "@/components/ui/alert-dialog"
import { motion } from "motion/react";




const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} ${years === 1 ? "year" : "years"} ago`;
  if (months > 0) return `${months} ${months === 1 ? "month" : "months"} ago`;
  if (days > 0) return `${days} ${days === 1 ? "day" : "days"} ago`;
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  return "Just now";
};

export function VideoCard({ video, index, setVideos }) {
  const [timeAgo, setTimeAgo] = useState("");
  const { data: session } = useSession();
  const unlike = async (videoId) => {
    if (!videoId) return; // Ensure videoId is valid

    try {
      const formData = new FormData();
      formData.append("videoId", videoId);
      formData.append("userid", session?.user?.id);
      const res = await axios.delete("/api/remove-liked-video", { data: formData });

      if (res.status === 200) {
        setVideos((prevVideos) =>
          prevVideos.filter((video) => video._id !== videoId)
        );
      }
    } catch (error) {
      console.error("Error removing liked video:", error);
    }
  };

  useEffect(() => {
    setTimeAgo(formatRelativeTime(video.createdAt));
  }, [video.createdAt]);

  return (
    <motion.div
      whileHover={{
        scale: 1.02 // Reduced scale for smoother hover
      }}
      whileTap={{
        scale: 1.02
      }}
      className="flex gap-2  p-2  hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
      <div className="w-6 text-gray-500 dark:text-gray-400 pt-2 font-medium shrink-0">{index}</div>
      <div className="relative group flex-1 overflow-hidden">
        <div className="flex gap-3 max-w-full">
          <div className="relative shrink-0">
            <Image
              src={video.thumbnailUrl || "/1.png"}
              alt={video.title}
              width={360}
              height={200}
              className="w-32 sm:w-40 h-24 object-cover rounded-lg"
            />
            <div className="absolute bottom-1 right-1 bg-black/80 text-white px-1 rounded text-xs">
              {video.duration}
            </div>
          </div>
          <div className="flex-1 min-w-0 pr-2"> {/* Added min-w-0 for text truncation */}
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm sm:text-base">
              {video.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {video.channel}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
              {video.views} views • {timeAgo}
            </p>
          </div>
          
          <div className="shrink-0">
            <AlertDialog>
              <AlertDialogTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 dark:text-gray-400"
                >
                  <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your liked
                    and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel >Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => unlike(video._id)}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

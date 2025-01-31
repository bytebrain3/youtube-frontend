import { memo } from "react";
import Image from "next/image";
import { X, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { motion } from "motion/react";

import { Slider } from "@/components/ui/slider";
import { useSession } from "next-auth/react";


export const VideoHistoryItem = memo(function VideoHistoryItem({
  video,
  onRemove,
}) {
  const { data: session } = useSession();

  const removeWatchedVideo = async (videoId) => {
    try {
      const formData = new FormData();
      formData.append("videoId", videoId);
      formData.append("userid", session?.user?.id || "");
      const response = await fetch("/api/remove-watched-video", {
        method: "DELETE",
        body: formData,
      });
      if (response.ok) {
        onRemove(videoId); // Update parent state instead of refreshing
      }
    } catch (error) {
      console.error("Error removing video:", error);
    }
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.05,
      }}
      whileTap={{
        scale : 1.05
      }}
      className="flex gap-4 group hover:bg-neutral-200 hover:dark:bg-neutral-800 p-2 px-4 rounded-lg transition-transform"
    >
      <div className="relative flex-shrink-0 w-40">
        <div className="relative">
          <Image
            src={video.thumbnailUrl || "/placeholder.svg"}
            alt={video.title}
            width={360}
            height={200}
            className="w-40 h-24 object-cover rounded"
          />

          <Slider
            value={[video.WatchedDuration || 0]} // Ensuring it doesn't break
            max={100}
            step={1}
            className="w-full h-1"
          />
        </div>
        <div className="absolute bottom-6 right-1 bg-black/80 px-1 rounded text-xs text-white">
          {video.duration}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
        <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
          <span>{video.channel_name}</span>
          {video.verified && (
            <CheckCircle className="h-3 w-3 fill-gray-400 stroke-none" />
          )}
        </div>
        <p className="text-gray-400 text-sm">{video.views} views</p>
        {video.description && (
          <p className="text-gray-400 text-sm line-clamp-2 mt-1">
            {video.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {" "}
        {/* Ensuring alignment */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <X size={18} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                video from your watch history and remove your data from our
                servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => removeWatchedVideo(video.videoId)}
              >
                Delete <Trash2 className="ml-2 h-4 w-4" />
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
});


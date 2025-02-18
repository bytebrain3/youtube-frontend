"use client"

import React from 'react'
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { EllipsisVertical, Share, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Pencil, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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
  if (minutes > 0)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  return "Just now";
};

const ProfileDialogCard = ({ title, handleDelete, videoId, setOpen }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteClick = async () => {
    try {
      setIsDeleting(true);
      await handleDelete(videoId);
      setOpen(false);
    } catch (error) {
      console.error('Error in delete operation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogDescription className="flex flex-col gap-2">
        <Link href={`/videos/${videoId}/edit`}>
          <Button variant="outline" className="flex items-center gap-2 w-full">
            <Pencil className="w-4 h-4" /> Edit
          </Button>
        </Link>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleDeleteClick} 
          disabled={isDeleting}
        > 
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
          Delete
        </Button>
      </DialogDescription>
    </>
  );
};

const VideoDialogCard = ({ title, channelId, videoId, setOpen }) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isInWatchLater, setIsInWatchLater] = useState(false);
 

  const handleWatchLater = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch("/api/update-watch-later", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          id: session.user.id,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsInWatchLater(!isInWatchLater);
      }
      setOpen(false);
    } catch (error) {
      console.error("Error updating watch later:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogDescription className="flex flex-col gap-2">
        <Button variant="outline">
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button 
          variant="outline" 
          onClick={handleWatchLater}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Eye className="w-4 h-4 mr-2" />
          )}
          {isInWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
        </Button>
      </DialogDescription>
    </>
  );
};

export default function VideoCard({
  channelId,
  videoId,
  thumbnail,
  profile,
  title,
  channel,
  channelImage,
  views,
  uploadDate,
  duration,
  username,
  handleDelete,
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    
    <div className="group w-full cursor-pointer">
      <Link href={`/videos/${videoId}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={thumbnail || "/placeholder.svg"}
            alt={title}
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />

          <div className="absolute bottom-2 right-2 rounded bg-black/90 px-1 py-0.5 text-xs font-medium text-white">
            {duration}
          </div>
        </div>
      </Link>

      <div className="mt-3 flex gap-3">
        {profile ? null : (
          <Link href={`/channel/@${username}`}>
            <Avatar className="h-9 w-9 rounded-full shrink-0">
              <Image
                src={channelImage || "/placeholder.svg"}
                alt={channel}
                width={36}
                height={36}
                priority={true}
                className="rounded-full"
              />
            </Avatar>
          </Link>
        )}
        <div className="flex flex-col relative w-full">
          <div className="flex justify-between items-start">
            <Link href={`/videos/${videoId}`}>
              <h3 className="line-clamp-2 text-sm font-medium text-primary hover:underline">
                {title}
              </h3>
            </Link>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <EllipsisVertical className="w-4 h-4 text-muted-foreground" />
                </DialogTrigger>
                <DialogContent>
                  {profile ? (
                    session?.user?.id === channelId ? (
                      <ProfileDialogCard 
                        title={title} 
                        channelId={channelId} 
                        videoId={videoId}
                        handleDelete={handleDelete}
                        setOpen={setOpen}
                      />
                    ) : (
                      <VideoDialogCard 
                        title={title} 
                        videoId={videoId} 
                        setOpen={setOpen}
                      />
                    )
                  ) : (
                    <VideoDialogCard 
                      title={title} 
                      videoId={videoId} 
                      setOpen={setOpen}
                    />
                  )}
                </DialogContent>
              </Dialog>
              

            </button>
          </div>

          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {channel}
            </p>
            <span className="text-xs">•</span>
            <span>{views} views</span>
            <span className="text-xs">•</span>
            <span>{formatRelativeTime(uploadDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

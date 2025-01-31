"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clapperboard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { ProfileSkeleton } from "@/components/profile-skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function VideoCard({ title, views, timestamp, thumbnail }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <Image src={thumbnail || "/placeholder.svg"} alt={title} fill className="object-cover" />
      </div>
      <div>
        <h3 className="font-medium line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {views} • {timestamp}
        </p>
      </div>
    </div>
  );
}

export default function Profile({ isLoading = false }) {
  const [hasVideos, setHasVideos] = useState(false);
  const [username, setUsername] = useState("DipWave");
  const [description, setDescription] = useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
  const [coverImage, setCoverImage] = useState("/1.png");
  const [profileImage, setProfileImage] = useState("/1.png");
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const handleFileUpload = (event, setImage) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Banner */}
      <div className="relative w-full max-w-7xl h-[240px]">
        <Image
          src={coverImage || "/placeholder.svg"}
          alt="Channel banner"
          fill
          className="object-cover rounded-xl border"
          priority
        />
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        {/* Profile Info */}
        <div className="flex items-start gap-6 -mt-6 mb-6">
          <Avatar className="w-32 h-32 border-4 border-background">
            <AvatarImage src={profileImage} />
            <AvatarFallback>DW</AvatarFallback>
          </Avatar>

          <div className="flex-1 mt-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Dip</h2>
              <span className="text-sm text-muted-foreground">@{username.toLowerCase()}</span>
            </div>
            <p className="text-sm text-muted-foreground">{description.slice(0, 100)}{description.length > 100 && !showFullDescription ? '...' : ''}</p>
            {description.length > 100 && !showFullDescription && (
              <Button variant="link" onClick={() => setShowFullDescription(true)}>Display more</Button>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="mt-4">Customize channel</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Customize Channel</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cover">Cover Image</Label>
                    <Input id="cover" type="file" onChange={(e) => handleFileUpload(e, setCoverImage)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profile">Profile Image</Label>
                    <Input id="profile" type="file" onChange={(e) => handleFileUpload(e, setProfileImage)} />
                  </div>
                </div>
                <Button onClick={() => setHasVideos(true)}>Save Changes</Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Full Description Popup */}
        <Dialog open={showFullDescription} onOpenChange={() => setShowFullDescription(false)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Channel Info</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">{description}</p>
              <p className="text-sm text-muted-foreground">Joined: 2021-01-01</p>
              <p className="text-sm text-muted-foreground">Total Videos: 12</p>
              <p className="text-sm text-muted-foreground">YouTube URL: <a href={`https://youtube.com/${username}`} target="_blank" rel="noopener noreferrer">youtube.com/{username}</a></p>
            </div>
            <Button variant="secondary" onClick={() => setShowFullDescription(false)}>Close</Button>
          </DialogContent>
        </Dialog>

        <ScrollArea className="h-[calc(100vh-400px)]">
          {!hasVideos ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <Clapperboard className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create content on any device</h3>
              <p className="text-muted-foreground mb-6">
                Upload and record at home or on the go.
                <br />
                Everything you make public will appear here.
              </p>
              <Button onClick={() => setHasVideos(true)}>Create</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <VideoCard
                title="Building a YouTube Clone with Next.js 13"
                views="1.2K views"
                timestamp="2 hours ago"
                thumbnail="/1.png"
              />
              {/* Add more VideoCard components as needed */}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

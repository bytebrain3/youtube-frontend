"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useInView } from "react-intersection-observer"
import { useToast } from "@/hooks/use-toast"
import { useDropzone } from "react-dropzone"

import { UserCircle, Eye, Video, GlobeIcon, X } from "lucide-react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { VideoSkeleton } from "@/components/skeleton/VideoSkeleton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import VideoCard from "@/components/videoCard"
import axiosInstance from "@/lib/axiosinstance"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const ImageUploadField = ({ label, value, onChange, onRemove, onView, className, isUploading }) => {
  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return

      // Create temporary preview
      const previewUrl = URL.createObjectURL(file)

      // Call onChange with preview URL first for immediate feedback
      onChange(previewUrl, true) // true indicates uploading state

      const formData = new FormData()
      formData.append("thumbnail", file)

      const response = await axiosInstance.post("/api/v1/image/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      // Update with actual uploaded URL
      onChange(response.data.data, false) // false indicates upload complete
    } catch (error) {
      console.error("Error uploading image:", error)
      onRemove() // Remove preview on error
      throw error
    }
  }

  return (
    <div className="relative">
      {value && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 rounded-full bg-black/50 hover:bg-black/70"
              disabled={isUploading}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onView}>View Image</DropdownMenuItem>
            <DropdownMenuItem onClick={onRemove}>Remove Image</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <div className={`relative ${className || ""}`}>
        {value ? (
          <div className="relative w-full h-full">
            <img src={value || "/placeholder.svg"} alt={label} className="w-full h-full object-cover rounded-lg" />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center border-2 border-dashed rounded-lg p-4">
            <span className="text-gray-500">Upload {label}</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </div>
    </div>
  )
}

const ProfilePage = () => {
  const { username } = useParams()
  const [userData, setUserData] = useState({
    username: "",
    full_name: "",
    description: "",
    coverImage: "/globe.svg",
    profileImage: "/placeholder.svg",
    bannerImage: null,
    createdAt: "",
    location: "",
    totalVideo: 0,
    Subscribers: 0,
    userID: "",
    channelId: "",
    isSubscribed : false,
  })

  const [uploadingStates, setUploadingStates] = useState({
    coverImage: false,
    profileImage: false,
    bannerImage: false,
  })

  const [validationErrors, setValidationErrors] = useState({
    username: false,
    coverImage: false,
    profileImage: false,
  })

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [maxVideos, setMaxVideos] = useState(4)
  const [hasMore, setHasMore] = useState(true)
  const { data: session, update } = useSession()
  const { ref, inView } = useInView({ threshold: 0.5 })
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const parsedUsername = username.replace("%40", "@").split("@")[1]?.trim()
        const response = await axios.get(`/api/user/${parsedUsername}`, {
          headers: {
            Authorization: session?.user?.id || ''
          }
        })
        setUserData(response.data)
        
        
        

        const channelResponse = await axios.post("/api/is-channel", {
          id: response.data.userID,
        })

        if (!channelResponse.data.isChannel) {
          router.push("/")
          return
        }

        setLoading(false)
      } catch (error) {
        setError(error.message)
        setLoading(false)
      }
    }

    if (username) {
      fetchUser()
    }
  }, [username, router, session?.user?.id])

  const fetchVideos = async (id) => {
    if (!hasMore || loading || !id) return

    try {
      setLoading(true)
      const response = await axios.get(`/api/get-video-of-user?index=${page}&userID=${id}&MAX_VIDEOS=${maxVideos}`)
      const newVideos = response.data.videos || response.data || []

      if (!Array.isArray(newVideos)) {
        console.error("Received invalid video data:", newVideos)
        setError("Invalid video data received")
        setHasMore(false)
        return
      }

      setVideos((prevVideos) => {
        const uniqueVideos = newVideos.filter(
          (newVideo) => !prevVideos.some((prevVideo) => prevVideo.videoId === newVideo.videoId),
        )
        return [...prevVideos, ...uniqueVideos]
      })

      setPage((prev) => prev + 1)
      setHasMore(newVideos.length === maxVideos)
    } catch (error) {
      console.error("Error fetching videos:", error)
      setError(error.message)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userData.userID && !videos.length) {
      fetchVideos(userData.userID)
    }
  }, [userData.userID, videos.length, fetchVideos]) // Added fetchVideos to dependencies

  useEffect(() => {
    if (inView && userData.userID && hasMore && !loading) {
      fetchVideos(userData.userID)
    }
  }, [inView, userData.userID, hasMore, loading, fetchVideos]) // Added fetchVideos to dependencies

  const handleDelete = async (videoId, closeDialog) => {
    try {
      setLoading(true)
      setError(null)

      console.log("Attempting to delete video:", videoId)

      const backendResponse = await axiosInstance.delete(`/api/v1/video/delete-video`, {
        data: { id: videoId },
      })
      if (!backendResponse.data.success) {
        throw new Error(backendResponse.data.message || "Failed to delete video files")
      }

      const dbResponse = await axios.delete(`/api/delete-video?videoId=${videoId}`)
      if (!dbResponse.data.success) {
        throw new Error(dbResponse.data.message || "Failed to delete video from database")
      }

      setVideos((prevVideos) => prevVideos.filter((video) => video.videoId !== videoId))
      setUserData((prev) => ({
        ...prev,
        totalVideo: prev.totalVideo - 1,
      }))

      toast({
        title: "Success",
        description: "Video deleted successfully",
      })

      if (closeDialog) closeDialog()
    } catch (error) {
      console.error("Error deleting video:", error)
      setError(error.message || "Failed to delete video")
      toast({
        title: "Error",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (field) => (url, isUploading) => {
    setUploadingStates((prev) => ({
      ...prev,
      [field]: isUploading,
    }))
    setUserData((prev) => ({
      ...prev,
      [field]: url,
    }))
    setValidationErrors((prev) => ({
      ...prev,
      [field]: false,
    }))
  }

  const handleSave = async () => {
    // Validate required fields
    const errors = {
      username: !userData.username.trim(),
      coverImage: !userData.coverImage || userData.coverImage === "/globe.svg",
      profileImage: !userData.profileImage || userData.profileImage === "/placeholder.svg",
    }
    console.log(userData);
    setValidationErrors(errors)

    if (Object.values(errors).some(Boolean) || Object.values(uploadingStates).some(Boolean)) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields and wait for images to upload",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await axios.put("/api/update-user-info", userData)

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update profile")
      }


      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      setOpen(false)
      
      // Force a hard refresh of the page
      window.location.reload()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const handleSubscribe = async () => {
    try {
      if (!session?.user?.id) {
        toast({
          title: "Error",
          description: "Please login to subscribe",
          variant: "destructive",
        })
        return
      }

      const response = await axios.post("/api/subscribe-chanel", {
        channelID: userData.userID,
        userID: session.user.id,
      })

      if (response.data.success) {
        // Update local state with the response from the server
        setUserData(prev => ({
          ...prev,
          isSubscribed: response.data.isSubscribed,
          Subscribers: response.data.subscriberCount
        }))

        toast({
          title: "Success",
          description: response.data.message,
        })
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error("Error updating subscription:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      })
    }
  }


  return (
    <div className="w-full  overflow-y-auto h-[calc(100vh-80px)]">

      <div className="w-full max-w-7xl mx-auto relative">
        <Image
          src={userData.coverImage || "/placeholder.svg"}
          alt="cover image"
          width={1200}
          height={300}
          className="object-cover w-full h-[200px] lg:h-[150px] sm:rounded-lg border-b-2"
        />
        <div className="flex flex-col md:flex-row gap-4 px-8 mt-4 md:mt-0">
          <Image
            src={userData.profileImage || "/placeholder.svg"}
            alt="profile image"
            width={150}
            height={150}
            className="object-cover rounded-full border-4 border-white -mt-16 md:-mt-20 w-[150px] h-[150px] md:w-[150px] md:h-[150px]"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{userData.full_name}</h1>
            <div className="flex items-center gap-2">
              <span>@{userData.username}</span>•<span>{userData.Subscribers} subscribers</span>•
              <span>{userData.totalVideo} videos</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              {userData.description.length > 150 ? `${userData.description.slice(0, 150)}` : userData.description}
              <Dialog>
                <DialogTrigger asChild className="text-sm text-gray-500">
                  <Button variant="link" className="p-0">
                    ...more
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>About</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-gray-500">{userData.description}</p>
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    <span className="text-sm text-gray-500">{userData.full_name}</span>
                    <GlobeIcon className="w-4 h-4" />
                    <span className="text-sm text-gray-500">{userData.location}</span>
                    <Eye className="w-4 h-4" />
                    <span className="text-sm text-gray-500">{userData.Subscribers} subscribers</span>
                    <Video className="w-4 h-4" />
                    <span className="text-sm text-gray-500">{userData.totalVideo} videos</span>
                  </div>
                </DialogContent>
              </Dialog>
            </p>

            {session?.user?.id ? (
              <>
                {session?.user?.id !== userData.userID ? (
                  <Button 
                    variant={userData.isSubscribed ? "destructive" : "outline"} 
                    className="rounded-full" 
                    onClick={handleSubscribe}
                  >
                    {userData.isSubscribed ? "Unsubscribe" : "Subscribe"}
                  </Button>

                ) : (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-full">
                        Customize Channel
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Customize Channel</DialogTitle>
                      </DialogHeader>
                      <Card>
                        <CardHeader></CardHeader>
                        <CardContent className="space-y-5" >
                          <div className="flex flex-col gap-2">
                            <Label className="flex items-center">
                              Channel Name
                              {validationErrors.username && <span className="text-red-500 text-sm ml-2">Required</span>}
                            </Label>
                            <Input
                              value={userData.full_name}
                              onChange={(e) => setUserData({ ...userData, full_name: e.target.value })}
                              className={validationErrors.username ? "border-red-500" : ""}
                            />
                          </div>
                         
                          <div className="flex flex-col gap-2">
                            <Label>Channel Description</Label>
                            <Textarea
                              value={userData.description}
                              onChange={(e) => setUserData({ ...userData, description: e.target.value })}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label>Channel Location</Label>
                            <Input
                              value={userData.location}
                              onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label className="flex items-center">
                              Channel Cover Image
                              {validationErrors.coverImage && (
                                <span className="text-red-500 text-sm ml-2">Required</span>
                              )}
                            </Label>
                            <ImageUploadField
                              label="Cover Image"
                              value={userData.coverImage}
                              onChange={handleImageChange("coverImage")}
                              onRemove={() => setUserData({ ...userData, coverImage: "" })}
                              onView={() => window.open(userData.coverImage, "_blank")}
                              className="h-40"
                              isUploading={uploadingStates.coverImage}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label className="flex items-center">
                              Channel Profile Image
                              {validationErrors.profileImage && (
                                <span className="text-red-500 text-sm ml-2">Required</span>
                              )}
                            </Label>
                            <ImageUploadField
                              label="Profile Image"
                              value={userData.profileImage}
                              onChange={handleImageChange("profileImage")}
                              onRemove={() => setUserData({ ...userData, profileImage: "" })}
                              onView={() => window.open(userData.profileImage, "_blank")}
                              className="h-40 w-40 rounded-xl "
                              isUploading={uploadingStates.profileImage}
                            />
                          </div>

                          
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            onClick={handleSave}
                            disabled={Object.values(uploadingStates).some(Boolean)}
                          >
                            {Object.values(uploadingStates).some(Boolean) ? "Uploading..." : "Save"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {videos.map((video, index) => (
            <VideoCard
              key={index}
              profile={true}
              channelId={userData.userID}
              videoId={video.videoId}
              thumbnail={video.thumbnailUrl}
              title={video.title}
              channel={video.channel_name}
              channelImage={video.channel_icon}
              views={video.views}
              uploadDate={video.createdAt}
              duration={video.duration}
              handleDelete={(videoId, closeDialog) => handleDelete(videoId, closeDialog)}
            />
          ))}
          {loading && Array.from({ length: 3 }).map((_, i) => <VideoSkeleton key={i} />)}
        </div>

        <div ref={ref} className="h-10 w-full" />

        {error && <p className="text-red-500">Error: {error}</p>}
      </div>
    </div>
  )
}

export default ProfilePage


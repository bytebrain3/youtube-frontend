import Image from "next/image"
import Link from "next/link"
import { Avatar } from "@/components/ui/avatar"


const formatRelativeTime = (dateString)=> {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years} ${years === 1 ? "year" : "years"} ago`
  if (months > 0) return `${months} ${months === 1 ? "month" : "months"} ago`
  if (days > 0) return `${days} ${days === 1 ? "day" : "days"} ago`
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  if (minutes > 0) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
  return "Just now"
}

export default function VideoCard({
  videoId,
  thumbnail,
  title,
  channel,
  channelImage,
  views,
  uploadDate,
  duration,
}) {
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
        <div className="flex flex-col">
          <Link href={`/videos/${videoId}`}>
            <h3 className="line-clamp-2 text-sm font-medium text-primary hover:underline">{title}</h3>
          </Link>
          
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
            
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{channel}</p>
          <span className="text-xs">|</span>
            <span>{views} views</span>
            <span className="text-xs">•</span>
            <span>{formatRelativeTime(uploadDate)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}


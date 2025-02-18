export function formatTimeAgo(date) {
    if (!date) return "Invalid date";
    
    // Convert date string to Date object if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Validate date object
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
        return "Invalid date";
    }

    const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)
  
    if (years > 0) return `${years} year${years === 1 ? "" : "s"} ago`
    if (months > 0) return `${months} month${months === 1 ? "" : "s"} ago`
    if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`
    if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
    return `${seconds} second${seconds === 1 ? "" : "s"} ago`
}

  export function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
  
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }
  
  export const formatTime = (seconds) => {
    const pad = (num) => num.toString().padStart(2, "0")
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
  
    return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`
  }
  
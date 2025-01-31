"use client"
import { Home, Plus, Cog, LogIn } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signIn, useSession } from "next-auth/react";
import Image from "next/image"
import { Button } from "@/components/ui/button"
const navItems = [
  { icon: Home, label: "Home", href: "/" },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
        <path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25zm-.23 5.86-8.5 4.5c-1.34.71-3.01.2-3.72-1.14-.71-1.34-.2-3.01 1.14-3.72l2.04-1.08v-1.21l-.69-.28-1.11-.46c-.99-.41-1.65-1.35-1.7-2.41-.05-1.06.52-2.06 1.46-2.56l8.5-4.5c1.34-.71 3.01-.2 3.72 1.14.71 1.34.2 3.01-1.14 3.72L15.5 9.26v1.21l1.8.74c.99.41 1.65 1.35 1.7 2.41.05 1.06-.52 2.06-1.46 2.56z" />
      </svg>
    ),
    label: "Shorts",
    href: "/shorts",
  },
  { icon: Plus, label: "Create", href: "/create" },
  { icon: Cog, label: "Settings", href: "/settings" },
]

const MobileNav = () => {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const userItem =
    status === "loading"
      ? { icon: () => <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse" />, label: "Loading", href: "#" }
      : session
        ? {
            icon: () => (
              <Image
                src={session.user?.image || "/placeholder.svg"}
                alt={session.user?.name || "User"}
                width={24}
                height={24}
                className="rounded-full"
              />
            ),
            label: "Profile",
            href: "/profile",
          }
        : <Button
        className="rounded-full"
        onClick={() => signIn("github", { callbackUrl: "/" })}
      >
        <LogIn/>
      </Button>


  const allItems = [...navItems, userItem]

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 px-2 py-1">
      {allItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link key={item.href} href={item.href} className="w-1/5">
            <div
              className={`flex flex-col items-center justify-center py-2 text-xs ${
                isActive ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? "text-red-600 dark:text-red-400" : ""}`} />
              <span className="mt-1">{item.label}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default MobileNav


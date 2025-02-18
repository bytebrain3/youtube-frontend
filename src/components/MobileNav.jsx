"use client";
import { Home, Plus, LibraryBig, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import axios from "axios";

import { useEffect, useState } from "react";
const navItems = [
  { icon: Home, label: "Home", href: "/" },
  
  { icon: Plus, label: "Upload", href: "/upload" },
  { icon: LibraryBig, label: "Library", href: "/Library" },
];


const MobileNav = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isChannel, setIsChannel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset loading state when session changes
    setIsLoading(true);

    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    const checkChannelStatus = async () => {
      try {
        const res = await axios.post("/api/is-channel", { id: session.user.id });
        setIsChannel(res.data.isChannel);
        localStorage.setItem("isChannel", res.data.isChannel);
      } catch (error) {
        console.error("Error checking channel status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (localStorage.getItem("isChannel") === "true") {
      setIsChannel(true);
      setIsLoading(false);
    } else {
      checkChannelStatus();
    }
  }, [session?.user?.id]);

  const userItem = status === "loading" ? {
    icon: () => (
      <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse" />
    ),
    label: "Loading",
    href: "#",
  } : session ? {
    icon: () => (
      isChannel ? (
        <Link href={`/channel/@${session.user?.username}`}>
          <Image
            src={session.user?.image || "/placeholder.svg"}
            alt={session.user?.name || "User"}
            width={24}
            height={24}
            className="rounded-full"
          />
        </Link>
      ) : (
        <Image
          src={session.user?.image || "/placeholder.svg"}
          alt={session.user?.name || "User"}
          width={24}
          height={24}
          className="rounded-full"
        />
      )
    ),
    label: "Profile",
    href: "/profile",
  } : {
    icon: LogIn,
    label: "Login",
    href: "#",
    onClick: () => signIn("github", { callbackUrl: "/" })
  };

  const allItems = [...navItems, userItem];

  return (
    <div className="fixed z-50  bottom-0 left-0 right-0 flex items-center justify-between bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 px-2 py-1">
      {allItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link key={item.href} href={item.href} className="w-1/5">
            <div
              className={`flex flex-col items-center justify-center py-2 text-xs ${
                isActive
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <item.icon
                className={`h-6 w-6 ${
                  isActive ? "text-red-600 dark:text-red-400" : ""
                }`}
              />
              <span className="mt-1">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileNav;

"use client";

import {
  Search,
  Plus,
  Bell,
  Mic,
  LogOut,
  UserCircle,
  CircleUserRound,
} from "lucide-react";
import { YouTubeLogo } from "./youtube-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TopNavSkeleton } from "@/components/skeleton/top-nav-skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
const SearchBar = () => {
  //const [searchQuery, setSearchQuery] = useState("");

  return (
    <form className="flex items-center max-w-[732px] w-full">
      <div className="flex w-full max-w-[632px]">
        <div className="flex w-full items-center rounded-l-full border px-4 hover:border-blue-600">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            className="border-0 focus-visible:ring-0 placeholder:text-muted-foreground focus-visible:ring-offset-0 bg-sidebar"
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          size="icon"
          className="h-10 rounded-l-none rounded-r-full border border-l-0 bg-secondary hover:bg-secondary/80"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
      <Button
        variant="secondary"
        size="icon"
        className="ml-2 h-10 w-10 rounded-full"
      >
        <Mic className="h-5 w-5" />
        <span className="sr-only">Search with voice</span>
      </Button>
    </form>
  );
};

const UploadVideo = () => {
  return (
    <Link
      href="/upload"
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 w-36 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 text-black dark:text-white rounded-3xl"
    >
      <Plus className="h-5 w-5" />
      <span className="">Upload video</span>
    </Link>
  );
};

const NotificationBell = () => {
  return (
    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
      <Bell className="h-5 w-5" />
      <span className="sr-only">Notifications</span>
    </Button>
  );
};



export function UserMenu({ isChannel }) {
  const { data: session } = useSession();
  
  const makeChannel = async () => {
    try {
      await axios.post("/api/switch-to-channel", {
        id: session?.user?.id,
      });
      window.location.reload(); 
    } catch (error) {
      console.error("Error switching to channel:", error);
    }
  }

  if (!session?.user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session?.user?.image}
              alt={session?.user?.name ?? "User avatar"}
            />
            <AvatarFallback>
              <UserCircle className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isChannel ? (
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex items-center gap-2 w-full cursor-pointer"
              >
                <CircleUserRound className="h-5 w-5" />
                <span>Channel</span>
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem>
              <Switch
                onCheckedChange={makeChannel}
                id="airplane-mode"
              />
              <Label htmlFor="airplane-mode">Switch to channel</Label>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2" />
          <p>Log out</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function TopNav() {
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
        setIsChannel(res.data.user.isChannel);
      } catch (error) {
        console.error("Error checking channel status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkChannelStatus();
  }, [session?.user?.id]);

  // Show skeleton while loading or checking authentication
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return <TopNavSkeleton />;
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 w-screen items-center bg-sidebar justify-between border-b px-4">
      <div className="flex items-center gap-4 relative">
        <SidebarTrigger className="fixed left-4" />
        <YouTubeLogo className="ml-8" />
      </div>
  
      <div className="flex flex-1 justify-center">
        <SearchBar />
      </div>

      <div className="flex items-center gap-2">
        {session?.user ? (
          <>
            {isChannel && <UploadVideo />}
            <NotificationBell />
            <UserMenu isChannel={isChannel} />
          </>
        ) : (
          <Button
            className="rounded-full"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            Sign in
          </Button>
        )}
      </div>
      
    </header>
    
  );
}

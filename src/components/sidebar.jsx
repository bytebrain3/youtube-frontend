"use client";

import * as React from "react";
import {
  Home,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  Clapperboard,
  Plus,
} from "lucide-react";

import { ModeToggle } from "@/components/theme-toogle";
import Link from "next/link";

import TopNav from "./top-nav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "./ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
const primaryMenuItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Clapperboard, label: "Shorts", href: "/shorts" },
  { icon: PlaySquare, label: "Subscriptions", href: "/subscriptions" },
];

const secondaryMenuItems = [
  { icon: History, label: "History", href: "/watch-history" },
  { icon: Clock, label: "Watch Later", href: "/watch-later" },
  { icon: ThumbsUp, label: "Liked Videos", href: "/liked-video" },
];

export function YouTubeSidebar() {
  return (
    <>
      <Sidebar collapsible="icon" className="border-r-0 bg-background">
        <SidebarHeader className="p-0">
          <TopNav />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {primaryMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link
                    href={item.href}
                    className="flex h-10 w-full items-center gap-6 rounded-none px-3 py-2 hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <div className="my-2 border-t border-border" />

          <SidebarMenu>
            {secondaryMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link
                    href={item.href}
                    className="flex h-10 w-full items-center gap-6 rounded-none px-3 py-2 hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem key="new-playlist">
              <SidebarMenuButton asChild tooltip="New Playlist">
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="flex h-10 w-full items-center px-2 gap-6 rounded-none hover:bg-accent"
                    >
                      <span >
                        <Plus className="h-5 w-5" />
                      </span>
                      
                      <span className="text-sm">New Playlist</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>

                    <DialogHeader>
                      <DialogTitle>Create New Playlist</DialogTitle>
                      <DialogDescription className="flex flex-col gap-2">
                        Create a new playlist to organize your videos.
                        <Input
                          type="text"
                          className="w-full"
                          placeholder="Playlist Name"
                        />
                      </DialogDescription>
                      <DialogFooter className="flex flex-col w-full gap-2">
                        <Button variant="outline" className="w-full">
                          Cancel
                        </Button>
                        <Button className="w-full" variant="secondary">
                          Create
                        </Button>
                      </DialogFooter>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="my-2 border-t border-border" />
          {/* 
        <SidebarMenu>
          {exploreItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                className="flex h-10 w-full items-center gap-6 rounded-none px-3 py-2 hover:bg-accent"
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        */}
        </SidebarContent>
        <hr />
        <SidebarFooter className="flex items-center justify-center p-2 ">
          <ModeToggle />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

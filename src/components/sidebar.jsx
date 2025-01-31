"use client"

import * as React from "react"
import { Home, PlaySquare, Clock, ThumbsUp, History, Clapperboard } from 'lucide-react'

import {ModeToggle} from "@/components/theme-toogle"
import Link  from "next/link"

import TopNav from "./top-nav"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

const primaryMenuItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Clapperboard, label: "Shorts", href: "/shorts" },
  { icon: PlaySquare, label: "Subscriptions", href: "/subscriptions" },
]

const secondaryMenuItems = [

  { icon: History, label: "History", href: "/watch-history" },
  { icon: Clock, label: "Watch Later", href: "/watch" },
  { icon: ThumbsUp, label: "Liked Videos", href: "/liked-video" },
]


export function YouTubeSidebar() {
  return (
    <>
    
    <Sidebar 
      collapsible="icon" 
      className="border-r-0 bg-background"
    >
      <SidebarHeader className="">
      <TopNav/>
          
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {primaryMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
              >
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
              <SidebarMenuButton
                asChild
                tooltip={item.label}
              >
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
      <hr/>
      <SidebarFooter className="flex items-center justify-center p-2 ">
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
    </>
  )
}


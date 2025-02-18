"use client";
import { Suspense } from "react";
import { YouTubeSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import MobileNav from "@/components/MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTop from "@/components/MobileTop";

const MobileComponents = () => {
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  
  return (
    <>
      <MobileTop />
      <MobileNav />
    </>
  );
};

export default function VideoLayout({
  children,
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <YouTubeSidebar />
      <SidebarInset className="flex-grow h-screen overflow-hidden">
        <main className="relative h-full">
          <Suspense fallback={null}>
            <MobileComponents />
          </Suspense>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

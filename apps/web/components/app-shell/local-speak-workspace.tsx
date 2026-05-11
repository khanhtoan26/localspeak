"use client"

import { useState } from "react"

import { AppHeader } from "@/components/app-shell/app-header"
import { AppSidebar } from "@/components/app-shell/app-sidebar"
import type { SurfaceId } from "@/components/app-shell/nav-config"
import { SurfaceRenderer } from "@/components/app-shell/surface-renderer"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function LocalSpeakWorkspace() {
  const [activeSurface, setActiveSurface] = useState<SurfaceId>("json")

  return (
    <SidebarProvider>
      <AppSidebar
        activeSurface={activeSurface}
        onSurfaceChange={setActiveSurface}
      />
      <SidebarInset>
        <AppHeader activeSurface={activeSurface} />
        <div className="min-w-0 flex-1 p-4 md:p-6">
          <SurfaceRenderer activeSurface={activeSurface} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

"use client"

import type { SurfaceId } from "@/components/app-shell/nav-config"
import { mainNav } from "@/components/app-shell/nav-config"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

type AppHeaderProps = {
  activeSurface: SurfaceId
}

export function AppHeader({ activeSurface }: AppHeaderProps) {
  const activeItem = mainNav.find((item) => item.id === activeSurface)
  const title = activeItem?.enabled ? activeItem.label : "Coming soon"

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator className="mr-2 h-4" orientation="vertical" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

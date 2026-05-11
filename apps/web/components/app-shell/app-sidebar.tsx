"use client"

import type { SurfaceId } from "@/components/app-shell/nav-config"
import { comingSoonNav, practiceNav } from "@/components/app-shell/nav-config"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

type AppSidebarProps = {
  activeSurface: SurfaceId
  onSurfaceChange: (surface: SurfaceId) => void
}

export function AppSidebar({
  activeSurface,
  onSurfaceChange,
}: AppSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleSurfaceChange = (surface: SurfaceId) => {
    onSurfaceChange(surface)
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex min-w-0 flex-col gap-1 px-2 py-2">
          <p className="m-0 truncate text-lg font-semibold tracking-tight">
            LocalSpeak
          </p>
          <p className="m-0 truncate text-xs text-sidebar-foreground/70">
            IELTS speaking practice
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Practice</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {practiceNav.map((item) => {
                const isActive = activeSurface === item.id

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      aria-current={isActive ? "page" : undefined}
                      isActive={isActive}
                      onClick={() => handleSurfaceChange(item.id)}
                      tooltip={item.label}
                      type="button"
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Coming soon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comingSoonNav.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    aria-disabled="true"
                    onClick={(event) => event.preventDefault()}
                    tooltip={item.label}
                    type="button"
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <Badge className="ml-auto" variant="secondary">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="m-0 rounded-md bg-sidebar-accent px-2 py-2 text-xs text-sidebar-accent-foreground">
          Focused practice workspace
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

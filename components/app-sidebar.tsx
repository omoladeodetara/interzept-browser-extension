"use client"

import { Globe, Zap, Settings, FileJson, HeadingIcon, ArrowRightLeft, Plus, HelpCircle, Download, Building } from "lucide-react"
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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Image from "next/image"

const data = {
  navMain: [
    {
      title: "API Rules",
      url: "#rules",
      icon: Zap,
      isActive: true,
      items: [
        {
          title: "Overrides",
          url: "#overrides",
          icon: FileJson,
        },
        {
          title: "Redirects", 
          url: "#redirects",
          icon: ArrowRightLeft,
        },
        {
          title: "Headers",
          url: "#headers", 
          icon: HeadingIcon,
        },
      ],
    },
    {
      title: "Tools",
      url: "#tools",
      icon: Settings,
      items: [
        {
          title: "Request Logs",
          url: "#logs",
        },
        {
          title: "Import/Export",
          url: "#import-export",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Help & Docs",
      url: "#help",
      icon: HelpCircle,
    },
    {
      title: "Download Extension",
      url: "https://interzept.dev/#download",
      icon: Download,
    },
  ],
}

export function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Image 
            src="/icons/icon128.png" 
            alt="Interzept" 
            width={32} 
            height={32} 
            className="h-8 w-8" 
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold">Interzept</span>
            <span className="text-xs text-muted-foreground">API Interceptor</span>
          </div>
        </div>
      </SidebarHeader>
      
    <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <Building />
                  <span>Team workspace</span>
                  <span className="ml-2 text-xs text-muted-foreground">Coming soon</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  )
}

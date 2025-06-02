"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header with Sidebar Trigger */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>API Rules</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-100 mb-6">
            Interzept - API Interception Tool
          </h1>
          
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">
              Welcome to Interzept
            </h2>
            <p className="text-slate-300 mb-4">
              Your API interception and mocking tool is now running with sidebar navigation!
            </p>
            <div className="space-y-2 text-slate-400">
              <p>• Sidebar navigation is working ✅</p>
              <p>• Development server is running ✅</p>
              <p>• Ready for development ✅</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

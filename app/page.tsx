"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  PlusCircle,
  Trash2,
  Save,
  Globe,
  ArrowRight,
  FileJson,
  HeadingIcon as Headers,
  Search,
  Download,
  Upload,
  Zap,
  Settings,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Rule {
  id: number
  name: string
  type: string
  source: string
  destination?: string
  responseCode?: number
  responseBody?: string
  responseHeaders?: Array<{
    name: string
    value: string
  }>
  headers?: Array<{
    operation: string
    name: string
    value: string
  }>
  enabled: boolean
  description: string
}

const isMobile = () => {
  if (typeof window === "undefined") return false
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  )
}

const MobileNotSupported = () => (
  <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
    <div className="max-w-md text-center">
      <div className="mb-6">
        <Image src="/icons/icon128.png" alt="Interzept" width={64} height={64} className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Interzept</h1>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-cyan-400 mb-3">Desktop Only</h2>
        <p className="text-slate-300 mb-4">
          Interzept is a browser extension designed for desktop development workflows. Mobile browsers don't support the
          extension APIs needed for request interception.
        </p>
        <p className="text-sm text-slate-400">Please visit this page on a desktop browser to use Interzept.</p>
      </div>

      <div className="space-y-3">
        <a
          href="https://interzept.dev"
          className="block w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all"
        >
          Visit Main Website
        </a>
        <a
          href="https://interzept.dev/#download"
          className="block w-full border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100 py-3 px-4 rounded-lg transition-all"
        >
          Download Extension
        </a>
      </div>
    </div>
  </div>
)

const sampleRules: Rule[] = [
  {
    id: 3,
    name: "User API Override",
    type: "overrides",
    enabled: true,
    source: "https://api.example.com/users",
    responseBody: '{"users": [{"id": 1, "name": "Test User"}]}',
    responseCode: 200,
    responseHeaders: [{ name: "Content-Type", value: "application/json" }],
    description: "Override API responses with custom data",
  },
  {
    id: 1,
    name: "Redirect API Endpoint",
    type: "redirect",
    enabled: true,
    source: "https://api.example.com/v1/*",
    destination: "https://api.example.com/v2/*",
    description: "Redirect all v1 API calls to v2",
  },
  {
    id: 2,
    name: "Add Auth Header",
    type: "headers",
    enabled: true,
    source: "https://secure.example.com/*",
    headers: [{ name: "Authorization", value: "Bearer test-token", operation: "add" }],
    description: "Add authentication header to all secure endpoints",
  },
]

const getRuleTypeIcon = (type: string) => {
  switch (type) {
    case "overrides":
      return <FileJson className="h-4 w-4" />
    case "redirect":
      return <Globe className="h-4 w-4" />
    case "headers":
      return <Headers className="h-4 w-4" />
    default:
      return <Settings className="h-4 w-4" />
  }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("rules")
  const [rules, setRules] = useState<Rule[]>(sampleRules)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null)
  const [lockedTab, setLockedTab] = useState<string | null>(null)
  const isMobile = useIsMobile()

  // Filter rules based on search term
  const filteredRules = rules.filter((rule) =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Load rules from localStorage on mount
  useEffect(() => {
    const savedRules = localStorage.getItem("interzept-rules")
    if (savedRules) {
      setRules(JSON.parse(savedRules))
    }
  }, [])

  // Save rules to localStorage on change
  useEffect(() => {
    localStorage.setItem("interzept-rules", JSON.stringify(rules))
  }, [rules])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleEditRule = (rule: Rule) => {
    setEditingRuleId(rule.id)
    setActiveTab("edit")
  }

  const handleDeleteRule = (id: number) => {
    setRules(rules.filter((rule) => rule.id !== id))
  }

  const handleSaveRule = (rule: Rule) => {
    if (rule.id) {
      // Update existing rule
      setRules(rules.map((r) => (r.id === rule.id ? rule : r)))
    } else {
      // Add new rule
      setRules([...rules, { ...rule, id: Date.now() }])
    }
    setActiveTab("rules")
  }

  const handleCancelEdit = () => {
    setEditingRuleId(null)
    setActiveTab("rules")
  }

  const handleRuleToggle = (id: number) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  const handleCreateNewRule = () => {
    const newRule: Rule = {
      id: Date.now(),
      name: "New Rule",
      type: "overrides",
      source: "",
      responseCode: 200,
      responseBody: '{\n  "success": true,\n  "data": {}\n}',
      responseHeaders: [{ name: "Content-Type", value: "application/json" }],
      enabled: true,
      description: ""
    }
    setRules([...rules, newRule])
    setEditingRuleId(newRule.id)
    setActiveTab("edit")
  }

  const handleExportRules = () => {
    const dataStr = JSON.stringify(rules, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `interzept-rules-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportRules = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedRules = JSON.parse(e.target?.result as string)
        if (Array.isArray(importedRules)) {
          setRules(importedRules)
        } else {
          alert('Invalid file format. Please select a valid rules JSON file.')
        }
      } catch (error) {
        alert('Error reading file. Please select a valid JSON file.')
      }
    }
    reader.readAsText(file)
    // Reset the input value so the same file can be imported again
    event.target.value = ''
  }

  // Replace the existing return statement with:
  if (isMobile) {
    return <MobileNotSupported />
  }

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
        <div className="ml-auto flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search rules..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-64 bg-slate-700 border-slate-600 pl-10 text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
            />
          </div>
          {/* Import/Export */}
          <Button
            variant="outline"
            onClick={handleExportRules}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById("import-file")?.click()}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <input id="import-file" type="file" accept=".json" onChange={handleImportRules} className="hidden" />
          <Button
            onClick={handleCreateNewRule}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 font-semibold shadow-lg shadow-cyan-500/25"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Rule
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {activeTab === "rules" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rules List */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-cyan-400" />
                    Rules ({filteredRules.length})
                  </CardTitle>
                  <CardDescription className="text-slate-400">Manage your API interception rules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`group p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          rule.enabled
                            ? "border-slate-600 bg-slate-700/50 hover:border-cyan-400/50 hover:bg-slate-700"
                            : "border-slate-700 bg-slate-800/30 opacity-60"
                        }`}
                        onClick={() => handleEditRule(rule)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                              className={`p-2 rounded-lg ${
                                rule.type === "overrides"
                                  ? "bg-cyan-500/10 text-cyan-400"
                                  : rule.type === "redirect"
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-purple-500/10 text-purple-400"
                              }`}
                            >
                              {getRuleTypeIcon(rule.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-100 truncate group-hover:text-cyan-400 transition-colors">
                                {rule.name}
                              </div>
                              <div className="text-xs text-slate-400 mt-1 capitalize">
                                {rule.type === "overrides"
                                  ? "Response Override"
                                  : rule.type === "redirect"
                                    ? "URL Redirect"
                                    : "Header Modification"}
                              </div>
                              {rule.description && (
                                <div className="text-xs text-slate-500 mt-1 line-clamp-2">{rule.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (rule.type === "overrides") {
                                  handleRuleToggle(rule.id)
                                }
                              }}
                              disabled={rule.type !== "overrides"}
                              className={`h-6 w-11 rounded-full p-0 ${
                                rule.type !== "overrides"
                                  ? "bg-slate-600/50 cursor-not-allowed opacity-50"
                                  : rule.enabled
                                    ? "bg-cyan-500 hover:bg-cyan-600"
                                    : "bg-slate-600 hover:bg-slate-500"
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                                  rule.type !== "overrides"
                                    ? "-translate-x-2.5 opacity-60"
                                    : rule.enabled
                                      ? "translate-x-2.5"
                                      : "-translate-x-2.5"
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteRule(rule.id)
                              }}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredRules.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        {searchTerm
                          ? "No rules match your search."
                          : 'No rules created yet. Click "New Rule" to get started.'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rule Editor */}
            <div className="lg:col-span-2">
              {activeTab === "edit" && editingRuleId !== null ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-100">
                      {rules.find((r) => r.id === editingRuleId) ? "Edit Rule" : "Create New Rule"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Configure how API requests should be intercepted and modified
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      value={rules.find((r) => r.id === editingRuleId)?.type}
                      onValueChange={(value) => {
                        const rule = rules.find((r) => r.id === editingRuleId)
                        if (rule) {
                          setRules(
                            rules.map((r) => (r.id === editingRuleId ? { ...rule, type: value } : r)),
                          )
                        }
                      }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="rule-name" className="text-slate-200">
                              Rule Name
                            </Label>
                            <Input
                              id="rule-name"
                              value={rules.find((r) => r.id === editingRuleId)?.name}
                              onChange={(e) => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, name: e.target.value } : r)),
                                  )
                                }
                              }}
                              className="bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-200">Template</Label>
                            <Select onValueChange={() => {}}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue placeholder="Choose template (optional)" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600">
                                <SelectItem value="api-mock" className="text-slate-100 focus:bg-slate-700">
                                  <div>
                                    <div className="font-medium">API Mock</div>
                                    <div className="text-xs text-slate-400">Mock API responses</div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="cors-bypass" className="text-slate-100 focus:bg-slate-700">
                                  <div>
                                    <div className="font-medium">CORS Bypass</div>
                                    <div className="text-xs text-slate-400">Add CORS headers</div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="auth-header" className="text-slate-100 focus:bg-slate-700">
                                  <div>
                                    <div className="font-medium">Auth Header</div>
                                    <div className="text-xs text-slate-400">Add authorization</div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="redirect-prod" className="text-slate-100 focus:bg-slate-700">
                                  <div>
                                    <div className="font-medium">Prod to Dev</div>
                                    <div className="text-xs text-slate-400">Redirect to dev server</div>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-200">Rule Type</Label>
                          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                            <TabsTrigger
                              value="overrides"
                              onClick={() => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, type: "overrides" } : r)),
                                  )
                                }
                              }}
                              disabled={!!(lockedTab && lockedTab !== "overrides")}
                              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Overrides
                            </TabsTrigger>
                            <TabsTrigger
                              value="redirect"
                              onClick={() => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, type: "redirect" } : r)),
                                  )
                                }
                              }}
                              disabled={!!(lockedTab && lockedTab !== "redirect")}
                              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Redirect
                            </TabsTrigger>
                            <TabsTrigger
                              value="headers"
                              onClick={() => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, type: "headers" } : r)),
                                  )
                                }
                              }}
                              disabled={!!(lockedTab && lockedTab !== "headers")}
                              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Headers
                            </TabsTrigger>
                          </TabsList>
                          {lockedTab && (
                            <p className="text-xs text-cyan-400 mt-1">
                              Template selected - rule type is locked to {lockedTab}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="source-url" className="text-slate-200">
                            Source URL Pattern
                          </Label>
                          <Input
                            id="source-url"
                            value={rules.find((r) => r.id === editingRuleId)?.source}
                            onChange={(e) => {
                              const rule = rules.find((r) => r.id === editingRuleId)
                              if (rule) {
                                setRules(
                                  rules.map((r) => (r.id === editingRuleId ? { ...rule, source: e.target.value } : r)),
                                )
                              }
                            }}
                            placeholder="https://example.com/*"
                            className="bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                          />
                          <p className="text-xs text-slate-400">
                            Use * as wildcard, e.g., https://api.example.com/* matches all paths
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-slate-200">
                            Description
                          </Label>
                          <Input
                            id="description"
                            value={rules.find((r) => r.id === editingRuleId)?.description}
                            onChange={(e) => {
                              const rule = rules.find((r) => r.id === editingRuleId)
                              if (rule) {
                                setRules(
                                  rules.map((r) => (r.id === editingRuleId ? { ...rule, description: e.target.value } : r)),
                                )
                              }
                            }}
                            className="bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                          />
                        </div>
                      </div>

                      <TabsContent value="redirect" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="destination-url" className="text-slate-200">
                            Destination URL
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="destination-url"
                              value={rules.find((r) => r.id === editingRuleId)?.destination || ""}
                              onChange={(e) => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, destination: e.target.value } : r)),
                                  )
                                }
                              }}
                              placeholder="https://new-example.com/$1"
                              disabled={true}
                              className="bg-slate-700/50 border-slate-600 text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 cursor-not-allowed"
                            />
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                          </div>
                          <p className="text-xs text-slate-400">
                            Use $1, $2, etc. to reference captured groups from the source URL
                          </p>
                          <div className="mt-4 p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
                            <p className="text-sm text-slate-400 text-center">
                              🚧 URL Redirection feature is coming soon! Stay tuned for updates.
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="headers" className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-slate-200">Headers</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {}}
                              disabled={true}
                              className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-100 cursor-not-allowed opacity-50"
                            >
                              <PlusCircle className="mr-2 h-3 w-3" /> Add Header
                            </Button>
                          </div>

                          {rules.find((r) => r.id === editingRuleId)?.headers &&
                            rules
                              .find((r) => r.id === editingRuleId)
                              ?.headers.map((header, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-3">
                                    <Select
                                      value={header.operation}
                                      onValueChange={() => {}}
                                      disabled={true}
                                    >
                                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-400 cursor-not-allowed">
                                        <SelectValue placeholder="Operation" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-800 border-slate-600">
                                        <SelectItem value="add" className="text-slate-100">
                                          Add
                                        </SelectItem>
                                        <SelectItem value="modify" className="text-slate-100">
                                          Modify
                                        </SelectItem>
                                        <SelectItem value="remove" className="text-slate-100">
                                          Remove
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-4">
                                    <Input
                                      value={header.name}
                                      onChange={() => {}}
                                      placeholder="Header name"
                                      disabled={true}
                                      className="bg-slate-700/50 border-slate-600 text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="col-span-4">
                                    <Input
                                      value={header.value}
                                      onChange={() => {}}
                                      placeholder="Header value"
                                      disabled={true}
                                      className="bg-slate-700/50 border-slate-600 text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {}}
                                      disabled={true}
                                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-not-allowed opacity-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}

                          <div className="mt-4 p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
                            <p className="text-sm text-slate-400 text-center">
                              🚧 Header Modification feature is coming soon! Stay tuned for updates.
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="overrides" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="status-code" className="text-slate-200">
                              Status Code
                            </Label>
                            <Input
                              id="status-code"
                              type="number"
                              value={rules.find((r) => r.id === editingRuleId)?.responseCode || 200}
                              onChange={(e) => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, responseCode: Number.parseInt(e.target.value) } : r)),
                                  )
                                }
                              }}
                              className="bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="content-type" className="text-slate-200">
                              Content Type
                            </Label>
                            <Select defaultValue="application/json">
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue placeholder="Content Type" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600">
                                <SelectItem value="application/json" className="text-slate-100">
                                  application/json
                                </SelectItem>
                                <SelectItem value="text/html" className="text-slate-100">
                                  text/html
                                </SelectItem>
                                <SelectItem value="text/plain" className="text-slate-100">
                                  text/plain
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="response-body" className="text-slate-200">
                            Response Body
                          </Label>
                          <Textarea
                            id="response-body"
                            className="font-mono text-sm h-40 bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                            value={rules.find((r) => r.id === editingRuleId)?.responseBody || '{\n  "success": true,\n  "data": {}\n}'}
                            onChange={(e) => {
                              const rule = rules.find((r) => r.id === editingRuleId)
                              if (rule) {
                                setRules(
                                  rules.map((r) => (r.id === editingRuleId ? { ...rule, responseBody: e.target.value } : r)),
                                )
                              }
                            }}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-700">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          const rule = rules.find((r) => r.id === editingRuleId)
                          if (rule) {
                            handleSaveRule(rule)
                          }
                        }}
                        disabled={rules.find((r) => r.id === editingRuleId)?.type !== "overrides"}
                        className={`${
                          rules.find((r) => r.id === editingRuleId)?.type !== "overrides"
                            ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900"
                        } font-semibold shadow-lg shadow-cyan-500/25`}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {rules.find((r) => r.id === editingRuleId)?.type !== "overrides" ? "Coming Soon" : "Save Rule"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : activeTab === "edit" ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center text-slate-400">
                      <div className="mb-4">
                        <Settings className="h-12 w-12 mx-auto text-slate-500" />
                      </div>
                      <p className="text-lg mb-2">No rule selected</p>
                      <p className="text-sm">Create a new rule or select an existing one to edit</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-100">Interzept</CardTitle>
                    <CardDescription className="text-slate-400">
                      Create and manage API interception rules for development and testing. Build powerful mock APIs and
                      test scenarios with ease.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-slate-700/50 border-slate-600 hover:border-cyan-400/50 transition-colors backdrop-blur-sm">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base flex items-center gap-2 text-slate-100">
                            <div className="p-2 bg-cyan-500/10 rounded-lg">
                              <FileJson className="h-4 w-4 text-cyan-400" />
                            </div>
                            Resource Overrides
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-slate-300">
                          Override API responses with custom data. Perfect for simulating server responses and managing
                          resource overrides during development and testing.
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-700/30 border-slate-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 to-slate-700/20 backdrop-blur-sm"></div>
                        <CardHeader className="p-4 relative z-10">
                          <CardTitle className="text-base flex items-center gap-2 text-slate-400">
                            <div className="p-2 bg-slate-600/20 rounded-lg">
                              <Zap className="h-4 w-4 text-slate-500" />
                            </div>
                            Advanced Features
                            <span className="ml-auto px-2 py-1 bg-slate-600/30 text-xs rounded-full text-slate-400">
                              Coming Soon
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 relative z-10">
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 bg-slate-600/20 rounded">
                                <Globe className="h-3 w-3 text-slate-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-400">URL Redirection</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  Redirect requests from one URL to another for testing different endpoints.
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="p-1.5 bg-slate-600/20 rounded">
                                <Headers className="h-3 w-3 text-slate-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-400">Header Modification</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  Add, modify, or remove headers for authentication and testing scenarios.
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Start */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
                      <h3 className="text-lg font-semibold text-slate-100 mb-3">Quick Start</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium text-cyan-400 mb-2">Getting Started</h4>
                          <div className="space-y-2 text-slate-300">
                            <div>• Use templates for common API testing scenarios</div>
                            <div>• Test with wildcard patterns (*) to match multiple URLs</div>
                            <div>• Export/import rules for sharing with your team</div>
                            <div>• Enable/disable rules to test different configurations</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                            Keyboard Shortcuts
                            <span className="px-2 py-1 bg-slate-600/30 text-xs rounded-full text-slate-400">
                              Coming Soon
                            </span>
                          </h4>
                          <div className="space-y-1 text-slate-400">
                            <div>
                              <kbd className="px-2 py-1 bg-slate-700/50 rounded text-xs opacity-50">Ctrl+N</kbd> New
                              Rule
                            </div>
                            <div>
                              <kbd className="px-2 py-1 bg-slate-700/50 rounded text-xs opacity-50">Ctrl+S</kbd> Save
                              Rule
                            </div>
                            <div>
                              <kbd className="px-2 py-1 bg-slate-700/50 rounded text-xs opacity-50">Escape</kbd> Cancel
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : activeTab === "edit" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rules List */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-cyan-400" />
                    Rules ({filteredRules.length})
                  </CardTitle>
                  <CardDescription className="text-slate-400">Manage your API interception rules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`group p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          rule.enabled
                            ? "border-slate-600 bg-slate-700/50 hover:border-cyan-400/50 hover:bg-slate-700"
                            : "border-slate-700 bg-slate-800/30 opacity-60"
                        }`}
                        onClick={() => handleEditRule(rule)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                              className={`p-2 rounded-lg ${
                                rule.type === "overrides"
                                  ? "bg-cyan-500/10 text-cyan-400"
                                  : rule.type === "redirect"
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-purple-500/10 text-purple-400"
                              }`}
                            >
                              {getRuleTypeIcon(rule.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-100 truncate group-hover:text-cyan-400 transition-colors">
                                {rule.name}
                              </div>
                              <div className="text-xs text-slate-400 mt-1 capitalize">
                                {rule.type === "overrides"
                                  ? "Response Override"
                                  : rule.type === "redirect"
                                    ? "URL Redirect"
                                    : "Header Modification"}
                              </div>
                              {rule.description && (
                                <div className="text-xs text-slate-500 mt-1 line-clamp-2">{rule.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (rule.type === "overrides") {
                                  handleRuleToggle(rule.id)
                                }
                              }}
                              disabled={rule.type !== "overrides"}
                              className={`h-6 w-11 rounded-full p-0 ${
                                rule.type !== "overrides"
                                  ? "bg-slate-600/50 cursor-not-allowed opacity-50"
                                  : rule.enabled
                                    ? "bg-cyan-500 hover:bg-cyan-600"
                                    : "bg-slate-600 hover:bg-slate-500"
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                                  rule.type !== "overrides"
                                    ? "-translate-x-2.5 opacity-60"
                                    : rule.enabled
                                      ? "translate-x-2.5"
                                      : "-translate-x-2.5"
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteRule(rule.id)
                              }}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredRules.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        {searchTerm
                          ? "No rules match your search."
                          : 'No rules created yet. Click "New Rule" to get started.'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rule Editor */}
            <div className="lg:col-span-2">
              {editingRuleId !== null ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-100">
                      {rules.find((r) => r.id === editingRuleId) ? "Edit Rule" : "Create New Rule"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Configure how API requests should be intercepted and modified
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      value={rules.find((r) => r.id === editingRuleId)?.type}
                      onValueChange={(value) => {
                        const rule = rules.find((r) => r.id === editingRuleId)
                        if (rule) {
                          setRules(
                            rules.map((r) => (r.id === editingRuleId ? { ...rule, type: value } : r)),
                          )
                        }
                      }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="rule-name" className="text-slate-200">
                              Rule Name
                            </Label>
                            <Input
                              id="rule-name"
                              value={rules.find((r) => r.id === editingRuleId)?.name}
                              onChange={(e) => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, name: e.target.value } : r)),
                                  )
                                }
                              }}
                              className="bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-200">Template</Label>
                            <Select onValueChange={() => {}}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue placeholder="Choose template (optional)" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600">
                                <SelectItem value="api-mock" className="text-slate-100 focus:bg-slate-700">
                                  <div>
                                    <div className="font-medium">API Mock</div>
                                    <div className="text-xs text-slate-400">Mock API responses</div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="cors-bypass" className="text-slate-100 focus:bg-slate-700">
                                  <div>
                                    <div className="font-medium">CORS Bypass</div>
                                    <div className="text-xs text-slate-400">Add CORS headers</div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="auth-header" className="text-slate-100 focus:bg-slate-700">
                                  <div>
                                    <div className="font-medium">Auth Header</div>
                                    <div className="text-xs text-slate-400">Add authorization</div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="redirect-prod" className="text-slate-100 focus:bg-slate-700">
                                  <div>
                                    <div className="font-medium">Prod to Dev</div>
                                    <div className="text-xs text-slate-400">Redirect to dev server</div>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-200">Rule Type</Label>
                          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                            <TabsTrigger
                              value="overrides"
                              onClick={() => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, type: "overrides" } : r)),
                                  )
                                }
                              }}
                              disabled={!!(lockedTab && lockedTab !== "overrides")}
                              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Overrides
                            </TabsTrigger>
                            <TabsTrigger
                              value="redirect"
                              onClick={() => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, type: "redirect" } : r)),
                                  )
                                }
                              }}
                              disabled={!!(lockedTab && lockedTab !== "redirect")}
                              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Redirect
                            </TabsTrigger>
                            <TabsTrigger
                              value="headers"
                              onClick={() => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, type: "headers" } : r)),
                                  )
                                }
                              }}
                              disabled={!!(lockedTab && lockedTab !== "headers")}
                              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Headers
                            </TabsTrigger>
                          </TabsList>
                          {lockedTab && (
                            <p className="text-xs text-cyan-400 mt-1">
                              Template selected - rule type is locked to {lockedTab}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="source-url" className="text-slate-200">
                            Source URL Pattern
                          </Label>
                          <Input
                            id="source-url"
                            value={rules.find((r) => r.id === editingRuleId)?.source}
                            onChange={(e) => {
                              const rule = rules.find((r) => r.id === editingRuleId)
                              if (rule) {
                                setRules(
                                  rules.map((r) => (r.id === editingRuleId ? { ...rule, source: e.target.value } : r)),
                                )
                              }
                            }}
                            placeholder="https://example.com/*"
                            className="bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                          />
                          <p className="text-xs text-slate-400">
                            Use * as wildcard, e.g., https://api.example.com/* matches all paths
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-slate-200">
                            Description
                          </Label>
                          <Input
                            id="description"
                            value={rules.find((r) => r.id === editingRuleId)?.description}
                            onChange={(e) => {
                              const rule = rules.find((r) => r.id === editingRuleId)
                              if (rule) {
                                setRules(
                                  rules.map((r) => (r.id === editingRuleId ? { ...rule, description: e.target.value } : r)),
                                )
                              }
                            }}
                            className="bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                          />
                        </div>
                      </div>

                      <TabsContent value="redirect" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="destination-url" className="text-slate-200">
                            Destination URL
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="destination-url"
                              value={rules.find((r) => r.id === editingRuleId)?.destination || ""}
                              onChange={(e) => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, destination: e.target.value } : r)),
                                  )
                                }
                              }}
                              placeholder="https://new-example.com/$1"
                              disabled={true}
                              className="bg-slate-700/50 border-slate-600 text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 cursor-not-allowed"
                            />
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                          </div>
                          <p className="text-xs text-slate-400">
                            Use $1, $2, etc. to reference captured groups from the source URL
                          </p>
                          <div className="mt-4 p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
                            <p className="text-sm text-slate-400 text-center">
                              🚧 URL Redirection feature is coming soon! Stay tuned for updates.
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="headers" className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-slate-200">Headers</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {}}
                              disabled={true}
                              className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-100 cursor-not-allowed opacity-50"
                            >
                              <PlusCircle className="mr-2 h-3 w-3" /> Add Header
                            </Button>
                          </div>

                          {rules.find((r) => r.id === editingRuleId)?.headers &&
                            rules
                              .find((r) => r.id === editingRuleId)
                              ?.headers.map((header, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-3">
                                    <Select
                                      value={header.operation}
                                      onValueChange={() => {}}
                                      disabled={true}
                                    >
                                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-400 cursor-not-allowed">
                                        <SelectValue placeholder="Operation" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-800 border-slate-600">
                                        <SelectItem value="add" className="text-slate-100">
                                          Add
                                        </SelectItem>
                                        <SelectItem value="modify" className="text-slate-100">
                                          Modify
                                        </SelectItem>
                                        <SelectItem value="remove" className="text-slate-100">
                                          Remove
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-4">
                                    <Input
                                      value={header.name}
                                      onChange={() => {}}
                                      placeholder="Header name"
                                      disabled={true}
                                      className="bg-slate-700/50 border-slate-600 text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="col-span-4">
                                    <Input
                                      value={header.value}
                                      onChange={() => {}}
                                      placeholder="Header value"
                                      disabled={true}
                                      className="bg-slate-700/50 border-slate-600 text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {}}
                                      disabled={true}
                                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-not-allowed opacity-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}

                          <div className="mt-4 p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
                            <p className="text-sm text-slate-400 text-center">
                              🚧 Header Modification feature is coming soon! Stay tuned for updates.
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="overrides" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="status-code" className="text-slate-200">
                              Status Code
                            </Label>
                            <Input
                              id="status-code"
                              type="number"
                              value={rules.find((r) => r.id === editingRuleId)?.responseCode || 200}
                              onChange={(e) => {
                                const rule = rules.find((r) => r.id === editingRuleId)
                                if (rule) {
                                  setRules(
                                    rules.map((r) => (r.id === editingRuleId ? { ...rule, responseCode: Number.parseInt(e.target.value) } : r)),
                                  )
                                }
                              }}
                              className="bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="content-type" className="text-slate-200">
                              Content Type
                            </Label>
                            <Select defaultValue="application/json">
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                                <SelectValue placeholder="Content Type" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600">
                                <SelectItem value="application/json" className="text-slate-100">
                                  application/json
                                </SelectItem>
                                <SelectItem value="text/html" className="text-slate-100">
                                  text/html
                                </SelectItem>
                                <SelectItem value="text/plain" className="text-slate-100">
                                  text/plain
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="response-body" className="text-slate-200">
                            Response Body
                          </Label>
                          <Textarea
                            id="response-body"
                            className="font-mono text-sm h-40 bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                            value={rules.find((r) => r.id === editingRuleId)?.responseBody || '{\n  "success": true,\n  "data": {}\n}'}
                            onChange={(e) => {
                              const rule = rules.find((r) => r.id === editingRuleId)
                              if (rule) {
                                setRules(
                                  rules.map((r) => (r.id === editingRuleId ? { ...rule, responseBody: e.target.value } : r)),
                                )
                              }
                            }}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-700">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          const rule = rules.find((r) => r.id === editingRuleId)
                          if (rule) {
                            handleSaveRule(rule)
                          }
                        }}
                        disabled={rules.find((r) => r.id === editingRuleId)?.type !== "overrides"}
                        className={`${
                          rules.find((r) => r.id === editingRuleId)?.type !== "overrides"
                            ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900"
                        } font-semibold shadow-lg shadow-cyan-500/25`}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {rules.find((r) => r.id === editingRuleId)?.type !== "overrides" ? "Coming Soon" : "Save Rule"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer - Full Width & Snapped to Bottom */}
      <footer className="bg-slate-950 text-slate-300 py-8 px-6 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/icons/icon48.png" alt="Interzept" width={32} height={32} className="h-8 w-8" />
                <span className="text-xl font-bold text-white">Interzept</span>
              </div>
              <p className="text-sm text-slate-400 max-w-md">
                The ultimate tool for intercepting and modifying network requests. Built for developers who need to
                test, debug, and develop web applications more efficiently.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-slate-100 mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="https://interzept.dev/docs"
                      className="text-slate-400 hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/interzeptdev/interzept"
                      className="text-slate-400 hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://interzept.dev/support"
                      className="text-slate-400 hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Support
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-100 mb-3">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="https://interzept.dev/terms"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://interzept.dev/privacy"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm">
            <p>&copy; 2025 Interzept. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

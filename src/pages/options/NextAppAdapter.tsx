"use client"

import React, { useState, useEffect } from "react"
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

// Define interfaces matching your Next.js app
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

// Convert between Chrome Extension rule format and our app's rule format
const chromeRuleToAppRule = (chromeRule: any): Rule => {
  // Extract the response type and body from data URL
  let responseType = 'application/json';
  let responseBody = '{}';
  
  if (chromeRule.action?.redirect?.url) {
    const dataUrl = chromeRule.action.redirect.url;
    if (dataUrl.startsWith('data:')) {
      const [typeInfo, encodedBody] = dataUrl.substring(5).split(',');
      responseType = typeInfo;
      responseBody = decodeURIComponent(encodedBody);
    }
  }

  return {
    id: chromeRule.id,
    name: chromeRule.urlPattern || "Rule " + chromeRule.id,
    type: "overrides",
    source: chromeRule.urlPattern,
    responseCode: 200,
    responseBody: responseBody,
    responseHeaders: [{ name: "Content-Type", value: responseType }],
    enabled: true,
    description: "Imported from Chrome extension"
  };
};

const appRuleToChromeRule = (appRule: Rule): any => {
  // Create data URL for response
  const responseType = appRule.responseHeaders?.find(h => h.name.toLowerCase() === 'content-type')?.value || 'application/json';
  const dataUrl = `data:${responseType},${encodeURIComponent(appRule.responseBody || '{}')}`;
  
  return {
    id: appRule.id,
    priority: 1,
    condition: {
      urlFilter: appRule.source,
      resourceTypes: ["xmlhttprequest", "main_frame", "sub_frame"]
    },
    action: {
      type: "redirect",
      redirect: {
        url: dataUrl
      }
    }
  };
};

// Store for Chrome extension storage
const ChromeStorage = {
  loadRules: async (): Promise<Rule[]> => {
    try {
      const result = await chrome.storage.local.get(['overrideRules']);
      const chromeRules = result.overrideRules || [];
      return chromeRules.map(chromeRuleToAppRule);
    } catch (error) {
      console.error('Error loading rules:', error);
      return [];
    }
  },
  
  saveRules: async (rules: Rule[]): Promise<void> => {
    try {
      // Save in our app format
      const chromeRules = rules.map(rule => ({
        id: rule.id,
        urlPattern: rule.source,
        responseType: rule.responseHeaders?.find(h => h.name.toLowerCase() === 'content-type')?.value || 'application/json',
        responseBody: rule.responseBody || '{}',
        created: new Date().toISOString()
      }));
      
      await chrome.storage.local.set({ overrideRules: chromeRules });
      
      // Update declarativeNetRequest rules
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const existingRuleIds = existingRules.map(rule => rule.id);
      
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: rules.map(appRuleToChromeRule)
      });
    } catch (error) {
      console.error('Error saving rules:', error);
    }
  }
};

const NextAppAdapter: React.FC = () => {
  const [activeTab, setActiveTab] = useState("rules")
  const [rules, setRules] = useState<Rule[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null)
  const [lockedTab, setLockedTab] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: string } | null>(null)

  // Filter rules based on search term
  const filteredRules = rules.filter((rule) =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rule.source.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Load rules from Chrome storage on mount
  useEffect(() => {
    const loadRulesFromChromeStorage = async () => {
      const loadedRules = await ChromeStorage.loadRules();
      setRules(loadedRules);
    };
    
    loadRulesFromChromeStorage();
  }, []);

  // Save rules to Chrome storage on change
  useEffect(() => {
    if (rules.length > 0) {
      ChromeStorage.saveRules(rules);
    }
  }, [rules]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleEditRule = (rule: Rule) => {
    setEditingRuleId(rule.id)
    setActiveTab("edit")
  }

  const handleDeleteRule = async (id: number) => {
    try {
      // Remove from Chrome's declarativeNetRequest
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [id]
      });
      
      setRules(rules.filter((rule) => rule.id !== id))
      showStatus('Rule deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting rule:', error);
      showStatus(`Error: ${(error as Error).message}`, 'error');
    }
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
    showStatus('Rule saved successfully!', 'success');
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
    // Create new rule ID
    const existingIds = rules.map(rule => rule.id);
    let newRuleId = 1000;
    while (existingIds.includes(newRuleId)) {
      newRuleId++;
      if (newRuleId >= 10000) newRuleId = 1000;
    }
    
    const newRule: Rule = {
      id: newRuleId,
      name: "New Override Rule",
      type: "overrides",
      source: "",
      responseCode: 200,
      responseBody: '{\n  "success": true,\n  "data": {}\n}',
      responseHeaders: [{ name: "Content-Type", value: "application/json" }],
      enabled: true,
      description: ""
    }
    
    setEditingRuleId(newRule.id)
    setActiveTab("edit")
    
    // Use a temporary rule object for editing
    setRules([...rules, newRule])
  }

  const handleExportRules = async () => {
    try {
      if (rules.length === 0) {
        showStatus('No rules to export!', 'error');
        return;
      }
      
      // Create a JSON blob
      const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `interzept_rules_${new Date().toISOString().slice(0, 10)}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showStatus(`Exported ${rules.length} rules`, 'success');
    } catch (error) {
      console.error('Error exporting rules:', error);
      showStatus(`Error exporting rules: ${(error as Error).message}`, 'error');
    }
  }

  const handleImportRules = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importedRules = JSON.parse(text);
        
        if (!Array.isArray(importedRules)) {
          showStatus('Invalid rules file format!', 'error');
          return;
        }
        
        // Process imported rules
        const existingIds = rules.map(rule => rule.id);
        const processedRules = importedRules.map((rule: any) => {
          // Ensure ID doesn't conflict
          let newId = rule.id;
          while (existingIds.includes(newId)) {
            newId = Math.floor(Math.random() * 8999) + 1000; // ID between 1000-9999
          }
          existingIds.push(newId);
          
          return {
            ...rule,
            id: newId
          };
        });
        
        setRules([...rules, ...processedRules]);
        showStatus(`Imported ${processedRules.length} rules successfully!`, 'success');
      } catch (e) {
        showStatus(`Error parsing rules file: ${(e as Error).message}`, 'error');
      }
    };
    
    fileInput.click();
  };

  const showStatus = (text: string, type: string) => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  // Find the rule being edited
  const editingRule = rules.find(rule => rule.id === editingRuleId) || {
    id: 0,
    name: "New Rule",
    type: "overrides",
    source: "",
    responseCode: 200,
    responseBody: '{\n  "success": true,\n  "data": {}\n}',
    responseHeaders: [{ name: "Content-Type", value: "application/json" }],
    enabled: true,
    description: ""
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mb-6">
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <div className="flex flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex flex-1 items-center gap-2">
            <h1 className="text-lg font-semibold">Interzept</h1>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search rules..."
                className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </header>
        
        {statusMessage && (
          <div className={`p-3 mb-4 mx-4 mt-4 rounded ${
            statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {statusMessage.text}
          </div>
        )}
        
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <Tabs defaultValue="rules" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="rules" disabled={!!lockedTab && lockedTab !== "rules"}>
                  Rules
                </TabsTrigger>
                <TabsTrigger value="edit" disabled={!!lockedTab && lockedTab !== "edit"}>
                  {editingRuleId ? "Edit Rule" : "New Rule"}
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={handleImportRules}
                >
                  <Upload className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">Import</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={handleExportRules}
                  disabled={rules.length === 0}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">Export</span>
                </Button>
                <Button variant="outline" className="gap-1" onClick={handleCreateNewRule}>
                  <PlusCircle className="h-4 w-4" />
                  <span>New Rule</span>
                </Button>
              </div>
            </div>
            
            <TabsContent value="rules">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRules.length === 0 ? (
                  <div className="md:col-span-2 lg:col-span-3">
                    <Card>
                      <CardContent className="py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <Zap className="h-10 w-10 text-muted-foreground" />
                          </div>
                          <h3 className="mt-4 text-lg font-semibold">No Rules Found</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {searchTerm
                              ? "No rules match your search. Try a different term."
                              : "Get started by creating your first request rule."}
                          </p>
                          <Button className="mt-4 gap-1" onClick={handleCreateNewRule}>
                            <PlusCircle className="h-4 w-4" />
                            <span>Create Rule</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  filteredRules.map((rule) => (
                    <Card key={rule.id} className={rule.enabled ? "" : "opacity-70"}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getRuleTypeIcon(rule.type)}
                            <CardTitle className="text-base">{rule.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleRuleToggle(rule.id)}
                              title={rule.enabled ? "Disable rule" : "Enable rule"}
                            >
                              {rule.enabled ? (
                                <Zap className="h-4 w-4 text-primary" />
                              ) : (
                                <Zap className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">{rule.enabled ? "Disable" : "Enable"}</span>
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="truncate" title={rule.source}>
                          {rule.source}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-xs text-muted-foreground">
                          {rule.description || "No description provided"}
                        </div>
                      </CardContent>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="text-xs">
                            {rule.type === "overrides" && (
                              <div className="flex items-center gap-1">
                                <span>Response: {rule.responseCode}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDeleteRule(rule.id)}
                              title="Delete rule"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditRule(rule)}
                              title="Edit rule"
                            >
                              <Settings className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="edit">
              <Card>
                <CardHeader>
                  <Breadcrumb className="mb-2">
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#" onClick={() => setActiveTab("rules")}>
                          Rules
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{editingRuleId ? "Edit Rule" : "New Rule"}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  <CardTitle>{editingRuleId ? "Edit Rule" : "Create New Rule"}</CardTitle>
                  <CardDescription>
                    Configure your request interception rule.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-5">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Rule Name</Label>
                      <Input
                        id="name"
                        placeholder="API Override"
                        value={editingRule.name}
                        onChange={(e) => 
                          setRules(rules.map(r => 
                            r.id === editingRuleId ? { ...r, name: e.target.value } : r
                          ))
                        }
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Input
                        id="description"
                        placeholder="Briefly describe this rule"
                        value={editingRule.description}
                        onChange={(e) => 
                          setRules(rules.map(r => 
                            r.id === editingRuleId ? { ...r, description: e.target.value } : r
                          ))
                        }
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="url-pattern">URL Pattern</Label>
                    <Input
                      id="url-pattern"
                      placeholder="e.g. *://api.example.com/users*"
                      value={editingRule.source}
                      onChange={(e) => 
                        setRules(rules.map(r => 
                          r.id === editingRuleId ? { ...r, source: e.target.value } : r
                        ))
                      }
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Use * for wildcards, e.g. *://example.com/* matches http and https
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="responseType">Response Type</Label>
                    <Select 
                      value={editingRule.responseHeaders?.[0]?.value || 'application/json'} 
                      onValueChange={(value) => {
                        setRules(rules.map(r => {
                          if (r.id === editingRuleId) {
                            const headers = [...(r.responseHeaders || [])];
                            const contentTypeIndex = headers.findIndex(h => h.name.toLowerCase() === 'content-type');
                            
                            if (contentTypeIndex >= 0) {
                              headers[contentTypeIndex] = { ...headers[contentTypeIndex], value };
                            } else {
                              headers.push({ name: 'Content-Type', value });
                            }
                            
                            return { ...r, responseHeaders: headers };
                          }
                          return r;
                        }));
                      }}
                    >
                      <SelectTrigger id="responseType">
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="application/json">JSON</SelectItem>
                        <SelectItem value="text/plain">Plain Text</SelectItem>
                        <SelectItem value="text/html">HTML</SelectItem>
                        <SelectItem value="text/javascript">JavaScript</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="response-body">Response Body</Label>
                    <Textarea
                      id="response-body"
                      className="font-mono h-48"
                      placeholder='{
  "success": true,
  "data": {}
}'
                      value={editingRule.responseBody || ''}
                      onChange={(e) => 
                        setRules(rules.map(r => 
                          r.id === editingRuleId ? { ...r, responseBody: e.target.value } : r
                        ))
                      }
                    />
                  </div>
                </CardContent>
                <div className="flex items-center justify-end space-x-4 border-t px-6 py-4">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSaveRule(editingRule as Rule)}>
                    <Save className="mr-1 h-4 w-4" />
                    Save Rule
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NextAppAdapter;

import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Trash2,
  Save,
  Globe,
  ArrowRight,
  FileJson,
  Heading as Headers,
  Search,
  Download,
  Upload,
  Zap,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ThemeProvider } from "@/components/theme-provider";
import { Rule } from "../shared/types/rules";
import { useRules } from "../shared/hooks/useRules";
import { isMobile, generateId } from "../shared/utils/helpers";
import "@/styles/globals.css";

// Set page title
document.title = "Interzept Options - API Request Interceptor";

// Environment detection and Chrome API handling
declare global {
  interface Window {
    chrome?: any;
  }
}

const isExtensionEnvironment = () => {
  return typeof window !== 'undefined' && 
         typeof window.chrome !== 'undefined' && 
         window.chrome.runtime && 
         window.chrome.runtime.id;
};

// Mock chrome APIs for standalone development
const mockChrome = {
  storage: {
    local: {
      get: (keys: any) => Promise.resolve({}),
      set: (items: any) => Promise.resolve(),
    }
  },
  runtime: {
    sendMessage: (message: any) => Promise.resolve(),
  }
};

// Use real chrome API in extension, mock in standalone
const chromeAPI = isExtensionEnvironment() ? window.chrome : mockChrome;

// Rule Templates
const ruleTemplates = {
  "api-mock": {
    name: "API Mock Response",
    type: "overrides" as const,
    enabled: true,
    source: "*/api/users",
    responseBody: '{\n  "success": true,\n  "data": [\n    {"id": 1, "name": "John Doe"},\n    {"id": 2, "name": "Jane Smith"}\n  ]\n}',
    responseCode: 200,
    responseHeaders: [{ name: "Content-Type", value: "application/json" }],
    description: "Mock API response with sample user data",
  },
  "cors-bypass": {
    name: "CORS Bypass Headers",
    type: "headers" as const,
    enabled: true,
    source: "*/api/*",
    headers: [
      { name: "Access-Control-Allow-Origin", value: "*", operation: "add" },
      { name: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE", operation: "add" },
      { name: "Access-Control-Allow-Headers", value: "Content-Type, Authorization", operation: "add" },
    ],
    description: "Add CORS headers to bypass restrictions",
  },
  "auth-header": {
    name: "Authorization Header",
    type: "headers" as const,
    enabled: true,
    source: "*/api/*",
    headers: [{ name: "Authorization", value: "Bearer your-token-here", operation: "add" }],
    description: "Automatically add authorization header to requests",
  },
  "redirect-prod": {
    name: "Production to Development",
    type: "redirect" as const,
    enabled: true,
    source: "https://api.production.com/*",
    destination: "http://localhost:3000/*",
    description: "Redirect production API calls to local development server",
  },
};

// Mobile Not Supported Component
const MobileNotSupported = () => (
  <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
    <div className="max-w-md text-center">
      <div className="mb-6">
        <img src="/icons/icon128.png" alt="Interzept" className="h-16 w-16 mx-auto mb-4" />
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
          className="block w-full border border-slate-600 text-slate-300 hover:bg-slate-700 py-3 px-4 rounded-lg transition-all"
        >
          Download Extension
        </a>
      </div>
    </div>
  </div>
);

// Main Component
export default function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [filteredRules, setFilteredRules] = useState<Rule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [activeRule, setActiveRule] = useState<Rule | null>(null);
  const [lockedTab, setLockedTab] = useState<string | null>(null);

  // Filter rules based on search
  useEffect(() => {
    if (searchQuery) {
      const filtered = rules.filter(
        (rule) =>
          rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rule.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rule.source.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredRules(filtered);
    } else {
      setFilteredRules(rules);
    }
  }, [rules, searchQuery]);

  // Load rules from localStorage when component mounts
  useEffect(() => {
    const savedRules = localStorage.getItem("interzept-rules");
    if (savedRules) {
      try {
        const parsedRules = JSON.parse(savedRules);
        setRules(parsedRules);
      } catch (error) {
        console.error("Error loading saved rules:", error);
      }
    }
  }, []);

  // Save rules to localStorage when they change
  useEffect(() => {
    localStorage.setItem("interzept-rules", JSON.stringify(rules));
  }, [rules]);

  const handleRuleToggle = (id: string) => {
    const rule = rules.find((r) => r.id === id);
    if (rule && rule.type !== "overrides") {
      return; // Don't allow toggling non-override rules
    }
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)));
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const handleEditRule = (rule: Rule) => {
    setActiveRule(rule);
    setEditMode(true);
    setLockedTab(null); // Allow free tab switching for existing rules
  };

  const handleNewRule = () => {
    const newRule: Rule = {
      id: Date.now().toString(),
      name: "New Rule",
      type: "overrides",
      enabled: true,
      source: "",
      responseBody: '{\n  "success": true,\n  "data": {}\n}',
      responseCode: 200,
      responseHeaders: [{ name: "Content-Type", value: "application/json" }],
      description: "",
    };
    setActiveRule(newRule);
    setEditMode(true);
    setLockedTab(null); // Allow free tab switching for manual rules
  };
  const createRuleFromTemplate = (templateId: string) => {
    const template = ruleTemplates[templateId as keyof typeof ruleTemplates];
    if (!template) return;

    const newRule: Rule = {
      id: Date.now().toString(),
      ...template,
    };
    setActiveRule(newRule);
    setEditMode(true);

    // Lock the tab to match template type - don't allow switching
    setLockedTab(template.type);

    // Navigate to the correct tab immediately
    setTimeout(() => {
      const tabTrigger = document.querySelector(`[value="${template.type}"]`);
      if (tabTrigger) {
        (tabTrigger as HTMLElement).click();
      }
    }, 0);
  };

  const saveRule = () => {
    if (!activeRule) return;

    // Prevent saving non-override rules
    if (activeRule.type !== "overrides") {
      alert("Only Override rules can be saved at this time. Redirect and Headers features are coming soon!");
      return;
    }

    // Check if this is a new rule or an edit
    const isNewRule = !rules.some((rule) => rule.id === activeRule.id);

    if (isNewRule) {
      setRules([...rules, activeRule]);
    } else {
      setRules(rules.map((rule) => (rule.id === activeRule.id ? activeRule : rule)));
    }

    setEditMode(false);
    setActiveRule(null);
    setLockedTab(null);
  };

  const updateActiveRule = (field: string, value: any) => {
    if (!activeRule) return;
    setActiveRule({
      ...activeRule,
      [field]: value,
    });
  };

  const updateNestedField = (parentField: string, index: number, field: string, value: any) => {
    if (!activeRule || !activeRule[parentField as keyof Rule]) return;

    const updatedArray = [...(activeRule[parentField as keyof Rule] as any[])];
    updatedArray[index] = {
      ...updatedArray[index],
      [field]: value,
    };

    setActiveRule({
      ...activeRule,
      [parentField]: updatedArray,
    });
  };

  const addHeader = () => {
    if (!activeRule) return;

    const headers = activeRule.headers || [];
    setActiveRule({
      ...activeRule,
      headers: [...headers, { name: "", value: "", operation: "add" }],
    });
  };

  const removeHeader = (index: number) => {
    if (!activeRule || !activeRule.headers) return;

    const headers = [...activeRule.headers];
    headers.splice(index, 1);

    setActiveRule({
      ...activeRule,
      headers: headers,
    });
  };

  const exportRules = () => {
    const dataStr = JSON.stringify(rules, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `interzept-rules-${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const importRules = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedRules = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedRules)) {
          const maxId = Math.max(0, ...rules.map((r) => parseInt(r.id)));
          const newRules = importedRules.map((rule: any, index: number) => ({
            ...rule,
            id: (maxId + index + 1).toString(),
          }));

          setRules([...rules, ...newRules]);
          alert(`Successfully imported ${newRules.length} rules!`);
        } else {
          alert("Invalid file format. Please select a valid JSON file.");
        }
      } catch (error) {
        alert("Error parsing file. Please select a valid JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case "redirect":
        return <Globe className="h-4 w-4" />;
      case "headers":
        return <Headers className="h-4 w-4" />;
      case "overrides":
        return <FileJson className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  // Replace the existing return statement with:
  if (isMobile()) {
    return <MobileNotSupported />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <img src="/icons/icon128.png" alt="Interzept" className="h-8 w-8" />
                  <span className="text-xl font-bold text-slate-100">Interzept</span>
                </div>                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search rules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>
              </div>

              {/* Import/Export */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={exportRules}
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
                <input id="import-file" type="file" accept=".json" onChange={importRules} className="hidden" aria-label="Import rules file" />

                <Button
                  onClick={handleNewRule}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 font-semibold shadow-lg shadow-cyan-500/25"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Rule
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 pb-8">
          <div className="container mx-auto py-8 px-6">
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
                                  e.stopPropagation();
                                  if (rule.type === "overrides") {
                                    handleRuleToggle(rule.id);
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
                                      ? "-translate-x-2.5 opacity-60" // Always show as "off" for disabled rules
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
                                  e.stopPropagation();
                                  handleDeleteRule(rule.id);
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
                          {searchQuery
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
                {editMode && activeRule ? (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-100">
                        {rules.some((r) => r.id === activeRule.id) ? "Edit Rule" : "Create New Rule"}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Configure how API requests should be intercepted and modified
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs
                        value={activeRule.type}
                        onValueChange={(value) => updateActiveRule("type", value)}
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
                                value={activeRule.name}
                                onChange={(e) => updateActiveRule("name", e.target.value)}
                                className="bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-200">Template</Label>
                              <Select onValueChange={createRuleFromTemplate}>
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
                                onClick={() => updateActiveRule("type", "overrides")}
                                disabled={!!(lockedTab && lockedTab !== "overrides")}
                                className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Overrides
                              </TabsTrigger>                              <TabsTrigger
                                value="redirect"
                                onClick={() => updateActiveRule("type", "redirect")}
                                disabled={!!(lockedTab && lockedTab !== "redirect")}
                                className="data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Redirect
                              </TabsTrigger>
                              <TabsTrigger
                                value="headers"
                                onClick={() => updateActiveRule("type", "headers")}
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
                              value={activeRule.source}
                              onChange={(e) => updateActiveRule("source", e.target.value)}
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
                              value={activeRule.description}
                              onChange={(e) => updateActiveRule("description", e.target.value)}
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
                                value={activeRule.destination || ""}
                                onChange={(e) => updateActiveRule("destination", e.target.value)}
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
                                onClick={addHeader}
                                disabled={true}
                                className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-100 cursor-not-allowed opacity-50"
                              >
                                <PlusCircle className="mr-2 h-3 w-3" /> Add Header
                              </Button>
                            </div>

                            {activeRule.headers &&
                              activeRule.headers.map((header, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-3">
                                    <Select
                                      value={header.operation}
                                      onValueChange={(value) => updateNestedField("headers", index, "operation", value)}
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
                                      onChange={(e) => updateNestedField("headers", index, "name", e.target.value)}
                                      placeholder="Header name"
                                      disabled={true}
                                      className="bg-slate-700/50 border-slate-600 text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="col-span-4">
                                    <Input
                                      value={header.value}
                                      onChange={(e) => updateNestedField("headers", index, "value", e.target.value)}
                                      placeholder="Header value"
                                      disabled={true}
                                      className="bg-slate-700/50 border-slate-600 text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeHeader(index)}
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
                                value={activeRule.responseCode || 200}
                                onChange={(e) => updateActiveRule("responseCode", Number.parseInt(e.target.value))}
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
                              value={activeRule.responseBody || '{\n  "success": true,\n  "data": {}\n}'}
                              onChange={(e) => updateActiveRule("responseBody", e.target.value)}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-700">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditMode(false);
                            setLockedTab(null);
                          }}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={saveRule}
                          disabled={activeRule?.type !== "overrides"}
                          className={`${
                            activeRule?.type !== "overrides"
                              ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900"
                          } font-semibold shadow-lg shadow-cyan-500/25`}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {activeRule?.type !== "overrides" ? "Coming Soon" : "Save Rule"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="py-12 text-center">
                      <FileJson className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                      <h3 className="text-xl font-semibold text-slate-100 mb-2">Welcome to Interzept</h3>
                      <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Create your first rule to start intercepting and modifying API requests. Choose from templates or
                        create custom rules.
                      </p>
                      <Button
                        onClick={handleNewRule}
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 font-semibold"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Your First Rule
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Full Width & Snapped to Bottom */}
        <footer className="bg-slate-950 text-slate-300 py-8 px-6 border-t border-slate-800">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <img src="/icons/icon48.png" alt="Interzept" className="h-8 w-8" />
                  <span className="text-xl font-bold text-white">Interzept</span>
                </div>
                <p className="text-sm text-slate-400 max-w-md">
                  The ultimate tool for intercepting and modifying network requests. Built for developers who need to
                  test, debug, and develop web applications more efficiently.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="https://interzept.dev"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://interzept.dev/#features"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://interzept.dev/#download"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
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

            <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm">
              <p>&copy; 2025 Interzept. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

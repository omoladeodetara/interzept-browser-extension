import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Zap, 
  CheckCircle, 
  Circle,
  ExternalLink
} from "lucide-react";
import { rulesStorage } from "../shared/utils/storage";
import { Rule } from "../shared/types/rules";

// Chrome extension API declaration
declare const chrome: any;

export default function Popup() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [activeRulesCount, setActiveRulesCount] = useState(0);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const savedRules = await rulesStorage.load();
      setRules(savedRules);
      setActiveRulesCount(savedRules.filter(rule => rule.enabled && rule.type === 'overrides').length);
    } catch (error) {
      console.error('Failed to load rules:', error);
    }
  };

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  const toggleRule = async (ruleId: string) => {
    try {
      const updatedRules = rules.map(rule => 
        rule.id === ruleId && rule.type === 'overrides' 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      );
      await rulesStorage.save(updatedRules);
      setRules(updatedRules);
      setActiveRulesCount(updatedRules.filter(rule => rule.enabled && rule.type === 'overrides').length);
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  // Only show override rules (since other types aren't functional yet)
  const overrideRules = rules.filter(rule => rule.type === 'overrides');

  return (
    <div className="w-80 min-h-96 bg-slate-900 text-slate-100">
      <Card className="border-0 bg-slate-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              Interzept
            </CardTitle>
            <Badge 
              variant={activeRulesCount > 0 ? "default" : "secondary"}
              className={activeRulesCount > 0 ? "bg-cyan-500 text-slate-900" : "bg-slate-700 text-slate-300"}
            >
              {activeRulesCount} active
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-cyan-400">{overrideRules.length}</div>
              <div className="text-slate-400">Total Rules</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-green-400">{activeRulesCount}</div>
              <div className="text-slate-400">Active</div>
            </div>
          </div>

          {/* Recent Rules */}
          {overrideRules.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-300">Recent Rules</h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {overrideRules.slice(0, 4).map((rule) => (
                  <div 
                    key={rule.id}
                    className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className="text-slate-400 hover:text-cyan-400"
                      >
                        {rule.enabled ? (
                          <CheckCircle className="h-4 w-4 text-cyan-400" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <span className={`truncate ${rule.enabled ? 'text-slate-200' : 'text-slate-500'}`}>
                        {rule.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No rules created yet</p>
              <p className="text-xs">Click below to get started</p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-slate-800">
            <Button 
              onClick={openOptionsPage}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 font-semibold"
            >
              <Settings className="mr-2 h-4 w-4" />
              Open Interzept Options
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

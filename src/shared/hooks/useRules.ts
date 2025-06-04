import { useState, useEffect } from "react";
import { Rule } from "../types/rules";
import { rulesStorage } from "../utils/storage";
import { generateId } from "../utils/helpers";

export const useRules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load rules on mount
  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);
        const savedRules = await rulesStorage.load();
        setRules(savedRules);
      } catch (err) {
        setError("Failed to load rules");
        console.error("Error loading rules:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  // Save rules when they change
  useEffect(() => {
    if (!loading) {
      rulesStorage.save(rules).catch((err) => {
        setError("Failed to save rules");
        console.error("Error saving rules:", err);
      });
    }
  }, [rules, loading]);

  const addRule = (rule: Rule) => {
    setRules((prev) => [...prev, rule]);
  };

  const updateRule = (id: string, updates: Partial<Rule>) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
    );
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  const toggleRule = (id: string) => {
    updateRule(id, { enabled: !rules.find((r) => r.id === id)?.enabled });
  };

  const createNewRule = (): Rule => ({
    id: generateId(),
    name: "New Rule",
    type: "overrides",
    enabled: true,
    source: "",
    responseBody: '{\n  "success": true,\n  "data": {}\n}',
    responseCode: 200,
    responseHeaders: [{ name: "Content-Type", value: "application/json" }],
    description: "",
  });

  const exportRules = async (): Promise<void> => {
    try {
      const dataStr = await rulesStorage.export();
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `interzept-rules-${new Date().toISOString().split("T")[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to export rules");
      console.error("Error exporting rules:", err);
    }
  };

  const importRules = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const importedRules = await rulesStorage.import(text);
      
      // Generate new IDs to avoid conflicts
      const maxId = Math.max(0, ...rules.map((r) => parseInt(r.id) || 0));
      const newRules = importedRules.map((rule, index) => ({
        ...rule,
        id: (maxId + index + 1).toString(),
      }));

      setRules((prev) => [...prev, ...newRules]);
      return Promise.resolve();
    } catch (err) {
      setError("Failed to import rules");
      console.error("Error importing rules:", err);
      throw err;
    }
  };

  return {
    rules,
    loading,
    error,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    createNewRule,
    exportRules,
    importRules,
    clearError: () => setError(null),
  };
};

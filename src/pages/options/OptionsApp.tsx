import React, { useState, useEffect } from 'react';

interface Rule {
  id: number;
  urlPattern: string;
  responseType: string;
  responseBody: string;
  created: string;
}

const OptionsApp: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [urlPattern, setUrlPattern] = useState('');
  const [responseType, setResponseType] = useState('application/json');
  const [responseBody, setResponseBody] = useState('{\n  "message": "Custom response"\n}');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: string } | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const result = await chrome.storage.local.get(['overrideRules']);
      setRules(result.overrideRules || []);
    } catch (error) {
      console.error('Error loading rules:', error);
      showStatus('Error loading rules', 'error');
    }
  };

  const addRule = async () => {
    try {
      if (!urlPattern || !responseBody) {
        showStatus('Please fill in all fields!', 'error');
        return;
      }

      // Validate JSON if it's JSON type
      if (responseType === 'application/json') {
        try {
          JSON.parse(responseBody);
        } catch (e) {
          showStatus('Invalid JSON format!', 'error');
          return;
        }
      }

      // Get existing rules
      const existingRules = [...rules];
      
      // Create new rule ID
      const existingIds = existingRules.map(rule => rule.id);
      let newRuleId = 1000;
      while (existingIds.includes(newRuleId)) {
        newRuleId++;
        if (newRuleId >= 10000) newRuleId = 1000;
      }
      
      // Create data URL for response
      const dataUrl = `data:${responseType},${encodeURIComponent(responseBody)}`;
      
      // Create the declarativeNetRequest rule
      const newRule = {
        id: newRuleId,
        priority: 1,
        condition: {
          urlFilter: urlPattern,
          resourceTypes: ["xmlhttprequest", "main_frame", "sub_frame"]
        },
        action: {
          type: "redirect",
          redirect: {
            url: dataUrl
          }
        }
      };
      
      // Add to Chrome's declarativeNetRequest
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [newRule as chrome.declarativeNetRequest.Rule]
      });
      
      // Save to storage for persistence
      const ruleData = {
        id: newRuleId,
        urlPattern,
        responseType,
        responseBody,
        created: new Date().toISOString()
      };
      
      existingRules.push(ruleData);
      await chrome.storage.local.set({ overrideRules: existingRules });
      
      showStatus('Rule added successfully!', 'success');
      loadRules();
      
      // Clear form
      setUrlPattern('');
      setResponseBody('{\n  "message": "Custom response"\n}');
      
    } catch (error) {
      console.error('Error adding rule:', error);
      showStatus(`Error: ${(error as Error).message}`, 'error');
    }
  };

  const deleteRule = async (ruleId: number) => {
    try {
      // Remove from Chrome's declarativeNetRequest
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleId]
      });
      
      // Remove from storage
      const updatedRules = rules.filter(rule => rule.id !== ruleId);
      await chrome.storage.local.set({ overrideRules: updatedRules });
      
      showStatus('Rule deleted successfully!', 'success');
      loadRules();
      
    } catch (error) {
      console.error('Error deleting rule:', error);
      showStatus(`Error: ${(error as Error).message}`, 'error');
    }
  };

  const exportRules = async () => {
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
  };

  const importRules = () => {
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
        
        let importCount = 0;
        const existingRules = [...rules];
        const existingIds = existingRules.map(rule => rule.id);
        
        for (const rule of importedRules) {
          if (!rule.urlPattern || !rule.responseBody) continue;
          
          let newId = 1000;
          while (existingIds.includes(newId)) {
            newId++;
            if (newId >= 10000) newId = 1000;
          }
          existingIds.push(newId);
          
          const dataUrl = `data:${rule.responseType || 'application/json'},${encodeURIComponent(rule.responseBody)}`;
          
          const newRule = {
            id: newId,
            priority: 1,
            condition: {
              urlFilter: rule.urlPattern,
              resourceTypes: ["xmlhttprequest", "main_frame", "sub_frame"]
            },
            action: {
              type: "redirect",
              redirect: { url: dataUrl }
            }
          };
          
          await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [newRule as chrome.declarativeNetRequest.Rule]
          });
          
          existingRules.push({
            id: newId,
            urlPattern: rule.urlPattern,
            responseType: rule.responseType || 'application/json',
            responseBody: rule.responseBody,
            created: new Date().toISOString()
          });
          
          importCount++;
        }
        
        await chrome.storage.local.set({ overrideRules: existingRules });
        
        showStatus(`Imported ${importCount} rules successfully!`, 'success');
        loadRules();
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

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Interzept Options</h1>
      
      {statusMessage && (
        <div className={`p-3 mb-4 rounded ${
          statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {statusMessage.text}
        </div>
      )}
      
      <div className="bg-white p-4 shadow rounded mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Override Rule</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">URL Pattern</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={urlPattern}
            onChange={(e) => setUrlPattern(e.target.value)}
            placeholder="e.g. *://api.example.com/*"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Response Type</label>
          <select
            className="w-full p-2 border rounded"
            value={responseType}
            onChange={(e) => setResponseType(e.target.value)}
          >
            <option value="application/json">JSON</option>
            <option value="text/plain">Plain Text</option>
            <option value="text/html">HTML</option>
            <option value="text/javascript">JavaScript</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Response Body</label>
          <textarea
            className="w-full p-2 border rounded font-mono text-sm"
            rows={6}
            value={responseBody}
            onChange={(e) => setResponseBody(e.target.value)}
          ></textarea>
        </div>
        
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={addRule}
        >
          Add Rule
        </button>
      </div>
      
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Existing Rules ({rules.length})</h2>
        <div className="space-x-2">
          <button
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
            onClick={importRules}
          >
            Import
          </button>
          <button
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
            onClick={exportRules}
            disabled={rules.length === 0}
          >
            Export
          </button>
        </div>
      </div>
      
      <div className="bg-white p-4 shadow rounded">
        {rules.length === 0 ? (
          <p className="text-gray-500 italic">No override rules configured.</p>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="border p-4 rounded">
                <h3 className="font-medium">🔗 {rule.urlPattern}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Type:</strong> {rule.responseType}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Response:</strong>
                </p>
                <pre className="bg-gray-100 p-2 rounded text-sm mt-1 overflow-x-auto">
                  {rule.responseBody}
                </pre>
                <p className="text-xs text-gray-500 mt-2">
                  Created: {new Date(rule.created).toLocaleString()}
                </p>
                <button
                  className="mt-2 px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200"
                  onClick={() => deleteRule(rule.id)}
                >
                  Delete Rule
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionsApp;

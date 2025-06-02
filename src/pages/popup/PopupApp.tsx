import React, { useState, useEffect } from 'react';

// Rule templates
const ruleTemplates: Record<string, {
  name: string;
  url: string;
  response: string;
  description: string;
}> = {
  'api-mock': {
    name: 'API Mock Response',
    url: 'https://api.example.com/*',
    response: '{\n  "success": true,\n  "data": {\n    "message": "Mocked response"\n  }\n}',
    description: 'Mock API responses for testing'
  },
  'json-override': {
    name: 'JSON Override',
    url: '*://jsonplaceholder.typicode.com/posts/*',
    response: '{\n  "id": 999,\n  "title": "Overridden Post",\n  "body": "This response was intercepted",\n  "userId": 1\n}',
    description: 'Override JSON responses'
  },
  'error-simulation': {
    name: 'Error Simulation',
    url: 'https://api.example.com/error/*',
    response: '{\n  "error": true,\n  "message": "Simulated API error",\n  "code": 500\n}',
    description: 'Simulate API errors'
  },
  'custom': {
    name: 'Custom Override',
    url: '',
    response: '{\n  "custom": true\n}',
    description: 'Create from scratch'
  }
};

const PopupApp: React.FC = () => {
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('overrides');
  const [url, setUrl] = useState('');
  const [responseType, setResponseType] = useState('application/json');
  const [response, setResponse] = useState('{\n  "message": "overridden"\n}');
  const [ruleCount, setRuleCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  useEffect(() => {
    // Load extension state
    chrome.storage.local.get(['extensionEnabled'], function(result) {
      setExtensionEnabled(result.extensionEnabled !== undefined ? result.extensionEnabled : true);
    });
    
    // Update rule count
    updateRuleCount();
  }, []);

  const updateRuleCount = async () => {
    try {
      const [dynamicRules, sessionRules] = await Promise.all([
        chrome.declarativeNetRequest.getDynamicRules(),
        chrome.declarativeNetRequest.getSessionRules()
      ]);

      setRuleCount(dynamicRules.length + sessionRules.length);
    } catch (error) {
      console.error('Error getting rule count:', error);
    }
  };

  const toggleExtension = () => {
    const newState = !extensionEnabled;
    setExtensionEnabled(newState);
    chrome.storage.local.set({ extensionEnabled: newState });
  };

  const switchTab = (tab: string) => {
    setActiveTab(tab);
  };

  const applyTemplate = (templateId: string) => {
    const template = ruleTemplates[templateId];
    if (!template) return;

    setUrl(template.url);
    setResponse(template.response);

    showToast(`Applied template: ${template.name}`, 'info');
  };

  const handleAddRule = async () => {
    if (!url || !response) {
      showToast('Please fill in both URL pattern and response body', 'error');
      return;
    }

    setLoading(true);

    try {
      await addOverrideRule(url, response);
      showToast('Override rule added successfully!', 'success');
      updateRuleCount();
      
      // Clear form
      setUrl('');
      setResponse('{\n  "message": "overridden"\n}');
    } catch (error) {
      console.error('Error adding rule:', error);
      showToast(`Failed to add rule: ${(error as Error).message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const addOverrideRule = async (urlPattern: string, responseBody: string) => {
    try {
      // Get existing dynamic rules to find next available ID
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      
      // Find the highest ID in the dynamic range (1000-9999)
      const dynamicRuleIds = existingRules
        .map(rule => rule.id)
        .filter(id => id >= 1000 && id < 10000);
      
      const nextId = dynamicRuleIds.length > 0 ? Math.max(...dynamicRuleIds) + 1 : 1000;
      
      if (nextId >= 10000) {
        throw new Error('Maximum number of dynamic rules reached');
      }

      // Create data URL for response
      let contentType = 'application/json';
      try {
        JSON.parse(responseBody);
      } catch {
        contentType = 'text/plain';
      }

      const dataUrl = `data:${contentType};base64,${btoa(unescape(encodeURIComponent(responseBody)))}`;

      // Create the rule
      const rule = {
        id: nextId,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            url: dataUrl
          }
        },
        condition: {
          urlFilter: urlPattern,
          resourceTypes: ['xmlhttprequest', 'main_frame', 'sub_frame']
        }
      };

      // Add the rule
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [rule as chrome.declarativeNetRequest.Rule]
      });

      // Store in local storage
      const result = await chrome.storage.local.get(['overrideRules']);
      const rules = result.overrideRules || [];
      
      rules.push({
        id: nextId,
        urlPattern,
        responseType: contentType,
        responseBody,
        created: new Date().toISOString()
      });
      
      await chrome.storage.local.set({ overrideRules: rules });
      
      console.log('Rule added successfully:', rule);
    } catch (error) {
      console.error('Error in addOverrideRule:', error);
      throw error;
    }
  };

  const clearAllRules = async () => {
    if (!confirm('Are you sure you want to clear all rules? This action cannot be undone.')) {
      return;
    }

    try {
      const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
      const ruleIds = dynamicRules.map(rule => rule.id);

      if (ruleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: ruleIds
        });
      }

      // Clear stored rules
      await chrome.storage.local.set({ overrideRules: [] });

      showToast('All rules cleared successfully!', 'success');
      updateRuleCount();
    } catch (error) {
      console.error('Error clearing rules:', error);
      showToast(`Failed to clear rules: ${(error as Error).message}`, 'error');
    }
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const showToast = (message: string, type: string = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <div className="w-[360px] p-4 bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-bold">Interzept</h1>
          <span className="text-xs text-gray-500">v{chrome.runtime.getManifest().version}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${
            extensionEnabled 
              ? 'bg-cyan-100 text-cyan-600 border border-cyan-200' 
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${extensionEnabled ? 'bg-cyan-500' : 'bg-gray-400'}`}></div>
            <span>{extensionEnabled ? 'Ready' : 'Disabled'}</span>
          </div>
          
          <button 
            onClick={toggleExtension}
            className={`w-10 h-5 rounded-full relative ${
              extensionEnabled ? 'bg-cyan-500' : 'bg-gray-300'
            }`}
          >
            <span 
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                extensionEnabled ? 'translate-x-5' : ''
              }`}
            ></span>
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button 
          className={`px-3 py-2 ${activeTab === 'overrides' ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-gray-500'}`}
          onClick={() => switchTab('overrides')}
        >
          Quick Override
        </button>
        <button 
          className={`px-3 py-2 ${activeTab === 'templates' ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-gray-500'}`}
          onClick={() => switchTab('templates')}
        >
          Templates
        </button>
        <button 
          className={`px-3 py-2 ${activeTab === 'manage' ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-gray-500'}`}
          onClick={() => switchTab('manage')}
        >
          Manage
        </button>
      </div>
      
      {/* Tab content */}
      <div className={activeTab === 'overrides' ? 'block' : 'hidden'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">URL Pattern</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. *://api.example.com/*"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Response Body</label>
            <textarea
              className="w-full p-2 border rounded font-mono text-sm"
              rows={5}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            ></textarea>
          </div>
          
          <button
            className={`w-full py-2 rounded font-medium ${
              loading ? 'bg-gray-300' : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            }`}
            onClick={handleAddRule}
            disabled={loading}
          >
            {loading ? 'Adding Rule...' : 'Add Override Rule'}
          </button>
        </div>
      </div>
      
      <div className={activeTab === 'templates' ? 'block' : 'hidden'}>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(ruleTemplates).map(([id, template]) => (
            <div 
              key={id}
              className="border rounded p-3 cursor-pointer hover:bg-gray-50"
              onClick={() => applyTemplate(id)}
            >
              <h3 className="font-medium text-sm">{template.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{template.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className={activeTab === 'manage' ? 'block' : 'hidden'}>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
            <div>
              <h3 className="font-medium">Active Rules</h3>
              <p className="text-sm text-gray-600">Currently {ruleCount} rules active</p>
            </div>
            <button 
              className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
              onClick={clearAllRules}
            >
              Clear All
            </button>
          </div>
          
          <button
            className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium"
            onClick={openOptions}
          >
            Open Advanced Options
          </button>
        </div>
      </div>
      
      {/* Toast */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 max-w-xs p-3 rounded shadow-lg text-white text-sm ${
            toast.type === 'success' ? 'bg-green-500' : 
            toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default PopupApp;

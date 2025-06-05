// Background script for Interzept Chrome Extension
console.log('Interzept background script loaded');

// Debug logging for rule matching
function logRuleActivity(rules) {
  console.group('🎯 Interzept Active Rules');
  if (rules.length === 0) {
    console.log('⚠️ No active interception rules - all requests pass through normally');
  } else {
    rules.forEach((rule, index) => {
      console.log(`📍 Rule ${index + 1}: Intercepting "${rule.condition.urlFilter}"`);
      console.log(`   → Will return: ${rule.action.redirect.url.substring(0, 100)}...`);
    });
  }
  console.groupEnd();
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Interzept extension installed/updated:', details.reason);
  updateRules();
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Interzept extension started');
  updateRules();
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'openOptions':
      chrome.runtime.openOptionsPage();
      break;
    case 'UPDATE_RULES':
      updateRules();
      break;
    default:
      console.log('Unknown action:', request.action);
  }
  
  sendResponse({ success: true });
});

// Core function to update declarativeNetRequest rules
async function updateRules() {
  try {
    console.log('Updating override rules...');
    
    // Get override rules from storage
    const result = await chrome.storage.sync.get(['interzept-rules']);
    const allRules = result['interzept-rules'] || [];
    
    // Filter for enabled override rules only
    const enabledOverrideRules = allRules.filter(rule => 
      rule.enabled && rule.type === 'overrides' && rule.source
    );
    
    console.log('Found enabled override rules:', enabledOverrideRules.length);
    
    // Clear existing dynamic rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    
    // Convert to Chrome declarativeNetRequest format
    const chromeRules = enabledOverrideRules.map((rule, index) => {
      const responseBody = rule.responseBody || '{}';
      const statusCode = rule.responseCode || 200;
      
      // Create data URL with proper headers
      const headers = rule.responseHeaders || [{ name: 'Content-Type', value: 'application/json' }];
      const contentType = headers.find(h => h.name.toLowerCase() === 'content-type')?.value || 'application/json';
      
      return {
        id: index + 1,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            url: `data:${contentType};charset=utf-8,${encodeURIComponent(responseBody)}`
          }
        },        condition: {
          urlFilter: convertToUrlFilter(rule.source),
          resourceTypes: ["xmlhttprequest"]
        }
      };
    });
      // Update rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: chromeRules
    });
    
    console.log('Successfully updated rules:', chromeRules.length);
    
    // Debug logging
    logRuleActivity(chromeRules);
    logRuleActivity(chromeRules); // Log the active rules
    
  } catch (error) {
    console.error('Failed to update rules:', error);
  }
}

// Convert user-friendly URL patterns to Chrome declarativeNetRequest format
function convertToUrlFilter(pattern) {
  // Simple conversion - handle basic wildcards
  return pattern.replace(/\*/g, '*');
}

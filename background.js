// Background script for Interzept Chrome Extension
console.log('Interzept background script loaded');

// Global state
let isInterceptionEnabled = true;
let activeRules = [];
let interceptedRequests = new Map();

// Storage keys
const STORAGE_KEYS = {
  RULES: 'interzept_rules',
  ENABLED: 'interzept_enabled',
  STATS: 'interzept_stats'
};

// Initialize extension
chrome.runtime.onStartup.addListener(initializeExtension);
chrome.runtime.onInstalled.addListener(initializeExtension);

async function initializeExtension() {
  console.log('Initializing Interzept extension...');
  
  try {
    // Load saved rules and state
    const result = await chrome.storage.local.get([STORAGE_KEYS.RULES, STORAGE_KEYS.ENABLED]);
    activeRules = result[STORAGE_KEYS.RULES] || [];
    isInterceptionEnabled = result[STORAGE_KEYS.ENABLED] !== false;
    
    // Set up request interception
    await setupRequestInterception();
    
    console.log(`Interzept initialized with ${activeRules.length} rules`);
  } catch (error) {
    console.error('Failed to initialize Interzept:', error);
  }
}

// Set up declarative net request rules
async function setupRequestInterception() {
  try {
    // Clear existing rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: await getAllRuleIds()
    });

    if (!isInterceptionEnabled) {
      console.log('Request interception is disabled');
      return;
    }

    // Convert our rules to Chrome's declarative net request format
    const chromeRules = activeRules
      .filter(rule => rule.enabled)
      .map(convertToDeclarativeRule)
      .filter(Boolean);

    if (chromeRules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: chromeRules
      });
      console.log(`Added ${chromeRules.length} interception rules`);
    }

    // Set up web request listeners for advanced functionality
    setupWebRequestListeners();
    
  } catch (error) {
    console.error('Failed to setup request interception:', error);
  }
}

// Convert our rule format to Chrome's declarative net request format
function convertToDeclarativeRule(rule, index) {
  const chromeRule = {
    id: parseInt(rule.id) || (index + 1),
    priority: 1,
    condition: {
      urlFilter: convertUrlPattern(rule.source),
      resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'fetch']
    }
  };

  switch (rule.type) {
    case 'redirect':
      if (rule.destination) {
        chromeRule.action = {
          type: 'redirect',
          redirect: { url: rule.destination }
        };
      }
      break;
      
    case 'headers':
      if (rule.headers && rule.headers.length > 0) {
        chromeRule.action = {
          type: 'modifyHeaders',
          requestHeaders: rule.headers
            .filter(h => h.operation !== 'remove')
            .map(h => ({
              header: h.name,
              operation: h.operation === 'add' ? 'set' : 'append',
              value: h.value
            }))
        };
      }
      break;
      
    case 'overrides':
      // For response overrides, we'll handle this in web request listeners
      // since declarativeNetRequest doesn't support response body modification
      return null;
      
    default:
      return null;
  }

  return chromeRule;
}

// Set up web request listeners for response modification
function setupWebRequestListeners() {
  if (chrome.webRequest) {
    // Remove existing listeners
    chrome.webRequest.onBeforeRequest.removeListener(handleBeforeRequest);
    chrome.webRequest.onHeadersReceived.removeListener(handleHeadersReceived);
    
    // Add new listeners
    chrome.webRequest.onBeforeRequest.addListener(
      handleBeforeRequest,
      { urls: ['<all_urls>'] },
      ['blocking', 'requestBody']
    );
    
    chrome.webRequest.onHeadersReceived.addListener(
      handleHeadersReceived,
      { urls: ['<all_urls>'] },
      ['blocking', 'responseHeaders']
    );
  }
}

// Handle request before it's sent
function handleBeforeRequest(details) {
  if (!isInterceptionEnabled) return;

  const matchingRules = findMatchingRules(details.url, 'overrides');
  
  if (matchingRules.length > 0) {
    const rule = matchingRules[0]; // Use first matching rule
    
    // Store request details for response modification
    interceptedRequests.set(details.requestId, {
      rule,
      url: details.url,
      timestamp: Date.now()
    });
    
    // For immediate response overrides
    if (rule.responseBody) {
      return {
        redirectUrl: `data:application/json;charset=utf-8,${encodeURIComponent(rule.responseBody)}`
      };
    }
  }
}

// Handle response headers
function handleHeadersReceived(details) {
  if (!isInterceptionEnabled) return;

  const intercepted = interceptedRequests.get(details.requestId);
  const matchingRules = findMatchingRules(details.url, 'headers');
  
  let responseHeaders = details.responseHeaders || [];
  
  // Apply header modifications
  matchingRules.forEach(rule => {
    if (rule.headers) {
      rule.headers.forEach(headerOp => {
        switch (headerOp.operation) {
          case 'add':
          case 'modify':
            // Remove existing header with same name
            responseHeaders = responseHeaders.filter(h => 
              h.name.toLowerCase() !== headerOp.name.toLowerCase()
            );
            // Add new header
            responseHeaders.push({
              name: headerOp.name,
              value: headerOp.value
            });
            break;
            
          case 'remove':
            responseHeaders = responseHeaders.filter(h => 
              h.name.toLowerCase() !== headerOp.name.toLowerCase()
            );
            break;
        }
      });
    }
  });
  
  // Handle response overrides
  if (intercepted && intercepted.rule.responseCode) {
    details.statusCode = intercepted.rule.responseCode;
  }
  
  // Add custom response headers for overrides
  if (intercepted && intercepted.rule.responseHeaders) {
    intercepted.rule.responseHeaders.forEach(header => {
      responseHeaders.push({
        name: header.name,
        value: header.value
      });
    });
  }
  
  // Clean up
  interceptedRequests.delete(details.requestId);
  
  return { responseHeaders };
}

// Find rules that match a given URL and type
function findMatchingRules(url, type = null) {
  return activeRules.filter(rule => {
    if (!rule.enabled) return false;
    if (type && rule.type !== type) return false;
    
    return matchesPattern(url, rule.source);
  });
}

// Check if URL matches a pattern
function matchesPattern(url, pattern) {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
    
  const regex = new RegExp('^' + regexPattern + '$', 'i');
  return regex.test(url);
}

// Convert URL pattern to Chrome's format
function convertUrlPattern(pattern) {
  // Handle wildcard patterns
  if (pattern.includes('*')) {
    return pattern.replace(/\*/g, '*');
  }
  return pattern;
}

// Get all rule IDs for cleanup
async function getAllRuleIds() {
  try {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    return rules.map(rule => rule.id);
  } catch {
    return [];
  }
}

// Message handling from popup and options
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'openOptions':
      chrome.runtime.openOptionsPage();
      sendResponse({ success: true });
      break;
      
    case 'toggleInterception':
      toggleInterception().then(result => sendResponse(result));
      return true; // Will respond asynchronously
      
    case 'updateRules':
      updateRules(request.rules).then(result => sendResponse(result));
      return true;
      
    case 'getRules':
      sendResponse({ rules: activeRules, enabled: isInterceptionEnabled });
      break;
      
    case 'getStats':
      getStats().then(stats => sendResponse(stats));
      return true;
      
    case 'getMatchingRules':
      const matchingRules = findMatchingRules(request.url);
      sendResponse({ rules: matchingRules });
      break;
      
    default:
      console.log('Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Toggle interception on/off
async function toggleInterception() {
  try {
    isInterceptionEnabled = !isInterceptionEnabled;
    await chrome.storage.local.set({ [STORAGE_KEYS.ENABLED]: isInterceptionEnabled });
    await setupRequestInterception();
    
    return { success: true, enabled: isInterceptionEnabled };
  } catch (error) {
    console.error('Failed to toggle interception:', error);
    return { success: false, error: error.message };
  }
}

// Update active rules
async function updateRules(newRules) {
  try {
    activeRules = newRules || [];
    await chrome.storage.local.set({ [STORAGE_KEYS.RULES]: activeRules });
    await setupRequestInterception();
    
    return { success: true, count: activeRules.length };
  } catch (error) {
    console.error('Failed to update rules:', error);
    return { success: false, error: error.message };
  }
}

// Get interception statistics
async function getStats() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.STATS);
    return result[STORAGE_KEYS.STATS] || {
      totalIntercepted: 0,
      rulesActive: activeRules.filter(r => r.enabled).length,
      lastActivity: null
    };
  } catch (error) {
    console.error('Failed to get stats:', error);
    return { totalIntercepted: 0, rulesActive: 0, lastActivity: null };
  }
}

// Initialize on script load
initializeExtension();

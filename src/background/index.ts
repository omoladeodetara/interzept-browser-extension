// Background service worker for Interzept Extension

// Restore rules when extension starts
chrome.runtime.onStartup.addListener(async () => {
  await restoreRules();
});

chrome.runtime.onInstalled.addListener(async () => {
  await restoreRules();
});

async function restoreRules() {
  try {
    // Get saved rules from storage
    const result = await chrome.storage.local.get(['overrideRules']);
    const savedRules = result.overrideRules || [];
    
    if (savedRules.length === 0) return;
    
    // Get existing static rules to avoid ID conflicts
    const staticRules = await chrome.declarativeNetRequest.getSessionRules();
    const staticRuleIds = staticRules.map(rule => rule.id);
    
    // Convert saved rules back to declarativeNetRequest format
    // Ensure dynamic rules use IDs in the 1000-9999 range
    const rules = [];
    let nextDynamicId = 1000; // Start dynamic rule IDs at 1000
    
    for (const ruleData of savedRules) {
      // If the rule already has an ID in the dynamic range (1000-9999), try to keep it
      // Otherwise assign a new ID in the dynamic range
      let ruleId = ruleData.id;
      if (!ruleId || ruleId < 1000 || ruleId >= 10000 || staticRuleIds.includes(ruleId)) {
        // Find next available ID
        while (staticRuleIds.includes(nextDynamicId) || 
               rules.some(r => r.id === nextDynamicId)) {
          nextDynamicId++;
          if (nextDynamicId >= 10000) nextDynamicId = 1000; // Wrap around if needed
        }
        ruleId = nextDynamicId++;
      }
      
      rules.push({
        id: ruleId,
        priority: 1,
        condition: {
          urlFilter: ruleData.urlPattern,
          resourceTypes: ["xmlhttprequest", "main_frame", "sub_frame"]
        },
        action: {
          type: "redirect",
          redirect: {
            url: `data:${ruleData.responseType},${encodeURIComponent(ruleData.responseBody)}`
          }
        }
      });
    }
    
    // Clear existing dynamic rules and add saved ones
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: rules
    });
    
    console.log(`Restored ${rules.length} override rules`);
    
  } catch (error) {
    console.error('Error restoring rules:', error);
  }
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getRuleCount') {
    chrome.declarativeNetRequest.getDynamicRules().then(rules => {
      sendResponse({ count: rules.length });
    });
    return true; // Indicates we will send a response asynchronously
  }
});

// Log rule matches for debugging
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener(
  (info) => {
    console.log('Rule matched:', info);
  }
);

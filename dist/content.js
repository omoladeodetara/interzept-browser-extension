// Content script for Interzept Chrome Extension
console.log('Interzept content script loaded');

// State management
let isInterceptionActive = false;
let originalFetch = null;
let originalXHR = null;

// Initialize interception
initializeInterception();

async function initializeInterception() {
  try {
    // Check if interception should be enabled
    const response = await chrome.runtime.sendMessage({ action: 'getRules' });
    if (response && response.enabled) {
      enableInterception();
    }
  } catch (error) {
    console.error('Failed to initialize interception:', error);
  }
}

// Enable request interception
function enableInterception() {
  if (isInterceptionActive) return;
  
  console.log('Enabling request interception');
  isInterceptionActive = true;
  
  // Store original functions
  originalFetch = window.fetch;
  originalXHR = window.XMLHttpRequest;
  
  // Intercept fetch API
  window.fetch = interceptFetch;
  
  // Intercept XMLHttpRequest
  window.XMLHttpRequest = interceptXMLHttpRequest();
  
  // Inject interception into existing frames
  injectInterceptionScript();
}

// Disable request interception
function disableInterception() {
  if (!isInterceptionActive) return;
  
  console.log('Disabling request interception');
  isInterceptionActive = false;
  
  // Restore original functions
  if (originalFetch) {
    window.fetch = originalFetch;
  }
  if (originalXHR) {
    window.XMLHttpRequest = originalXHR;
  }
}

// Intercepted fetch function
async function interceptFetch(input, init = {}) {
  const url = typeof input === 'string' ? input : input.url;
  
  try {
    // Get matching rules from background
    const rules = await getMatchingRules(url);
    
    if (rules.length > 0) {
      const rule = rules[0]; // Use first matching rule
      
      console.log('Intercepting fetch request:', url, 'with rule:', rule.name);
      
      // Handle different rule types
      switch (rule.type) {
        case 'overrides':
          return createMockResponse(rule);
          
        case 'redirect':
          if (rule.destination) {
            const newUrl = rule.destination.replace('*', '');
            return originalFetch(newUrl, init);
          }
          break;
          
        case 'headers':
          if (rule.headers) {
            init.headers = init.headers || {};
            rule.headers.forEach(header => {
              if (header.operation === 'add' || header.operation === 'modify') {
                init.headers[header.name] = header.value;
              } else if (header.operation === 'remove') {
                delete init.headers[header.name];
              }
            });
          }
          break;
      }
    }
    
    // Proceed with original request
    return originalFetch(input, init);
    
  } catch (error) {
    console.error('Error in fetch interception:', error);
    return originalFetch(input, init);
  }
}

// Create intercepted XMLHttpRequest
function interceptXMLHttpRequest() {
  class InterceptedXMLHttpRequest extends originalXHR {
    constructor() {
      super();
      this._url = null;
      this._method = null;
      this._intercepted = false;
    }
    
    open(method, url, async = true, user, password) {
      this._method = method;
      this._url = url;
      
      // Check for interception
      getMatchingRules(url).then(rules => {
        if (rules.length > 0) {
          this._intercepted = true;
          this._rule = rules[0];
          console.log('Intercepting XHR request:', url, 'with rule:', this._rule.name);
        }
      });
      
      return super.open(method, url, async, user, password);
    }
    
    send(data) {
      if (this._intercepted && this._rule) {
        // Handle mock response
        if (this._rule.type === 'overrides') {
          setTimeout(() => {
            Object.defineProperty(this, 'readyState', { value: 4, writable: false });
            Object.defineProperty(this, 'status', { value: this._rule.responseCode || 200, writable: false });
            Object.defineProperty(this, 'statusText', { value: 'OK', writable: false });
            Object.defineProperty(this, 'responseText', { value: this._rule.responseBody || '{}', writable: false });
            Object.defineProperty(this, 'response', { value: this._rule.responseBody || '{}', writable: false });
            
            if (this.onreadystatechange) {
              this.onreadystatechange();
            }
            
            this.dispatchEvent(new Event('load'));
          }, 10);
          return;
        }
        
        // Handle redirects
        if (this._rule.type === 'redirect' && this._rule.destination) {
          const newUrl = this._rule.destination.replace('*', '');
          super.open(this._method, newUrl, true);
        }
      }
      
      return super.send(data);
    }
  }
  
  return InterceptedXMLHttpRequest;
}

// Create mock response for fetch
function createMockResponse(rule) {
  const responseBody = rule.responseBody || '{}';
  const responseCode = rule.responseCode || 200;
  const responseHeaders = rule.responseHeaders || [{ name: 'Content-Type', value: 'application/json' }];
  
  const headers = new Headers();
  responseHeaders.forEach(header => {
    headers.set(header.name, header.value);
  });
  
  return Promise.resolve(new Response(responseBody, {
    status: responseCode,
    statusText: responseCode === 200 ? 'OK' : 'Intercepted',
    headers
  }));
}

// Get matching rules from background script
async function getMatchingRules(url) {
  try {
    const response = await chrome.runtime.sendMessage({ 
      action: 'getMatchingRules', 
      url 
    });
    return response.rules || [];
  } catch (error) {
    console.error('Failed to get matching rules:', error);
    return [];
  }
}

// Inject interception script into the page context
function injectInterceptionScript() {
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      console.log('Interzept: Page-level interception injected');
      
      // Additional page-level interception can be added here
      // This runs in the page context and can intercept requests
      // that are made by inline scripts
    })();
  `;
  
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  switch (request.action) {
    case 'enableInterception':
      enableInterception();
      sendResponse({ success: true });
      break;
      
    case 'disableInterception':
      disableInterception();
      sendResponse({ success: true });
      break;
      
    case 'toggleInterception':
      if (isInterceptionActive) {
        disableInterception();
      } else {
        enableInterception();
      }
      sendResponse({ success: true, active: isInterceptionActive });
      break;
      
    case 'getStatus':
      sendResponse({ active: isInterceptionActive });
      break;
      
    default:
      console.log('Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Listen for navigation events to re-inject interception
window.addEventListener('beforeunload', () => {
  console.log('Page unloading, preserving interception state');
});

// Monitor for dynamic content changes
const observer = new MutationObserver((mutations) => {
  // Re-inject interception if needed when DOM changes significantly
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Check if new scripts were added that might need interception
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SCRIPT') {
          // New script detected - ensure interception is still active
          if (isInterceptionActive) {
            injectInterceptionScript();
          }
        }
      });
    }
  });
});

// Start observing
observer.observe(document.body || document.documentElement, {
  childList: true,
  subtree: true
});

console.log('Interzept content script initialization complete');

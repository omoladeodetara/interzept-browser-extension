// Background script for Interzept Chrome Extension
console.log('Interzept background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Interzept extension installed/updated:', details.reason);
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Interzept extension started');
});

// Optional: Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'openOptions':
      chrome.runtime.openOptionsPage();
      break;
    default:
      console.log('Unknown action:', request.action);
  }
  
  sendResponse({ success: true });
});

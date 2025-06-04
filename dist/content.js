// Content script for Interzept Chrome Extension
console.log('Interzept content script loaded');

// This content script can be used to inject functionality into web pages
// For now, it's just a placeholder for future API interception features

// Example: Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  switch (request.action) {
    case 'interceptRequests':
      console.log('Request interception enabled');
      // Future: Add request interception logic here
      break;
    case 'stopInterception':
      console.log('Request interception disabled');
      // Future: Stop request interception
      break;
    default:
      console.log('Unknown action:', request.action);
  }
  
  sendResponse({ success: true });
});

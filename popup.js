// Extension state management
let extensionEnabled = true;
let activeRules = [];
let extensionStats = { totalIntercepted: 0, rulesActive: 0 };

// Initialize extension state on load
document.addEventListener('DOMContentLoaded', function() {
    initializePopup();
});

async function initializePopup() {
    try {
        // Load extension state from background
        const response = await chrome.runtime.sendMessage({ action: 'getRules' });
        if (response) {
            extensionEnabled = response.enabled;
            activeRules = response.rules || [];
        }
        
        // Load stats
        const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
        if (stats) {
            extensionStats = stats;
        }
        
        updateUI();
        updateVersion();
        loadDynamicIcon();
        setupEventListeners();
        
    } catch (error) {
        console.error('Failed to initialize popup:', error);
        // Fallback to default state
        updateUI();
        updateVersion();
        loadDynamicIcon();
        setupEventListeners();
    }
}

function setupEventListeners() {
    // Toggle extension
    const extensionToggle = document.getElementById('extensionToggle');
    if (extensionToggle) {
        extensionToggle.addEventListener('click', toggleExtension);
    }
    
    // Add click listeners to all rule cards
    const ruleCards = document.querySelectorAll('.interzept-rule');
    ruleCards.forEach(card => {
        card.addEventListener('click', () => {
            openInterzept();
        });
    });
    
    // Add click listeners to all open buttons
    const openButtons = document.querySelectorAll('.interzept-btn-primary');
    openButtons.forEach(button => {
        button.addEventListener('click', () => openInterzept());
    });
}

async function toggleExtension() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'toggleInterception' });
        if (response && response.success) {
            extensionEnabled = response.enabled;
            updateUI();
            
            // Show feedback
            showNotification(`Interception ${extensionEnabled ? 'enabled' : 'disabled'}`);
        }
    } catch (error) {
        console.error('Failed to toggle extension:', error);
        showNotification('Failed to toggle extension', 'error');
    }
}

function updateUI() {
    const toggle = document.getElementById('extensionToggle');
    const statusBadge = document.querySelector('.interzept-status');
    const statusText = statusBadge.querySelector('span');
    const statusDot = document.querySelector('.interzept-status-dot');
    
    if (extensionEnabled) {
        toggle.classList.add('active');
        statusBadge.style.background = 'rgba(34, 211, 238, 0.1)';
        statusBadge.style.borderColor = 'rgba(34, 211, 238, 0.2)';
        statusBadge.style.color = '#22d3ee';
        statusDot.style.background = '#22d3ee';
        statusText.textContent = 'Ready';
    } else {
        toggle.classList.remove('active');
        statusBadge.style.background = 'rgba(100, 116, 139, 0.1)';
        statusBadge.style.borderColor = 'rgba(100, 116, 139, 0.2)';
        statusBadge.style.color = '#64748b';
        statusDot.style.background = '#64748b';
        statusText.textContent = 'Disabled';
    }
    
    // Update stats display
    updateStats();
}

function openInterzept() {
    // Open the extension's options page
    chrome.runtime.openOptionsPage();
    window.close();
}

function updateVersion() {
    // Get version from manifest and update display
    const manifest = chrome.runtime.getManifest();
    const versionElement = document.querySelector('.interzept-version');
    if (versionElement && manifest.version) {
        versionElement.textContent = `v${manifest.version}`;
    }
}

function loadDynamicIcon() {
    // Load icon dynamically from manifest
    const manifest = chrome.runtime.getManifest();
    const logoImage = document.getElementById('logoImage');
    
    if (logoImage && manifest.action && manifest.action.default_icon) {
        // Use the largest available icon (128px) or fallback to 48px
        const iconPath = manifest.action.default_icon['128'] || 
                        manifest.action.default_icon['48'] || 
                        manifest.action.default_icon['16'];
        
        if (iconPath) {
            // Use chrome.runtime.getURL for proper extension resource URL
            const iconUrl = chrome.runtime.getURL(iconPath);
            logoImage.src = iconUrl;
        }
    }
}

// Show notification function
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.interzept-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'interzept-notification';
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    // Set notification style based on type
    if (type === 'error') {
        notification.style.background = 'rgba(239, 68, 68, 0.9)';
        notification.style.color = 'white';
    } else {
        notification.style.background = 'rgba(34, 211, 238, 0.9)';
        notification.style.color = 'white';
    }
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Auto hide after 2 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// Update stats display
function updateStats() {
    // Update intercepted count if element exists
    const interceptedElement = document.querySelector('.interzept-intercepted-count');
    if (interceptedElement) {
        interceptedElement.textContent = extensionStats.totalIntercepted || 0;
    }
    
    // Update active rules count
    const activeRulesElement = document.querySelector('.interzept-active-rules-count');
    if (activeRulesElement) {
        activeRulesElement.textContent = extensionStats.rulesActive || 0;
    }
}

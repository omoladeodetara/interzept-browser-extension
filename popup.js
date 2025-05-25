// Extension state management
let extensionEnabled = true;

// Initialize extension state on load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved state (default to enabled)
    extensionEnabled = true;
    updateUI();
    
    // Add event listeners
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
});

function toggleExtension() {
    extensionEnabled = !extensionEnabled;
    updateUI();
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
}

function openInterzept() {
    // Simple redirect to Interzept website
    chrome.tabs.create({ url: 'https://interzept.dev/' });
    window.close();
}

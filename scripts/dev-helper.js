#!/usr/bin/env node

/**
 * Development helper for Chrome Extension
 * This script provides useful development commands
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function showHelp() {
    console.log(`
🔧 Interzept Extension Development Helper

Available commands:
  npm run build:fast      - Quick build (no minification)
  npm run watch:extension - Auto-rebuild on file changes
  
🚀 Quick Setup:
  1. Run: npm run build:extension
  2. Load dist/ folder in Chrome extensions
  3. For development: npm run watch:extension
  4. Make changes and the extension will auto-rebuild
  5. Click reload button in Chrome extensions page

💡 Tips:
  - Use Ctrl+R in extension popup to see changes
  - Use F12 in options page to debug React app
  - Check Chrome DevTools > Extensions for background script logs
  - Use chrome://extensions/ to manage your extension
    `);
}

function checkDistFolder() {
    const distPath = path.join(__dirname, '../dist');
    if (fs.existsSync(distPath)) {
        console.log('✅ dist/ folder exists and ready for Chrome');
        console.log('📂 Load this folder in Chrome: ' + distPath);
    } else {
        console.log('❌ dist/ folder not found. Run: npm run build:extension');
    }
}

const command = process.argv[2];

switch (command) {
    case 'help':
    case '--help':
    case '-h':
        showHelp();
        break;
    case 'check':
        checkDistFolder();
        break;
    default:
        showHelp();
}

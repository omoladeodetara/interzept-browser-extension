const fs = require('fs');
const path = require('path');

// Copy extension files to dist
const copyFile = (src, dest) => {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
};

// Move file function
const moveFile = (src, dest) => {
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.renameSync(src, dest);
    console.log(`Moved: ${src} -> ${dest}`);
  }
};

// Files to copy to dist for the extension
const filesToCopy = [
  { src: 'manifest.json', dest: 'dist/manifest.json' },
  { src: 'popup.html', dest: 'dist/popup.html' },
  { src: 'popup.js', dest: 'dist/popup.js' },
  { src: 'background.js', dest: 'dist/background.js' },
  { src: 'content.js', dest: 'dist/content.js' }
];

// Copy icon files
const iconFiles = [
  { src: 'icons/interzept16.png', dest: 'dist/icons/interzept16.png' },
  { src: 'icons/interzept48.png', dest: 'dist/icons/interzept48.png' },
  { src: 'icons/interzept128.png', dest: 'dist/icons/interzept128.png' }
];

console.log('🔧 Preparing Chrome Extension...');

// Copy main files
filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    copyFile(src, dest);
  } else {
    console.log(`⚠️  Warning: ${src} not found`);
  }
});

// Copy icons
iconFiles.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    copyFile(src, dest);
  } else {
    console.log(`⚠️  Warning: ${src} not found`);
  }
});

// Move the HTML files to the correct locations
if (fs.existsSync('dist/src/options/index.html')) {
  moveFile('dist/src/options/index.html', 'dist/options.html');
}

// Don't overwrite the existing popup.html - it's already copied and working
// The popup uses the root popup.html file, not the React-built version
if (fs.existsSync('dist/src/popup/index.html')) {
  // Just remove the built popup since we're using the existing one
  fs.rmSync('dist/src/popup/index.html', { force: true });
  console.log('🗑️  Removed built popup.html (using existing popup.html instead)');
}

// Clean up the entire src directory structure
if (fs.existsSync('dist/src')) {
  fs.rmSync('dist/src', { recursive: true, force: true });
  console.log('🧹 Cleaned up unnecessary src/ folder from extension');
}

console.log('✅ Chrome Extension prepared in dist/ folder');
console.log('💡 Load the dist/ folder as an unpacked extension in Chrome');
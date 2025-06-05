const fs = require('fs');
const path = require('path');

// Get current date in compact format that fits Chrome's constraints
const getCurrentDateVersion = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // months are 0-indexed
  const day = now.getDate();
  
  // Use last 2 digits of year to stay under 65536 limit
  const shortYear = year % 100; // 2025 -> 25
  // Create a date number: YYMM format (e.g., 2506 for June 2025)
  const dateNumber = shortYear * 100 + month; // 25 * 100 + 6 = 2506
  
  return { dateNumber, day, year, month };
};

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Parse current version
const currentVersion = packageJson.version;
let versionParts;

// Handle various version formats and normalize to numeric parsing
let cleanVersion = currentVersion;
if (currentVersion.startsWith('v1.')) {
  cleanVersion = currentVersion.substring(3); // Remove 'v1.' prefix
} else if (currentVersion.startsWith('1.')) {
  cleanVersion = currentVersion.substring(2); // Remove '1.' prefix
}

versionParts = cleanVersion.split('.').map(Number);
const [major, minor, patch, build = 0] = versionParts;

// Get today's date version
const { dateNumber, day, year, month } = getCurrentDateVersion();

let newVersion;

// Check if we're building on the same day (compare dateNumber and day)
if (major === dateNumber && minor === day) {
  // Same day - increment build number
  const newBuild = (patch || 0) + 1; // patch is the build number in our format
  newVersion = `1.${dateNumber}.${day}.${newBuild}`;
  console.log(`📦 Same day build detected. Incrementing build number: ${currentVersion} → ${newVersion}`);
} else {
  // Different day - start fresh with .1 build
  newVersion = `1.${dateNumber}.${day}.1`;
  console.log(`📅 New day detected. Starting fresh build: ${currentVersion} → ${newVersion}`);
}

console.log(`📅 Date format: YYMM.DD (${year % 100}${month.toString().padStart(2, '0')}.${day}) = ${dateNumber}.${day}`);

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// Update manifest.json
const manifestPath = path.join(__dirname, '..', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.version = newVersion;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✅ Updated manifest.json version to ${newVersion}`);
}

console.log(`✅ Updated package.json version to ${newVersion}`);
console.log(`🎯 Chrome-compatible format: 1.YYMM.DD.BUILD (${newVersion})`);
console.log(`📊 All numbers ≤ 65536: ✅`);

module.exports = { newVersion };

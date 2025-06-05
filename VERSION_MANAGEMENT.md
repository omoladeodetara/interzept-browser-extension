# Interzept Extension - Version Management System

## Overview
The Interzept extension now uses an automatic date-based versioning system that supports multiple builds per day.

## Version Format
**Format:** `1.YYMM.DD.BUILD` (Chrome-compatible - all numbers ≤ 65536)

- **1**: Major version (indicates version 1 of the extension)
- **YYMM**: Year and month (e.g., 2506 for June 2025)
- **DD**: Current day (1-31, no leading zeros)  
- **BUILD**: Build number for the day (starts at 1, increments with each build)

## Examples
- `1.2506.6.1` - First build on June 6, 2025
- `1.2506.6.2` - Second build on June 6, 2025
- `1.2507.7.1` - First build on July 7, 2025

> **Chrome Compatibility**: This format ensures all version numbers stay under Chrome's 65536 limit by using YY (25) instead of YYYY (2025).

## How It Works

### Automatic Version Increment
The version is automatically incremented every time you run:
```bash
npm run build:extension
npm run build:fast
npm run copy:extension
```

### Manual Version Increment
You can also manually increment the version:
```bash
npm run version          # Increment version
```

### Version Logic
1. **Same Day**: If building on the same date, increments the build number
   - `1.2506.6.1` → `1.2506.6.2`
2. **New Day**: If building on a new date, starts fresh with build 1
   - `1.2506.6.5` → `1.2507.7.1`
3. **Legacy Support**: Automatically converts old formats to new format
   - `2025.6.6.5` → `1.2506.6.1`
   - `v1.2025.6.6.5` → `1.2506.6.1`
   - `1.2025.6.6.5` → `1.2506.6.1`

## Files Updated
The version increment script automatically updates both files with the same format:
- `package.json` - Node package version: `1.YYMM.DD.BUILD`
- `manifest.json` - Chrome extension version: `1.YYMM.DD.BUILD`

## Implementation Files
- `scripts/increment-version.js` - Main version increment logic
- `scripts/prepare-extension.js` - Updated to auto-increment before building
- `package.json` - Added version management scripts

## Benefits
✅ **Multiple Builds Per Day**: No conflicts when building multiple times daily  
✅ **Automatic**: No manual version management needed  
✅ **Date-Based**: Easy to identify when extension was built  
✅ **Chronological**: Versions naturally sort by date  
✅ **Chrome Compatible**: Follows Chrome extension version requirements

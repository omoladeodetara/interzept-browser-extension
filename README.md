# Interzept Chrome Extension

Interzept is the ultimate tool for developers to mock, modify, and override API calls. This Chrome extension provides a powerful interface for intercepting requests, simulating APIs, and debugging applications efficiently.

## ✨ Features

- **🚀 Quick Access Popup**: Instant extension control and rule management
- **⚙️ Comprehensive Options**: Full-featured React-based configuration interface
- **🔧 API Interception**: Mock, modify, and override HTTP requests
- **📊 Request Monitoring**: Real-time tracking of intercepted calls
- **🎯 Rule Management**: Create, edit, and organize interception rules
- **💾 Persistent Storage**: Chrome sync storage for rules and settings
- **🔄 CORS Bypass**: Handle cross-origin request restrictions
- **📱 Responsive Design**: Modern UI with Tailwind CSS

## 🏗️ Architecture

This extension uses a hybrid architecture:

- **Popup**: Lightweight vanilla HTML/CSS/JS for instant access
- **Options Page**: Full React/TypeScript app for comprehensive configuration
- **Shared Utilities**: TypeScript modules for common functionality
- **Chrome Extension APIs**: Proper manifest v3 implementation

## 📦 Installation

### For Development:
```powershell
# Clone and install dependencies
git clone <repository>
cd Interzept/4
npm install

# Build the extension
npm run build:extension

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the `dist/` folder
```

### For Users:
1. Download the extension from Chrome Web Store (coming soon)
2. Or load the built extension from the `dist/` folder as unpacked extension

## 🚀 Development

### Build Commands:
```powershell
# Full extension build (recommended)
npm run build:extension

# Quick development build
npm run build:fast

# Watch mode for development
npm run watch:extension

# Build options page only
npm run build

# Copy extension files only
npm run copy:extension
```

### Project Structure:
```
src/
├── options/           # React options page
├── popup/            # React popup (not used - see root popup.html)
└── shared/           # Shared TypeScript utilities
    ├── types/        # Type definitions
    ├── utils/        # Helper functions & storage
    └── hooks/        # React hooks

Root files:
├── popup.html        # Working popup interface
├── popup.js         # Popup functionality
├── manifest.json    # Extension configuration
└── background.js    # Service worker
```

## 💻 Usage

### Popup Interface:
- Click the Interzept icon in Chrome toolbar
- Toggle extension on/off
- View active rules and statistics  
- Access rule cards for quick actions
- Click "Open Interzept Options" for full interface

### Options Page:
- Right-click extension icon → "Options"
- Or click "Open Interzept Options" from popup
- Create and manage interception rules
- Configure request/response modifications
- Set up API mocking and redirects

## 🔧 Configuration

### Rule Types:
- **Override**: Replace API responses with custom data
- **Redirect**: Redirect requests to different URLs
- **Headers**: Modify request/response headers
- **CORS**: Bypass cross-origin restrictions
- **Mock**: Create fake API endpoints

### Storage:
- Rules are stored in Chrome sync storage
- Settings persist across Chrome sessions
- Automatic backup and restore

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Build the extension: `npm run build:extension`
5. Test in Chrome with the built extension
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📝 Version History

- **v25.6.4**: Major restructuring - eliminated duplicate code, hybrid architecture
- **v1.0.1**: Initial Chrome extension release

## 🐛 Troubleshooting

### Common Issues:
- **Popup not showing**: Check if extension is enabled in chrome://extensions/
- **Rules not working**: Verify extension has permissions for the target website
- **Build errors**: Ensure all dependencies are installed with `npm install`

### Debug Mode:
1. Enable "Developer mode" in chrome://extensions/
2. Use "Inspect popup" to debug popup issues
3. Check browser console for error messages
4. Use source maps for debugging built code

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with React, TypeScript, and Vite
- UI components from Shadcn/UI
- Icons from Lucide React
- Styling with Tailwind CSS

---

**Interzept** - Making API development and debugging effortless! 🚀

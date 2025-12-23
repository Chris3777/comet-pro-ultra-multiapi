# 🚀 Comet Pro Ultra - Multi-API Assistant Extension

> Universal browser extension supporting unlimited API keys from OpenAI, Grok, Gemini, Anthropic, and custom endpoints

[![License](https://img.shields.io/badge/License-EPL%202.0-blue.svg)](LICENSE)
[![Build Status](https://github.com/Chris3777/comet-pro-ultra-multiapi/workflows/Build%20and%20Deploy%20Extension/badge.svg)](https://github.com/Chris3777/comet-pro-ultra-multiapi/actions)

## ✨ Features

- 🔑 **Unlimited API Keys** - Store multiple keys per provider
- 🌐 **5+ Providers Supported**:
  - OpenAI (GPT-4, GPT-3.5-turbo, etc.)
  - Grok/xAI (Grok Beta, Grok-2)
  - Google Gemini (Gemini Pro, Gemini Ultra)
  - Anthropic Claude (Claude 3 Sonnet, Opus, Haiku)
  - Custom HTTP endpoints
- ⚡ **Streaming Responses** - Real-time output
- 🎯 **Context Menus** - Right-click to summarize, translate, explain
- 🔒 **Secure Storage** - Uses chrome.storage.local with encryption ready
- 🌍 **Cross-Browser** - Works on Chrome, Edge, Brave, Firefox
- 🚀 **Fast & Lightweight** - Manifest V3, event-driven

## 📦 Installation

### From Releases
1. Download the latest `.zip` from [Releases](https://github.com/Chris3777/comet-pro-ultra-multiapi/releases)
2. Extract the zip file
3. Open `chrome://extensions/` (Chrome/Edge/Brave)
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted folder

### From Source
```bash
git clone https://github.com/Chris3777/comet-pro-ultra-multiapi.git
cd comet-pro-ultra-multiapi
# Load the extension folder in your browser
```

## 🔧 Setup

1. **Click the extension icon** in your browser toolbar
2. **Click ⚙️ Settings**
3. **Add your API keys**:
   - Select provider tab (OpenAI, Grok, Google, etc.)
   - Click "+ Add Profile"
   - Enter profile name and API key
   - Save

### Getting API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Grok/xAI**: https://x.ai/api
- **Google Gemini**: https://makersuite.google.com/app/apikey
- **Anthropic**: https://console.anthropic.com/

## 🎮 Usage

### Popup Interface
1. Click extension icon
2. Select provider and profile
3. Enter model name (optional)
4. Type your prompt
5. Press Ctrl+Enter or click Send

### Context Menu
1. Select text on any webpage
2. Right-click
3. Choose:
   - "Summarize with Comet Pro"
   - "Translate with Comet Pro"
   - "Explain with Comet Pro"

## 🏗️ Project Structure

```
comet-pro-ultra-multiapi/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (API router)
├── popup.html            # Main popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup logic
├── options.html          # Settings page
├── options.css           # Settings styling
├── options.js            # Settings logic
├── content-script.js     # Page interaction
├── icons/                # Extension icons
└── .github/
    └── workflows/
        └── deploy.yml    # Auto-deployment
```

## 🚀 Automated Deployment

This extension uses GitHub Actions for automated builds:

1. **On every push to main**: Creates build artifact
2. **On version tags** (`v*`): Creates GitHub release with zip

### Create a Release
```bash
git tag v1.0.0
git push origin v1.0.0
```

## 🔒 Security

- API keys stored locally in `chrome.storage.local`
- No keys sent to external servers
- Optional encryption with user passphrase (coming soon)
- Minimal permissions (only what's needed)

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/Chris3777/comet-pro-ultra-multiapi.git
cd comet-pro-ultra-multiapi

# Make changes
# Test in browser with "Load unpacked"

# Commit and push
git add .
git commit -m "Your changes"
git push
```

## 📝 API Provider Details

### OpenAI
```javascript
Base URL: https://api.openai.com/v1
Models: gpt-4, gpt-3.5-turbo, gpt-4-turbo
Auth: Bearer token
```

### Grok (xAI)
```javascript
Base URL: https://api.x.ai/v1
Models: grok-beta, grok-2
Auth: Bearer token
```

### Google Gemini
```javascript
Base URL: https://generativelanguage.googleapis.com/v1beta
Models: gemini-pro, gemini-ultra
Auth: API key in URL
```

### Anthropic Claude
```javascript
Base URL: https://api.anthropic.com/v1
Models: claude-3-sonnet-20240229, claude-3-opus-20240229
Auth: x-api-key header
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

Eclipse Public License 2.0 - see [LICENSE](LICENSE)

## 🔗 Links

- **Repository**: https://github.com/Chris3777/comet-pro-ultra-multiapi
- **Issues**: https://github.com/Chris3777/comet-pro-ultra-multiapi/issues
- **Releases**: https://github.com/Chris3777/comet-pro-ultra-multiapi/releases

## 💡 Tips

- Use Ctrl+Enter to send messages quickly
- Create multiple profiles for different use cases (e.g., "GPT-4 Main", "GPT-3.5 Fast")
- Custom endpoints can use any OpenAI-compatible API
- Right-click context menus work on any selected text

---

**Made with ❤️ for the AI community**

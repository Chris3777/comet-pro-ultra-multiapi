# Chris Assistant Extension - Complete Deployment Guide

## ✅ Files Already Created
- `popup.html` ✓
- `popup.css` ✓
- `popup.js` ✓
- `background.js` ✓
- `manifest.json` ✓

## 📝 Remaining Files to Create

Create these files in your repository:

### 1. **options.html** (Settings Page)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chris Assistant - Settings</title>
  <link rel="stylesheet" href="options.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 Chris Assistant Settings</h1>
    </header>

    <nav class="tabs">
      <button class="tab-btn active" data-tab="openai">OpenAI</button>
      <button class="tab-btn" data-tab="grok">Grok</button>
      <button class="tab-btn" data-tab="google">Google</button>
      <button class="tab-btn" data-tab="anthropic">Anthropic</button>
      <button class="tab-btn" data-tab="custom">Custom</button>
    </nav>

    <div class="tab-content active" id="openai">
      <h2>OpenAI API Keys</h2>
      <div class="profiles-list" id="openai-profiles"></div>
      <button class="btn-add" onclick="addProfile('openai')">+ Add Profile</button>
    </div>

    <div class="tab-content" id="grok">
      <h2>Grok/xAI API Keys</h2>
      <div class="profiles-list" id="grok-profiles"></div>
      <button class="btn-add" onclick="addProfile('grok')">+ Add Profile</button>
    </div>

    <div class="tab-content" id="google">
      <h2>Google Gemini API Keys</h2>
      <div class="profiles-list" id="google-profiles"></div>
      <button class="btn-add" onclick="addProfile('google')">+ Add Profile</button>
    </div>

    <div class="tab-content" id="anthropic">
      <h2>Anthropic Claude API Keys</h2>
      <div class="profiles-list" id="anthropic-profiles"></div>
      <button class="btn-add" onclick="addProfile('anthropic')">+ Add Profile</button>
    </div>

    <div class="tab-content" id="custom">
      <h2>Custom API Endpoints</h2>
      <div class="profiles-list" id="custom-profiles"></div>
      <button class="btn-add" onclick="addProfile('custom')">+ Add Profile</button>
    </div>

    <button class="btn-save" id="save-all">💾 Save All Changes</button>
  </div>

  <script src="options.js"></script>
</body>
</html>
```

### 2. **options.js** (Settings Logic)

```javascript
let config = {
  providers: {
    openai: { profiles: [] },
    grok: { profiles: [] },
    google: { profiles: [] },
    anthropic: { profiles: [] },
    custom: { profiles: [] }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  renderAllProfiles();
  setupTabHandlers();
  document.getElementById('save-all').addEventListener('click', saveAllProfiles);
});

async function loadConfig() {
  const result = await chrome.storage.local.get('config');
  if (result.config) {
    config = result.config;
  }
}

function setupTabHandlers() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

function renderAllProfiles() {
  Object.keys(config.providers).forEach(provider => {
    renderProfiles(provider);
  });
}

function renderProfiles(provider) {
  const container = document.getElementById(`${provider}-profiles`);
  container.innerHTML = '';
  
  config.providers[provider].profiles.forEach((profile, index) => {
    const div = document.createElement('div');
    div.className = 'profile-item';
    div.innerHTML = `
      <input type="text" value="${profile.name}" data-provider="${provider}" data-index="${index}" data-field="name" placeholder="Profile Name">
      <input type="password" value="${profile.apiKey}" data-provider="${provider}" data-index="${index}" data-field="apiKey" placeholder="API Key">
      <button class="btn-delete" onclick="deleteProfile('${provider}', ${index})">🗑️</button>
    `;
    container.appendChild(div);
  });
}

function addProfile(provider) {
  const id = Date.now().toString();
  config.providers[provider].profiles.push({ id, name: '', apiKey: '' });
  renderProfiles(provider);
}

function deleteProfile(provider, index) {
  if (confirm('Delete this profile?')) {
    config.providers[provider].profiles.splice(index, 1);
    renderProfiles(provider);
  }
}

function saveAllProfiles() {
  document.querySelectorAll('input[data-provider]').forEach(input => {
    const provider = input.dataset.provider;
    const index = parseInt(input.dataset.index);
    const field = input.dataset.field;
    config.providers[provider].profiles[index][field] = input.value;
  });
  
  chrome.storage.local.set({ config }, () => {
    alert('✅ Settings saved successfully!');
  });
}
```

### 3. **options.css** (Settings Styling)

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 30px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

header h1 {
  text-align: center;
  color: #667eea;
  margin-bottom: 30px;
  font-size: 32px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.profile-item {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.profile-item input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.btn-add, .btn-save, .btn-delete {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-add {
  background: #667eea;
  color: white;
  width: 100%;
  margin-top: 15px;
}

.btn-save {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  width: 100%;
  margin-top: 30px;
  padding: 15px;
  font-size: 16px;
}

.btn-delete {
  background: #ff4444;
  color: white;
  min-width: 50px;
}

.btn-add:hover, .btn-save:hover, .btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
```

### 4. **content-script.js** (Webpage Interaction)

```javascript
// Content script for Chris Assistant Extension

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONTEXT_MENU_ACTION') {
    // Handle context menu actions
    console.log('Context menu action:', message.action, message.text);
    
    // You can add custom UI overlay here if needed
    showNotification(`Processing: ${message.action}`);
    
    sendResponse({ success: true });
  }
  
  return true;
});

function showNotification(text) {
  const notification = document.createElement('div');
  notification.textContent = text;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #667eea;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
```

### 5. **icons/** (Create placeholder icons)

Create a folder named `icons` and add three PNG files:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

**Quick Icon Generation:**
You can use any of these methods:
1. Generate online at: https://www.favicon-generator.org/
2. Use GIMP/Photoshop to create simple colored squares
3. Temporary: Copy any existing 16x16, 48x48, 128x128 PNG images

## 🚀 Quick Deployment Steps

```bash
# 1. Clone your repository
git clone https://github.com/Chris3777/comet-pro-ultra-multiapi.git
cd comet-pro-ultra-multiapi

# 2. Create missing files (copy content from above)
# Create: options.html, options.js, options.css, content-script.js
# Create: icons/icon16.png, icons/icon48.png, icons/icon128.png

# 3. Commit and push
git add .
git commit -m "Add remaining extension files and icons"
git push origin main

# 4. Load extension in Chrome
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the repository folder
```

## 📦 Creating a Release

```bash
# Tag a new version
git tag v1.0.1
git push origin v1.0.1
```

The GitHub Actions workflow will automatically create a release ZIP file.

## ✅ Testing Checklist

1. ✓ Extension loads without errors
2. ✓ Popup opens and displays correctly
3. ✓ Settings page opens and saves profiles
4. ✓ API calls work with configured keys
5. ✓ Context menus appear on right-click
6. ✓ Icons display correctly

## 🎯 Next Steps for Your Tutorial App Idea

Once this extension is working, you can:
1. Use it as a base for automation
2. Add screenshot capture functionality
3. Integrate video recording APIs
4. Add TTS for voiceover
5. Connect to YouTube API for upload

---
**Created: December 24, 2025**
**Status: Ready for deployment**

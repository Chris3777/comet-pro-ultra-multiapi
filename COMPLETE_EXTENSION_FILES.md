# Complete Extension Code Package

Copy each section into separate files.

## SETUP SCRIPT
```bash
#!/bin/bash
# Run this to create all files automatically

cat > popup.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Comet Pro Ultra</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h1>🚀 Comet Pro Ultra</h1>
    <div class="profile-selector">
      <label>Provider:</label>
      <select id="provider">
        <option value="openai">OpenAI (GPT)</option>
        <option value="grok">Grok (xAI)</option>
        <option value="google">Google Gemini</option>
        <option value="anthropic">Anthropic Claude</option>
        <option value="custom">Custom API</option>
      </select>
    </div>
    <div class="profile-selector">
      <label>Profile:</label>
      <select id="profile"></select>
    </div>
    <div class="model-selector">
      <label>Model:</label>
      <input type="text" id="model" placeholder="e.g., gpt-4, grok-beta">
    </div>
    <div class="prompt-area">
      <textarea id="prompt" placeholder="Ask anything..."></textarea>
    </div>
    <div class="actions">
      <button id="send" class="primary">Send</button>
      <button id="settings">⚙️ Settings</button>
    </div>
    <div id="response" class="response hidden"></div>
    <div id="error" class="error hidden"></div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
EOF

cat > popup.js << 'EOF'
let config = null;
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig(); setupEventListeners(); populateProfiles();
});
async function loadConfig() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
  if (response.success) config = response.config;
}
function setupEventListeners() {
  document.getElementById('provider').addEventListener('change', populateProfiles);
  document.getElementById('send').addEventListener('click', sendMessage);
  document.getElementById('settings').addEventListener('click', () => chrome.runtime.openOptionsPage());
  document.getElementById('prompt').addEventListener('keydown', (e) => { if (e.ctrlKey && e.key === 'Enter') sendMessage(); });
}
function populateProfiles() {
  const provider = document.getElementById('provider').value;
  const profileSelect = document.getElementById('profile');
  profileSelect.innerHTML = '';
  if (!config || !config.providers[provider]) return;
  const profiles = config.providers[provider].profiles;
  profiles.forEach(profile => {
    const option = document.createElement('option');
    option.value = profile.id; option.textContent = profile.name;
    profileSelect.appendChild(option);
  });
  if (profiles.length === 0) profileSelect.innerHTML = '<option>No profiles - Add in Settings</option>';
}
async function sendMessage() {
  const provider = document.getElementById('provider').value;
  const profileId = document.getElementById('profile').value;
  const model = document.getElementById('model').value;
  const prompt = document.getElementById('prompt').value;
  if (!prompt.trim()) return;
  const responseDiv = document.getElementById('response');
  const errorDiv = document.getElementById('error');
  responseDiv.classList.add('hidden'); errorDiv.classList.add('hidden');
  responseDiv.textContent = 'Thinking...'; responseDiv.classList.remove('hidden');
  const response = await chrome.runtime.sendMessage({ type: 'CALL_MODEL', payload: { provider, profileId, model, messages: [{ role: 'user', content: prompt }] } });
  if (response.success) { responseDiv.textContent = response.result; }
  else { responseDiv.classList.add('hidden'); errorDiv.textContent = 'Error: ' + response.error; errorDiv.classList.remove('hidden'); }
}
EOF

cat > content-script.js << 'EOF'
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONTEXT_MENU_ACTION') alert('Comet Pro: ' + message.prompt);
});
EOF

echo "All files created! Load extension in chrome://extensions/"
```

## Quick Deploy
1. Clone: `git clone https://github.com/Chris3777/comet-pro-ultra-multiapi.git`
2. Run setup script above
3. Load in Chrome
4. Add your API keys

**Repository**: https://github.com/Chris3777/comet-pro-ultra-multiapi

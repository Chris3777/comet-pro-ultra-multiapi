// Comet Pro Ultra - Universal Multi-API Background Service Worker
// Supports: OpenAI, Grok (xAI), Google Gemini, Anthropic Claude, and custom endpoints

const DEFAULT_CONFIG = {
  providers: {
    openai: { profiles: [], baseUrl: 'https://api.openai.com/v1' },
    grok: { profiles: [], baseUrl: 'https://api.x.ai/v1' },
    google: { profiles: [], baseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
    anthropic: { profiles: [], baseUrl: 'https://api.anthropic.com/v1' },
    custom: { profiles: [] }
  },
  activeProfile: null
};

// Get configuration from storage
async function getConfig() {
  const result = await chrome.storage.local.get(['config']);
  return result.config || DEFAULT_CONFIG;
}

// Save configuration
async function saveConfig(config) {
  await chrome.storage.local.set({ config });
  return config;
}

// OpenAI API caller
async function callOpenAI(profile, model, messages, stream = false) {
  const url = `${profile.baseUrl || DEFAULT_CONFIG.providers.openai.baseUrl}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${profile.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'gpt-4',
      messages,
      stream
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }
  
  if (stream) return response.body;
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Grok (xAI) API caller
async function callGrok(profile, model, messages, stream = false) {
  const url = `${profile.baseUrl || DEFAULT_CONFIG.providers.grok.baseUrl}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${profile.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'grok-beta',
      messages,
      stream
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok API error (${response.status}): ${error}`);
  }
  
  if (stream) return response.body;
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Google Gemini API caller  
async function callGoogle(profile, model, messages, stream = false) {
  const modelName = model || 'gemini-pro';
  const url = `${profile.baseUrl || DEFAULT_CONFIG.providers.google.baseUrl}/models/${modelName}:generateContent?key=${profile.apiKey}`;
  
  // Convert OpenAI format to Gemini format
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google API error (${response.status}): ${error}`);
  }
  
  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
}

// Anthropic Claude API caller
async function callAnthropic(profile, model, messages, stream = false) {
  const url = `${profile.baseUrl || DEFAULT_CONFIG.providers.anthropic.baseUrl}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': profile.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'claude-3-sonnet-20240229',
      messages,
      max_tokens: 4096,
      stream
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }
  
  if (stream) return response.body;
  const data = await response.json();
  return data.content[0]?.text || '';
}

// Custom endpoint caller
async function callCustom(profile, model, messages, stream = false) {
  const headers = {
    'Content-Type': 'application/json',
    ...(profile.headers || {})
  };
  
  if (profile.apiKey) {
    headers['Authorization'] = `Bearer ${profile.apiKey}`;
  }
  
  const response = await fetch(profile.baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      stream
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Custom API error (${response.status}): ${error}`);
  }
  
  if (stream) return response.body;
  const data = await response.json();
  return data.choices?.[0]?.message?.content || data.content || data.response || '';
}

// Main router function
async function callModel({ provider, profileId, model, messages, stream = false }) {
  const config = await getConfig();
  const providerConfig = config.providers[provider];
  
  if (!providerConfig) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  
  const profile = providerConfig.profiles.find(p => p.id === profileId);
  if (!profile) {
    throw new Error(`Profile not found: ${profileId}`);
  }
  
  switch (provider) {
    case 'openai':
      return await callOpenAI(profile, model, messages, stream);
    case 'grok':
      return await callGrok(profile, model, messages, stream);
    case 'google':
      return await callGoogle(profile, model, messages, stream);
    case 'anthropic':
      return await callAnthropic(profile, model, messages, stream);
    case 'custom':
      return await callCustom(profile, model, messages, stream);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CALL_MODEL') {
    callModel(message.payload)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Async response
  }
  
  if (message.type === 'GET_CONFIG') {
    getConfig()
      .then(config => sendResponse({ success: true, config }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.type === 'SAVE_CONFIG') {
    saveConfig(message.payload)
      .then(config => sendResponse({ success: true, config }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'comet-summarize',
    title: 'Summarize with Comet Pro',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'comet-translate',
    title: 'Translate with Comet Pro',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'comet-explain',
    title: 'Explain with Comet Pro',
    contexts: ['selection']
  });
});

// Context menu handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const text = info.selectionText;
  let prompt = '';
  
  switch (info.menuItemId) {
    case 'comet-summarize':
      prompt = `Summarize this text concisely: ${text}`;
      break;
    case 'comet-translate':
      prompt = `Translate this to English: ${text}`;
      break;
    case 'comet-explain':
      prompt = `Explain this in simple terms: ${text}`;
      break;
  }
  
  // Send to content script
  chrome.tabs.sendMessage(tab.id, {
    type: 'CONTEXT_MENU_ACTION',
    prompt,
    selectedText: text
  });
});

console.log('Comet Pro Ultra background service worker loaded');

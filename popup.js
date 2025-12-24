// popup.js - Frontend logic for Chris Assistant Extension

let config = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  setupEventListeners();
  populateProfiles();
});

async function loadConfig() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
    if (response.success) {
      config = response.config;
    } else {
      showError('Failed to load configuration');
    }
  } catch (error) {
    showError('Error loading configuration: ' + error.message);
  }
}

function setupEventListeners() {
  document.getElementById('provider').addEventListener('change', populateProfiles);
  document.getElementById('send').addEventListener('click', sendMessage);
  document.getElementById('settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('prompt').addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      sendMessage();
    }
  });
}

function populateProfiles() {
  const provider = document.getElementById('provider').value;
  const profileSelect = document.getElementById('profile');
  profileSelect.innerHTML = '';
  
  if (!config || !config.providers || !config.providers[provider]) {
    profileSelect.innerHTML = '<option>No profiles - Add in Settings</option>';
    return;
  }
  
  const profiles = config.providers[provider].profiles;
  
  if (profiles && profiles.length > 0) {
    profiles.forEach(profile => {
      const option = document.createElement('option');
      option.value = profile.id;
      option.textContent = profile.name;
      profileSelect.appendChild(option);
    });
  } else {
    profileSelect.innerHTML = '<option>No profiles - Add in Settings</option>';
  }
}

async function sendMessage() {
  const provider = document.getElementById('provider').value;
  const profileId = document.getElementById('profile').value;
  const model = document.getElementById('model').value;
  const prompt = document.getElementById('prompt').value;
  
  if (!prompt.trim()) {
    showError('Please enter a message');
    return;
  }
  
  if (!config || !config.providers || !config.providers[provider] || 
      !config.providers[provider].profiles || 
      config.providers[provider].profiles.length === 0) {
    showError('No API profiles configured. Please add profiles in Settings.');
    return;
  }
  
  const responseDiv = document.getElementById('response');
  const errorDiv = document.getElementById('error');
  
  responseDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
  
  responseDiv.textContent = 'Thinking...';
  responseDiv.classList.remove('hidden');
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CALL_MODEL',
      payload: {
        provider,
        profileId,
        model: model || undefined,
        messages: [{ role: 'user', content: prompt }]
      }
    });
    
    if (response.success) {
      responseDiv.textContent = response.result;
    } else {
      responseDiv.classList.add('hidden');
      showError('Error: ' + response.error);
    }
  } catch (error) {
    responseDiv.classList.add('hidden');
    showError('Request failed: ' + error.message);
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  
  setTimeout(() => {
    errorDiv.classList.add('hidden');
  }, 5000);
}

// AntiGravity Nexus - Logic Core

// --- STATE MANAGEMENT ---
const state = {
    config: JSON.parse(localStorage.getItem('nexus-config')) || {
        provider: 'ollama',
        baseUrl: 'http://localhost:11434/api/chat',
        apiKey: '',
        model: 'llama3'
    },
    messages: [],
    currentArtifact: ''
};

// --- DOM ELEMENTS ---
const dom = {
    chatStream: document.getElementById('chat-stream'),
    input: document.getElementById('user-input'),
    previewFrame: document.getElementById('preview-frame'),
    codeDisplay: document.getElementById('code-display'),
    statusDot: document.getElementById('status-dot'),
    previewPlaceholder: document.querySelector('.preview-placeholder'),
    modal: document.getElementById('config-modal')
};

// --- INITIALIZATION ---
window.app = {};

app.init = () => {
    app.updateStatus();
    dom.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            app.sendMessage();
        }
    });

    // Populate inputs with saved config
    document.getElementById('api-url').value = state.config.baseUrl;
    document.getElementById('api-key').value = state.config.apiKey;
    document.getElementById('model-name').value = state.config.model;
    document.getElementById('provider-select').value = state.config.provider;
    document.getElementById('current-model-name').textContent = state.config.model;
};

// --- UI ACTIONS ---
app.newChat = () => {
    state.messages = [];
    dom.chatStream.innerHTML = `
        <div class="empty-state">
            <h1>Nexus Agent Ready.</h1>
            <div class="suggestion-chips">
                <button onclick="app.quickPrompt('Create a dashboard with HTML/CSS')">Create UI</button>
                <button onclick="app.quickPrompt('Write a Python script for data analysis')">Python Helper</button>
            </div>
        </div>
    `;
    dom.previewFrame.srcdoc = '';
    dom.previewPlaceholder.style.display = 'flex';
};

app.toggleConfig = () => {
    dom.modal.classList.toggle('hidden');
};

app.quickPrompt = (text) => {
    dom.input.value = text;
    app.sendMessage();
};

app.switchTab = (tab) => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view-layer').forEach(v => v.classList.remove('active'));
    
    // Find button with text matching tab
    const buttons = document.querySelectorAll('.tab');
    if (tab === 'preview') {
        buttons[0].classList.add('active');
        document.getElementById('view-preview').classList.add('active');
    } else {
        buttons[1].classList.add('active');
        document.getElementById('view-code').classList.add('active');
    }
};

app.updateForm = () => {
    const type = document.getElementById('provider-select').value;
    const urlInput = document.getElementById('api-url');
    
    if (type === 'ollama') {
        urlInput.value = 'http://localhost:11434/api/chat';
    } else if (type === 'openai') {
        urlInput.value = 'https://api.openai.com/v1/chat/completions';
    } else if (type === 'openrouter') {
        urlInput.value = 'https://openrouter.ai/api/v1/chat/completions';
    }
};

app.saveConfig = () => {
    state.config = {
        provider: document.getElementById('provider-select').value,
        baseUrl: document.getElementById('api-url').value,
        apiKey: document.getElementById('api-key').value,
        model: document.getElementById('model-name').value
    };
    
    localStorage.setItem('nexus-config', JSON.stringify(state.config));
    document.getElementById('current-model-name').textContent = state.config.model;
    app.toggleConfig();
    app.updateStatus();
};

app.updateStatus = async () => {
    // Simple check - just to see if config exists
    dom.statusDot.className = 'status-indicator online';
    dom.statusDot.title = `Connected to ${state.config.provider}`;
};

// --- CHAT ENGINE ---
app.sendMessage = async () => {
    const text = dom.input.value.trim();
    if (!text) return;

    // Add User Message
    app.appendMessage('user', text);
    dom.input.value = '';
    dom.input.style.height = 'auto';

    // Add AI Placeholder
    const aiMsgId = `msg-${Date.now()}`;
    app.appendMessage('ai', '<span class="typing">Thinking...</span>', aiMsgId);

    // Prepare History
    const history = state.messages.map(m => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: text });

    // Stream Response
    let fullResponse = '';
    try {
        await streamResponse(history, state.config, (chunk) => {
            fullResponse += chunk;
            document.getElementById(aiMsgId).innerHTML = marked.parse(fullResponse);

            // Real-time Code Extraction (Simple)
            if (fullResponse.includes('```html') || fullResponse.includes('<!DOCTYPE html')) {
                app.extractAndRender(fullResponse);
            }
        });

        // Finalize
        state.messages.push({ role: 'user', content: text });
        state.messages.push({ role: 'assistant', content: fullResponse });
        hljs.highlightAll();
    } catch (err) {
        document.getElementById(aiMsgId).innerHTML = `<span style="color:red">Error: ${err.message}</span>`;
    }
};

app.appendMessage = (role, html, id = null) => {
    // Remove empty state if exists
    const empty = document.querySelector('.empty-state');
    if (empty) empty.remove();

    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerHTML = `
        <div class="msg-avatar">${role === 'user' ? '<i class="ri-user-line"></i>' : '<i class="ri-infinity-line"></i>'}</div>
        <div class="msg-content" id="${id}">${html}</div>
    `;
    dom.chatStream.appendChild(div);
    dom.chatStream.scrollTop = dom.chatStream.scrollHeight;
};

// --- ARTIFACT ENGINE (Preview Code) ---
app.extractAndRender = (text) => {
    // Regex to find HTML blocks
    const htmlMatch = text.match(/```html\n([\s\S]*?)```/);
    if (htmlMatch && htmlMatch[1]) {
        const code = htmlMatch[1];
        state.currentArtifact = code;

        // Render to Iframe
        dom.previewFrame.srcdoc = code;
        dom.previewPlaceholder.style.display = 'none';

        // Render to Code View
        dom.codeDisplay.textContent = code;

        // Auto switch to preview if first time
        if (!dom.previewFrame.classList.contains('has-content')) {
            app.switchTab('preview');
            dom.previewFrame.classList.add('has-content');
        }
    }
};

app.copyArtifact = () => {
    navigator.clipboard.writeText(state.currentArtifact);
    alert('Code copied to clipboard!');
};

// --- GENERIC LLM STREAMER ---
async function streamResponse(messages, config, onChunk) {
    const isOllama = config.provider === 'ollama';
    const isOpenAI = config.provider === 'openai' || config.provider === 'openrouter';

    const headers = {
        'Content-Type': 'application/json'
    };

    if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    if (config.provider === 'openrouter') {
        headers['HTTP-Referer'] = 'http://localhost:8080'; // Required by OpenRouter
    }

    // Payload adaptation
    const payload = {
        model: config.model,
        messages: messages,
        stream: true
    };

    if (isOllama) {
        payload.options = { temperature: 0.7 }; // Ollama specific
    }

    const response = await fetch(config.baseUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (isOllama) {
                // Ollama format: { message: { content: ... }, done: false }
                try {
                    const json = JSON.parse(trimmed);
                    if (json.message && json.message.content) {
                        onChunk(json.message.content);
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            } else if (isOpenAI) {
                // OpenAI format: data: { ... }
                if (trimmed.startsWith('data: ')) {
                    const dataStr = trimmed.replace('data: ', '');
                    if (dataStr === '[DONE]') continue;

                    try {
                        const json = JSON.parse(dataStr);
                        const content = json.choices?.[0]?.delta?.content;
                        if (content) onChunk(content);
                    } catch (e) {
                        // Ignore
                    }
                }
            }
        }
    }
}

// Start
app.init();

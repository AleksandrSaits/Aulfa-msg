// Если фронтенд и бэкенд на одном сервере (например, Render Web Service), оставьте пустым "".
// Если фронтенд на GitHub Pages, укажите URL вашего бэкенда на Render, например: "https://my-messenger.onrender.com"
const BACKEND_URL = "";

let ws = null;
let currentUser = "";

const authScreen = document.getElementById("auth-screen");
const chatScreen = document.getElementById("chat-screen");
const usernameInput = document.getElementById("username-input");
const joinBtn = document.getElementById("join-btn");
const currentUserDisplay = document.getElementById("current-user-display");
const statusIndicator = document.getElementById("status-indicator");
const messagesContainer = document.getElementById("messages-container");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

function getWebSocketUrl(user) {
    if (BACKEND_URL) {
        const cleanUrl = BACKEND_URL.replace(/\/$/, "");
        const wsBase = cleanUrl.replace(/^http/, "ws");
        return `${wsBase}/ws/${encodeURIComponent(user)}`;
    }
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/${encodeURIComponent(user)}`;
}

function connectWebSocket() {
    const wsUrl = getWebSocketUrl(currentUser);
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        statusIndicator.textContent = "В сети";
        statusIndicator.className = "status online";
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        renderMessage(data);
    };

    ws.onclose = () => {
        statusIndicator.textContent = "Отключено";
        statusIndicator.className = "status offline";
        setTimeout(connectWebSocket, 3000);
    };
}

function renderMessage(data) {
    const msgDiv = document.createElement("div");

    if (data.type === "system") {
        msgDiv.className = "message system";
        msgDiv.textContent = data.text;
    } else {
        const isOwn = data.sender === currentUser;
        msgDiv.className = `message ${isOwn ? "own" : ""}`;
        
        const metaDiv = document.createElement("div");
        metaDiv.className = "message-meta";
        metaDiv.innerHTML = `<span>${escapeHtml(data.sender)}</span><span>${data.time}</span>`;
        
        const textDiv = document.createElement("div");
        textDiv.className = "message-text";
        textDiv.textContent = data.text;
        
        msgDiv.appendChild(metaDiv);
        msgDiv.appendChild(textDiv);
    }

    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function enterChat() {
    const name = usernameInput.value.trim();
    if (!name) return;
    currentUser = name;
    currentUserDisplay.textContent = currentUser;
    authScreen.classList.remove("active");
    chatScreen.classList.add("active");
    connectWebSocket();
}

joinBtn.addEventListener("click", enterChat);
usernameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") enterChat();
});

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (text && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text }));
        messageInput.value = "";
    }
});

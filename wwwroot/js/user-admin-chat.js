/**
 * User Chat Module - Chat với Admin và các user khác
 * Hỗ trợ lưu lịch sử chat trên localStorage
 */

const ADMIN_ID = 999;
const ADMIN_NAME = "admin";
const ADMIN_AVATAR = "https://i.pravatar.cc/150?img=999";
const STORAGE_KEY = 'user_admin_chat_history';

let selectedUserId = null;
let selectedUserName = null;
let userChatMessages = {};
let allUsers = [];
const currentUserId = parseInt(sessionStorage.getItem("userId")) || 0;
const currentUserName = sessionStorage.getItem("userName") || "User";

// ==================== INITIALIZATION ====================

function initUserChat() {
    if (!currentUserId) {
        console.log("User not logged in");
        return;
    }
    
    loadUsersList();
    setupChatEventListeners();
    // Auto-refresh messages every 2 seconds
    setInterval(refreshChatMessages, 2000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserChat);
} else {
    initUserChat();
}

// ==================== LOAD USERS ====================

async function loadUsersList() {
    try {
        const response = await fetch('/api/UserAdminChat/users');
        const result = await response.json();

        if (!result.success) {
            console.error('Error loading users:', result.message);
            // Vẫn thêm admin ngay cả khi API fail
            allUsers = [getAdminUser()];
            displayUsersList();
            return;
        }

        // Thêm admin vào danh sách
        allUsers = result.data || [];
        allUsers.unshift(getAdminUser()); // Thêm admin lên đầu danh sách
        
        displayUsersList();
    } catch (error) {
        console.error('Error loading users:', error);
        // Fallback: chỉ hiển thị admin
        allUsers = [getAdminUser()];
        displayUsersList();
    }
}

function getAdminUser() {
    return {
        MaNguoiDung: ADMIN_ID,
        TenDangNhap: ADMIN_NAME,
        Email: "admin@utc.edu.vn",
        Avatar: ADMIN_AVATAR,
        IsOnline: true
    };
}

function displayUsersList() {
    const usersList = document.getElementById('userChatAdminsList');
    if (!usersList) return;

    usersList.innerHTML = '';

    if (allUsers.length === 0) {
        usersList.innerHTML = '<div class="loading">Không có người dùng nào</div>';
        return;
    }

    allUsers.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'admin-item-chat';
        if (user.MaNguoiDung === ADMIN_ID) {
            userItem.classList.add('admin-badge'); // Đánh dấu là admin
        }
        
        userItem.innerHTML = `
            <img src="${user.Avatar}" alt="${user.TenDangNhap}" class="admin-avatar" />
            <div class="admin-info">
                <div class="admin-name">
                    ${escapeHtml(user.TenDangNhap)}
                    ${user.MaNguoiDung === ADMIN_ID ? '<span class="admin-label">👑 Admin</span>' : ''}
                </div>
                <div class="admin-status">
                    <span class="status-dot online"></span>
                    Online
                </div>
            </div>
        `;
        userItem.addEventListener('click', () => selectUser(user.MaNguoiDung, user));
        usersList.appendChild(userItem);
    });
}

// ==================== SELECT USER ====================

function selectUser(userId, user) {
    selectedUserId = userId;
    selectedUserName = user.TenDangNhap;

    // Update active state
    document.querySelectorAll('.admin-item-chat').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.closest('.admin-item-chat').classList.add('active');

    // Update header
    document.getElementById('chatWithAdminAvatar').src = user.Avatar;
    document.getElementById('chatWithAdminName').textContent = escapeHtml(user.TenDangNhap);
    if (user.MaNguoiDung === ADMIN_ID) {
        document.getElementById('chatWithAdminName').textContent += ' 👑';
    }
    document.getElementById('chatWithAdminStatus').textContent = '🟢 Online';

    // Enable input
    document.getElementById('userMessageInput').disabled = false;
    document.getElementById('userSendBtn').disabled = false;

    // Load messages from localStorage
    loadMessages();
}

// ==================== LOAD & SAVE MESSAGES ====================

function getConversationKey(userId1, userId2) {
    // Tạo key nhất quán cho cuộc trò chuyện
    const min = Math.min(userId1, userId2);
    const max = Math.max(userId1, userId2);
    return `chat_${min}_${max}`;
}

function loadMessages() {
    if (!selectedUserId || !currentUserId) return;

    const conversationKey = getConversationKey(currentUserId, selectedUserId);
    const storedMessages = localStorage.getItem(conversationKey);
    
    let messages = [];
    if (storedMessages) {
        try {
            messages = JSON.parse(storedMessages);
        } catch (e) {
            console.error('Error parsing stored messages:', e);
            messages = [];
        }
    }

    userChatMessages[selectedUserId] = messages;
    displayMessages(messages);
}

function saveMessages(messages) {
    if (!selectedUserId || !currentUserId) return;
    
    const conversationKey = getConversationKey(currentUserId, selectedUserId);
    try {
        localStorage.setItem(conversationKey, JSON.stringify(messages));
    } catch (e) {
        console.error('Error saving messages to localStorage:', e);
    }
}

function displayMessages(messages) {
    const messagesArea = document.getElementById('userChatMessages');
    if (!messagesArea) return;

    messagesArea.innerHTML = '';

    if (messages.length === 0) {
        messagesArea.innerHTML = `
            <div class="empty-chat-state">
                <p>💬 Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!</p>
            </div>
        `;
        return;
    }

    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        const isFromCurrentUser = msg.senderId === currentUserId;
        messageDiv.className = `chat-message ${isFromCurrentUser ? 'user-msg' : 'admin-msg'}`;

        const time = new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="msg-bubble">
                <div class="msg-sender">${escapeHtml(msg.senderName)}</div>
                <div class="msg-text">${escapeHtml(msg.message)}</div>
                <div class="msg-time">${time}</div>
            </div>
        `;

        messagesArea.appendChild(messageDiv);
    });

    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// ==================== SEND MESSAGE ====================

function sendUserMessage() {
    if (!selectedUserId || !currentUserId) {
        alert('Vui lòng chọn một người để chat');
        return;
    }

    const input = document.getElementById('userMessageInput');
    const message = input.value.trim();

    if (!message) return;

    try {
        // Tạo message object
        const newMessage = {
            id: generateId(),
            senderId: currentUserId,
            senderName: currentUserName,
            receiverId: selectedUserId,
            message: message,
            timestamp: new Date().toISOString(),
            isRead: false
        };

        // Lấy tin nhắn cũ
        const messages = userChatMessages[selectedUserId] || [];
        messages.push(newMessage);

        // Lưu vào localStorage
        saveMessages(messages);

        // Cập nhật hiển thị
        userChatMessages[selectedUserId] = messages;
        displayMessages(messages);

        // Xóa input
        input.value = '';

        // Gửi đến server (optional - nếu có backend)
        if (selectedUserId !== ADMIN_ID) {
            sendToServer(newMessage);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Lỗi kết nối: ' + error.message);
    }
}

function sendToServer(message) {
    // Gửi tin nhắn đến server nếu không phải admin
    fetch('/api/UserAdminChat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            senderId: message.senderId,
            receiverId: message.receiverId,
            senderName: message.senderName,
            message: message.message
        })
    }).catch(error => console.error('Error sending to server:', error));
}

// ==================== AUTO REFRESH ====================

async function refreshChatMessages() {
    if (!selectedUserId) return;
    loadMessages();
}

// ==================== EVENT LISTENERS ====================

function setupChatEventListeners() {
    const form = document.getElementById('userChatForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            sendUserMessage();
        });
    }

    const searchInput = document.getElementById('userChatSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.admin-item-chat').forEach(item => {
                const name = item.querySelector('.admin-name').textContent.toLowerCase();
                item.style.display = name.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    const sendBtn = document.getElementById('userSendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sendUserMessage();
        });
    }
}

// ==================== UTILITIES ====================

function generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.sendUserMessage = sendUserMessage;
window.selectUser = selectUser;
window.initUserChat = initUserChat;
/**
 * Realtime Chat Module
 * Quản lý giao diện và logic chat realtime
 */

// ==================== STATE ====================
let selectedUserId = null;
let currentUserMessages = {};
let adminMessages = [];
let allChatUsers = [
    { id: 0, name: "Admin", avatar: "https://i.pravatar.cc/150?img=0", isOnline: true },
    { id: 1, name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=1", isOnline: true },
    { id: 2, name: "Trần Thị B", avatar: "https://i.pravatar.cc/150?img=2", isOnline: true },
    { id: 3, name: "Phạm Văn C", avatar: "https://i.pravatar.cc/150?img=3", isOnline: false },
    { id: 4, name: "Lê Minh D", avatar: "https://i.pravatar.cc/150?img=4", isOnline: true },
    //{ id: 5, name: "Hoàng Thanh E", avatar: "https://i.pravatar.cc/150?img=5", isOnline: false },
    //{ id: 6, name: "Đỗ Hữu F", avatar: "https://i.pravatar.cc/150?img=6", isOnline: true },
];

// ==================== INITIALIZATION ====================
/**
 * Khởi tạo module Chat Realtime
 */
function initRealtimeChat() {
    loadAdminChatHistory();
    loadRealtimeChatUsers();
    setupRealtimeChatEventListeners();
}

// Tự động khởi tạo khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRealtimeChat);
} else {
    initRealtimeChat();
}

// ==================== ADMIN CHAT STORAGE ====================
/**
 * Lưu lịch sử chat với admin vào localStorage
 */
function saveAdminChatHistory() {
    localStorage.setItem('adminChatHistory', JSON.stringify(adminMessages));
}

/**
 * Tải lịch sử chat với admin từ localStorage
 */
function loadAdminChatHistory() {
    const saved = localStorage.getItem('adminChatHistory');
    if (saved) {
        adminMessages = JSON.parse(saved);
    }
}

/**
 * Thêm tin nhắn vào lịch sử admin và lưu
 * @param {object} message - Đối tượng tin nhắn
 */
function addAdminMessage(message) {
    adminMessages.push(message);
    saveAdminChatHistory();
}

// ==================== LOAD USERS ====================
/**
 * Tải danh sách người dùng vào sidebar
 */
function loadRealtimeChatUsers() {
    const usersList = document.getElementById('realtimeChatUsersList');
    if (!usersList) return;

    usersList.innerHTML = '';

    allChatUsers.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item-realtime';
        userItem.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}" loading="lazy" />
            <div class="user-item-info">
                <div class="user-item-name">${escapeHtml(user.name)}</div>
                <div class="user-item-status">
                    <span class="${user.isOnline ? 'online-dot' : 'offline-dot'}"></span>
                    ${user.isOnline ? 'Online' : 'Offline'}
                </div>
            </div>
        `;
        userItem.addEventListener('click', () => selectRealtimeChatUser(user.id, user));
        usersList.appendChild(userItem);
    });
}

// ==================== SELECT USER ====================
/**
 * Chọn người để chat
 * @param {number} userId - ID của người dùng
 * @param {object} user - Thông tin người dùng
 */
function selectRealtimeChatUser(userId, user) {
    selectedUserId = userId;

    // Cập nhật active state
    document.querySelectorAll('.user-item-realtime').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Cập nhật chat header
    document.getElementById('selectedUserAvatar').src = user.avatar;
    document.getElementById('selectedUserName').textContent = escapeHtml(user.name);
    document.getElementById('selectedUserStatus').textContent = 
        user.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến';   
    
    // Cập nhật online indicator
    const indicator = document.getElementById('onlineIndicator');
    indicator.classList.remove('offline');
    indicator.classList.add(user.isOnline ? 'online' : 'offline');

    // Bật/tắt input
    document.getElementById('realtimeMessageInput').disabled = false;
    document.getElementById('realtimeSendBtn').disabled = false;

    // Tải tin nhắn
    loadRealtimeMessages(userId);
}

// ==================== LOAD MESSAGES ====================
/**
 * Tải tin nhắn cho người dùng được chọn
 * @param {number} userId - ID của người dùng
 */
function loadRealtimeMessages(userId) {
    const messagesArea = document.getElementById('realtimeChatMessages');
    messagesArea.innerHTML = '';

    let messages = [];

    // Admin chat sử dụng adminMessages, người dùng khác sử dụng currentUserMessages
    if (userId === 0) {
        messages = adminMessages;
    } else {
        if (!currentUserMessages[userId]) {
            currentUserMessages[userId] = [];
        }
        messages = currentUserMessages[userId];
    }

    if (messages.length === 0) {
        messagesArea.innerHTML = `
            <div class="empty-messages">
                <div class="empty-icon">💬</div>
                <p>Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</p>
            </div>
        `;
        return;
    }

    messages.forEach(msg => {
        renderRealtimeMessage(msg, false);
    });

    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// ==================== RENDER MESSAGE ====================
/**
 * Render một tin nhắn vào chat area
 * @param {object} message - Đối tượng tin nhắn
 * @param {boolean} scroll - Cuộn đến dưới cùng hay không
 */
function renderRealtimeMessage(message, scroll = true) {
    const messagesArea = document.getElementById('realtimeChatMessages');
    
    // Xóa empty state nếu có
    if (messagesArea.innerHTML.includes('empty-messages') || messagesArea.innerHTML.includes('Chọn một người')) {
        messagesArea.innerHTML = '';
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${message.fromMe ? 'sent' : 'received'}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div>
            <div class="message-content ${message.fromMe ? 'sent' : 'received'}">
                ${escapeHtml(message.text)}
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;

    messagesArea.appendChild(messageDiv);
    
    if (scroll) {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
}

// ==================== SEND MESSAGE ====================
/**
 * Gửi tin nhắn
 * @param {event} event - Form submit event
 */
function sendRealtimeMessage(event) {
    event.preventDefault();

    if (!selectedUserId && selectedUserId !== 0) {
        alert('Vui lòng chọn một người để chat');
        return;
    }

    const messageInput = document.getElementById('realtimeMessageInput');
    const messageText = messageInput.value.trim();

    if (!messageText) return;

    const message = {
        id: Date.now(),
        text: messageText,
        fromMe: true,
        timestamp: new Date()
    };

    // Xử lý admin chat
    if (selectedUserId === 0) {
        addAdminMessage(message);
        renderRealtimeMessage(message);
        messageInput.value = '';
        
        // Admin phản hồi sau một khoảng thời gian
        setTimeout(() => {
            receiveAdminMessage();
        }, 1000 + Math.random() * 1000);
    } else {
        // Xử lý chat với người dùng khác
        if (!currentUserMessages[selectedUserId]) {
            currentUserMessages[selectedUserId] = [];
        }

        currentUserMessages[selectedUserId].push(message);
        renderRealtimeMessage(message);
        messageInput.value = '';

        setTimeout(() => {
            receiveRealtimeMessage();
        }, 1000 + Math.random() * 1000);
    }
}

// ==================== RECEIVE MESSAGE ====================
/**
 * Mô phỏng nhận tin nhắn từ người khác
 */
function receiveRealtimeMessage() {
    const user = allChatUsers.find(u => u.id === selectedUserId);
    if (!user || !user.isOnline) return;

    const responses = [
        'Vâng, tôi hiểu rồi! 👍',
        'Đó là ý hay! 💡',
        'Tôi hoàn toàn đồng ý 😊',
        'Cảm ơn bạn đã chia sẻ!',
        'Thật tuyệt vời!',
        'Mình rất thích điều đó! 💯',
        'Có vẻ hay lắm!',
        'Bạn nói đúng đó!'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const message = {
        id: Date.now(),
        text: randomResponse,
        fromMe: false,
        timestamp: new Date()
    };

    currentUserMessages[selectedUserId].push(message);
    renderRealtimeMessage(message);
}

/**
 * Mô phỏng nhận tin nhắn từ admin
 */
function receiveAdminMessage() {
    const adminResponses = [
        'Cảm ơn bạn đã liên hệ! 😊',
        'Tôi sẽ giúp bạn ngay. 👍',
        'Có gì tôi có thể hỗ trợ? 💡',
        'Thông tin của bạn đã được ghi nhận.',
        'Hãy chờ tôi xử lý nhé!',
        'Bạn có thêm câu hỏi nào không? 🤔',
        'Tất cả đã ổn định, cảm ơn bạn!',
        'Mình sẽ xem xét và phản hồi sớm!'
    ];

    const randomResponse = adminResponses[Math.floor(Math.random() * adminResponses.length)];

    const message = {
        id: Date.now(),
        text: randomResponse,
        fromMe: false,
        timestamp: new Date()
    };

    addAdminMessage(message);
    renderRealtimeMessage(message);
}

// ==================== EVENT LISTENERS ====================
/**
 * Thiết lập các event listeners
 */
function setupRealtimeChatEventListeners() {
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.user-item-realtime').forEach(item => {
                const name = item.querySelector('.user-item-name').textContent.toLowerCase();
                item.style.display = name.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// ==================== UTILITIES ====================
/**
 * Escape HTML để tránh XSS
 * @param {string} text - Text cần escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
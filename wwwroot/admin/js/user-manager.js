// ===============================
// MODULE QUẢN LÝ USER (NÂNG CẤP LOCAL STORAGE)
// ===============================

const STORAGE_KEY = 'admin_dashboard_users'; // Tên key lưu trong trình duyệt
const ITEMS_PER_PAGE = 5;
let currentPage = 1;

// Biến chứa toàn bộ user (Database giả lập)
let allUsers = [];
// Biến chứa user đang hiển thị (đã qua lọc/search)
let filteredUsers = [];

let currentActionUser = null;

// ===============================
// KHỞI TẠO DỮ LIỆU
// ===============================

document.addEventListener("DOMContentLoaded", function () {
    // 1. Tải dữ liệu từ LocalStorage hoặc Mock Data
    initData();

    // 2. Router logic cho từng trang
    if (document.getElementById("userTable")) {
        // Trang danh sách user
        loadUsersPage();
    } else if (document.getElementById("userName")) {
        // Trang chi tiết user
        loadUserDetailPage();
    } else if (document.getElementById("total-users")) {
        // Trang Dashboard
        loadDashboardStats();
    }

    // Thêm nút Reset dữ liệu (để test)
    setupResetButton();
});

// Hàm quan trọng: Khởi tạo dữ liệu "Database"
function initData() {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (storedData) {
        // Nếu đã có dữ liệu trong trình duyệt -> Lấy ra dùng
        allUsers = JSON.parse(storedData);
    } else {
        // Nếu chưa có (lần đầu vào) -> Lấy từ mock-data.js và lưu vào trình duyệt
        // (Biến mockUsers lấy từ file mock-data.js đã load trước đó)
        allUsers = [...mockUsers];
        saveData();
    }
}

// Hàm lưu dữ liệu xuống trình duyệt
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
}

// ===============================
// LOGIC TRANG DANH SÁCH USER
// ===============================

function loadUsersPage() {
    // Mặc định hiển thị tất cả
    filteredUsers = [...allUsers];
    renderTable();
    updatePagination();
    setupEventListeners();
}

function setupEventListeners() {
    // Search
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", handleSearch);

    // Filters
    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) statusFilter.addEventListener("change", handleFilter);

    const roleFilter = document.getElementById("roleFilter");
    if (roleFilter) roleFilter.addEventListener("change", handleFilter);

    // Pagination
    document.getElementById("prevBtn").addEventListener("click", () => changePage(-1));
    document.getElementById("nextBtn").addEventListener("click", () => changePage(1));
}

function handleSearch() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();

    // Lọc từ danh sách gốc allUsers
    filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.id.toString().includes(searchTerm)
    );

    // Áp dụng thêm filter nếu có
    applyDropdownFilters();

    currentPage = 1;
    renderTable();
    updatePagination();
}

function handleFilter() {
    // Reset về allUsers trước khi lọc
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();

    filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.id.toString().includes(searchTerm)
    );

    applyDropdownFilters();

    currentPage = 1;
    renderTable();
    updatePagination();
}

function applyDropdownFilters() {
    const statusFilter = document.getElementById("statusFilter").value;
    const roleFilter = document.getElementById("roleFilter").value;

    filteredUsers = filteredUsers.filter(user => {
        const matchStatus = !statusFilter || user.status === statusFilter;
        const matchRole = !roleFilter || user.role === roleFilter;
        return matchStatus && matchRole;
    });
}

function renderTable() {
    const tbody = document.getElementById("userTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageUsers = filteredUsers.slice(start, end);

    if (pageUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Không tìm thấy user nào</td></tr>`;
        return;
    }

    pageUsers.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${user.id}</td>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${user.avatar}" style="width:30px; height:30px; border-radius:50%">
                    ${user.name}
                </div>
            </td>
            <td>${user.email}</td>
            <td><span style="text-transform: capitalize;">${user.role}</span></td>
            <td>
                <span class="status-badge status-${user.status}">
                    ${getStatusLabel(user.status)}
                </span>
            </td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-primary" onclick="viewUserDetail(${user.id})" style="padding: 6px 10px; font-size: 12px;">Chi tiết</button>
                    
                    ${user.status !== 'banned'
                ? `<button class="btn btn-danger" onclick="confirmAction(${user.id}, 'ban')" style="padding: 6px 10px; font-size: 12px;">Khóa</button>`
                : `<button class="btn btn-success" onclick="confirmAction(${user.id}, 'unban')" style="padding: 6px 10px; font-size: 12px;">Mở khóa</button>`
            }
                    
                    <button class="btn btn-warning" onclick="resetPassword(${user.id})" style="padding: 6px 10px; font-size: 12px;">Reset</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusLabel(status) {
    switch (status) {
        case 'active': return '✓ Active';
        case 'banned': return '✕ Banned';
        case 'inactive': return '⊘ Inactive';
        default: return status;
    }
}

function changePage(direction) {
    const maxPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const newPage = currentPage + direction;

    if (newPage >= 1 && newPage <= maxPages) {
        currentPage = newPage;
        renderTable();
        updatePagination();
    }
}

function updatePagination() {
    const maxPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const pageNumbersDiv = document.getElementById("pageNumbers");
    if (!pageNumbersDiv) return;

    pageNumbersDiv.innerHTML = "";

    // Nút số trang
    for (let i = 1; i <= maxPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = `page-num ${i === currentPage ? "active" : ""}`;
        btn.onclick = () => {
            currentPage = i;
            renderTable();
            updatePagination();
        };
        pageNumbersDiv.appendChild(btn);
    }

    document.getElementById("prevBtn").disabled = currentPage === 1;
    document.getElementById("nextBtn").disabled = currentPage === maxPages || maxPages === 0;
}

// ===============================
// LOGIC HÀNH ĐỘNG (UPDATE DỮ LIỆU)
// ===============================

function viewUserDetail(userId) {
    // Tìm user mới nhất từ allUsers (để đảm bảo trạng thái đúng)
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    localStorage.setItem("selectedUserId", userId);
    window.location.href = "user-detail.html"; // Nếu đang ở thư mục pages
    // Lưu ý: Check đường dẫn tương đối tùy thuộc file html nằm ở đâu
}

function confirmAction(userId, type) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    currentActionUser = user;
    const modal = document.getElementById("actionModal");
    const actionTitle = document.getElementById("actionTitle");
    const actionMessage = document.getElementById("actionMessage");
    const confirmBtn = document.getElementById("confirmBtn");

    modal.classList.add("show");

    if (type === 'ban') {
        actionTitle.textContent = "Khóa Tài Khoản";
        actionMessage.textContent = `Bạn có chắc chắn muốn khóa tài khoản ${user.name}? User sẽ không thể đăng nhập.`;
        confirmBtn.onclick = () => executeAction('ban');
    } else if (type === 'unban') {
        actionTitle.textContent = "Mở Khóa Tài Khoản";
        actionMessage.textContent = `Kích hoạt lại tài khoản cho ${user.name}?`;
        confirmBtn.onclick = () => executeAction('unban');
    }

    // Setup nút hủy
    document.getElementById("cancelBtn").onclick = () => modal.classList.remove("show");
}

function executeAction(type) {
    if (!currentActionUser) return;

    // 1. Cập nhật dữ liệu trong mảng gốc
    if (type === 'ban') {
        currentActionUser.status = 'banned';
    } else if (type === 'unban') {
        currentActionUser.status = 'active';
    }

    // 2. QUAN TRỌNG: Lưu lại vào LocalStorage
    saveData();

    // 3. Cập nhật giao diện
    document.getElementById("actionModal").classList.remove("show");

    // Nếu đang ở trang list thì render lại bảng
    if (document.getElementById("userTable")) {
        // Cập nhật lại filteredUsers để phản ánh thay đổi
        handleFilter();
        alert(`Đã ${type === 'ban' ? 'khóa' : 'mở khóa'} thành công!`);
    }
    // Nếu đang ở trang detail thì reload trang
    else if (document.getElementById("userName")) {
        location.reload();
    }
}

function resetPassword(userId) {
    alert(`Đã gửi email reset mật khẩu cho User ID: ${userId} (Mô phỏng)`);
}

// ===============================
// LOGIC TRANG DASHBOARD
// ===============================

function loadDashboardStats() {
    // Tính toán dựa trên allUsers (đã lấy từ storage)
    const activeUsersCount = allUsers.filter(u => u.status === "active").length;
    const totalLessons = allUsers.reduce((sum, u) => sum + (u.lessonsCompleted || 0), 0);
    const totalHours = allUsers.reduce((sum, u) => sum + (u.hoursSpent || 0), 0);

    document.getElementById("total-users").textContent = allUsers.length;
    document.getElementById("active-users").textContent = activeUsersCount;
    document.getElementById("completed-lessons").textContent = totalLessons;
    document.getElementById("total-hours").textContent = Math.round(totalHours / (allUsers.length || 1));
}

// ===============================
// LOGIC TRANG CHI TIẾT
// ===============================

function loadUserDetailPage() {
    const userId = parseInt(localStorage.getItem("selectedUserId"));
    const user = allUsers.find(u => u.id === userId);

    if (!user) {
        alert("Không tìm thấy user!");
        history.back();
        return;
    }

    // Điền dữ liệu (tương tự code cũ nhưng lấy từ 'user' đã cập nhật)
    document.getElementById("userAvatar").src = user.avatar;
    document.getElementById("userName").textContent = user.name;
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("userId").textContent = `#${user.id}`;
    document.getElementById("userRole").textContent = user.role;

    // Hiển thị trạng thái với màu sắc
    const statusBadge = document.getElementById("userStatus");
    statusBadge.textContent = getStatusLabel(user.status);
    statusBadge.className = `status-badge status-${user.status}`;

    // Logic nút khóa/mở khóa ở trang chi tiết (nếu có nút hành động ở đây)
    // ... (Giữ nguyên phần hiển thị progress bar của bạn)
}

// ===============================
// TIỆN ÍCH: RESET DỮ LIỆU GỐC
// ===============================

function setupResetButton() {
    // Tạo một nút nhỏ ở góc dưới màn hình để reset data khi test hỏng
    const btn = document.createElement("button");
    btn.textContent = "🔄 Reset Data Gốc";
    btn.style.cssText = "position: fixed; bottom: 10px; right: 10px; z-index: 9999; padding: 5px 10px; background: #333; color: #fff; border: none; cursor: pointer; opacity: 0.7; font-size: 10px;";

    btn.onclick = () => {
        if (confirm("Bạn muốn xóa mọi thay đổi và quay về dữ liệu mẫu ban đầu?")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    };

    document.body.appendChild(btn);
}

// Close modal khi click ra ngoài
window.onclick = (event) => {
    const modals = document.querySelectorAll(".modal");
    modals.forEach(m => {
        if (event.target === m) m.classList.remove("show");
    });
};
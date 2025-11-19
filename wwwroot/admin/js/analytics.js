/**
 * MODULE THỐNG KÊ (ANALYTICS)
 * Sử dụng thư viện Chart.js để vẽ biểu đồ
 */

document.addEventListener("DOMContentLoaded", function () {
    // 1. Lấy dữ liệu User mới nhất (Ưu tiên từ LocalStorage để đồng bộ với trang User List)
    const STORAGE_KEY = 'admin_dashboard_users';
    let users = JSON.parse(localStorage.getItem(STORAGE_KEY));

    // Nếu chưa có trong Storage (lần đầu vào), dùng dữ liệu mẫu từ mock-data.js
    if (!users || users.length === 0) {
        users = window.mockUsers || []; // Fallback an toàn
    }

    // 2. Lấy dữ liệu thống kê lịch sử (từ mock-analytics trong file mock-data.js)
    const analyticsData = window.mockAnalytics || {
        newUsersByDay: [],
        completionRateByDay: [],
        popularCourses: []
    };

    // --- KHỞI CHẠY CÁC HÀM RENDER ---
    renderKPICards(users);
    renderNewUsersChart(analyticsData.newUsersByDay);
    renderCompletionChart(analyticsData.completionRateByDay);
    renderStatusChart(users); // Vẽ động dựa trên status thực tế
    renderCourseChart(analyticsData.popularCourses);
    renderRoleTable(users);
});

// ==============================================
// 1. XỬ LÝ HIỂN THỊ KPI CARDS
// ==============================================
function renderKPICards(users) {
    // Tổng User
    document.getElementById("stat-total-users").textContent = users.length;

    // User đang hoạt động (Active)
    const activeCount = users.filter(u => u.status === 'active').length;
    document.getElementById("stat-active-users").textContent = activeCount;

    // Tổng bài học hoàn thành
    const totalLessons = users.reduce((sum, u) => sum + (u.lessonsCompleted || 0), 0);
    document.getElementById("stat-completed-lessons").textContent = totalLessons.toLocaleString('vi-VN');

    // Giờ học trung bình
    const totalHours = users.reduce((sum, u) => sum + (u.hoursSpent || 0), 0);
    const avgHours = users.length ? (totalHours / users.length).toFixed(1) : 0;
    document.getElementById("stat-avg-hours").textContent = avgHours + "h";
}

// ==============================================
// 2. VẼ CÁC BIỂU ĐỒ (CHARTS)
// ==============================================

// Cấu hình chung cho font chữ đẹp hơn
Chart.defaults.font.family = "'Segoe UI', 'Arial', sans-serif";
Chart.defaults.color = '#666';

/**
 * Chart 1: User Mới Theo Ngày (Bar Chart)
 */
function renderNewUsersChart(data) {
    const ctx = document.getElementById('newUsersChart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.day),
            datasets: [{
                label: 'User mới',
                data: data.map(item => item.count),
                backgroundColor: '#4e73df',
                borderRadius: 4,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [2, 4] } },
                x: { grid: { display: false } }
            }
        }
    });
}

/**
 * Chart 2: Tỷ Lệ Hoàn Thành (Line Chart)
 */
function renderCompletionChart(data) {
    const ctx = document.getElementById('completionChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.day),
            datasets: [{
                label: 'Tỷ lệ hoàn thành (%)',
                data: data.map(item => item.rate),
                borderColor: '#1cc88a',
                backgroundColor: 'rgba(28, 200, 138, 0.1)',
                tension: 0.4, // Làm mềm đường cong
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { borderDash: [2, 4] } },
                x: { grid: { display: false } }
            }
        }
    });
}

/**
 * Chart 3: Phân Bố Trạng Thái User (Doughnut Chart)
 * Dữ liệu được tính động từ danh sách users hiện tại
 */
function renderStatusChart(users) {
    const ctx = document.getElementById('statusChart').getContext('2d');

    const active = users.filter(u => u.status === 'active').length;
    const banned = users.filter(u => u.status === 'banned').length;
    const inactive = users.filter(u => u.status === 'inactive').length;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hoạt động', 'Bị khóa', 'Vô hiệu'],
            datasets: [{
                data: [active, banned, inactive],
                backgroundColor: ['#1cc88a', '#e74a3b', '#f6c23e'],
                hoverOffset: 10,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
            },
            cutout: '70%' // Độ dày của vòng tròn
        }
    });
}

/**
 * Chart 4: Khóa Học Phổ Biến (Horizontal Bar Chart)
 */
function renderCourseChart(data) {
    const ctx = document.getElementById('courseChart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        indexAxis: 'y', // Chuyển thành biểu đồ ngang
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                label: 'Số học viên',
                data: data.map(item => item.students),
                backgroundColor: '#36b9cc',
                borderRadius: 4,
                barThickness: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

// ==============================================
// 3. XỬ LÝ BẢNG CHI TIẾT (TABLE)
// ==============================================
function renderRoleTable(users) {
    const tbody = document.getElementById('statsTableBody');
    tbody.innerHTML = '';

    // Các role cần thống kê
    const roles = ['student', 'teacher', 'admin'];

    roles.forEach(role => {
        // Lọc user theo role
        const roleUsers = users.filter(u => u.role === role);
        const count = roleUsers.length;

        if (count === 0) return; // Bỏ qua nếu không có user nào

        // Tính toán trung bình
        const totalLessons = roleUsers.reduce((sum, u) => sum + (u.lessonsCompleted || 0), 0);
        const totalHours = roleUsers.reduce((sum, u) => sum + (u.hoursSpent || 0), 0);

        // Tính % hoàn thành trung bình (giả sử tổng bài là 60 cho student)
        // Logic này chỉ mang tính tương đối dựa trên mock data
        const totalCompletionRate = roleUsers.reduce((sum, u) => {
            const total = u.lessonsTotal || 60;
            return sum + ((u.lessonsCompleted / total) * 100);
        }, 0);

        const avgLessons = Math.round(totalLessons / count);
        const avgHours = Math.round(totalHours / count);
        const avgCompletion = Math.round(totalCompletionRate / count);

        // Render Row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span style="text-transform: capitalize; font-weight: 600;">${role}</span></td>
            <td>${count}</td>
            <td>${avgLessons} bài</td>
            <td>${avgHours} giờ</td>
            <td>
                <div class="progress-wrapper" style="display:flex; align-items:center; gap:10px;">
                    <span style="min-width:35px">${avgCompletion}%</span>
                    <div style="flex:1; height:8px; background:#eee; border-radius:4px; overflow:hidden;">
                        <div style="width:${avgCompletion}%; height:100%; background: ${getColorByRate(avgCompletion)}"></div>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Helper: Chọn màu dựa trên % hoàn thành
function getColorByRate(rate) {
    if (rate >= 80) return '#1cc88a'; // Xanh lá
    if (rate >= 50) return '#36b9cc'; // Xanh dương
    return '#f6c23e'; // Vàng
}
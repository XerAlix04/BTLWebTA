// wwwroot/js/courses.js

// 1. Mock Data (Dữ liệu giả lập)
const mockCourses = [
    {
        id: 1,
        title: "COMBO COMPLETE TOEIC 4 KỸ NĂNG",
        price: 1525000,
        oldPrice: 3600000,
        tags: ["Listening", "Reading", "Speaking", "Writing"],
        type: "TOEIC",
        image: "https://via.placeholder.com/300x180?text=TOEIC+Combo" // Thêm ảnh placeholder
    },
    {
        id: 2,
        title: "COMBO IELTS INTENSIVE",
        price: 1525000,
        oldPrice: 3596000,
        tags: ["Listening", "Reading", "Writing", "Speaking"],
        type: "IELTS",
        image: "https://via.placeholder.com/300x180?text=IELTS+Intensive"
    },
    {
        id: 3,
        title: "IELTS FUNDAMENTALS + INTENSIVE",
        price: 1825000,
        oldPrice: 4495000,
        tags: ["From 0 to 7.0+"],
        type: "IELTS",
        image: "https://via.placeholder.com/300x180?text=IELTS+Zero+to+Hero"
    },
    {
        id: 4,
        title: "TIẾNG ANH GIAO TIẾP CƠ BẢN",
        price: 899000,
        oldPrice: 1500000,
        tags: ["Communication", "Basic"],
        type: "Basic",
        image: "https://via.placeholder.com/300x180?text=Basic+English"
    }
];

// 2. Hàm Render
function renderCourses() {
    console.log("Đang render khóa học..."); // Log để kiểm tra xem hàm có chạy không
    const container = document.getElementById("courseList");

    // Kiểm tra nếu không tìm thấy thẻ div chứa danh sách thì dừng
    if (!container) {
        console.warn("Không tìm thấy element id='courseList'");
        return;
    }

    // Nếu đã có dữ liệu rồi thì không render lại (tránh bị duplicate khi bấm nhiều lần)
    if (container.children.length > 1 && !container.querySelector('.loading-spinner')) {
        return;
    }

    container.innerHTML = mockCourses.map(c => {
        const discount = Math.round(((c.oldPrice - c.price) / c.oldPrice) * 100);
        return `
        <div class="course-card">
            <div class="course-img" style="margin-bottom:15px; border-radius:8px; overflow:hidden;">
                <img src="${c.image}" alt="${c.title}" style="width:100%; height:auto; display:block;">
            </div>

            <div class="course-header">
                <div class="course-tags">
                    <span class="tag" style="background:#e0f2fe; color:#0369a1">#Online</span>
                    ${c.tags.map(t => `<span class="tag">📝 ${t}</span>`).join('')}
                </div>
                <h3 style="margin: 10px 0; font-size: 1.1rem;">${c.title}</h3>
            </div>
            
            <div class="course-price">
                <div style="margin-bottom: 10px;">
                    <span class="price-current">${c.price.toLocaleString('vi-VN')}đ</span>
                    <span class="price-old">${c.oldPrice.toLocaleString('vi-VN')}đ</span>
                    <span class="discount-badge">-${discount}%</span>
                </div>
                <button class="btn-buy" onclick="buyCourse(${c.id}, '${c.title}')">Đăng ký ngay</button>
            </div>
        </div>
        `;
    }).join('');
}

// 3. Hàm xử lý mua (giả lập)
function buyCourse(id, title) {
    if (!confirm(`Bạn muốn đăng ký khóa học: "${title}"?`)) return;
    alert(`✅ Đã gửi yêu cầu đăng ký cho khóa học ID: ${id}. Vui lòng chờ Admin duyệt.`);
}

// 4. Kích hoạt sự kiện (QUAN TRỌNG NHẤT)
document.addEventListener("DOMContentLoaded", function () {
    // Tìm nút có data-tab="courses" trong Layout
    const courseBtn = document.querySelector('button[data-tab="courses"]');

    if (courseBtn) {
        // Gán sự kiện click
        courseBtn.addEventListener('click', function () {
            // Gọi hàm render
            renderCourses();
        });
    } else {
        console.error("Không tìm thấy nút khóa học trong Navbar");
    }

    // Trường hợp user refresh trang và đang ở tab courses, cần render ngay lập tức
    const coursesTab = document.getElementById("courses");
    if (coursesTab && coursesTab.classList.contains("active")) {
        renderCourses();
    }
});
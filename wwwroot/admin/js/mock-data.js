// ===============================
// DỮ LIỆU MOCK CHO ADMIN PANEL (ENGLISH APP)
// Context: Tháng 11/2025
// ===============================

const mockUsers = [
    {
        id: 1,
        name: "Nguyễn Văn An",
        email: "an.nguyen@example.com",
        role: "student",
        status: "active",
        avatar: "https://i.pravatar.cc/150?img=11",
        createdAt: "2025-01-15",
        lastActive: "2025-11-26 19:30",
        lessonsCompleted: 45,
        lessonsTotal: 60,
        quizScore: 85, // IELTS band score equivalent could be stored elsewhere, this is progress %
        courseCompleted: 2,
        hoursSpent: 125,
        activities: [
            { time: "19:30", action: "Hoàn thành bài Luyện nghe IELTS Part 1" },
            { time: "18:15", action: "Làm bài kiểm tra từ vựng Unit 5" },
            { time: "08:00", action: "Đăng nhập hệ thống" }
        ]
    },
    {
        id: 2,
        name: "Trần Thị Bích",
        email: "bich.tran@example.com",
        role: "student",
        status: "active",
        avatar: "https://i.pravatar.cc/150?img=5",
        createdAt: "2025-05-20",
        lastActive: "2025-11-26 09:45",
        lessonsCompleted: 58,
        lessonsTotal: 60,
        quizScore: 92,
        courseCompleted: 3,
        hoursSpent: 180,
        activities: [
            { time: "09:45", action: "Xem video Ngữ pháp thì hiện tại hoàn thành" },
            { time: "08:30", action: "Tham gia phòng Speaking ảo với AI" },
            { time: "07:00", action: "Nộp bài viết (Writing Task 1)" }
        ]
    },
    {
        id: 3,
        name: "Mr. David Smith",
        email: "david.smith@englishapp.com",
        role: "teacher",
        status: "active",
        avatar: "https://i.pravatar.cc/150?img=13",
        createdAt: "2024-12-10",
        lastActive: "2025-11-26 14:00",
        lessonsCompleted: 0, // Teacher doesn't learn
        lessonsTotal: 0,
        quizScore: 0,
        courseCompleted: 0,
        hoursSpent: 1500, // Teaching hours
        activities: [
            { time: "14:00", action: "Đã chấm điểm bài Writing của Bích" },
            { time: "10:00", action: "Tạo đề thi thử TOEIC mới" },
            { time: "09:00", action: "Cập nhật giáo án Speaking" }
        ]
    },
    {
        id: 4,
        name: "Lê Minh Dương",
        email: "duong.le@example.com",
        role: "student",
        status: "banned",
        avatar: "https://i.pravatar.cc/150?img=4",
        createdAt: "2025-08-05",
        lastActive: "2025-11-10 15:20",
        lessonsCompleted: 10,
        lessonsTotal: 60,
        quizScore: 35,
        courseCompleted: 0,
        hoursSpent: 20,
        activities: [
            { time: "15:20", action: "Spam bình luận trong khóa học" },
            { time: "14:00", action: "Tham gia lớp học" }
        ]
    },
    {
        id: 5,
        name: "Hoàng Thanh Tâm",
        email: "tam.hoang@example.com",
        role: "student",
        status: "inactive",
        avatar: "https://i.pravatar.cc/150?img=9",
        createdAt: "2025-02-12",
        lastActive: "2025-10-01 08:00",
        lessonsCompleted: 15,
        lessonsTotal: 60,
        quizScore: 60,
        courseCompleted: 0,
        hoursSpent: 35,
        activities: [
            { time: "08:00", action: "Xem lại flashcard từ vựng" },
            { time: "19:30", action: "Đăng xuất" }
        ]
    },
    {
        id: 6,
        name: "Admin System",
        email: "admin@englishapp.com",
        role: "admin",
        status: "active",
        avatar: "https://i.pravatar.cc/150?img=60",
        createdAt: "2024-01-01",
        lastActive: "2025-11-26 12:00",
        lessonsCompleted: 0,
        lessonsTotal: 0,
        quizScore: 0,
        courseCompleted: 0,
        hoursSpent: 2000,
        activities: [
            { time: "12:00", action: "Backup cơ sở dữ liệu" },
            { time: "11:00", action: "Phê duyệt khóa học mới" },
            { time: "10:00", action: "Gửi thông báo bảo trì hệ thống" }
        ]
    },
    {
        id: 7,
        name: "Vũ Thị Gấm",
        email: "gam.vu@example.com",
        role: "student",
        status: "active",
        avatar: "https://i.pravatar.cc/150?img=20",
        createdAt: "2025-09-18",
        lastActive: "2025-11-26 13:45",
        lessonsCompleted: 38,
        lessonsTotal: 50,
        quizScore: 78,
        courseCompleted: 1,
        hoursSpent: 95,
        activities: [
            { time: "13:45", action: "Luyện phát âm từ vựng chủ đề Travel" },
            { time: "12:30", action: "Tham gia Quiz Battle" },
            { time: "11:00", action: "Hỏi đáp với AI Tutor" }
        ]
    },
    {
        id: 8,
        name: "Bùi Hải Hưng",
        email: "hung.bui@example.com",
        role: "student",
        status: "active",
        avatar: "https://i.pravatar.cc/150?img=12",
        createdAt: "2025-10-22",
        lastActive: "2025-11-26 14:15",
        lessonsCompleted: 55,
        lessonsTotal: 60,
        quizScore: 88,
        courseCompleted: 2,
        hoursSpent: 210,
        activities: [
            { time: "14:15", action: "Hoàn thành khóa Tiếng Anh Giao Tiếp" },
            { time: "13:00", action: "Nộp bài nói cuối kỳ" },
            { time: "11:30", action: "Đăng ký khóa IELTS nâng cao" }
        ]
    }
];

const mockAnalytics = {
    totalUsers: mockUsers.length,
    activeUsers: mockUsers.filter(u => u.status === "active").length,
    // Giả lập dữ liệu tháng 11/2025
    newUsersByDay: [
        { day: "20/11", count: 15 },
        { day: "21/11", count: 22 },
        { day: "22/11", count: 18 },
        { day: "23/11", count: 12 }, // Chủ nhật thấp hơn
        { day: "24/11", count: 25 }, // Thứ 2 tăng cao
        { day: "25/11", count: 30 },
        { day: "26/11", count: 28 }  // Hôm nay
    ],

    // Tỷ lệ hoàn thành bài tập trung bình (%)
    completionRateByDay: [
        { day: "20/11", rate: 65 },
        { day: "21/11", rate: 70 },
        { day: "22/11", rate: 75 },
        { day: "23/11", rate: 60 },
        { day: "24/11", rate: 80 },
        { day: "25/11", rate: 85 },
        { day: "26/11", rate: 82 }
    ],

    // Khóa học phổ biến (Thay thế JS/React bằng Tiếng Anh)
    popularCourses: [
        { name: "IELTS Foundation", students: 120, hours: 4500 },
        { name: "Tiếng Anh Giao Tiếp", students: 98, hours: 3800 },
        { name: "TOEIC 500+", students: 85, hours: 3400 },
        { name: "Ngữ Pháp Cơ Bản", students: 70, hours: 2100 },
        { name: "Luyện Phát Âm Mỹ", students: 65, hours: 1500 }
    ],

    // Thống kê placeholder (Logic chính nằm ở file analytics.js tính toán trực tiếp từ mockUsers)
    statsByRole: []
};

const mockChatUsers = [
    { id: 1, name: "Nguyễn Văn An", avatar: "https://i.pravatar.cc/150?img=11", isOnline: true },
    { id: 2, name: "Trần Thị Bích", avatar: "https://i.pravatar.cc/150?img=5", isOnline: true },
    { id: 3, name: "Mr. David Smith", avatar: "https://i.pravatar.cc/150?img=13", isOnline: false },
    { id: 4, name: "Hỗ trợ viên AI", avatar: "../assets/ai-avatar.png", isOnline: true }, // Giả sử có AI
];

const mockMessages = {
    1: [
        { id: 1, from: "admin", text: "Chào An, bạn có gặp khó khăn gì với bài IELTS Listening hôm qua không?", time: "10:00" },
        { id: 2, from: "user", text: "Chào admin! Phần Part 3 hơi nhanh, tôi nghe không kịp.", time: "10:05" },
        { id: 3, from: "admin", text: "Cảm ơn phản hồi của bạn. Chúng tôi sẽ xem xét lại tốc độ bài giảng.", time: "10:10" },
        { id: 4, from: "user", text: "Vâng, cảm ơn ad nhiều ạ.", time: "10:12" }
    ],
    2: [
        { id: 1, from: "admin", text: "Chúc mừng Bích! Bạn đã lọt top 10 bảng xếp hạng tuần này.", time: "09:00" },
        { id: 2, from: "user", text: "Wow thật ạ? Em cảm ơn trung tâm!", time: "09:05" }
    ],
    3: [
        { id: 1, from: "user", text: "Admin ơi, tôi vừa cập nhật bộ đề thi mới, nhờ duyệt giúp nhé.", time: "13:00" }
    ]
};

// Hàm helper để định dạng ngày
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
}

// Hàm helper để định dạng giờ
function formatTime(timeString) {
    // Chỉ dùng để format hiển thị giờ giả định
    return timeString;
}

// ==============================================
// QUAN TRỌNG: Gán vào window để analytics.js đọc được
// ==============================================
window.mockUsers = mockUsers;
window.mockAnalytics = mockAnalytics;
window.mockChatUsers = mockChatUsers;
window.mockMessages = mockMessages;

// Export cho môi trường Node.js (nếu có dùng build tools)
if (typeof module !== "undefined" && module.exports) {
    module.exports = { mockUsers, mockAnalytics, mockChatUsers, mockMessages, formatDate, formatTime };
}
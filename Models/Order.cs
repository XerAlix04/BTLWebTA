namespace Project1.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; } // Link tới bảng User
        public string UserName { get; set; } // Lưu nhanh tên user
        public int CourseId { get; set; }
        public string CourseName { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public decimal TotalAmount { get; set; }

        // Status: 0 = Pending (Đang chờ duyệt), 1 = Approved (Đã nhận hàng), 2 = Cancelled
        public int Status { get; set; }
        public string? AdminNote { get; set; } // Ghi chú của admin khi duyệt/hủy
    }
}

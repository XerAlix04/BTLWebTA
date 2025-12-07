namespace Project1.Models
{
    public class Course
    {
        public int Id { get; set; }
        public string Title { get; set; } // Tên khóa học (VD: Combo TOEIC)
        public string Description { get; set; }
        public decimal Price { get; set; } // Giá gốc
        public decimal DiscountPrice { get; set; } // Giá giảm
        public string ImageUrl { get; set; }
    }
}

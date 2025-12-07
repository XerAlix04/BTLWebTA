using Microsoft.AspNetCore.Mvc;
using Project1.Models;
using System.Text.Json;

namespace Project1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserAdminChatController : ControllerBase
    {
        private readonly WebTaContext _context;
        private readonly ILogger<UserAdminChatController> _logger;
        // In-memory storage for demo (replace with database in production)
        private static Dictionary<string, List<ChatMessageDTO>> chatConversations = new();

        public UserAdminChatController(WebTaContext context, ILogger<UserAdminChatController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ==================== GET ALL USERS ====================

        /// <summary>
        /// Lấy danh sách tất cả người dùng để chat
        /// </summary>
        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            try
            {
                var users = _context.NguoiDungs
                    .Select(u => new 
                    { 
                        u.MaNguoiDung, 
                        u.TenDangNhap, 
                        u.Email,
                        IsOnline = true,
                        Avatar = "https://i.pravatar.cc/150?img=" + u.MaNguoiDung
                    })
                    .ToList();

                return Ok(new { success = true, data = users });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ==================== SEND MESSAGE ====================

        /// <summary>
        /// Gửi tin nhắn giữa hai người dùng bất kỳ
        /// </summary>
        [HttpPost("send")]
        public IActionResult SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Message))
                    return BadRequest(new { success = false, message = "Tin nhắn không được để trống" });

                var conversationKey = GetConversationKey(request.SenderId, request.ReceiverId);

                // Khởi tạo conversation nếu chưa có
                if (!chatConversations.ContainsKey(conversationKey))
                {
                    chatConversations[conversationKey] = new List<ChatMessageDTO>();
                }

                // Thêm tin nhắn
                var message = new ChatMessageDTO
                {
                    Id = Guid.NewGuid().ToString(),
                    SenderId = request.SenderId,
                    SenderName = request.SenderName,
                    Message = request.Message,
                    Timestamp = DateTime.Now,
                    IsRead = false
                };

                chatConversations[conversationKey].Add(message);

                return Ok(new { success = true, message = "Tin nhắn đã được gửi", data = message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ==================== GET MESSAGES ====================

        /// <summary>
        /// Lấy tin nhắn giữa hai người dùng
        /// </summary>
        [HttpGet("messages/{userId}/{targetUserId}")]
        public IActionResult GetMessages(int userId, int targetUserId)
        {
            try
            {
                var conversationKey = GetConversationKey(userId, targetUserId);
                
                if (!chatConversations.ContainsKey(conversationKey))
                {
                    return Ok(new { success = true, data = new List<ChatMessageDTO>() });
                }

                var messages = chatConversations[conversationKey]
                    .OrderBy(m => m.Timestamp)
                    .ToList();

                return Ok(new { success = true, data = messages });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting messages");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ==================== HELPER METHODS ====================

        private string GetConversationKey(int userId1, int userId2)
        {
            // Tạo key sao cho thứ tự không quan trọng
            var min = Math.Min(userId1, userId2);
            var max = Math.Max(userId1, userId2);
            return $"{min}_{max}";
        }
    }

    // ==================== DTOs ====================

    public class ChatMessageDTO
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public bool IsRead { get; set; } = false;
    }

    public class SendMessageRequest
    {
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
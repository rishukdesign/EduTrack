using System.ComponentModel.DataAnnotations;

namespace EduTrack.Backend.Models;

public class Notification
{
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; } // The recipient of the notification
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Message { get; set; } = string.Empty;
    
    public string Type { get; set; } = "Info"; // Info, Success, Warning, Error
    
    public bool IsRead { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    // Optional: Link to related entity for navigation (e.g., Assignment ID)
    public int? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; } // "Assignment", "Student", etc.
}

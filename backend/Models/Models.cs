using System.ComponentModel.DataAnnotations;

namespace EduTrack.Backend.Models;

public class User
{
    public int Id { get; set; }
    [Required]
    public string Username { get; set; } = string.Empty;
    [Required]
    public string Password { get; set; } = string.Empty; // In production, hash this!
    [Required]
    public string Role { get; set; } = string.Empty; // Admin, Faculty, Student
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int? StudentId { get; set; } // Nullable, only for students
}

public class Student
{
    public int Id { get; set; }
    [Required]
    public string RollNo { get; set; } = string.Empty;
    [Required]
    public string FirstName { get; set; } = string.Empty;
    [Required]
    public string LastName { get; set; } = string.Empty;
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    public string Program { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class Company
{
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class Mentor
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    [Required]
    public string Name { get; set; } = string.Empty;
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class Training
{
    public int Id { get; set; }
    [Required]
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = "Upcoming"; // Upcoming, Ongoing, Closed
}

public class Assignment
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public int TrainingId { get; set; }
    public int CompanyId { get; set; }
    public int MentorId { get; set; }
    public string Status { get; set; } = "Assigned"; // Assigned, InProgress, PendingEvaluation, Completed
    public DateTime AssignedDate { get; set; } = DateTime.Now;
    [Range(0, 100, ErrorMessage = "Progress must be between 0 and 100")]
    public int Progress { get; set; } = 0;
    public string Remarks { get; set; } = string.Empty;
    [Range(0, 100, ErrorMessage = "Score must be between 0 and 100")]
    public int? Score { get; set; }
}

public class AcademicRecord
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    [Required]
    public string Degree { get; set; } = string.Empty;
    [Required]
    public string Institution { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Score { get; set; } = string.Empty;
}

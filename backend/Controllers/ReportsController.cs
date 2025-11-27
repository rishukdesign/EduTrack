using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.Backend.Data;
using EduTrack.Backend.Models;
using System.Text;

namespace EduTrack.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/reports/students
    [HttpGet("students")]
    public async Task<ActionResult<IEnumerable<object>>> GetStudentReport([FromQuery] string? program, [FromQuery] int? year)
    {
        var query = _context.Students.AsQueryable();

        if (!string.IsNullOrEmpty(program))
        {
            query = query.Where(s => s.Program == program);
        }

        if (year.HasValue)
        {
            query = query.Where(s => s.Year == year.Value);
        }

        var students = await query.ToListAsync();
        
        // Enrich with assignment data
        var reportData = new List<object>();
        foreach (var s in students)
        {
            var assignments = await _context.Assignments.Where(a => a.StudentId == s.Id).ToListAsync();
            var completed = assignments.Count(a => a.Status == "Completed");
            var avgProgress = assignments.Any() ? assignments.Average(a => a.Progress) : 0;
            var totalScore = assignments.Sum(a => a.Score ?? 0);

            reportData.Add(new
            {
                s.Id,
                s.FirstName,
                s.LastName,
                s.RollNo,
                s.Program,
                s.Year,
                s.Email,
                s.Phone,
                TotalAssignments = assignments.Count,
                CompletedAssignments = completed,
                AverageProgress = Math.Round(avgProgress, 1),
                TotalScore = totalScore
            });
        }

        return Ok(reportData);
    }

    // GET: api/reports/trainings
    [HttpGet("trainings")]
    public async Task<ActionResult<IEnumerable<object>>> GetTrainingReport([FromQuery] string? status, [FromQuery] int? companyId)
    {
        var query = _context.Trainings.AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status == status);
        }

        var trainings = await query.ToListAsync();
        var reportData = new List<object>();

        foreach (var t in trainings)
        {
            var assignments = await _context.Assignments
                .Include(a => a.Company)
                .Where(a => a.TrainingId == t.Id)
                .ToListAsync();

            if (companyId.HasValue)
            {
                assignments = assignments.Where(a => a.CompanyId == companyId.Value).ToList();
            }

            // If filtering by company, we might filter out trainings that have no assignments for that company
            if (companyId.HasValue && !assignments.Any()) continue;

            var active = assignments.Count(a => a.Status == "InProgress");
            var pending = assignments.Count(a => a.Status == "PendingEvaluation");
            var completed = assignments.Count(a => a.Status == "Completed");

            reportData.Add(new
            {
                t.Id,
                t.Title,
                t.Status,
                StartDate = t.StartDate?.ToString("yyyy-MM-dd"),
                EndDate = t.EndDate?.ToString("yyyy-MM-dd"),
                TotalEnrolled = assignments.Count,
                Active = active,
                PendingEvaluation = pending,
                Completed = completed
            });
        }

        return Ok(reportData);
    }

    // GET: api/reports/student-profile/{id}
    [HttpGet("student-profile/{id}")]
    public async Task<ActionResult<object>> GetStudentProfile(int id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null) return NotFound();

        var academicRecords = await _context.AcademicRecords.Where(ar => ar.StudentId == id).ToListAsync();
        var assignments = await _context.Assignments
            .Include(a => a.Training)
            .Include(a => a.Company)
            .Include(a => a.Mentor)
            .Where(a => a.StudentId == id)
            .ToListAsync();

        return Ok(new
        {
            Personal = student,
            Academic = academicRecords,
            Training = assignments.Select(a => new
            {
                a.Id,
                TrainingTitle = a.Training?.Title,
                CompanyName = a.Company?.Name,
                MentorName = a.Mentor?.Name,
                a.Status,
                a.Progress,
                a.Score,
                a.Remarks,
                AssignedDate = a.AssignedDate.ToString("yyyy-MM-dd")
            })
        });
    }

    // GET: api/reports/export
    [HttpGet("export")]
    public async Task<IActionResult> ExportReport([FromQuery] string type, [FromQuery] string format)
    {
        // Simple CSV export implementation
        var sb = new StringBuilder();

        if (type == "student_performance")
        {
            sb.AppendLine("Student ID,Name,Program,Year,Assignments,Completed,Avg Progress,Score");
            
            // Re-use logic (in a real app, refactor to service)
            var students = await _context.Students.ToListAsync();
            foreach (var s in students)
            {
                var assignments = await _context.Assignments.Where(a => a.StudentId == s.Id).ToListAsync();
                var completed = assignments.Count(a => a.Status == "Completed");
                var avg = assignments.Any() ? assignments.Average(a => a.Progress) : 0;
                var score = assignments.Sum(a => a.Score ?? 0);

                sb.AppendLine($"{s.Id},{s.FirstName} {s.LastName},{s.Program},{s.Year},{assignments.Count},{completed},{avg:F1},{score}");
            }
            
            return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", "student_performance_report.csv");
        }
        else if (type == "training_status")
        {
            sb.AppendLine("Training ID,Title,Status,Enrolled,Active,Pending,Completed");
            
            var trainings = await _context.Trainings.ToListAsync();
            foreach (var t in trainings)
            {
                var assignments = await _context.Assignments.Where(a => a.TrainingId == t.Id).ToListAsync();
                var active = assignments.Count(a => a.Status == "InProgress");
                var pending = assignments.Count(a => a.Status == "PendingEvaluation");
                var completed = assignments.Count(a => a.Status == "Completed");

                sb.AppendLine($"{t.Id},{t.Title},{t.Status},{assignments.Count},{active},{pending},{completed}");
            }

            return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", "training_status_report.csv");
        }

        return BadRequest("Invalid report type");
    }
}

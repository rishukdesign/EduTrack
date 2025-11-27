using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.Backend.Data;
using EduTrack.Backend.Models;

namespace EduTrack.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AssignmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AssignmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Assignment>>> GetAssignments()
    {
        return await _context.Assignments.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Assignment>> PostAssignment(Assignment assignment)
    {
        // 1. Duplicate Assignment Check
        // Ensure the same Training is not assigned to the same Student more than once
        if (assignment.TrainingId.HasValue && await _context.Assignments.AnyAsync(a => a.StudentId == assignment.StudentId && a.TrainingId == assignment.TrainingId))
        {
            return BadRequest("This training has already been assigned to this student.");
        }

        // If Title is not provided, try to inherit from Training
        if (string.IsNullOrEmpty(assignment.Title) && assignment.TrainingId.HasValue)
        {
            var training = await _context.Trainings.FindAsync(assignment.TrainingId);
            if (training != null)
            {
                assignment.Title = training.Title;
                assignment.Description = training.Description;
            }
        }

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        // Notify Student
        var studentUser = await _context.Users.FirstOrDefaultAsync(u => u.StudentId == assignment.StudentId);
        if (studentUser != null)
        {
            var notification = new Notification
            {
                UserId = studentUser.Id,
                Title = "New Assignment",
                Message = $"You have been assigned to: {assignment.Title}",
                Type = "Info",
                RelatedEntityId = assignment.Id,
                RelatedEntityType = "Assignment"
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetAssignments), new { id = assignment.Id }, assignment);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Assignment>> GetAssignment(int id)
    {
        var assignment = await _context.Assignments.FindAsync(id);

        if (assignment == null)
        {
            return NotFound();
        }

        return assignment;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutAssignment(int id, Assignment assignment)
    {
        if (id != assignment.Id)
        {
            return BadRequest();
        }

        // Fetch existing assignment to check progress rules
        var existingAssignment = await _context.Assignments.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
        if (existingAssignment == null)
        {
            return NotFound();
        }

        // 1. Completion Lock: If already 100%, prevent changes to progress (unless it's an admin override, but for now strict)
        if (existingAssignment.Progress == 100 && assignment.Progress != 100)
        {
            return BadRequest("Cannot modify a completed assignment.");
        }

        // 2. Regression Check: New Progress cannot be less than Old Progress
        if (assignment.Progress < existingAssignment.Progress)
        {
            return BadRequest($"Progress cannot be regressed. Current progress is {existingAssignment.Progress}%.");
        }

        _context.Entry(assignment).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();

            // Notify Student if Graded
            if (existingAssignment.Score != assignment.Score && assignment.Score.HasValue)
            {
                var studentUser = await _context.Users.FirstOrDefaultAsync(u => u.StudentId == assignment.StudentId);
                if (studentUser != null)
                {
                    var notification = new Notification
                    {
                        UserId = studentUser.Id,
                        Title = "Grade Posted",
                        Message = $"Your assignment '{assignment.Title}' has been graded. Score: {assignment.Score}",
                        Type = "Success",
                        RelatedEntityId = assignment.Id,
                        RelatedEntityType = "Assignment"
                    };
                    _context.Notifications.Add(notification);
                    await _context.SaveChangesAsync();
                }
            }
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!AssignmentExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
        {
            return NotFound();
        }

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool AssignmentExists(int id)
    {
        return _context.Assignments.Any(e => e.Id == id);
    }
}

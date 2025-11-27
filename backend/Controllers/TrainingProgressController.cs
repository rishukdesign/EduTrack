using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.Backend.Data;
using EduTrack.Backend.Models;

namespace EduTrack.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TrainingProgressController : ControllerBase
{
    private readonly AppDbContext _context;

    public TrainingProgressController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TrainingProgress>>> GetAllProgress()
    {
        return await _context.TrainingProgress.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TrainingProgress>> GetProgress(int id)
    {
        var progress = await _context.TrainingProgress.FindAsync(id);
        if (progress == null) return NotFound();
        return progress;
    }

    [HttpGet("assignment/{assignmentId}")]
    public async Task<ActionResult<IEnumerable<TrainingProgress>>> GetAssignmentProgress(int assignmentId)
    {
        return await _context.TrainingProgress.Where(p => p.AssignmentId == assignmentId).OrderBy(p => p.Date).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<TrainingProgress>> PostProgress(TrainingProgress progress)
    {
        // 1. Date Logic: Date not in future
        if (progress.Date > DateTime.Now)
        {
            return BadRequest("Progress date cannot be in the future.");
        }

        // 2. Progress Logic: Percent between 0 and 100
        if (progress.Percent < 0 || progress.Percent > 100)
        {
            return BadRequest("Progress percent must be between 0 and 100.");
        }

        // 3. Consistency Check: Percent cannot be less than current Assignment Progress
        var assignment = await _context.Assignments.FindAsync(progress.AssignmentId);
        if (assignment == null)
        {
            return NotFound("Assignment not found.");
        }

        if (progress.Percent < assignment.Progress)
        {
            return BadRequest($"Progress log cannot be less than the current assignment progress ({assignment.Progress}%).");
        }

        _context.TrainingProgress.Add(progress);
        
        // Auto-update assignment progress if this log is higher
        if (progress.Percent > assignment.Progress)
        {
            assignment.Progress = progress.Percent;
            _context.Entry(assignment).State = EntityState.Modified;
        }

        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProgress), new { id = progress.Id }, progress);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutProgress(int id, TrainingProgress progress)
    {
        if (id != progress.Id) return BadRequest();

        // 1. Date Logic: Date not in future
        if (progress.Date > DateTime.Now)
        {
            return BadRequest("Progress date cannot be in the future.");
        }

        // 2. Progress Logic: Percent between 0 and 100
        if (progress.Percent < 0 || progress.Percent > 100)
        {
            return BadRequest("Progress percent must be between 0 and 100.");
        }

        _context.Entry(progress).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.TrainingProgress.Any(e => e.Id == id)) return NotFound();
            else throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProgress(int id)
    {
        var progress = await _context.TrainingProgress.FindAsync(id);
        if (progress == null) return NotFound();
        _context.TrainingProgress.Remove(progress);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

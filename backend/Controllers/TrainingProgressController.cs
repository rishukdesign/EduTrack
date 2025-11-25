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
        _context.TrainingProgress.Add(progress);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProgress), new { id = progress.Id }, progress);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutProgress(int id, TrainingProgress progress)
    {
        if (id != progress.Id) return BadRequest();
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

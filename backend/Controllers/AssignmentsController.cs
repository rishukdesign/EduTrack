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

        _context.Entry(assignment).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
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

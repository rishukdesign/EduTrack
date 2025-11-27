using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.Backend.Data;
using EduTrack.Backend.Models;

namespace EduTrack.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TrainingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TrainingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Training>>> GetTrainings()
    {
        return await _context.Trainings.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Training>> PostTraining(Training training)
    {
        // 1. Date Logic: StartDate < EndDate
        if (training.StartDate.HasValue && training.EndDate.HasValue && training.StartDate > training.EndDate)
        {
            return BadRequest("Start Date cannot be after End Date.");
        }

        // 2. Future Date Limit: StartDate not > 2 years
        if (training.StartDate.HasValue && training.StartDate > DateTime.Now.AddYears(2))
        {
            return BadRequest("Training cannot be scheduled more than 2 years in advance.");
        }

        // 3. Duplicate Check (Title)
        if (await _context.Trainings.AnyAsync(t => t.Title == training.Title))
        {
            return BadRequest("A training program with this Title already exists.");
        }

        _context.Trainings.Add(training);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTrainings), new { id = training.Id }, training);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutTraining(int id, Training training)
    {
        if (id != training.Id) return BadRequest();

        // 1. Date Logic: StartDate < EndDate
        if (training.StartDate.HasValue && training.EndDate.HasValue && training.StartDate > training.EndDate)
        {
            return BadRequest("Start Date cannot be after End Date.");
        }

        // 2. Future Date Limit: StartDate not > 2 years
        if (training.StartDate.HasValue && training.StartDate > DateTime.Now.AddYears(2))
        {
            return BadRequest("Training cannot be scheduled more than 2 years in advance.");
        }

        // 3. Duplicate Check (Title) - exclude current training
        if (await _context.Trainings.AnyAsync(t => t.Title == training.Title && t.Id != id))
        {
            return BadRequest("A training program with this Title already exists.");
        }

        _context.Entry(training).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Trainings.Any(e => e.Id == id)) return NotFound();
            else throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTraining(int id)
    {
        var training = await _context.Trainings.FindAsync(id);
        if (training == null) return NotFound();
        _context.Trainings.Remove(training);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

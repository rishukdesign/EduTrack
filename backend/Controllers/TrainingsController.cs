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
        _context.Trainings.Add(training);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTrainings), new { id = training.Id }, training);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Training>> GetTraining(int id)
    {
        var training = await _context.Trainings.FindAsync(id);
        if (training == null) return NotFound();
        return training;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutTraining(int id, Training training)
    {
        if (id != training.Id) return BadRequest();
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

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.Backend.Data;
using EduTrack.Backend.Models;

namespace EduTrack.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MentorsController : ControllerBase
{
    private readonly AppDbContext _context;

    public MentorsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Mentor>>> GetMentors()
    {
        return await _context.Mentors.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Mentor>> PostMentor(Mentor mentor)
    {
        _context.Mentors.Add(mentor);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMentors), new { id = mentor.Id }, mentor);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Mentor>> GetMentor(int id)
    {
        var mentor = await _context.Mentors.FindAsync(id);
        if (mentor == null) return NotFound();
        return mentor;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutMentor(int id, Mentor mentor)
    {
        if (id != mentor.Id) return BadRequest();
        _context.Entry(mentor).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Mentors.Any(e => e.Id == id)) return NotFound();
            else throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMentor(int id)
    {
        var mentor = await _context.Mentors.FindAsync(id);
        if (mentor == null) return NotFound();
        _context.Mentors.Remove(mentor);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

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
        // 1. Duplicate Check (Email)
        if (!string.IsNullOrEmpty(mentor.Email) && await _context.Mentors.AnyAsync(m => m.Email == mentor.Email))
        {
            return BadRequest("A mentor with this Email already exists.");
        }

        // 2. Phone Validation
        if (!string.IsNullOrEmpty(mentor.Phone) && !System.Text.RegularExpressions.Regex.IsMatch(mentor.Phone, @"^\d{10,15}$"))
        {
            return BadRequest("Phone number must be between 10 and 15 digits.");
        }

        _context.Mentors.Add(mentor);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMentors), new { id = mentor.Id }, mentor);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutMentor(int id, Mentor mentor)
    {
        if (id != mentor.Id) return BadRequest();

        // 1. Duplicate Check (Email) - exclude current
        if (!string.IsNullOrEmpty(mentor.Email) && await _context.Mentors.AnyAsync(m => m.Email == mentor.Email && m.Id != id))
        {
            return BadRequest("A mentor with this Email already exists.");
        }

        // 2. Phone Validation
        if (!string.IsNullOrEmpty(mentor.Phone) && !System.Text.RegularExpressions.Regex.IsMatch(mentor.Phone, @"^\d{10,15}$"))
        {
            return BadRequest("Phone number must be between 10 and 15 digits.");
        }

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

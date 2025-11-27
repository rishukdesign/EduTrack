using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.Backend.Data;
using EduTrack.Backend.Models;

namespace EduTrack.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public StudentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Student>>> GetStudents()
    {
        return await _context.Students.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Student>> GetStudent(int id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null) return NotFound();
        return student;
    }

    [HttpPost]
    public async Task<ActionResult<Student>> PostStudent(Student student)
    {
        // 1. Duplicate Check (RollNo)
        if (await _context.Students.AnyAsync(s => s.RollNo == student.RollNo))
        {
            return BadRequest("A student with this Roll No already exists.");
        }

        // 2. Duplicate Check (Email)
        if (await _context.Students.AnyAsync(s => s.Email == student.Email))
        {
            return BadRequest("A student with this Email already exists.");
        }

        // 3. Phone Validation
        if (!System.Text.RegularExpressions.Regex.IsMatch(student.Phone, @"^\d{10,15}$"))
        {
            return BadRequest("Phone number must be between 10 and 15 digits.");
        }

        _context.Students.Add(student);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetStudent), new { id = student.Id }, student);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutStudent(int id, Student student)
    {
        if (id != student.Id) return BadRequest();

        // 1. Duplicate Check (RollNo) - exclude current student
        if (await _context.Students.AnyAsync(s => s.RollNo == student.RollNo && s.Id != id))
        {
            return BadRequest("A student with this Roll No already exists.");
        }

        // 2. Duplicate Check (Email) - exclude current student
        if (await _context.Students.AnyAsync(s => s.Email == student.Email && s.Id != id))
        {
            return BadRequest("A student with this Email already exists.");
        }

        // 3. Phone Validation
        if (!System.Text.RegularExpressions.Regex.IsMatch(student.Phone, @"^\d{10,15}$"))
        {
            return BadRequest("Phone number must be between 10 and 15 digits.");
        }

        _context.Entry(student).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Students.Any(e => e.Id == id)) return NotFound();
            else throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStudent(int id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null) return NotFound();
        _context.Students.Remove(student);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

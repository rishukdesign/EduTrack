using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.Backend.Data;
using EduTrack.Backend.Models;

namespace EduTrack.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AcademicRecordsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AcademicRecordsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AcademicRecord>>> GetAcademicRecords()
    {
        return await _context.AcademicRecords.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AcademicRecord>> GetAcademicRecord(int id)
    {
        var record = await _context.AcademicRecords.FindAsync(id);
        if (record == null) return NotFound();
        return record;
    }

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<IEnumerable<AcademicRecord>>> GetStudentAcademicRecords(int studentId)
    {
        return await _context.AcademicRecords.Where(r => r.StudentId == studentId).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<AcademicRecord>> PostAcademicRecord(AcademicRecord record)
    {
        _context.AcademicRecords.Add(record);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAcademicRecord), new { id = record.Id }, record);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutAcademicRecord(int id, AcademicRecord record)
    {
        if (id != record.Id) return BadRequest();
        _context.Entry(record).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.AcademicRecords.Any(e => e.Id == id)) return NotFound();
            else throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAcademicRecord(int id)
    {
        var record = await _context.AcademicRecords.FindAsync(id);
        if (record == null) return NotFound();
        _context.AcademicRecords.Remove(record);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

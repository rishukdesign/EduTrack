using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.Backend.Data;
using EduTrack.Backend.Models;

namespace EduTrack.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CompaniesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CompaniesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Company>>> GetCompanies()
    {
        return await _context.Companies.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Company>> PostCompany(Company company)
    {
        // 1. Duplicate Check (Name)
        if (await _context.Companies.AnyAsync(c => c.Name == company.Name))
        {
            return BadRequest("A company with this Name already exists.");
        }

        // 2. Duplicate Check (Email)
        if (!string.IsNullOrEmpty(company.Email) && await _context.Companies.AnyAsync(c => c.Email == company.Email))
        {
            return BadRequest("A company with this Email already exists.");
        }

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCompanies), new { id = company.Id }, company);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutCompany(int id, Company company)
    {
        if (id != company.Id) return BadRequest();

        // 1. Duplicate Check (Name) - exclude current
        if (await _context.Companies.AnyAsync(c => c.Name == company.Name && c.Id != id))
        {
            return BadRequest("A company with this Name already exists.");
        }

        // 2. Duplicate Check (Email) - exclude current
        if (!string.IsNullOrEmpty(company.Email) && await _context.Companies.AnyAsync(c => c.Email == company.Email && c.Id != id))
        {
            return BadRequest("A company with this Email already exists.");
        }

        _context.Entry(company).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Companies.Any(e => e.Id == id)) return NotFound();
            else throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCompany(int id)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company == null) return NotFound();
        _context.Companies.Remove(company);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

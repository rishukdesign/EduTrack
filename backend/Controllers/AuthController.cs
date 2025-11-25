using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduTrack.Backend.Data;
using EduTrack.Backend.Models;

namespace EduTrack.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username || u.Email == request.Username);

            if (user == null || user.Password != request.Password) // In production, use hashing!
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Account is deactivated. Contact Admin." });
            }

            return Ok(user);
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(RegisterRequest request)
        {
            if (_context.Users.Any(u => u.Username == request.Username || u.Email == request.Email))
            {
                return BadRequest(new { message = "Username or Email already exists" });
            }

            var user = new User
            {
                Username = request.Username,
                Password = request.Password, // In production, hash this!
                Email = request.Email,
                Name = request.Name,
                Role = request.Role,
                IsActive = true
            };

            // If registering as Student, create linked Student record
            if (user.Role == "Student")
            {
                var student = new Student
                {
                    RollNo = $"TEMP-{DateTime.Now.Ticks}", // Temporary RollNo
                    FirstName = user.Name.Split(' ')[0],
                    LastName = user.Name.Contains(' ') ? user.Name.Substring(user.Name.IndexOf(' ') + 1) : "",
                    Email = user.Email,
                    Program = "Pending",
                    Year = 1,
                    Phone = request.Phone, // Save Phone
                    IsActive = true
                };

                _context.Students.Add(student);
                await _context.SaveChangesAsync(); // Save to get ID

                user.StudentId = student.Id;
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Login), new { username = user.Username }, user);
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }
}

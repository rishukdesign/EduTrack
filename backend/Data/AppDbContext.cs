using Microsoft.EntityFrameworkCore;
using EduTrack.Backend.Models;

namespace EduTrack.Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<Company> Companies { get; set; }
    public DbSet<Mentor> Mentors { get; set; }
    public DbSet<Training> Trainings { get; set; }
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<AcademicRecord> AcademicRecords { get; set; }
    public DbSet<TrainingProgress> TrainingProgress { get; set; }
    public DbSet<Notification> Notifications { get; set; }
}

using EduTrack.Backend.Models;

namespace EduTrack.Backend.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        context.Database.EnsureCreated();

        // Seed Students
        if (context.Students.Count() < 3) // Check if we have the full seed set
        {
            var students = new Student[]
            {
                new Student { RollNo = "CS-23-003", FirstName = "Aarav", LastName = "Patel", Email = "aarav@edutrack.edu", Program = "BCA", Year = 2, Phone = "9876543212" },
                new Student { RollNo = "CS-23-004", FirstName = "Ananya", LastName = "Singh", Email = "ananya@edutrack.edu", Program = "MCA", Year = 1, Phone = "9876543213" },
                new Student { RollNo = "CS-23-005", FirstName = "Vihaan", LastName = "Gupta", Email = "vihaan@edutrack.edu", Program = "B.Tech CS", Year = 4, Phone = "9876543214" },
                new Student { RollNo = "CS-23-006", FirstName = "Diya", LastName = "Rao", Email = "diya@edutrack.edu", Program = "BCA", Year = 2, Phone = "9876543215" }
            };
            foreach (var s in students)
            {
                if (!context.Students.Any(e => e.Email == s.Email)) context.Students.Add(s);
            }
            context.SaveChanges();
        }

        // Seed Companies
        if (!context.Companies.Any())
        {
            var companies = new Company[]
            {
                new Company { Name = "TechSolutions India", Address = "Cyber City, Gurugram", ContactPerson = "Amit Malhotra", Email = "hr@techsolutions.in" },
                new Company { Name = "InnovateX Bangalore", Address = "Whitefield, Bangalore", ContactPerson = "Sneha Reddy", Email = "careers@innovatex.com" },
                new Company { Name = "DataMinds Hyderabad", Address = "Hitech City, Hyderabad", ContactPerson = "Rajesh Kumar", Email = "contact@dataminds.co.in" },
                new Company { Name = "CloudNine Systems", Address = "Pune IT Park", ContactPerson = "Vikram Singh", Email = "jobs@cloudnine.com" }
            };
            context.Companies.AddRange(companies);
            context.SaveChanges();
        }

        // Seed Mentors
        if (!context.Mentors.Any())
        {
            var companies = context.Companies.ToList();
            if (companies.Count >= 4)
            {
                var mentors = new Mentor[]
                {
                    new Mentor { Name = "Suresh Raina", Email = "suresh@techsolutions.in", Designation = "Senior Developer", Phone = "9988776655", CompanyId = companies[0].Id },
                    new Mentor { Name = "Meera Iyer", Email = "meera@innovatex.com", Designation = "Tech Lead", Phone = "9988776644", CompanyId = companies[1].Id },
                    new Mentor { Name = "Arjun Kapoor", Email = "arjun@dataminds.co.in", Designation = "Data Scientist", Phone = "9988776633", CompanyId = companies[2].Id },
                    new Mentor { Name = "Zara Khan", Email = "zara@cloudnine.com", Designation = "DevOps Engineer", Phone = "9988776622", CompanyId = companies[3].Id }
                };
                context.Mentors.AddRange(mentors);
                context.SaveChanges();
            }
        }

        // Seed Trainings
        if (!context.Trainings.Any())
        {
            var trainings = new Training[]
            {
                new Training { Title = "Full Stack Web Development", Description = "MERN Stack deep dive", StartDate = DateTime.Now.AddMonths(-2), EndDate = DateTime.Now.AddMonths(1), Status = "Ongoing" },
                new Training { Title = "Data Science with Python", Description = "AI/ML Fundamentals", StartDate = DateTime.Now.AddMonths(-1), EndDate = DateTime.Now.AddMonths(2), Status = "Ongoing" },
                new Training { Title = "Cloud Computing (AWS)", Description = "AWS Certified Solutions Architect", StartDate = DateTime.Now.AddMonths(1), EndDate = DateTime.Now.AddMonths(4), Status = "Upcoming" },
                new Training { Title = "Cyber Security Essentials", Description = "Network Security and Ethial Hacking", StartDate = DateTime.Now.AddMonths(-3), EndDate = DateTime.Now.AddMonths(-1), Status = "Completed" }
            };
            context.Trainings.AddRange(trainings);
            context.SaveChanges();
        }

        // Seed Assignments
        if (!context.Assignments.Any())
        {
            var students = context.Students.OrderBy(s => s.Id).ToList();
            var trainings = context.Trainings.OrderBy(t => t.Id).ToList();
            var companies = context.Companies.OrderBy(c => c.Id).ToList();
            var mentors = context.Mentors.OrderBy(m => m.Id).ToList();

            if (students.Count >= 5 && trainings.Count >= 4 && companies.Count >= 4 && mentors.Count >= 4)
            {
                var assignments = new Assignment[]
                {
                    new Assignment { StudentId = students[0].Id, TrainingId = trainings[0].Id, CompanyId = companies[0].Id, MentorId = mentors[0].Id, Status = "InProgress", AssignedDate = DateTime.Now.AddMonths(-2), Progress = 60, Remarks = "Good progress in React" },
                    new Assignment { StudentId = students[1].Id, TrainingId = trainings[1].Id, CompanyId = companies[2].Id, MentorId = mentors[2].Id, Status = "InProgress", AssignedDate = DateTime.Now.AddMonths(-1), Progress = 30, Remarks = "Learning Python basics" },
                    new Assignment { StudentId = students[2].Id, TrainingId = trainings[0].Id, CompanyId = companies[1].Id, MentorId = mentors[1].Id, Status = "Assigned", AssignedDate = DateTime.Now.AddDays(-5), Progress = 0, Remarks = "Just joined" },
                    new Assignment { StudentId = students[4].Id, TrainingId = trainings[3].Id, CompanyId = companies[3].Id, MentorId = mentors[3].Id, Status = "Completed", AssignedDate = DateTime.Now.AddMonths(-3), Progress = 100, Remarks = "Excellent performance", Score = 95 }
                };
                context.Assignments.AddRange(assignments);
                context.SaveChanges();
            }
        }

        // Seed Users
        if (!context.Users.Any())
        {
            var users = new User[]
            {
                new User { Username = "admin", Password = "password", Role = "Admin", Name = "System Admin", Email = "admin@edutrack.edu" },
                new User { Username = "faculty", Password = "password", Role = "Faculty", Name = "Dr. R.K. Narayan", Email = "faculty@edutrack.edu" },
                new User { Username = "rahul", Password = "password", Role = "Student", Name = "Rahul Sharma", Email = "rahul@edutrack.edu", StudentId = context.Students.FirstOrDefault(s => s.Email == "rahul@edutrack.edu")?.Id }
            };
            context.Users.AddRange(users);
            context.SaveChanges();
        }
    }
}

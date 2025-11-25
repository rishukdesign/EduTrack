using EduTrack.Backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database - Use SQL Server in production, SQLite in development
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (builder.Environment.IsProduction() && !string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connectionString));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite("Data Source=edutrack.db"));
}

// CORS - Configure based on environment
builder.Services.AddCors(options =>
{
    if (builder.Environment.IsProduction())
    {
        options.AddPolicy("AllowFrontend",
            policy => policy.WithOrigins(
                builder.Configuration["FrontendUrl"] ?? "https://edutrack-frontend.azurewebsites.net")
                              .AllowAnyMethod()
                              .AllowAnyHeader()
                              .AllowCredentials());
    }
    else
    {
        options.AddPolicy("AllowFrontend",
            policy => policy.AllowAnyOrigin()
                              .AllowAnyMethod()
                              .AllowAnyHeader());
    }
});

// Add health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable Swagger in production for Azure (can be disabled later)
if (app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    
    // For production, apply migrations automatically
    if (app.Environment.IsProduction())
    {
        context.Database.Migrate();
    }
    
    DbInitializer.Initialize(context);
}

app.Run();

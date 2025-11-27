using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduTrack.Backend.Migrations
{
    /// <inheritdoc />
    public partial class DeployUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Degree",
                table: "AcademicRecords");

            migrationBuilder.RenameColumn(
                name: "Score",
                table: "AcademicRecords",
                newName: "Qualification");

            migrationBuilder.AlterColumn<int>(
                name: "TrainingId",
                table: "Assignments",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "MentorId",
                table: "Assignments",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "CompanyId",
                table: "Assignments",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Assignments",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Assignments",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "ObtainedScore",
                table: "AcademicRecords",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "TotalScore",
                table: "AcademicRecords",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Assignments");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Assignments");

            migrationBuilder.DropColumn(
                name: "ObtainedScore",
                table: "AcademicRecords");

            migrationBuilder.DropColumn(
                name: "TotalScore",
                table: "AcademicRecords");

            migrationBuilder.RenameColumn(
                name: "Qualification",
                table: "AcademicRecords",
                newName: "Score");

            migrationBuilder.AlterColumn<int>(
                name: "TrainingId",
                table: "Assignments",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "MentorId",
                table: "Assignments",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CompanyId",
                table: "Assignments",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Degree",
                table: "AcademicRecords",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}

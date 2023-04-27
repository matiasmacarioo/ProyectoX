using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoX.Migrations
{
    public partial class MigracionServicios2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Eliminado",
                table: "Servicios",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Eliminado",
                table: "Servicios");
        }
    }
}


using System.ComponentModel.DataAnnotations;

namespace ProyectoX.Models;

public class Categoria
{
    [Key]
    public int CategoriaID { get; set; }
    public string? Descripcion { get; set; }
    public bool Eliminado { get; set; }
}

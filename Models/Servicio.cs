using System.ComponentModel.DataAnnotations;
using ProyectoX.Data;

namespace ProyectoX.Models
{
public class Servicio
{
    public int ServicioID { get; set; }
    [Required]
    public string? Descripcion { get; set; }
    [Required]
    public string? Direccion { get; set; }
    [Required]
    [RegularExpression(@"^\d{10}$")]
    public string? Telefono { get; set; }
    public bool Eliminado { get; set; }
    public int ProductoID { get; set; }
    public virtual Producto? Producto { get; set; }
}


public class VistaServicio {
    public int ServicioID { get; set; }
    public string? Descripcion { get; set; } 
    public string? Direccion { get; set; }
    public string? Telefono { get; set; }
    public bool Eliminado { get; set; }
    public int ProductoID { get; set; }
    public string? ProductoDescripcion { get; set; }
    public virtual Producto? Producto { get; set; }
}

}
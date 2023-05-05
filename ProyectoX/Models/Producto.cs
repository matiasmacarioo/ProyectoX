using System.ComponentModel.DataAnnotations;
using ProyectoX.Data;
// using System.Linq;


namespace ProyectoX.Models
{
public class Producto
{
    public int ProductoID { get; set; }
    [Required]
    public string? Descripcion { get; set; }
    public bool Eliminado { get; set; }
    public int CategoriaID { get; set; }
    public virtual Categoria? Categoria { get; set; }
    public virtual ICollection<Servicio>? Servicios { get; set; }

}

public class VistaProducto {
    public int ProductoID { get; set; }
    public bool Eliminado { get; set; }
    public string? Descripcion { get; set; } 
    public int CategoriaID { get; set; }
    public string? CategoriaDescripcion { get; set; }
}
}
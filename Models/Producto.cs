using System.ComponentModel.DataAnnotations;
using ProyectoX.Data;
using System.Linq;


namespace ProyectoX.Models
{
public class Producto
{
    public int ProductoID { get; set; }

    [Required]
    public string Descripcion { get; set; }

    public bool Eliminado { get; set; }

    [ValidCategoriaID]
    public int CategoriaID { get; set; }

    public virtual Categoria Categoria { get; set; }
}

public class VistaProducto {
    public int ProductoID { get; set; }

    public string? Descripcion { get; set; } 

    public int CategoriaID { get; set; }

    public string? CategoriaDescripcion { get; set; }
}
    

public class ValidCategoriaIDAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        var dbContext = validationContext.GetService(typeof(ApplicationDbContext)) as ApplicationDbContext;

        int categoriaID = (int)value;

        if (dbContext.Categorias.Any(c => c.CategoriaID == categoriaID))
        {
            return ValidationResult.Success;
        }

        return new ValidationResult("CategoriaID no es valido.");
    }
}
}
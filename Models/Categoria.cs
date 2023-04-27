using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ProyectoX.Models
{
    public class Categoria
    {
        [Key]
        public int CategoriaID { get; set; }

        [Required(ErrorMessage = "La descripción es obligatoria.")]
        [StringLength(50, ErrorMessage = "La descripción no puede tener más de 50 caracteres.")]
        public string? Descripcion { get; set; }
        public bool Eliminado { get; set; }
        public virtual ICollection<Producto>? Productos { get; set; }
    }
}

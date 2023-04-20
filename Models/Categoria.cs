using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ProyectoX.Models
{
    public class Categoria
    {
        [Key]
        public int CategoriaID { get; set; }
        public string? Descripcion { get; set; }
        public bool Eliminado { get; set; }
        public virtual ICollection<Producto> Productos { get; set; }
    }
}

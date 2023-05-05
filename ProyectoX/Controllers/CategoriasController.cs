
using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProyectoX.Data;
using ProyectoX.Models;

namespace ProyectoX.Controllers;

public class CategoriasController : Controller
{
    private readonly ILogger<CategoriasController> _logger;
    private ApplicationDbContext _contexto;

    public CategoriasController(ILogger<CategoriasController> logger, ApplicationDbContext contexto)
    {
        _logger = logger;
        _contexto = contexto;
    }

    public IActionResult Index()
    {
        return View();
    }

    // El método toma un parámetro opcional llamado "categoriaID", que tiene un valor predeterminado de 0.
    public JsonResult BuscarCategorias(int categoriaID = 0)
    {
        // Se recuperan todas las categorías de la base de datos y se ordenan por su descripción.
        var categorias = _contexto.Categorias.OrderBy(c => c.Descripcion).ToList();

        if (!User.Identity.IsAuthenticated)
        {
            // Si el usuario no está autenticado, filtrar solo las categorías permitidas que no han sido eliminadas.
            categorias = _contexto.Categorias.OrderBy(c => c.Descripcion).Where(c => c.Eliminado == false).ToList();
        }

        if (categoriaID > 0)
        {
            // Si se proporciona un valor para "categoriaID" que sea mayor que cero, filtrar la lista de categorías aún más
            // para que solo se devuelva la categoría específica que corresponde al ID proporcionado.
            categorias = categorias.Where(c => c.CategoriaID == categoriaID).OrderBy(c => c.Descripcion).ToList();
        }

        // Se devuelve una respuesta en formato JSON que contiene la lista de categorías resultante.
        return Json(categorias);
    }

    [Authorize]
    // El método toma dos parámetros: "categoriaID" y "descripcion", que son obligatorios.
    public JsonResult GuardarCategoria(int categoriaID, string descripcion)
    {
        int resultado = 0; // valor por defecto para indicar que falló (default)

        if (!string.IsNullOrEmpty(descripcion))
        {
            // Si la descripción no está vacía, se procede a guardar o editar la categoría en la base de datos.

            // Si el valor de "categoriaID" es 0, se crea una nueva categoría.
            if (categoriaID == 0)
            {
                // Se busca si ya existe una categoría con la misma descripción.
                var categoriaOriginal = _contexto.Categorias.Where(c => c.Descripcion == descripcion).FirstOrDefault();

                if (categoriaOriginal == null)
                {
                    // Si no existe una categoría con la misma descripción, se crea un nuevo objeto de categoría con la descripción ingresada en el modal.
                    var categoriaGuardar = new Categoria
                    {
                        Descripcion = descripcion
                    };

                    // Se guarda el nuevo objeto en la base de datos.
                    _contexto.Add(categoriaGuardar);
                    _contexto.SaveChanges();
                    resultado = 0; // Se crea el objeto correctamente (CASO 0)
                }
                else
                {
                    resultado = 1; // La categoría ya existe (CASO 1)
                }
            }
            else
            {
                // Si el valor de "categoriaID" es diferente de 0, se edita una categoría existente.
                var categoriaOriginal = _contexto.Categorias.Where(c => c.Descripcion == descripcion && c.CategoriaID != categoriaID).FirstOrDefault();

                if (categoriaOriginal == null)
                {
                    // Si no existe una categoría con la misma descripción, se busca la categoría original que se quiere editar.
                    var categoriaEditar = _contexto.Categorias.Find(categoriaID);

                    if (categoriaEditar != null)
                    {
                        // Se modifica la descripción de la categoría y se guarda en la base de datos.
                        categoriaEditar.Descripcion = descripcion;
                        _contexto.SaveChanges();
                        resultado = 0; // Se edita el objeto correctamente (CASO 0)
                    }
                }
                else
                {
                    resultado = 1; // La categoría ya existe (CASO 1)
                }
            }
        }
        else
        {
            resultado = 2; // La descripción no puede estar vacía (CASO 2)
        }

        // Se devuelve un resultado en formato JSON que indica el éxito o fracaso de la operación.
        return Json(resultado);
    }

    [Authorize]
    public JsonResult DeshabilitarCategoria(int categoriaID)
    {
        bool resultado = true;
        if (categoriaID != 0)
        {
            // Crear variable que guarde el objeto segun el id deseado
            var categoriaDeshabilitar = _contexto.Categorias.Find(categoriaID);
            if (categoriaDeshabilitar != null)
            {
                // Actualizar el valor de la propiedad "Eliminado" a true
                categoriaDeshabilitar.Eliminado = true;
                _contexto.SaveChanges();
                resultado = true;
            }
        }
        else
        {
            resultado = false;
        }
        return Json(resultado);
    }

    [Authorize]
    public JsonResult HabilitarCategoria(int categoriaID)
    {
        bool resultado = true;
        if (categoriaID != 0)
        {
            // Crear variable que guarde el objeto segun el id deseado
            var categoriaHabilitar = _contexto.Categorias.Find(categoriaID);
            if (categoriaHabilitar != null)
            {
                // Actualizar el valor de la propiedad "Eliminado" a false
                categoriaHabilitar.Eliminado = false;
                _contexto.SaveChanges();
                resultado = true;
            }
        }
        else
        {
            resultado = false;
        }
        return Json(resultado);
    }

    [Authorize]
    public JsonResult EliminarCategoria(int categoriaID)
    {
        bool resultado = true;
        var categoriaEliminar = _contexto.Categorias.Find(categoriaID);

        if (categoriaID != 0)
        {
            // Obtener productos asociados a la categoría a eliminar
            var productosEnCategoria = (from a in _contexto.Productos where a.CategoriaID == categoriaID select a).ToList();

            // Si la categoría no tiene productos asociados, proceder a eliminarla
            if (productosEnCategoria.Count == 0)
            {
                if (categoriaEliminar != null)
                {
                    _contexto.Categorias.Remove(categoriaEliminar);
                    _contexto.SaveChanges();
                    return Json(new { success = true, message = "La categoría se eliminó de la base de datos." });
                    resultado = true;
                }
                else
                {
                    resultado = false;
                    return Json(new { success = false, message = "La categoría no se encontró en la base de datos." });
                }

            }
            else
            {
                resultado = false;
                return Json(new { success = false, message = "La categoría no se puede eliminar porque tiene productos asociados." });
            }
        }
        else
        {
            resultado = false;
            return Json(new { success = false, message = "La categoría no se encontró en la base de datos." });
        }
        return Json(resultado);
    }
}

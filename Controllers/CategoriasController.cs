
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

    public JsonResult BuscarCategorias(int categoriaID = 0)
    {
        var categorias = _contexto.Categorias.ToList();

        if (categoriaID > 0)
        {
            categorias = categorias.Where(c => c.CategoriaID == categoriaID).OrderBy(c => c.Descripcion).ToList();
        }

        return Json(categorias);
    }

    [Authorize]
    public JsonResult GuardarCategoria(int categoriaID, string descripcion)
    {
        int resultado = 0; // valor por defecto para indicar que falló (default)

        if (!string.IsNullOrEmpty(descripcion))
        {
            // SI ES 0 CREA UNA NUEVA
            if (categoriaID == 0)
            {
                //BUSCAMOS SI YA EXISTE UNA CON LA MISMA DESCRIPCION
                var categoriaOriginal = _contexto.Categorias.Where(c => c.Descripcion == descripcion).FirstOrDefault();
                if (categoriaOriginal == null)
                {
                    //DECLARAMOS EL OBJETO CON EL VALOR DE LA DECRIPCION INGRESADA EN EL MODAL
                    var categoriaGuardar = new Categoria
                    {
                        Descripcion = descripcion
                    };
                    _contexto.Add(categoriaGuardar);
                    _contexto.SaveChanges();
                    resultado = 0; // SE CREA EL OBJETO CORRECTAMENTE (CASO 0)
                }
                else
                {
                    resultado = 1; //La categoría ya existe (CASO 1)
                }
            }
            else
            {
                var categoriaOriginal = _contexto.Categorias.Where(c => c.Descripcion == descripcion && c.CategoriaID != categoriaID).FirstOrDefault();
                if (categoriaOriginal == null)
                {
                    var categoriaEditar = _contexto.Categorias.Find(categoriaID);
                    if (categoriaEditar != null)
                    {
                        categoriaEditar.Descripcion = descripcion;
                        _contexto.SaveChanges();
                        resultado = 0; // SE EDITA EL OBJETO CORRECTAMENTE (CASO 0)
                    }
                }
                else
                {
                    resultado = 1; //La categoría ya existe (CASO 1)
                }
            }
        }
        else
        {
            resultado = 2; //La descripción no puede estar vacía (CASO 2)
        }

        return Json(resultado);
    }

    [Authorize]
    public JsonResult DeshabilitarCategoria(int categoriaID)
    {
        bool resultado = true;
        if (categoriaID != 0)
        {
            //crear variable que guarde el objeto segun el id deseado
            var categoriaDeshabilitar = _contexto.Categorias.Find(categoriaID);
            if (categoriaDeshabilitar != null)
            {
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
            var categoriaHabilitar = _contexto.Categorias.Find(categoriaID);
            if (categoriaHabilitar != null)
            {
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
            var categoriaProductos = (from a in _contexto.Productos where a.CategoriaID == categoriaID select a).ToList();
            if (categoriaProductos.Count == 0)
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

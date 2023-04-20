
    
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoX.Data;
using ProyectoX.Models;

namespace ProyectoX.Controllers;

public class ProductosController : Controller
{
    private readonly ILogger<ProductosController> _logger;
    private ApplicationDbContext _contexto;

    public ProductosController(ILogger<ProductosController> logger, ApplicationDbContext contexto)
    {
        _logger = logger;
        _contexto = contexto;
    }

    public IActionResult Index()
    {
        return View();
    }

public JsonResult BuscarProductos(int categoriaID = 0)
{
    var productos = _contexto.Productos.ToList();

    if (categoriaID > 0)
    {
        productos = productos.Where(p => p.CategoriaID == categoriaID).ToList();
    }

    return Json(productos);
}




public JsonResult BuscarCategorias()
{
    var categorias = _contexto.Categorias.ToList();
    return Json(categorias);
}

public JsonResult GuardarProducto(int id, string descripcion, int categoriaID)
{
    int resultado = -1;

    if (!string.IsNullOrEmpty(descripcion))
    {
        if (id == 0)
        {
            var productoOriginal = _contexto.Productos.Where(p => p.Descripcion == descripcion && p.CategoriaID == categoriaID).FirstOrDefault();
            if (productoOriginal == null)
            {
                var productoGuardar = new Producto
                {
                    Descripcion = descripcion,
                    CategoriaID = categoriaID
                };
                _contexto.Add(productoGuardar);
                _contexto.SaveChanges();
                resultado = 0;
            }
            else
            {
                resultado = 1;
            }
        }
        else
        {
            var productoOriginal = _contexto.Productos.Where(p => p.Descripcion == descripcion && p.CategoriaID == categoriaID).FirstOrDefault();
            if (productoOriginal == null)
            {
                var productoEditar = _contexto.Productos.Find(id);
                if (productoEditar != null)
                {
                    productoEditar.Descripcion = descripcion;
                    productoEditar.CategoriaID = categoriaID;
                    _contexto.SaveChanges();
                    resultado = 0;
                }
            }
            else
            {
                resultado = 1;
            }
        }
    }
    else
    {
        resultado = 2;
    }

    return Json(resultado);
}

}
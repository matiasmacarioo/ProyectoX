

using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
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
        // var categorias = _contexto. Categorias.ToList();
        // ViewBag. categorialD = new SelectList(categorias, "CategorialD", "Descripcion");
        return View();
    }

    public JsonResult BuscarProductos(int ProductoID = 0)
    {
        List<VistaProducto> ProductosMostrar = new List<VistaProducto>();

        // busca los productos en categorias habilitadas y las ordena por descripcion
        var Productos = _contexto.Productos.Include(p => p.Categoria).Where(p => p.Categoria.Eliminado == false).OrderBy(p => p.Descripcion).ToList();

        if (ProductoID > 0)
        {
            Productos = Productos.Where(p => p.ProductoID == ProductoID).OrderBy(p => p.Descripcion).ToList();
        }
        foreach (var Producto in Productos)
        {
            var ProductoMostrar = new VistaProducto
            {
                Descripcion = Producto.Descripcion,
                ProductoID = Producto.ProductoID,
                CategoriaID = Producto.CategoriaID,
                CategoriaDescripcion = Producto.Categoria.Descripcion,
                Eliminado = Producto.Eliminado

            };
            ProductosMostrar.Add(ProductoMostrar);
        }

        return Json(ProductosMostrar);
    }

    public JsonResult BuscarCategorias()
    {
        var categorias = _contexto.Categorias.OrderBy(c => c.Descripcion).ToList();
        return Json(categorias);
    }

    [Authorize]
    public JsonResult GuardarProducto(int productoID, string descripcion, int categoriaID)
    {
        int resultado = 0;

        if (categoriaID != 0)
        {
            // comprueba que la descripcion recibida no este vacia.
            if (!string.IsNullOrEmpty(descripcion))
            {
                // crea un nuevo producto
                if (productoID == 0)
                {
                    var productoOriginal = _contexto.Productos.Where(p => p.Descripcion == descripcion && p.ProductoID != productoID).FirstOrDefault();
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
                // edita un producto ya creado
                {
                    // comprueba que el nombre del producto sea diferente a otros en la misma categoría
                    var productoOriginal = _contexto.Productos.Where(p => p.Descripcion == descripcion && p.ProductoID != productoID).FirstOrDefault();
                    if (productoOriginal == null)
                    {
                        var productoEditar = _contexto.Productos.Find(productoID);
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

        }
        else
        {
            resultado = 3;
        }

        return Json(resultado);
    }

    [Authorize]

    public JsonResult DeshabilitarProducto(int productoID)
    {
        bool resultado = true;
        if (productoID != 0)
        {
            //crear variable que guarde el objeto segun el id deseado
            var productoDeshabilitar = _contexto.Productos.Find(productoID);
            if (productoDeshabilitar != null)
            {
                productoDeshabilitar.Eliminado = true;
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

    public JsonResult HabilitarProducto(int productoID)
    {
        bool resultado = true;
        if (productoID != 0)
        {
            var productoHabilitar = _contexto.Productos.Find(productoID);
            if (productoHabilitar != null)
            {
                productoHabilitar.Eliminado = false;
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

    public JsonResult EliminarProducto(int productoID)
    {
        bool resultado = true;
        if (productoID != 0)
        {
            var productoDeshabilitar = _contexto.Productos.Find(productoID);
            if (productoDeshabilitar != null)
            {
                _contexto.Productos.Remove(productoDeshabilitar);
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
}
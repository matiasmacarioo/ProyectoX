

using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ProyectoX.Data;
using ProyectoX.Models;

namespace ProyectoX.Controllers;

public class ServiciosController : Controller
{
    private readonly ILogger<ServiciosController> _logger;
    private ApplicationDbContext _contexto;
    public ServiciosController(ILogger<ServiciosController> logger, ApplicationDbContext contexto)
    {
        _logger = logger;
        _contexto = contexto;
    }

    public IActionResult Index()
    {
        return View();
    }

    [Authorize]
    public JsonResult GuardarServicio(int servicioID, string descripcion, string direccion, string telefono, int productoID)
    {
        int resultado = 0;

        if (productoID != 0)
        {
            // comprueba que la descripcion recibida no este vacia.
            if (!string.IsNullOrEmpty(descripcion) & !string.IsNullOrEmpty(direccion) & !string.IsNullOrEmpty(telefono))
            {
                // crea un nuevo servicio si su id es 0
                if (servicioID == 0)
                {
                    // Comprueba si no existe otro con la misma descripcion
                    var servicioOriginal = _contexto.Servicios.Where(p => p.Descripcion == descripcion && p.ProductoID == productoID).FirstOrDefault();
                    // si no hay uno igual procede a crear un nuevo servicio
                    if (servicioOriginal == null)
                    {
                        var servicioGuardar = new Servicio
                        {
                            Descripcion = descripcion,
                            Direccion = direccion,
                            Telefono = telefono,
                            ProductoID = productoID
                        };
                        _contexto.Add(servicioGuardar);
                        _contexto.SaveChanges();
                        resultado = 0;
                    }
                    else
                    {
                        resultado = 1;
                    }
                }
                else
                // edita un servicio ya creado ya que el id no es 0
                {
                    // comprueba que el nombre del servicio sea diferente a otros en la misma categoría
                    var servicioOriginal = _contexto.Servicios.Where(p => p.Descripcion == descripcion && p.ProductoID == productoID).FirstOrDefault();
                    if (servicioOriginal == null)
                    {
                        var servicioEditar = _contexto.Servicios.Find(servicioID);
                        if (servicioEditar != null)
                        {
                            servicioEditar.Descripcion = descripcion;
                            servicioEditar.Direccion = direccion;
                            servicioEditar.Telefono = telefono;
                            servicioEditar.ProductoID = productoID;
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


    // public JsonResult BuscarServicios(int ProductoID = 0)
    // {
    //     List<VistaProducto> ServiciosMostrar = new List<VistaProducto>();

    //     // busca los servicios en categorias habilitadas y las ordena por descripcion
    //     var Servicios = _contexto.Servicios.Include(p => p.Categoria).Where(p => p.Categoria.Eliminado == false).OrderBy(p => p.Descripcion).ToList();

    //     if (ProductoID > 0)
    //     {
    //         Servicios = Servicios.Where(p => p.ProductoID == ProductoID).OrderBy(p => p.Descripcion).ToList();
    //     }
    //     foreach (var Producto in Servicios)
    //     {
    //         var ProductoMostrar = new VistaProducto
    //         {
    //             Descripcion = Producto.Descripcion,
    //             ProductoID = Producto.ProductoID,
    //             CategoriaID = Producto.CategoriaID,
    //             CategoriaDescripcion = Producto.Categoria.Descripcion,
    //             Eliminado = Producto.Eliminado

    //         };
    //         ServiciosMostrar.Add(ProductoMostrar);
    //     }

    //     return Json(ServiciosMostrar);
    // }

    // public JsonResult BuscarCategorias()
    // {
    //     var categorias = _contexto.Categorias.OrderBy(c => c.Descripcion).ToList();
    //     return Json(categorias);
    // }


    // [Authorize]

    // public JsonResult DeshabilitarProducto(int productoID)
    // {
    //     bool resultado = true;
    //     if (productoID != 0)
    //     {
    //         //crear variable que guarde el objeto segun el id deseado
    //         var productoDeshabilitar = _contexto.Servicios.Find(productoID);
    //         if (productoDeshabilitar != null)
    //         {
    //             productoDeshabilitar.Eliminado = true;
    //             _contexto.SaveChanges();
    //             resultado = true;
    //         }
    //     }
    //     else
    //     {
    //         resultado = false;
    //     }
    //     return Json(resultado);
    // }

    // [Authorize]

    // public JsonResult HabilitarProducto(int productoID)
    // {
    //     bool resultado = true;
    //     if (productoID != 0)
    //     {
    //         var productoHabilitar = _contexto.Servicios.Find(productoID);
    //         if (productoHabilitar != null)
    //         {
    //             productoHabilitar.Eliminado = false;
    //             _contexto.SaveChanges();
    //             resultado = true;
    //         }
    //     }
    //     else
    //     {
    //         resultado = false;
    //     }
    //     return Json(resultado);
    // }

    // [Authorize]

    // public JsonResult EliminarProducto(int productoID)
    // {
    //     bool resultado = true;
    //     if (productoID != 0)
    //     {
    //         var productoDeshabilitar = _contexto.Servicios.Find(productoID);
    //         if (productoDeshabilitar != null)
    //         {
    //             _contexto.Servicios.Remove(productoDeshabilitar);
    //             _contexto.SaveChanges();
    //             resultado = true;
    //         }
    //     }
    //     else
    //     {
    //         resultado = false;
    //     }
    //     return Json(resultado);
    // }
}


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
            if (!string.IsNullOrEmpty(descripcion))
            {
                if (!string.IsNullOrEmpty(direccion))
                {
                    if (!string.IsNullOrEmpty(telefono))
                    {

                        // crea un nuevo servicio si su id es 0
                        if (servicioID == 0)
                        {
                            // Comprueba si no existe otro con la misma descripcion
                            var servicioOriginal = _contexto.Servicios.Where(p => p.Descripcion == descripcion && p.ServicioID != servicioID).FirstOrDefault();
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
                            var servicioOriginal = _contexto.Servicios.Where(p => p.Descripcion == descripcion && p.ServicioID != servicioID).FirstOrDefault();
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
                        resultado = 5;
                    }
                }
                else
                {
                    resultado = 4;
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


    public JsonResult BuscarServicios(int ServicioID = 0)
    {
        List<VistaServicio> ServiciosMostrar = new List<VistaServicio>();

        // busca los servicios en productos habilitadas y las ordena por descripcion
        var Servicios = _contexto.Servicios.Include(s => s.Producto).Where(s => s.Producto.Eliminado == false && s.Producto.Categoria.Eliminado == false).OrderBy(p => p.Descripcion).ToList();

                if (!User.Identity.IsAuthenticated)
        {
        // Si el usuario no está autenticado, filtrar solo las categorías permitidas
        Servicios = _contexto.Servicios.Include(s => s.Producto).Where(s => s.Producto.Eliminado == false && s.Producto.Categoria.Eliminado == false).Where(s => s.Eliminado == false).OrderBy(p => p.Descripcion).ToList();
        }

        if (ServicioID > 0)
        {
            Servicios = Servicios.Where(s => s.ServicioID == ServicioID).OrderBy(s => s.Descripcion).ToList();
        }
        foreach (var Servicio in Servicios)
        {
            var ServicioMostrar = new VistaServicio
            {
                ServicioID = Servicio.ServicioID,
                Descripcion = Servicio.Descripcion,
                Direccion = Servicio.Direccion,
                Telefono = Servicio.Telefono,
                Eliminado = Servicio.Eliminado,
                ProductoID = Servicio.ProductoID,
                ProductoDescripcion = Servicio.Producto.Descripcion

            };
            ServiciosMostrar.Add(ServicioMostrar);
        }

        return Json(ServiciosMostrar);
    }

    public JsonResult BuscarProductos()
    {
        var productos = _contexto.Productos.OrderBy(c => c.Descripcion).ToList();
        return Json(productos);
    }


    [Authorize]

    public JsonResult DeshabilitarServicio(int servicioID)
    {
        bool resultado = true;
        if (servicioID != 0)
        {
            //crear variable que guarde el objeto segun el id deseado
            var servicioDeshabilitar = _contexto.Servicios.Find(servicioID);
            if (servicioDeshabilitar != null)
            {
                servicioDeshabilitar.Eliminado = true;
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

    public JsonResult HabilitarServicio(int servicioID)
    {
        bool resultado = true;
        if (servicioID != 0)
        {
            var servicioHabilitar = _contexto.Servicios.Find(servicioID);
            if (servicioHabilitar != null)
            {
                servicioHabilitar.Eliminado = false;
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
    public JsonResult EliminarServicio(int servicioID)
    {
        bool resultado = true;
        if (servicioID != 0)
        {
            var servicioDeshabilitar = _contexto.Servicios.Find(servicioID);
            if (servicioDeshabilitar != null)
            {
                _contexto.Servicios.Remove(servicioDeshabilitar);
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


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

        // Si el id del producto recibido no es cero
        if (productoID != 0)
        {
            // comprueba que la descripcion recibida no este vacia.
            if (!string.IsNullOrEmpty(descripcion))
            {
                if (!string.IsNullOrEmpty(direccion))
                {
                    if (!string.IsNullOrEmpty(telefono))
                    {

                        // si el id del servicio es 0, crea un nuevo servicio 
                        if (servicioID == 0)
                        {
                            // Comprueba si no existe otro servicio con la misma descripcion
                            var servicioOriginal = _contexto.Servicios.Where(p => p.Descripcion == descripcion && p.ServicioID != servicioID).FirstOrDefault();
                            // si no hay otro servicio igual procede a crear uno nuevo
                            if (servicioOriginal == null)
                            {
                                // crea un nuevo objeto llamado servicio y guarda sus atributos
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
                                resultado = 1; // 1 indica que ya existe un servicio con la misma descripcion
                            }
                        }
                        else
                        // edita un servicio ya creado ya que el id no es 0
                        {
                            // comprueba que la descripcion del servicio editado no sea igual a otro en la misma categoria
                            var servicioOriginal = _contexto.Servicios.Where(p => p.Descripcion == descripcion && p.ServicioID != servicioID).FirstOrDefault();
                            if (servicioOriginal == null)
                            {
                                var servicioEditar = _contexto.Servicios.Find(servicioID);
                                if (servicioEditar != null)
                                {
                                    // edita los atributos del objeto Servicio ya existente 
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
                                resultado = 1; // 1 indica que ya existe un servicio con la misma descripcion
                            }
                        }
                    }
                    else
                    {
                        resultado = 5; // 5 indica que el campo telefono esta vacio
                    }
                }
                else
                {
                    resultado = 4; // 4 indica que el campo direccion esta vacio
                }
            }
            else
            {
                resultado = 2; // 2 indica que el campo descripcion esta vacio
            }

        }
        else
        {
            resultado = 3; // 3 indica que el productoID es cero
        }

        return Json(resultado);
    }


    public JsonResult BuscarServicios(int ServicioID = 0)
    {
        List<VistaServicio> ServiciosMostrar = new List<VistaServicio>();

        // Busca todos los servicios en productos habilitados en categorias habilitadas y los ordena por descripción
        var Servicios = _contexto.Servicios.Include(s => s.Producto).Where(s => s.Producto.Eliminado == false && s.Producto.Categoria.Eliminado == false).OrderBy(p => p.Descripcion).ToList();

        if (!User.Identity.IsAuthenticated)
        {
            // Si el usuario no está autenticado, filtra solo las servicios habilitados en productos habilitados en categorias habilitadas y los ordena por descripción
            Servicios = _contexto.Servicios.Include(s => s.Producto).Where(s => s.Producto.Eliminado == false && s.Producto.Categoria.Eliminado == false).Where(s => s.Eliminado == false).OrderBy(p => p.Descripcion).ToList();
        }

        if (ServicioID > 0)
        {
            // Si se especificó un ServicioID, filtra la lista de servicios para mostrar solo ese servicio
            Servicios = Servicios.Where(s => s.ServicioID == ServicioID).OrderBy(s => s.Descripcion).ToList();
        }

        foreach (var Servicio in Servicios)
        {
            // Crea un objeto VistaServicio con la información del servicio a mostrar
            // Esta instancia es creada para que en la vista de servicios se pueda ver la descripcion del producto al que corresponde.
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
            // Agrega el objeto VistaServicio a la lista ServiciosMostrar
            ServiciosMostrar.Add(ServicioMostrar);
        }

        return Json(ServiciosMostrar);
    }

    public JsonResult BuscarProductos()
    {
        // Obtiene todos los productos y los ordena por descripción
        var productos = _contexto.Productos.OrderBy(c => c.Descripcion).ToList();
        return Json(productos);
    }

    [Authorize]
    public JsonResult DeshabilitarServicio(int servicioID)
    {
        bool resultado = true;
        if (servicioID != 0)
        {
            // Busca el servicio correspondiente al servicioID dado
            var servicioDeshabilitar = _contexto.Servicios.Find(servicioID);
            if (servicioDeshabilitar != null)
            {
                // Deshabilita el servicio y guarda los cambios en la base de datos
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
            // Busca el servicio correspondiente al servicioID dado
            var servicioHabilitar = _contexto.Servicios.Find(servicioID);
            if (servicioHabilitar != null)
            {
                // Habilita el servicio y guarda los cambios en la base de datos
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
            // Busca el servicio correspondiente al servicioID dado
            var servicioEliminar = _contexto.Servicios.Find(servicioID);
            if (servicioEliminar != null)
            {
                // Elimina el servicio de la base de datos
                _contexto.Servicios.Remove(servicioEliminar);
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
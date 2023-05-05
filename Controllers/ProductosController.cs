

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
        // Inicializa una lista vacía que almacenará los productos a mostrar
        List<VistaProducto> ProductosMostrar = new List<VistaProducto>();

        // Busca todos los productos en categorías habilitadas y los ordena por descripción
        var Productos = _contexto.Productos.Include(p => p.Categoria).Where(p => p.Categoria.Eliminado == false).OrderBy(p => p.Descripcion).ToList();

        // Si el usuario no está autenticado, solo mostrar productos habilitados
        if (!User.Identity.IsAuthenticated)
        {
            // Filtra los productos habilitados en categorías habilitadas
            Productos = _contexto.Productos.Include(p => p.Categoria).Where(p => p.Categoria.Eliminado == false).Where(p => p.Eliminado == false).OrderBy(p => p.Descripcion).ToList();
        }

        // Si el parámetro ProductoID es mayor que cero, filtra la lista de productos para incluir solo el producto con el ID especificado
        if (ProductoID > 0)
        {
            Productos = Productos.Where(p => p.ProductoID == ProductoID).OrderBy(p => p.Descripcion).ToList();
        }

        // Itera sobre los productos encontrados y crea una instancia de VistaProducto para cada uno, agregándolos a la lista ProductosMostrar
        // Esta instancia es creada para que en la vista de los productos se pueda ver la descripcion de la categoria a la que corresponde.
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

        // Devuelve la lista ProductosMostrar en formato JSON
        return Json(ProductosMostrar);
    }

    // Este método busca todas las categorías disponibles en la base de datos y las ordena alfabéticamente por su descripción para mostrarlas en el selector del modal en orden.
    public JsonResult BuscarCategorias()
    {
        var categorias = _contexto.Categorias.OrderBy(c => c.Descripcion).ToList();
        return Json(categorias);
    }

    // Guarda o edita un producto
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
                    // comprueba que la descripcion del producto no exista ya en la base de datos
                    var productoOriginal = _contexto.Productos.Where(p => p.Descripcion == descripcion && p.ProductoID != productoID).FirstOrDefault();
                    if (productoOriginal == null)
                    {
                        // crea un nuevo producto y lo agrega a la base de datos
                        var productoGuardar = new Producto
                        {
                            Descripcion = descripcion,
                            CategoriaID = categoriaID
                        };
                        _contexto.Add(productoGuardar);
                        _contexto.SaveChanges();
                        resultado = 0; // éxito
                    }
                    else
                    {
                        resultado = 1; // la descripcion del producto ya existe
                    }
                }
                else
                // edita un producto ya creado
                {
                    // comprueba que el nombre del producto sea diferente a otros en la misma categoría
                    var productoOriginal = _contexto.Productos.Where(p => p.Descripcion == descripcion && p.ProductoID != productoID).FirstOrDefault();
                    if (productoOriginal == null)
                    {
                        // obtiene el producto a editar
                        var productoEditar = _contexto.Productos.Find(productoID);
                        if (productoEditar != null)
                        {
                            // actualiza la información del producto
                            productoEditar.Descripcion = descripcion;
                            productoEditar.CategoriaID = categoriaID;
                            _contexto.SaveChanges();
                            resultado = 0; // éxito
                        }
                    }
                    else
                    {
                        resultado = 1; // la descripcion del producto ya existe
                    }
                }
            }
            else
            {
                resultado = 2; // la descripcion del producto está vacía
            }

        }
        else
        {
            resultado = 3; // la categoría no es válida
        }
        // retorna un resultado en JSON indicando el éxito o la razón del fallo
        return Json(resultado);
    }

    [Authorize]

    // Método para deshabilitar un producto en la base de datos según su ID.
    public JsonResult DeshabilitarProducto(int productoID)
    {
        bool resultado = true;

        // Verifica que el ID del producto no sea 0.
        if (productoID != 0)
        {
            // Busca el producto en la base de datos según su ID.
            var productoDeshabilitar = _contexto.Productos.Find(productoID);

            // Verifica que el producto existe en la base de datos.
            if (productoDeshabilitar != null)
            {
                // Actualiza el estado del producto a "Eliminado" / "Deshabilitado".
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

    // Método para habilitar un producto en la base de datos según su ID.
    [Authorize]
    public JsonResult HabilitarProducto(int productoID)
    {
        bool resultado = true;

        // Verifica que el ID del producto no sea 0.
        if (productoID != 0)
        {
            // Busca el producto en la base de datos según su ID.
            var productoHabilitar = _contexto.Productos.Find(productoID);

            // Verifica que el producto existe en la base de datos.
            if (productoHabilitar != null)
            {
                // Actualiza el estado del producto a "No Eliminado" / "Habilitado".
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
        if (productoID != 0)
        {
            // obtiene los servicios asociados al producto
            var serviciosEnProducto = (from a in _contexto.Servicios where a.ProductoID == productoID select a).ToList();
            if (serviciosEnProducto.Count == 0)
            {
                // si no hay servicios asociados, procede a eliminar el producto
                var productoEliminar = _contexto.Productos.Find(productoID);
                if (productoEliminar != null)
                {
                    _contexto.Productos.Remove(productoEliminar);
                    _contexto.SaveChanges();
                    return Json(new { success = true, message = "El producto se ha eliminado." });
                }
            }
            else
            {
                // devuelve un mensaje de error si hay servicios asociados al producto
                return Json(new { success = false, message = "La categoría no se puede eliminar porque tiene servicios asociados." });
            }
        }

        // devuelve un mensaje de error si el producto no existe o el id es 0
        return Json(new { success = false, message = "No se pudo eliminar el producto." });
    }


}
window.onload = BuscarProductos();

// Esta función utiliza AJAX para hacer una petición GET al servidor y obtener los productos.
function BuscarProductos() {
  $.ajax({
    url: '/Productos/BuscarProductos',
    method: 'GET',
    success: function (data) {
      // Limpia el cuerpo de la tabla donde se mostrarán los productos
      let tbodyProductos = $('#tbody-productos').empty();

      // Recorre el arreglo de productos obtenido y crea una fila en la tabla para cada producto.
      $.each(data, function (index, producto) {
        // Define los botones de acciones para cada producto
        let acciones = `
          <button class="btn btn-dark btn-sm editar" onClick="EditarProducto(${producto.productoID}, 'editar', this)">Editar</button>
          <button class="btn btn-dark btn-sm" onClick="EliminarProducto(${producto.productoID}, this)">X</button>
        `;
        // Define el botón de habilitar/deshabilitar para cada producto
        let botonDeshabilitar = '';
        if (producto.eliminado) {
          botonDeshabilitar = `<button class="btn btn-dark btn-sm habilitar" onclick="HabilitarProducto('${producto.productoID}', this)">Habilitar</button>`;
        } else {
          botonDeshabilitar = `<button class="btn btn-dark btn-sm deshabilitar" onclick="DeshabilitarProducto('${producto.productoID}', this)">Deshabilitar</button>`;
        }
        // Agrega la fila a la tabla
        tbodyProductos.append(`
          <tr class="text-light text-center" data-id="${producto.productoID}">
            <td>${producto.descripcion}</td>
            <td>${producto.categoriaDescripcion}</td>
            <td class="btn-group">${acciones} ${botonDeshabilitar}</td>
          </tr>
        `);
      });

      // Función de búsqueda
      $('#busqueda').on('keyup', function () {
        var value = $(this).val().toLowerCase();
        $('#tbody-productos tr').each(function () {
          var rowText = $(this).find('td:first-child').text().toLowerCase();
          if (rowText.indexOf(value) !== -1) {
            $(this).show();
          } else {
            $(this).hide();
          }
        });
      });
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log('Error al cargar productos:', textStatus, errorThrown); // Log any errors to the console
    }
  });
}
function GuardarProducto(button) {
  let descripcion = $("#Descripcion").val();
  let categoriaID = $("#CategoriaID").val();
  let productoID = $("#ProductoID").val();

  // Envía los datos del producto al controlador de C# mediante una petición POST de jQuery
  $.post('../../Productos/GuardarProducto', { descripcion, categoriaID, productoID })
    .done(function (resultado) {
      switch (resultado) {
        case 0:
          // Si se guardó correctamente, se oculta el modal de producto, y se actualiza la tabla de productos
          $("#ModalProducto").modal("hide");
          BuscarProductos();
          break;
        case 1:
          // Si el nombre del producto ya existe, se muestra un mensaje de error
          $("#DescripcionError").html(`<div></div> <strong>El nombre ya existe. Por favor ingrese un nombre único.</strong> </div>`);
          break;
        case 2:
          // Si el nombre del producto está vacío, se muestra un mensaje de error
          $("#DescripcionError").html(`<div></div> <strong>El nombre no puede estar vacío. Por favor ingrese un nombre válido.</strong> </div>`);
          break;
        case 3:
          // Si la categoría seleccionada no es válida, se muestra un mensaje de error
          $("#CategoriaError").html(`<div></div> <strong>La categoría no puede estar vacía. Por favor seleccione una categoría válida.</strong> </div>`);
          break;
        default:
          // Si ocurre un error inesperado, se muestra un mensaje de error genérico
          $("#DescripcionError").html(`<div>></div> <strong>Ocurrió un error inesperado. Por favor inténtelo de nuevo más tarde.</strong> </div>`);
          break;
      }
    })
    .fail(function () {
      // Si la petición falla, se muestra un mensaje de error para iniciar sesión
      $("#DescripcionError").html(`<div></div> <strong>Primero debe iniciar sesión.</strong> </div>`);
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}

// Esta función se encarga de editar o crear un producto dependiendo del ID del producto pasado como parámetro.
function EditarProducto(productoID) {
  // Obtener el modal y el título del modal
  var modal = $('#ModalProducto');
  var title = $('#exampleModalLabel');
  // Definir la variable modo en función del productoID (editar o crear)
  var modo = productoID ? 'editar' : 'crear';

  // Realizar una petición GET para obtener el producto a editar o crear
  $.get('../../Productos/BuscarProductos', { productoID: productoID })
    .done(function (productos) {
      // Si la petición fue exitosa y se obtuvo un solo producto
      if (productos.length == 1) {
        let producto = productos[0];
        // Llenar los campos del formulario con los datos del producto
        $("#Descripcion").val(producto.descripcion);
        $("#ProductoID").val(producto.productoID);
        $("#CategoriaID").val(producto.categoriaID);
        LlenarCategorias(); // Llamar a la función para llenar el dropdown de categorías

        // Cambiar el título del modal en función del modo
        if (modo === 'editar') {
          title.text('Editar Producto');
        } else {
          title.text('Agregar Producto');
        }

        // Mostrar el modal
        modal.modal('show');

      }
    })
    .fail(function () {
      alert('Error al cargar productos');
    });
}

// Función para llenar el dropdown de categorías con las categorías disponibles
function LlenarCategorias() {
  // Realizar una petición GET a la ruta "../../Productos/BuscarCategorias" para obtener las categorías
  $.get('../../Productos/BuscarCategorias', function (categorias) {
    // Vaciar el dropdown de categorías y agregar una opción por defecto
    let selectCategorias = $("#CategoriaID").empty();
    selectCategorias.append('<option value="0" selected>Seleccione una categoría</option>');

    // Recorrer todas las categorías y agregarlas al dropdown
    $.each(categorias, function (index, categoria) {
      // Crear una opción para la categoría actual
      let option = $('<option></option>').val(categoria.categoriaID).text(categoria.descripcion);

      // Si la categoría está eliminada, agregar texto indicando que está deshabilitada
      if (categoria.eliminado) {
        // option.attr("disabled", true); // deshabilitar opción
        option.text(categoria.descripcion + " (deshabilitado)"); // agregar texto indicando que está deshabilitado
      }

      // Agregar la opción creada al dropdown
      $('#CategoriaID').append(option);
    });
  })
    // En caso de que la petición falle, mostrar una alerta con el mensaje correspondiente
    .fail(function () {
      alert('Error al cargar categorías');
    });
}

// Función para limpiar el formulario de la categoría
function VaciarFormulario() {
  var modal = $('#ModalProducto');
  var title = $('#exampleModalLabel');
  title.text('Agregar Producto');

  // Limpia los campos del formulario y los mensajes de error
  $("#Descripcion").val('');
  $("#CategoriaID").val(0);
  $("#ProductoID").val(0);
  document.getElementById("DescripcionError").textContent = "";
  document.getElementById("CategoriaError").textContent = "";
}

// Función para deshabilitar un producto
function DeshabilitarProducto(productoID, button) {
  // Realiza una petición POST para deshabilitar el producto con el ID especificado
  $.post('../../Productos/DeshabilitarProducto', { productoID: parseInt(productoID) })
    .done(function (resultado) {
      // Si la operación se realiza correctamente, llama a la función BuscarProductos() para actualizar la tabla
      // Si no, cambia el texto del botón a "Error"
      resultado ? BuscarProductos() : $(button).text('Error');
    })
    .fail(function (xhr, status) {
      // Si hay un error en la petición, cambia el texto del botón a un enlace de inicio de sesión y muestra un mensaje de alerta
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}

// Función para habilitar un producto
function HabilitarProducto(productoID, button) {
  // Realiza una petición POST para habilitar el producto con el ID especificado
  $.post('../../Productos/HabilitarProducto', { productoID: productoID })
    .done(function (resultado) {
      // Si la operación se realiza correctamente, llama a la función BuscarProductos() para actualizar la tabla
      // Si no, cambia el texto del botón a "Error"
      resultado ? BuscarProductos() : $(button).text('Error');
    })
    .fail(function () {
      // Si hay un error en la petición, cambia el texto del botón a un enlace de inicio de sesión
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}

function EliminarProducto(productoID) {
  // Mostrar el modal de confirmación
  $('#confirm-delete-modal').modal('show');

  // Agregar un event listener al botón de eliminar dentro del modal
  $('#confirm-delete-btn').click(function () {
    // Enviar una solicitud post al servidor para eliminar el producto
    $.post('../../Productos/EliminarProducto', { productoID: parseInt(productoID) })
      .done(function (resultado) {
        console.log(resultado);
        if (resultado.success) {
          // Si la solicitud fue exitosa, mostrar un mensaje de éxito dentro del modal
          $('#confirm-delete-modal .modal-body').html('<p class="text-success">' + resultado.message + '</p>');

          // Esperar 850ms antes de cerrar el modal
          setTimeout(function () {
            // Ocultar el modal
            $('#confirm-delete-modal').modal('hide');

            // Desvanecer la fila antes de eliminarla de la tabla
            $('#tbody-productos tr').filter(`[data-id='${productoID}']`).fadeOut('slow', function () {
              $(this).remove();
            });

            // Esperar otro segundo antes de refrescar la lista de productos
            setTimeout(function () {
              BuscarProductos();
            }, 1000);
          }, 850);
        } else {
          // Si hubo un error, mostrar un mensaje de error dentro del modal
          $('#confirm-delete-modal .modal-body').html('<p class="text-danger">' + resultado.message + '</p>');
        }
      })
      .fail(function (xhr, status) {
        // Si falla la solicitud post, mostrar un mensaje de que el usuario debe iniciar sesión
        $('#confirm-delete-modal .modal-body').html('<p>Primero debe iniciar sesión.</p>');
        $('#confirm-delete-btn').html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
      });
  });

  // Agregar un event listener al evento de ocultar el modal
  $('#confirm-delete-modal').on('hidden.bs.modal', function () {
    // Restablecer el contenido del modal a su estado predeterminado
    $('#confirm-delete-modal .modal-body').html('<p>¿Está seguro que desea eliminar este producto?</p>');
  });
}


// Este código agrega un evento al modal de producto para que cuando se muestre, 
// se seleccione automáticamente el campo Descripción y se le dé el enfoque,
// para que el usuario pueda comenzar a escribir inmediatamente al abrir el modal.

$('#ModalProducto').on('shown.bs.modal', function () {
  $('#Descripcion').focus();
});

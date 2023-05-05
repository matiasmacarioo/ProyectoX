window.onload = BuscarServicios();

function BuscarServicios() {
  $.ajax({
    url: '/Servicios/BuscarServicios',
    method: 'GET',
    success: function (data) {
      // Cuando se recibe la respuesta exitosa desde el servidor, se vacía el cuerpo de la tabla donde se muestran los servicios
      let tbodyServicios = $('#tbody-servicios').empty();
      // Se recorre el arreglo de servicios que se recibió desde el servidor
      $.each(data, function (index, servicio) {
        // Botones de acción que se mostrarán en cada fila de la tabla
        let acciones = `
          <button class="btn btn-dark btn-sm editar" onClick="EditarServicio(${servicio.servicioID}, 'editar', this)">Editar</button>
          <button class="btn btn-dark btn-sm" onClick="EliminarServicio(${servicio.servicioID}, this)">X</button>
        `;
        // Botón de habilitar o deshabilitar servicio según el estado del servicio en la base de datos
        let botonDeshabilitar = '';
        if (servicio.eliminado) {
          botonDeshabilitar = `<button class="btn btn-dark btn-sm habilitar" onclick="HabilitarServicio('${servicio.servicioID}', this)">Habilitar</button>`;
        } else {
          botonDeshabilitar = `<button class="btn btn-dark btn-sm deshabilitar" onclick="DeshabilitarServicio('${servicio.servicioID}', this)">Deshabilitar</button>`;
        }
        // Se agrega una nueva fila a la tabla por cada servicio encontrado
        tbodyServicios.append(`
          <tr data-id="${servicio.servicioID}" class="text-center">
            <td class="text-light">${servicio.descripcion}</td>
            <td class="text-light">${servicio.productoDescripcion}</td>
            <td class="text-light">${servicio.direccion}</td>
            <td class="text-light">${servicio.telefono}</td>
            <td class="text-light text-center btn-group">${acciones} ${botonDeshabilitar}</td>
          </tr>
        `);
      });
      // Funcionalidad de búsqueda, para filtrar las filas que contienen el texto ingresado.
      $('#busqueda').on('keyup', function () {
        var value = $(this).val().toLowerCase();
        $('#tbody-servicios tr').each(function () {
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
      // Si la petición AJAX falla, se muestra un mensaje de error en la consola
      console.log('Error al cargar servicios:', textStatus, errorThrown);
    }
  });
}

function GuardarServicio(button) {
  // Obtiene los valores de los inputs
  let servicioID = $("#ServicioID").val();
  let productoID = $("#ProductoID").val();
  let descripcion = $("#Descripcion").val();
  let direccion = $("#Direccion").val();
  let telefono = $("#Telefono").val();

  // Envía una petición POST al servidor con los datos del servicio
  $.post('../../Servicios/GuardarServicio', { servicioID, productoID, descripcion, direccion, telefono })
    .done(function (resultado) {
      // Evalúa el resultado de la petición
      switch (resultado) {
        case 0:
          // Si el resultado es 0, significa que el servicio se guardó exitosamente
          // Se oculta el modal y se llama a la función BuscarServicios() para actualizar la tabla
          $("#ModalServicio").modal("hide");
          BuscarServicios();
          break;
        case 1:
          // Si el resultado es 1, significa que ya existe un servicio con el mismo nombre
          // Se muestra un mensaje de error en el input de descripción
          $("#DescripcionError").html(`<div><strong>El nombre ya existe. Por favor ingrese un nombre único.</strong> </div>`);
          break;
        case 2:
          // Si el resultado es 2, significa que el nombre del servicio está vacío
          // Se muestra un mensaje de error en el input de descripción
          $("#DescripcionError").html(`<div><strong>El nombre no puede estar vacío. Por favor ingrese un nombre válido.</strong> </div>`);
          break;
        case 3:
          // Si el resultado es 3, significa que no se seleccionó un producto válido
          // Se muestra un mensaje de error en el input de producto
          $("#ProductoError").html(`<div><strong>El producto no puede estar vacío. Por favor seleccione un producto válido.</strong> </div>`);
          break;
        case 4:
          // Si el resultado es 4, significa que la dirección está vacía
          // Se muestra un mensaje de error en el input de dirección
          $("#DireccionError").html(`<div><strong>La dirección no puede estar vacía. Por favor ingrese una dirección válida.</strong> </div>`);
          break;
        case 5:
          // Si el resultado es 5, significa que el teléfono está vacío
          // Se muestra un mensaje de error en el input de teléfono
          $("#TelefonoError").html(`<div><strong>El teléfono no puede estar vacío. Por favor ingrese un teléfono válido.</strong> </div>`);
          break;
        default:
          // Si el resultado es cualquier otro valor, significa que ocurrió un error inesperado
          // Se muestra un mensaje de error genérico en el input de descripción
          $("#DescripcionError").html(`<div><strong>Ocurrió un error inesperado. Por favor inténtelo de nuevo más tarde.</strong> </div>`);
          break;
      }
    })
    .fail(function () {
      // Si la petición falla, significa que el usuario no está autenticado
      // Se muestra un mensaje de error en el input de teléfono y se cambia el botón Guardar por un enlace de inicio de sesión
      $("#TelefonoError").html(`<div"><strong>Primero debe iniciar sesión.</strong> </div>`);
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}
// Función para editar un servicio
function EditarServicio(servicioID) {
  // Obtener el modal del servicio y el título
  var modal = $('#ModalServicio');
  var title = $('#exampleModalLabel');
  // Definir la variable "modo" según si se está editando o creando un servicio
  var modo = servicioID ? 'editar' : 'crear';

  // Hacer una petición GET para obtener los detalles del servicio seleccionado
  $.get('../../Servicios/BuscarServicios', { servicioID: servicioID })
    .done(function (servicios) {
      // Si la petición es exitosa y se obtiene un servicio
      if (servicios.length == 1) {
        // Obtener los detalles del servicio y llenar los campos del modal
        let servicio = servicios[0];
        $("#Descripcion").val(servicio.descripcion);
        $("#Direccion").val(servicio.direccion);
        $("#Telefono").val(servicio.telefono);
        $("#ServicioID").val(servicio.servicioID);
        $("#ProductoID").val(servicio.productoID);
        // Limpiar los mensajes de error
        document.getElementById("ProductoError").textContent = "";
        document.getElementById("DescripcionError").textContent = "";
        document.getElementById("DireccionError").textContent = "";
        document.getElementById("TelefonoError").textContent = "";
        // Llamar a la función para llenar el dropdown de productos
        LlenarProductos();

        // Cambiar el título del modal dependiendo de la variable modo
        if (modo === 'editar') {
          title.text('Editar Servicio');
        } else {
          title.text('Agregar Servicio');
        }

        // Mostrar el modal
        modal.modal('show');

      }
    })
    .fail(function () {
      // Si falla la petición, mostrar un mensaje de error
      alert('Error al cargar servicios');
    });
}

// Obtiene los productos existentes y llena el dropdown del modal con ellos.
function LlenarProductos() {
  $.get('../../Servicios/BuscarProductos', function (productos) {
    // Luego se vacía el dropdown
    let selectProductos = $("#ProductoID").empty();
    // se agrega la opción 'Seleccione un producto' como la opción por defecto. 
    selectProductos.append('<option value="0" selected>Seleccione un producto</option>');
    //Después, por cada producto se crea un option en el dropdown con el valor del producto y su descripción.
    $.each(productos, function (index, producto) {
      let option = $('<option></option>').val(producto.productoID).text(producto.descripcion);
      // Si el producto está deshabilitado, se agrega la frase '(deshabilitado)'.
      if (producto.eliminado) {
        // option.attr("disabled", true); // opcion para deshabilitar la seleccion si es necesario.
        option.text(producto.descripcion + " (deshabilitado)"); // agregar texto indicando que está deshabilitado
      }
      $('#ProductoID').append(option);
    });
  }).fail(function () {
    alert('Error al cargar productos');
  });
}

// La función VaciarFormulario se encarga de vaciar los campos del formulario de la modal de agregar/editar servicio
function VaciarFormulario() {
  var modal = $('#ModalServicio');
  var title = $('#exampleModalLabel');
  // Cambia el título del modal a 'Agregar Servicio' que es el valor por defecto.
  title.text('Agregar Servicio');

  $("#ServicioID").val(0);
  $("#ProductoID").val(0);
  $("#Descripcion").val('');
  $("#Direccion").val('');
  $("#Telefono").val('');
  // y elimina cualquier mensaje de error que pudiera estar mostrándose.
  document.getElementById("ProductoError").textContent = "";
  document.getElementById("DescripcionError").textContent = "";
  document.getElementById("DireccionError").textContent = "";
  document.getElementById("TelefonoError").textContent = "";
}

// La función DeshabilitarServicio se encarga de hacer una petición POST a la ruta '../../Servicios/DeshabilitarServicio' para deshabilitar un servicio.
// Recibe como parámetros el ID del servicio a deshabilitar y el botón que se presionó para modificarlo segun si falla o necesita iniciar sesión.
function DeshabilitarServicio(servicioID, button) {
  $.post('../../Servicios/DeshabilitarServicio', { servicioID: parseInt(servicioID) })
    .done(function (resultado) {
      // Si la petición es exitosa, se llama a la función BuscarServicios() para actualizar la lista de servicios.
      // Si no es exitosa, se cambia el texto del botón a 'Error'.
      resultado ? BuscarServicios() : $(button).text('Error');
    })
    .fail(function (xhr, status) {
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}

// La función HabilitarServicio se encarga de hacer una petición POST a la ruta '../../Servicios/HabilitarServicio' para habilitar un servicio.
// Recibe como parámetros el ID del servicio a habilitar y el botón que se presionó para modificarlo segun si falla o necesita iniciar sesión.
function HabilitarServicio(servicioID, button) {
  $.post('../../Servicios/HabilitarServicio', { servicioID: servicioID })
    // Si la petición es exitosa, se llama a la función BuscarServicios() para actualizar la lista de servicios.
    // Si no es exitosa, se cambia el texto del botón a 'Error'.
    .done(function (resultado) {
      resultado ? BuscarServicios() : $(button).text('Error');
    })
    .fail(function () {
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}

// La función EliminarServicio muestra un modal de confirmación para eliminar un servicio.
// Recibe como parámetro el ID del servicio a eliminar.
function EliminarServicio(servicioID) {
  // Mostrar el modal de confirmación
  $('#confirm-delete-modal').modal('show');

  // Agregar un event listener al botón de eliminar en el modal
  $('#confirm-delete-btn').click(function () {
    // Enviar una petición POST al servidor para eliminar el servicio
    $.post('../../Servicios/EliminarServicio', { servicioID: parseInt(servicioID) })
      .done(function (resultado) {
        if (resultado) {
          // Si la petición fue exitosa, actualizar el contenido del modal y esperar 1 segundo antes de cerrarlo
          $('#confirm-delete-modal .modal-body').html('<p class="text-success">El servicio se ha eliminado.</p>');
          setTimeout(function () {
            // Ocultar el modal
            $('#confirm-delete-modal').modal('hide');

            // Desvanecer la fila correspondiente en la tabla antes de eliminarla
            $('#tbody-servicios tr').filter(`[data-id='${servicioID}']`).fadeOut('slow', function () {
              $(this).remove();
            });

            // Esperar otro segundo antes de actualizar la lista de servicios
            setTimeout(function () {
              BuscarServicios();
            }, 1000);
          }, 850);
        } else {
          // Si la petición falló, actualizar el contenido del modal con un mensaje de error
          $('#confirm-delete-modal .modal-body').html('<p class="text-danger">No se pudo eliminar el servicio.</p>');
        }
      })
      .fail(function (xhr, status) {
        // Si la petición falló debido a una falta de autenticación, actualizar el contenido del modal y el botón con un enlace de inicio de sesión
        $('#confirm-delete-modal .modal-body').html('<p>Primero debe iniciar sesión.</p>');
        $('#confirm-delete-btn').html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
      });
  });

  // Agregar un event listener al evento de ocultamiento del modal
  $('#confirm-delete-modal').on('hidden.bs.modal', function () {
    // Restablecer el contenido del modal a su valor por defecto
    $('#confirm-delete-modal .modal-body').html('<p>¿Está seguro que desea eliminar este servicio?</p>');
  });

}

// Función que se ejecuta cuando se muestra el modal "ModalServicio"
$('#ModalServicio').on('shown.bs.modal', function () {
  // Pone el cursor en el campo "Descripcion" del formulario del modal.
  $('#Descripcion').focus();
});

// Obtiene el elemento input "Telefono" del formulario
var telefonoInput = document.getElementById("Telefono");
// Agrega un listener al evento "input" del campo "Telefono"
telefonoInput.addEventListener("input", function (event) {
  var telefono = event.target.value;
  var telefonoValido = /^\d{10}$/; // Expresión regular para números de teléfono de 10 dígitos

  // Verifica si el número de teléfono ingresado es válido o no y muestra una alerta
  if (!telefonoValido.test(telefono)) {
    document.getElementById("TelefonoError").textContent = "Introduce un número de teléfono válido (10 dígitos).";
  } else {
    document.getElementById("TelefonoError").textContent = "";
  }
});
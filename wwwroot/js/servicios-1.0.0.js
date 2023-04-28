window.onload = BuscarServicios();

function BuscarServicios() {
  $.ajax({
    url: '/Servicios/BuscarServicios',
    method: 'GET',
    success: function (data) {
      // console.log(data); // Log the retrieved products to the console
      let tbodyServicios = $('#tbody-servicios').empty();
      $.each(data, function (index, servicio) {
        let acciones = `
          <button class="btn btn-dark btn-sm editar" onClick="EditarServicio(${servicio.servicioID}, 'editar', this)">Editar</button>
          <button class="btn btn-dark btn-sm" onClick="EliminarServicio(${servicio.servicioID}, this)">X</button>
        `;
        let botonDeshabilitar = '';
        if (servicio.eliminado) {
          botonDeshabilitar = `<button class="btn btn-dark btn-sm habilitar" onclick="HabilitarServicio('${servicio.servicioID}', this)">Habilitar</button>`;
        } else {
          botonDeshabilitar = `<button class="btn btn-dark btn-sm deshabilitar" onclick="DeshabilitarServicio('${servicio.servicioID}', this)">Deshabilitar</button>`;
        }
        tbodyServicios.append(`
          <tr class="text-center">
            <td class="text-light">${servicio.descripcion}</td>
            <td class="text-light">${servicio.productoDescripcion}</td>
            <td class="text-light">${servicio.direccion}</td>
            <td class="text-light">${servicio.telefono}</td>
            <td class="text-light text-center btn-group">${acciones} ${botonDeshabilitar}</td>
          </tr>
        `);
      });
      // función de busqueda
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
      console.log('Error al cargar servicios:', textStatus, errorThrown); // Log any errors to the console
    }
  });
}

function GuardarServicio(button) {
  let servicioID = $("#ServicioID").val();
  let productoID = $("#ProductoID").val();
  let descripcion = $("#Descripcion").val();
  let direccion = $("#Direccion").val();
  let telefono = $("#Telefono").val();

  $.post('../../Servicios/GuardarServicio', { servicioID, productoID, descripcion, direccion, telefono })
    .done(function (resultado) {
      switch (resultado) {
        case 0:
          $("#ModalServicio").modal("hide");
          BuscarServicios();
          break;
        case 1:
          $("#DescripcionError").html(`<div><strong>El nombre ya existe. Por favor ingrese un nombre único.</strong> </div>`);
          break;
        case 2:
          $("#DescripcionError").html(`<div><strong>El nombre no puede estar vacío. Por favor ingrese un nombre válido.</strong> </div>`);
          break;
        case 3:
          $("#ProductoError").html(`<div><strong>El producto no puede estar vacío. Por favor seleccione un producto válido.</strong> </div>`);
          break;
        case 4:
          $("#DireccionError").html(`<div><strong>La direccion no puede estar vacía. Por favor ingrese una dirección válida.</strong> </div>`);
          break;
        case 5:
          $("#TelefonoError").html(`<div><strong>El telefono no puede estar vacío. Por favor ingrese un telefono válido.</strong> </div>`);
          break;
        default:
          $("#DescripcionError").html(`<div><strong>Ocurrió un error inesperado. Por favor inténtelo de nuevo más tarde.</strong> </div>`);
          break;
      }
    })
    .fail(function () {
      $("#DescripcionError").html(`<div"><strong>Primero debe iniciar sesión.</strong> </div>`);
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}

function EditarServicio(servicioID) {
  var modal = $('#ModalServicio');
  var title = $('#exampleModalLabel');
  var modo = servicioID ? 'editar' : 'crear'; // Define the modo variable

  $.get('../../Servicios/BuscarServicios', { servicioID: servicioID })
    .done(function (servicios) {
      if (servicios.length == 1) {
        let servicio = servicios[0];
        $("#Descripcion").val(servicio.descripcion);
        $("#Direccion").val(servicio.direccion);
        $("#Telefono").val(servicio.telefono);
        $("#ServicioID").val(servicio.servicioID);
        $("#ProductoID").val(servicio.productoID);
        document.getElementById("ProductoError").textContent = "";
        document.getElementById("DescripcionError").textContent = "";
        document.getElementById("DireccionError").textContent = "";
        document.getElementById("TelefonoError").textContent = "";
        LlenarProductos(); // call the function to fill the categories dropdown

        // Change modal title based on the button
        if (modo === 'editar') {
          title.text('Editar Servicio');
        } else {
          title.text('Agregar Servicio');
        }

        // Show modal
        modal.modal('show');

      }
    })
    .fail(function () {
      alert('Error al cargar servicios');
    });
}

function LlenarProductos() {
  $.get('../../Servicios/BuscarProductos', function (productos) {
    let selectProductos = $("#ProductoID").empty();
    selectProductos.append('<option value="0" selected>Seleccione un producto</option>');
    $.each(productos, function (index, producto) {
      $('#ProductoID').append($('<option></option>').val(producto.productoID).text(producto.descripcion));
    });
  }).fail(function () {
    alert('Error al cargar productos');
  });
}

function VaciarFormulario() {
  var modal = $('#ModalServicio');
  var title = $('#exampleModalLabel');
  title.text('Agregar Servicio');

  $("#ServicioID").val(0);
  $("#ProductoID").val(0);
  $("#Descripcion").val('');
  $("#Direccion").val('');
  $("#Telefono").val('');
  document.getElementById("ProductoError").textContent = "";
  document.getElementById("DescripcionError").textContent = "";
  document.getElementById("DireccionError").textContent = "";
  document.getElementById("TelefonoError").textContent = "";
}

function DeshabilitarServicio(servicioID, button) {
  $.post('../../Servicios/DeshabilitarServicio', { servicioID: parseInt(servicioID) })
    .done(function (resultado) {
      // resultado ? BuscarServicios() : alert("No se pudo deshabilitar el servicio.");
      resultado ? BuscarServicios() : $(button).text('Error');
    })
    .fail(function (xhr, status) {
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}

function HabilitarServicio(servicioID, button) {
  $.post('../../Servicios/HabilitarServicio', { servicioID: servicioID })
    .done(function (resultado) {
      resultado ? BuscarServicios() : $(button).text('Error');
    })
    .fail(function () {
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}

function EliminarServicio(servicioID) {
  // Show confirmation modal
  $('#confirm-delete-modal').modal('show');

  // Add event listener to delete button in modal
  $('#confirm-delete-btn').click(function () {
    // Send post request to server to delete the category
    $.post('../../Servicios/EliminarServicio', { servicioID: parseInt(servicioID) })
      .done(function (resultado) {
        if (resultado) {
          $('#confirm-delete-modal .modal-body').html('<p class="text-success">El servicio se ha eliminado.</p>');
          setTimeout(function () {
            BuscarServicios();
            $('#confirm-delete-modal').modal('hide');
          }, 650);
        } else {
          $('#confirm-delete-modal .modal-body').html('<p class="text-danger">No se pudo eliminar el servicio.</p>');
        }
      })
      .fail(function (xhr, status) {
        $('#confirm-delete-modal .modal-body').html('<p>Primero debe iniciar sesión.</p>');
        $('#confirm-delete-btn').html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
      });
  });

  // Add event listener to modal hidden event
  $('#confirm-delete-modal').on('hidden.bs.modal', function () {
    // Reset modal content to default
    $('#confirm-delete-modal .modal-body').html('<p>¿Está seguro que desea eliminar este servicio?</p>');
  });

}


$('#ModalServicio').on('shown.bs.modal', function () {
  $('#Descripcion').focus();
});


var telefonoInput = document.getElementById("Telefono");
telefonoInput.addEventListener("input", function (event) {
  var telefono = event.target.value;
  var telefonoValido = /^\d{10}$/; // Expresión regular para números de teléfono de 10 dígitos

  if (!telefonoValido.test(telefono)) {
    document.getElementById("TelefonoError").textContent = "Introduce un número de teléfono válido (10 dígitos).";
    // telefonoInput.setCustomValidity("Introduce un número de teléfono válido (10 dígitos).");
  } else {
    document.getElementById("TelefonoError").textContent = "";
    // telefonoInput.setCustomValidity("");
  }
});

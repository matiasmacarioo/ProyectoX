window.onload = BuscarCategorias();

// esta función guarda o edita una categoría en la base de datos.
// recoge la información del formulario del modal y realiza una llamada AJAX al servidor para guardar esta información.
// si la categoría se guarda correctamente, oculta el modal y actualiza la lista de categorías.
// si una categoría con la misma descripción ya existe, muestra una alerta de error.
// Si se está editando una categoría existente, la función actualiza la información de la categoría existente en lugar de crear una nueva.
function GuardarCategoria(button) {
  let descripcion = $("#Descripcion").val();
  let categoriaID = $("#CategoriaID").val();

  $.post('../../Categorias/GuardarCategoria', { categoriaID, descripcion })
    .done(function (resultado) {
      switch (resultado) {
        case 0:
          $("#ModalCategoria").modal("hide");
          BuscarCategorias();
          break;
        case 1:
          $("#DescripcionError").text("El nombre ya existe. Por favor ingrese un nombre único.");
          break;
        case 2:
          $("#DescripcionError").text("El nombre no puede estar vacío. Por favor ingrese un nombre válido.");
          break;
        default:
          $("#DescripcionError").text("Ocurrió un error inesperado. Por favor inténtelo de nuevo más tarde.");
          break;
      }
    })
    .fail(function () {
      $("#DescripcionError").text("Primero debe iniciar sesión.");
      $('#guardar-cambios-btn').html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}

// esta función realiza una llamada AJAX para obtener una lista de categorías desde el servidor y mostrarla en la página.
function BuscarCategorias() {
  // console.log('Inside BuscarCategorias function');
  $.get('../../Categorias/BuscarCategorias', function (categorias) {
    // console.log('categorias:', categorias);
    let tbodyCategorias = $("#tbody-categorias").empty();
    $.each(categorias, function (index, categoria) {
      // console.log('Procesando categoria:', categoria);
      let botonDeshabilitar = '';
      if (categoria.eliminado) {
        botonDeshabilitar = `<button class="btn btn-dark btn-sm habilitar" onclick="HabilitarCategoria('${categoria.categoriaID}', this)">Habilitar</button>`;
      } else {
        botonDeshabilitar = `<button class="btn btn-dark btn-sm deshabilitar" onclick="DeshabilitarCategoria('${categoria.categoriaID}', this)">Deshabilitar</button>`;
      }
      tbodyCategorias.append(`
  <tr class="text-center" data-id="${categoria.categoriaID}">
    <td class="text-light">${categoria.descripcion}</td>
    <td class="text-light text-center btn-group">
      <button class="btn btn-dark btn-sm editar" onClick="BuscarCategoria(${categoria.categoriaID}, 'editar')">Editar</button>
      <button class="btn btn-dark btn-sm" onClick="EliminarCategoria(${categoria.categoriaID})">X</button>
      ${botonDeshabilitar}
    </td>
  </tr>
`);

    });

    // función de busqueda
    $('#busqueda').on('keyup', function () {
      var value = $(this).val().toLowerCase();
      $('#tbody-categorias tr').each(function () {
        var rowText = $(this).find('td:first-child').text().toLowerCase();
        if (rowText.indexOf(value) !== -1) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    });
  }).fail(function () {
    alert('Error al cargar categorias');
  });
}

// esta función recibe un ID de categoría como argumento y realiza una llamada AJAX para obtener la información de esa categoría desde el servidor y mostrarla en un formulario en la página.
function BuscarCategoria(categoriaID) {
  var modal = $('#ModalCategoria');
  var title = $('#exampleModalLabel');
  var modo = categoriaID ? 'editar' : 'crear'; // Define the modo variable

  // Llamada AJAX para obtener la categoría con el ID recibido como argumento
  $.get('../../Categorias/BuscarCategorias', { categoriaID: categoriaID })
    .done(function (categorias) {
      if (categorias.length == 1) {
        let categoria = categorias[0];
        // Llenar los campos del formulario con la información de la categoría obtenida
        $("#Descripcion").val(categoria.descripcion);
        $("#CategoriaID").val(categoria.categoriaID);

        // Cambiar el título del modal según el modo (editar o crear)
        if (modo === 'editar') {
          title.text('Editar Categoría');
        } else {
          title.text('Agregar Categoría');
        }

        // Mostrar el modal
        modal.modal('show');
      }
    })
    .fail(function () {
      alert('Error al cargar categorias');
    });
}
// Esta función recibe un ID de categoría como argumento y realiza una llamada AJAX para deshabilitar esa categoría en la base de datos.
function DeshabilitarCategoria(categoriaID, button) {
  $.post('../../Categorias/DeshabilitarCategoria', { categoriaID: parseInt(categoriaID) })
    .done(function (resultado) {
      // Si se realiza con éxito, se llama a la función BuscarCategorias() para actualizar la lista de categorías.
      resultado ? BuscarCategorias() : $(button).text('Error');
    })
    .fail(function (xhr, status) {
      // Si hay un error, se muestra un mensaje y se redirige a la página de inicio de sesión.
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}

// Esta función recibe un ID de categoría como argumento y realiza una llamada AJAX para habilitar esa categoría en la base de datos.
function HabilitarCategoria(categoriaID, button) {
  $.post('../../Categorias/HabilitarCategoria', { categoriaID: categoriaID })
    .done(function (resultado) {
      // Si se realiza con éxito, se llama a la función BuscarCategorias() para actualizar la lista de categorías.
      resultado ? BuscarCategorias() : $(button).text('Error');
    })
    .fail(function () {
      // Si hay un error, se muestra un mensaje y se redirige a la página de inicio de sesión.
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
    });
}

// Esta función muestra el modal para eliminar una categoría y envía una solicitud POST al servidor para eliminarla si el usuario lo confirma.
function EliminarCategoria(categoriaID) {
  // Mostrar modal de confirmación
  $('#confirm-delete-modal').modal('show');

  // Agregar un event listener al botón de eliminar en el modal
  $('#confirm-delete-btn').click(function () {
    // Enviar solicitud POST al servidor para eliminar la categoría
    $.post('../../Categorias/EliminarCategoria', { categoriaID: parseInt(categoriaID) })
      .done(function (resultado) {
        if (resultado.success) {
          // Mostrar mensaje de éxito dentro del modal
          $('#confirm-delete-modal .modal-body').html('<p class="text-success">La categoría se ha eliminado correctamente.</p>');

          // Esperar 850ms antes de cerrar el modal para dar tiempo a leer el mensaje
          setTimeout(function () {
            // Ocultar el modal
            $('#confirm-delete-modal').modal('hide');

            // Transicion de desvanecer antes de eliminar la fila de la tabla
            $('#tbody-categorias tr').filter(`[data-id='${categoriaID}']`).fadeOut('slow', function () {
              $(this).remove();
            });

            // Esperar otro segundo antes de actualizar la lista de categorías para que se vea al desvanecer la fila
            setTimeout(function () {
              BuscarCategorias();
            }, 1000);
          }, 850);
        } else {
          // Mostrar mensaje de error dentro del modal
          $('#confirm-delete-modal .modal-body').html('<p class="text-danger">' + resultado.message + '</p>');
        }
      })
      .fail(function (xhr, status) {
        // Mostrar mensaje de inicio de sesión dentro del modal
        $('#confirm-delete-modal .modal-body').html('<p>Primero debe iniciar sesión.</p>');
        $('#confirm-delete-btn').html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
      });
  });

  // Agregar event listener al evento de ocultar el modal
  $('#confirm-delete-modal').on('hidden.bs.modal', function () {
    // Restablecer el contenido del modal a su valor predeterminado para la proxima vez que se quiera eliminar una categoria sin reiniciar la pagina ya que usamos ajax.
    $('#confirm-delete-modal .modal-body').html('<p>¿Está seguro que desea eliminar esta categoría?</p>');
  });
}
// Esta función limpia los campos del modal de categorías.
function VaciarFormulario() {
  var title = $('#exampleModalLabel');
  title.text('Agregar Categoría'); // Establece el título del modal como "Agregar Categoría".

  // Limpia los campos del formulario dentro del modal.
  $("#Descripcion").val(''); // Limpia el campo "Descripción".
  $("#CategoriaID").val(0); // Establece el valor del campo "CategoriaID" en 0.
  document.getElementById("DescripcionError").textContent = ""; // Limpia cualquier mensaje de error que pueda haber en el campo "Descripción".
}

// Agrega un listener para cuando el modal de categorías se muestre en la pantalla.
$('#ModalCategoria').on('shown.bs.modal', function () {
  $('#Descripcion').focus(); // Pone el foco en el campo "Descripción" para que el usuario pueda empezar a escribir inmediatamente.
});
window.onload = BuscarCategorias();

// esta función guarda o edita una categoría en la base de datos.
// recoge la información del formulario del modal y realiza una llamada AJAX al servidor para guardar esta información.
// si la categoría se guarda correctamente, oculta el modal y actualiza la lista de categorías.
// si una categoría con la misma descripción ya existe, muestra una alerta de error.
// Si se está editando una categoría existente, la función actualiza la información de la categoría existente en lugar de crear una nueva.
function GuardarCategoria() {
  let descripcion = $("#Descripcion").val();
  let categoriaID = $("#CategoriaID").val();

  $.post('../../Categorias/GuardarCategoria', { categoriaID, descripcion })
    .done(function (resultado) {
      switch(resultado) {
        case 0:
          $("#ModalCategoria").modal("hide");
          BuscarCategorias();
          break;
        case 1:
          alert("La descripción ya existe. Por favor ingrese una descripción única.");
          break;
        case 2:
          alert("La descripción no puede estar vacía. Por favor ingrese una descripción válida.");
          break;
        default:
          alert("Ocurrió un error inesperado. Por favor inténtelo de nuevo más tarde.");
          break;
      }
    })
    .fail(function () {
      alert('Disculpe, existió un problema');
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
        botonDeshabilitar = `<button class="btn btn-dark btn-sm habilitar" onclick="HabilitarCategoria('${categoria.categoriaID}')">Habilitar</button>`;
      } else {
        botonDeshabilitar = `<button class="btn btn-dark btn-sm deshabilitar" onclick="DeshabilitarCategoria('${categoria.categoriaID}')">Deshabilitar</button>`;
      }
      tbodyCategorias.append(`
          <tr>
            <td class="text-light">${categoria.descripcion}</td>
            <td class="text-light text-center btn-group">
              <button class="btn btn-dark btn-sm editar" onClick="BuscarCategoria(${categoria.categoriaID})">Editar</button>
              <button class="btn btn-dark btn-sm" disabled></button>
              ${botonDeshabilitar}
            </td>
          </tr>
        `);
    });

// función de busqueda
$('#busqueda').on('keyup', function () {
  var value = $(this).val().toLowerCase();
  $('#tbody-categorias tr').each(function() {
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
  $.get('../../Categorias/BuscarCategorias', { categoriaID: categoriaID })
    .done(function (categorias) {
      if (categorias.length == 1) {
        let categoria = categorias[0];
        $("#Descripcion").val(categoria.descripcion);
        $("#CategoriaID").val(categoria.categoriaID);
        $("#ModalCategoria").modal("show");
      }
    })
    .fail(function () {
      alert('Error al cargar categorias');
    });
}

// esta función recibe un ID de categoría como argumento y realiza una llamada AJAX para deshabilitar esa categoría en la base de datos.
function DeshabilitarCategoria(categoriaID) {
  $.post('../../Categorias/DeshabilitarCategoria', { categoriaID: parseInt(categoriaID) })
    .done(function (resultado) {
      resultado ? BuscarCategorias() : alert("Error: la categoría no ha sido eliminada");
    })
    .fail(function (xhr, status) {
      alert('Disculpe, existió un problema');
    });
}

// esta función recibe un ID de categoría como argumento y realiza una llamada AJAX para habilitar esa categoría en la base de datos.
function HabilitarCategoria(categoriaID) {
  $.post('../../Categorias/HabilitarCategoria', { categoriaID: categoriaID })
    .done(function (resultado) {
      resultado ? BuscarCategorias() : alert('No se pudo habilitar la categoria.');
    })
    .fail(function () {
      alert('Error al habilitar la categoria.');
    });
}

// esta función limpia los campos del modal.
function VaciarFormulario() {
  $("#Descripcion").val('');
  $("#CategoriaID").val(0);
}
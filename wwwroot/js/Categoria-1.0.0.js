window.onload = BuscarCategorias();

function VaciarFormulario() {
  $("#Descripcion").val('');
  $("#CategoriaID").val(0);
}

function BuscarCategorias() {
  $.get('../../Categorias/BuscarCategorias', function(categorias) {
    let tbodyCategorias = $("#tbody-categorias").empty();
    $.each(categorias, function (index, categoria) {
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
  }).fail(function() {
    alert('Error al cargar categorias');
  });
}

function BuscarCategoria(categoriaID) {
  $.get('../../Categorias/BuscarCategorias', { categoriaID: categoriaID })
    .done(function(categorias) {
      if (categorias.length == 1) {
        let categoria = categorias[0];
        $("#Descripcion").val(categoria.descripcion);
        $("#CategoriaID").val(categoria.categoriaID);
        $("#ModalCategoria").modal("show");
      }
    })
    .fail(function() {
      alert('Error al cargar categorias');
    });
}

function BuscarCategoria(categoriaID) {
  $.get('../../Categorias/BuscarCategorias', { categoriaID: categoriaID })
    .done(function(categoria) {
      if (categoria != null) {
        $("#Descripcion").val(categoria.descripcion);
        $("#CategoriaID").val(categoria.categoriaID);
        $("#ModalCategoria").modal("show");
      }
    })
    .fail(function() {
      alert('Error al cargar categoría');
    });
}

function DeshabilitarCategoria(categoriaID) {
  $.post('../../Categorias/DeshabilitarCategoria', { categoriaID: parseInt(categoriaID) })
    .done(function(resultado) {
      resultado ? BuscarCategorias() : alert("Error: la categoría no ha sido eliminada");
    })
    .fail(function(xhr, status) {
      alert('Disculpe, existió un problema');
    });
}

function HabilitarCategoria(categoriaID) {
  $.post('../../Categorias/HabilitarCategoria', { categoriaID: categoriaID })
    .done(function(resultado) {
      resultado ? BuscarCategorias() : alert('No se pudo habilitar la categoria.');
    })
    .fail(function() {
      alert('Error al habilitar la categoria.');
    });
}

function GuardarCategoria() {
  let descripcion = $("#Descripcion").val();
  let categoriaID = $("#CategoriaID").val();

  $.post('../../Categorias/GuardarCategoria', { categoriaID, descripcion })
    .done(function(resultado) {
      resultado ? ( $("#ModalCategoria").modal("hide"), BuscarCategorias() )
                : alert("Existe una Categoría con la misma descripcións.");
    })
    .fail(function() {
      alert('Disculpe, existió un problema');
    });
}
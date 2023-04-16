window.onload = BuscarCategorias();

function BuscarCategorias() {
  $("#tbody-categorias").empty();
  $.ajax({
    url: '../../Categorias/BuscarCategorias',
    data: {},
    type: 'GET',
    dataType: 'json',
    success: function (categorias) {
      $("#tbody-categorias").empty();
      $.each(categorias, function (index, categoria) {
        let botonDeshabilitar = `<button class="btn btn-dark btn-sm" onclick="DeshabilitarCategoria('${categoria.categoriaID}')">${categoria.eliminado ? 'Habilitar' : 'Deshabilitar'}</button>`;
        if (categoria.eliminado) {
          botonDeshabilitar = `<button class="btn btn-dark btn-sm" onclick="HabilitarCategoria('${categoria.categoriaID}')">Habilitar</button>`;
        }
        $("#tbody-categorias").append(`
          <tr>
            <td class="text-light " >${categoria.descripcion}</td>
            <td class="text-light text-center">
              <button class="btn btn-dark btn-sm" onClick="BuscarCategoria(${categoria.categoriaID})">Editar</button> |
              ${botonDeshabilitar}
            </td>
          </tr>
        `);
      });
    },
    error: function (xhr, status) {
      alert('Error al cargar categorias');
    },
    complete: function (xhr, status) {
      //alert('Petición realizada');
    }
  });
}

function BuscarCategoria(categoriaID) {
  $.ajax({
    url: '../../Categorias/BuscarCategorias',
    data: { categoriaID: categoriaID },
    type: 'GET',
    dataType: 'json',
    success: function (categoria) {
      if (categoria != null) {
        $("#Descripcion").val(categoria.descripcion);
        $("#CategoriaID").val(categoria.categoriaID);

        $("#ModalCategoria").modal("show");
      }
    },
    error: function (xhr, status) {
      alert('Error al cargar categoría');
    },
    complete: function (xhr, status) {
      //alert('Petición realizada');
    }
  });
}

function DeshabilitarCategoria(categoriaID) {
  categoriaID = parseInt(categoriaID); // convert string to number
  $.ajax({
    url: '../../Categorias/DeshabilitarCategoria',
    data: {
      categoriaID: categoriaID
    },
    type: 'POST',
    dataType: 'json',
    success: function (resultado) {
      if (resultado) {
        BuscarCategorias();
      } else {
        alert("Error: la categoría no ha sido eliminada");
      }
    },
    error: function (xhr, status) {
      alert('Disculpe, existió un problema');
    }
  });
}

function HabilitarCategoria(categoriaID) {
  $.ajax({
    url: '../../Categorias/HabilitarCategoria',
    data: { categoriaID: categoriaID },
    type: 'POST',
    dataType: 'json',
    success: function (resultado) {
      if (resultado) {
        BuscarCategorias();
      } else {
        alert('No se pudo habilitar la categoria.');
      }
    },    
    error: function (xhr, status) {
      alert('Error al habilitar la categoria.');
    }
  });
}

function VaciarFormulario() {
  $("#Descripcion").val('');
  $("#CategoriaID").val(0);
}

function BuscarCategoria(categoriaID) {
  $.ajax({
    // la URL para la petición
    url: '../../Categorias/BuscarCategorias',
    // la información a enviar
    // (también es posible utilizar una cadena de datos)
    data: { categoriaID: categoriaID },
    // especifica si será una petición POST o GET
    type: 'GET',
    // el tipo de información que se espera de respuesta
    dataType: 'json',
    // código a ejecutar si la petición es satisfactoria;
    // la respuesta es pasada como argumento a la función
    success: function (categorias) {

      if (categorias.length == 1) {
        let categoria = categorias[0];
        $("#Descripcion").val(categoria.descripcion);
        $("#CategoriaID").val(categoria.categoriaID);

        $("#ModalCategoria").modal("show");
      }
    },

    // código a ejecutar si la petición falla;
    // son pasados como argumentos a la función
    // el objeto de la petición en crudo y código de estatus de la petición
    error: function (xhr, status) {
      alert('Error al cargar categorias');
    },

    // código a ejecutar sin importar si la petición falló o no
    complete: function (xhr, status) {
      //alert('Petición realizada');
    }
  });
}

function GuardarCategoria() {
  let descripcion = $("#Descripcion").val();
  let categoriaID = $("#CategoriaID").val();

  $.ajax({
    url: '../../Categorias/GuardarCategoria',
    data: {
      categoriaID: categoriaID,
      descripcion: descripcion
    },
    type: 'POST',
    dataType: 'json',
    success: function (resultado) {
      if (resultado) {
        $("#ModalCategoria").modal("hide");
        BuscarCategorias();
      } else {
        alert("Existe una Categoría con la misma descripcións.");
      }
    },
    error: function (xhr, status) {
      alert('Disculpe, existió un problema');
    }
  });
}
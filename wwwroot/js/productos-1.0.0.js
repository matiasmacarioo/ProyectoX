window.onload = BuscarProductos();



function GuardarProducto() {
  let descripcion = $("#Descripcion").val();
  let categoriaID = $("#CategoriaID").val();
  let productoID = $("#ProductoID").val();

  $.post('../../Productos/GuardarProducto', { descripcion, categoriaID, productoID })
    .done(function (resultado) {
      switch(resultado) {
        case 0:
          $("#ModalProducto").modal("hide");
          BuscarProductos();
          break;
        case 1:
          alert("El nombre ya existe. Por favor ingrese un nombre único.");
          break;
        case 2:
          alert("El nombre no puede estar vacío. Por favor ingrese un nombre válido.");
          break;
        case 3:
          alert("La categoría no puede estar vacía. Por favor seleccione una categoría válida.");
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

function BuscarProductos() {
  $.ajax({
    url: '/Productos/BuscarProductos',
    method: 'GET',
    success: function(data) {
      console.log(data); // Log the retrieved products to the console
      let tbodyProductos = $('#tbody-productos').empty();
      $.each(data, function(index, producto) {
        let acciones = `
          <button class="btn btn-dark btn-sm editar" onClick="BuscarProducto(${producto.productoID})">Editar</button>
          <button class="btn btn-dark btn-sm" onClick="EliminarProducto(${producto.productoID})">X</button>
        `;
        tbodyProductos.append(`
          <tr>
            <td class="text-light">${producto.nombre}</td>
            <td class="text-light">${producto.categoria }</td>
            <td class="text-light text-center btn-group">${acciones}</td>
          </tr>
        `);
      });
      // función de busqueda
      $('#busqueda').on('keyup', function() {
        var value = $(this).val().toLowerCase();
        $('#tbody-productos tr').each(function() {
          var rowText = $(this).find('td:first-child').text().toLowerCase();
          if (rowText.indexOf(value) !== -1) {
            $(this).show();
          } else {
            $(this).hide();
          }
        });
      });
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('Error al cargar productos:', textStatus, errorThrown); // Log any errors to the console
    }
  });
}



function LlenarCategorias() {
  $.get('../../Productos/BuscarCategorias', function (categorias) {
    let selectCategorias = $("#CategoriaID").empty();
    selectCategorias.append('<option value="0" selected>Seleccione una categoría</option>');
    $.each(categorias, function (index, categoria) {
      $('#CategoriaID').append($('<option></option>').val(categoria.categoriaID).text(categoria.descripcion));
    });      
  }).fail(function () {
    alert('Error al cargar categorías');
  });
}


function VaciarFormulario() {
  $("#Descripcion").val('');
  $("#CategoriaID").val(0);
  $("#ProductoID").val(0);
}

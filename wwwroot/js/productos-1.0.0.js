window.onload = BuscarProductos();

function BuscarProductos() {
  $.ajax({
    url: '/Productos/BuscarProductos',
    method: 'GET',
    success: function(data) {
      console.log(data); // Log the retrieved products to the console
      let tbodyProductos = $('#tbody-productos').empty();
      $.each(data, function(index, producto) {
        let acciones = `
          <button class="btn btn-dark btn-sm editar" onClick="EditarProducto(${producto.productoID}, 'editar')">Editar</button>
          <button class="btn btn-dark btn-sm" onClick="EliminarProducto(${producto.productoID})">X</button>
        `;
        let botonDeshabilitar = '';
        if (producto.eliminado) {
          botonDeshabilitar = `<button class="btn btn-dark btn-sm habilitar" onclick="HabilitarProducto('${producto.productoID}')">Habilitar</button>`;
        } else {
          botonDeshabilitar = `<button class="btn btn-dark btn-sm deshabilitar" onclick="DeshabilitarProducto('${producto.productoID}')">Deshabilitar</button>`;
        }
        tbodyProductos.append(`
          <tr>
            <td class="text-light">${producto.descripcion}</td>
            <td class="text-light">${producto.categoriaDescripcion}</td>
            <td class="text-light text-center btn-group">${acciones} ${botonDeshabilitar}</td>
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
          $("#DescripcionError").text("El nombre ya existe. Por favor ingrese un nombre único.");
          break;
        case 2:
          $("#DescripcionError").text("El nombre no puede estar vacío. Por favor ingrese un nombre válido.");
          break;
        case 3:
          $("#DescripcionError").text("La categoría no puede estar vacía. Por favor seleccione una categoría válida.");
          break;
        default:
          $("#DescripcionError").text("Ocurrió un error inesperado. Por favor inténtelo de nuevo más tarde.");
          break;
      }
    })
    .fail(function () {
      $("#DescripcionError").text("La categoría no puede estar vacía. Por favor seleccione una categoría válida.");
    });
}


function EditarProducto(productoID) {
  var modal = $('#ModalProducto');
  var title = $('#exampleModalLabel');
  var modo = productoID ? 'editar' : 'crear'; // Define the modo variable

  $.get('../../Productos/BuscarProductos', { productoID: productoID })
    .done(function (productos) {
      if (productos.length == 1) {
        let producto = productos[0];
        $("#Descripcion").val(producto.descripcion);
        $("#ProductoID").val(producto.productoID);
        $("#CategoriaID").val(producto.categoriaID);
        LlenarCategorias(); // call the function to fill the categories dropdown
        
        // Change modal title based on mode
        if (modo === 'editar') {
          title.text('Editar Producto');
        } else {
          title.text('Agregar Producto');
        }

        // Show modal
        modal.modal('show');

      }
    })
    .fail(function () {
      alert('Error al cargar productos');
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
  var modal = $('#ModalCategoria');
  var title = $('#exampleModalLabel');
  title.text('Agregar Categoría');

  $("#Descripcion").val('');
  $("#CategoriaID").val(0);
  $("#ProductoID").val(0);
}

function DeshabilitarProducto(productoID) {
  $.post('../../Productos/DeshabilitarProducto', { productoID: parseInt(productoID) })
    .done(function (resultado) {
      resultado ? BuscarProductos() : alert("No se pudo deshabilitar el producto.");
    })
    .fail(function (xhr, status) {
      alert('Disculpe, existió un problema');
    });
}

function HabilitarProducto(productoID) {
  $.post('../../Productos/HabilitarProducto', { productoID: productoID })
    .done(function (resultado) {
      resultado ? BuscarProductos() : alert('No se pudo habilitar el producto.');
    })
    .fail(function () {
      alert('Error al habilitar la producto.');
    });
}

function EliminarProducto(productoID) {
  // Show confirmation modal
  $('#confirm-delete-modal').modal('show');
  
  // Add event listener to delete button in modal
  $('#confirm-delete-btn').click(function() {
    // Send post request to server to delete the category
    $.post('../../Productos/EliminarProducto', { productoID: parseInt(productoID) })
      .done(function (resultado) {
        resultado ? BuscarProductos() : alert("No se pudo eliminar el producto.");
      })
      .fail(function (xhr, status) {
        alert('Disculpe, existió un problema');
      });
      
    // Hide the modal
    $('#confirm-delete-modal').modal('hide');
  });
}
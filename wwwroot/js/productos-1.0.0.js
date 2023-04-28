window.onload = BuscarProductos();

function BuscarProductos() {
  $.ajax({
    url: '/Productos/BuscarProductos',
    method: 'GET',
    success: function(data) {
      // console.log(data); // Log the retrieved products to the console
      let tbodyProductos = $('#tbody-productos').empty();
      $.each(data, function(index, producto) {
        let acciones = `
          <button class="btn btn-dark btn-sm editar" onClick="EditarProducto(${producto.productoID}, 'editar', this)">Editar</button>
          <button class="btn btn-dark btn-sm" onClick="EliminarProducto(${producto.productoID}, this)">X</button>
        `;
        let botonDeshabilitar = '';
        if (producto.eliminado) {
          botonDeshabilitar = `<button class="btn btn-dark btn-sm habilitar" onclick="HabilitarProducto('${producto.productoID}', this)">Habilitar</button>`;
        } else {
          botonDeshabilitar = `<button class="btn btn-dark btn-sm deshabilitar" onclick="DeshabilitarProducto('${producto.productoID}', this)">Deshabilitar</button>`;
        }
        tbodyProductos.append(`
          <tr class="text-light text-center">
            <td>${producto.descripcion}</td>
            <td>${producto.categoriaDescripcion}</td>
            <td class="btn-group">${acciones} ${botonDeshabilitar}</td>
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

function GuardarProducto(button) {
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
          $("#DescripcionError").html(`<div></div> <strong>El nombre ya existe. Por favor ingrese un nombre único.</strong> </div>`);
          break;
        case 2:
          $("#DescripcionError").html(`<div></div> <strong>El nombre no puede estar vacío. Por favor ingrese un nombre válido.</strong> </div>`);
          break;
        case 3:
          $("#CategoriaError").html(`<div></div> <strong>La categoría no puede estar vacía. Por favor seleccione una categoría válida.</strong> </div>`);
          break;
        default:
          $("#DescripcionError").html(`<div>></div> <strong>Ocurrió un error inesperado. Por favor inténtelo de nuevo más tarde.</strong> </div>`);
          break;
      }
    })
    .fail(function () {
      $("#DescripcionError").html(`<div></div> <strong>Primero debe iniciar sesión.</strong> </div>`);
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
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
        
        // Change modal title based on the button
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
  title.text('Agregar Producto');

  $("#Descripcion").val('');
  $("#CategoriaID").val(0);
  $("#ProductoID").val(0);
}

function DeshabilitarProducto(productoID, button) {
  $.post('../../Productos/DeshabilitarProducto', { productoID: parseInt(productoID) })
    .done(function (resultado) {
      // resultado ? BuscarProductos() : alert("No se pudo deshabilitar el producto.");
      resultado ? BuscarProductos() : $(button).text('Error');
    })
    .fail(function (xhr, status) {
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
      // alert('Primero debe iniciar sesión.');
      // $(button).text('Inicia sesión');
    });
}

function HabilitarProducto(productoID, button) {
  $.post('../../Productos/HabilitarProducto', { productoID: productoID })
    .done(function (resultado) {
      resultado ? BuscarProductos() : $(button).text('Error');
    })
    .fail(function () {
      $(button).html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
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
        if (resultado) {
          $('#confirm-delete-modal .modal-body').html('<p class="text-success">El producto se ha eliminado.</p>');
          setTimeout(function () {
            BuscarProductos();
            $('#confirm-delete-modal').modal('hide');
          }, 650);
        } else {
          $('#confirm-delete-modal .modal-body').html('<p class="text-danger">No se pudo eliminar el producto.</p>');
        }
      })
      .fail(function (xhr, status) {
        $('#confirm-delete-modal .modal-body').html('<p>Primero debe iniciar sesión.</p>');
        $('#confirm-delete-btn').html('<a class="nav-link text-light" href="/Identity/Account/Login">Iniciar sesión</a>');
      });
  });

  // Add event listener to modal hidden event
  $('#confirm-delete-modal').on('hidden.bs.modal', function() {
    // Reset modal content to default
    $('#confirm-delete-modal .modal-body').html('<p>¿Está seguro que desea eliminar esta categoria?</p>');
  });

}


$('#ModalProducto').on('shown.bs.modal', function () {
  $('#Descripcion').focus();
});

window.onload = BuscarCategorias();

function BuscarCategorias(){
    $("#tbody-categorias").empty();
    $.ajax({
        // la URL para la petición
        url : '../../Categorias/BuscarCategorias',
        // la información a enviar
        // (también es posible utilizar una cadena de datos)
        data : {  },    
        // especifica si será una petición POST o GET
        type : 'GET',
        // el tipo de información que se espera de respuesta
        dataType : 'json',
        // código a ejecutar si la petición es satisfactoria;
        // la respuesta es pasada como argumento a la función
        success : function(categorias) {
            $("#tbody-categorias").empty();
            $.each(categorias, function( index, categoria ) {
                $("#tbody-categorias").append(
                    '<tr>' +
                        '<td> <a class="btn btn-primary btn-sm" onClick="BuscarCategoria(' + categoria.categoriaID + ')" role="button">' + categoria.descripcion + '</a></td>' +
                    '</tr>'
                );     
            });
        },
   
        // código a ejecutar si la petición falla;
        // son pasados como argumentos a la función
        // el objeto de la petición en crudo y código de estatus de la petición
        error : function(xhr, status) {
            alert('Error al cargar categorias');
        },
   
        // código a ejecutar sin importar si la petición falló o no
        complete : function(xhr, status) {
            //alert('Petición realizada');
        }
    });
}

function VaciarFormulario(){
    $("#Descripcion").val('');
    $("#CategoriaID").val(0);
}

function BuscarCategoria(categoriaID){
    $.ajax({
        // la URL para la petición
        url : '../../Categorias/BuscarCategorias',
        // la información a enviar
        // (también es posible utilizar una cadena de datos)
        data : { categoriaID: categoriaID },    
        // especifica si será una petición POST o GET
        type : 'GET',
        // el tipo de información que se espera de respuesta
        dataType : 'json',
        // código a ejecutar si la petición es satisfactoria;
        // la respuesta es pasada como argumento a la función
        success : function(categorias) {
           
            if (categorias.length == 1){
                let categoria = categorias[0];
                $("#Descripcion").val(categoria.descripcion);
                $("#CategoriaID").val(categoria.categoriaID);

                $("#ModalCategoria").modal("show");
            }
        },
   
        // código a ejecutar si la petición falla;
        // son pasados como argumentos a la función
        // el objeto de la petición en crudo y código de estatus de la petición
        error : function(xhr, status) {
            alert('Error al cargar categorias');
        },
   
        // código a ejecutar sin importar si la petición falló o no
        complete : function(xhr, status) {
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
        success: function(resultado) {
            if (resultado) {
                $("#ModalCategoria").modal("hide");
                BuscarCategorias();
            } else {
                alert("Existe una Categoría con la misma descripción.");
            }
        },
        error: function(xhr, status) {
            alert('Disculpe, existió un problema');
        }
    });
}

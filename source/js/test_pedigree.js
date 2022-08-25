var data = {};

$(document).ready(function() {
//  Functions from the top NAVBAR Buttons
  $("#log").click(function() {
    console.log(data);
  });

  $("#load").click(function() {
    data = JSON.parse(localStorage.getItem('fhh_data'));
    $(".fhh_pedigree").pedigree("display");
  });


  $("#import_from_file").click(function() {
    $("#import_file").click();
  });

  $("#import_file").change(function(e) {

    var reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.onload = function(e) {
      data = JSON.parse(e.target.result);
      $("#fhh_pedigree").pedigree("data", data);
      $("#fhh_pedigree").pedigree("display");
    };
    document.getElementById('import_file').value= null; // resets the value to allow reload
  });

  $("#import_from_url").click(function() {
    var pick_url_dialog = $("<DIV id='pick_url_dialog' title='Choose URL Dialog'>")
      .append("<LABEL for='d_pick_url_input'>Choose URL</LABEL>")
      .append(": ")
      .append("<INPUT type='text' id='d_pick_url_input' size='30'></INPUT>");

    pick_url_dialog.dialog({
      modal:true,
      position: {my:"center top", at:"center top"},
      buttons: [
        {
          text: "Cancel", click: function() {
            $( this ).dialog( "close" );
          }
        }, {
          text: "Submit", click: function() {
            $( this ).dialog( "close" );
            var url = $("#d_pick_url_input").val()
            $.getJSON(url, function (json) {
              data = json;
              $(".fhh_pedigree").pedigree("display");
            });
          }
        }
      ]
   });

  });

  $("#clear").click(function() {
    data = {};
    display_fhh();
    create_add_person_to_fhh_widget();
    $("#remove_person_from_fhh").empty();
  });

  $(".fhh_pedigree").pedigree();
  $(".fhh_pedigree").pedigree("display");

});

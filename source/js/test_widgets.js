
var data = [];

$(document).ready(function() {
  // executes when HTML-Document is loaded and DOM is ready

  $("#log").click(function() {
    console.log(data);
  });

  $("#save").click(function() {
    localStorage.setItem("fhh_data", JSON.stringify(data))
  });

  $("#load").click(function() {
    data = JSON.parse(localStorage.getItem('fhh_data'));
    display_fhh(data["proband"], "simple");
  });


  $("#export").click(function() {
    exportJson(data, "fhh_export");
  });

  $("#import_from_file").click(function() {
    $("#import_file").click();
  });

  $("#import_file").change(function(e) {

    var reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.onload = function(e) {
      data = JSON.parse(e.target.result);
      display_fhh(data["proband"], "complex");
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
              display_fhh(data["proband"], "complex");
            });
          }
        }
      ]
   });

  });

  $("#clear").click(function() {
    data = [];
    display_fhh(data["proband"], "simple");
  });

});

function display_fhh(id, view) {
  $("#fhh_data").empty();
  if (!data  || !data["people"] || !data["proband"]) return; // Need a minimum in order to process at all

  var proband = data["proband"];

  // Make Proband Card
  var proband_div = $("<div></div>").addClass("fhh_card").attr("person_id", proband);
  $("#fhh_data").append(proband_div);

  // Make Parents Cards
  var father_id = data["people"][proband]["father"];
  var father_div = $("<div></div>").addClass("fhh_card").attr("person_id", father_id);
  $("#fhh_data").append(father_div);

  var mother_id = data["people"][proband]["mother"];
  var mother_div = $("<div></div>").addClass("fhh_card").attr("person_id", mother_id);
  $("#fhh_data").append(mother_div);

  // Make Children Cards
  var children = data["people"][proband]["children"];
  children.forEach(function(person_id) {
    var person_div =  $("<div></div>").addClass("fhh_card").attr("person_id", person_id);
    $("#fhh_data").append(person_div);
  });

  // Make Sibling Cards
  var full_siblings = get_full_siblings(data, proband, father_id, mother_id);
  full_siblings.forEach(function(person_id) {
    var person_div =  $("<div></div>").addClass("fhh_card").attr("person_id", person_id);
    $("#fhh_data").append(person_div);
  });

// This is where we define what the cards look like
  $(".fhh_card").card({
    view:"complex"
  });
// This is where we add the data to all cards based on the person_id of the card
  $(".fhh_card").each(function(i) {
    var person_id = $(this).attr("person_id");
    $(this).card("person_id", person_id);
    $(this).card("data", data["people"][person_id]);
  });
}



function get_full_siblings(d, proband_id, father_id, mother_id) {
  var fathers_children = [];
  var mothers_children = [];

  if (d["people"][father_id] && d["people"][father_id]["children"])
    fathers_children = data["people"][father_id]["children"];
  if (d["people"][mother_id] != null && d["people"][mother_id]["children"] != null)
    mothers_children = data["people"][mother_id]["children"];

  var common = $(fathers_children).filter(mothers_children);

  var siblings = [];
  $.each(common, function(i,v) {
    if (v != proband_id) siblings.push(v);
  });
  return (siblings);
}

function exportJson(data, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}


var data = {};

$(document).ready(function() {
  // executes when HTML-Document is loaded and DOM is ready

  $("#log").click(function() {
    console.log(data);
  });

  $("#save").click(function() {
    localStorage.setItem("fhh_data", JSON.stringify(data));
    alert ("Data Saved");
  });

  $("#load").click(function() {
    data = JSON.parse(localStorage.getItem('fhh_data'));
    display_fhh(data["proband"], "simple");
    create_add_person_to_fhh_widget();
    create_remove_person_from_fhh_widget();
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
      create_add_person_to_fhh_widget();
      create_remove_person_from_fhh_widget();
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
    data = {};
    display_fhh(data["proband"], "simple");
    create_add_person_to_fhh_widget();
    $("#remove_person_from_fhh").empty();
  });

  create_add_person_to_fhh_widget();
});

function create_add_person_to_fhh_widget() {
  if (data && data["proband"] && data["people"][data["proband"]]) {
    var add_relative_button = $("<BUTTON>Add Relative</BUTTON>");
    add_relative_button.click(function (event) {
      alert("Adding Relative");
    });
    $("#add_person_to_fhh").empty().append(add_relative_button);

  } else {
    var add_proband_button = $("<BUTTON>Add Proband</BUTTON>");
    add_proband_button.click(add_proband);
    $("#add_person_to_fhh").empty().append(add_proband_button);
  }
 }
function add_proband (event) {
  // Completely clear the data;
  data = {};
  // Add Proband
  var id = crypto.randomUUID();
  data["proband"] = id;
  data["people"] = {}
  data["people"][id] = {};
  data["people"][id]["name"] = "Proband";

  // Add Parents
  var father_id = crypto.randomUUID();
  data["people"][id]["father"] = father_id;
  data["people"][father_id]= {};
  data["people"][father_id]["name"] = "Father";
  data["people"][father_id]["children"] = [];
  data["people"][father_id]["children"][0] = id;

  var mother_id = crypto.randomUUID();
  data["people"][id]["mother"] = mother_id;
  data["people"][mother_id] = {}
  data["people"][mother_id]["name"] = "Mother";
  data["people"][mother_id]["children"] = [];
  data["people"][mother_id]["children"][0] = id;

  // Add Paternal Grandparents
  var paternal_grandfather_id = crypto.randomUUID();
  data["people"][father_id]["father"] = paternal_grandfather_id;
  data["people"][paternal_grandfather_id] = {}
  data["people"][paternal_grandfather_id]["name"] = "Paternal Grandfather";
  data["people"][paternal_grandfather_id]["children"] = [];
  data["people"][paternal_grandfather_id]["children"][0] = father_id;

  var paternal_grandmother_id = crypto.randomUUID();
  data["people"][father_id]["mother"] = paternal_grandmother_id;
  data["people"][paternal_grandmother_id] = {}
  data["people"][paternal_grandmother_id]["name"] = "Paternal Grandmother";
  data["people"][paternal_grandmother_id]["children"] = [];
  data["people"][paternal_grandmother_id]["children"][0] = father_id;

  // Add Maternal Grandparents
  var maternal_grandfather_id = crypto.randomUUID();
  data["people"][mother_id]["father"] = maternal_grandfather_id;
  data["people"][maternal_grandfather_id] = {}
  data["people"][maternal_grandfather_id]["name"] = "Maternal Grandfather";
  data["people"][maternal_grandfather_id]["children"] = [];
  data["people"][maternal_grandfather_id]["children"][0] = mother_id;

  var maternal_grandmother_id = crypto.randomUUID();
  data["people"][maternal_grandmother_id] = {}
  data["people"][mother_id]["mother"] = maternal_grandmother_id;
  data["people"][maternal_grandmother_id]["name"] = "Maternal Grandmother";
  data["people"][maternal_grandmother_id]["children"] = [];
  data["people"][maternal_grandmother_id]["children"][0] = mother_id;


  display_fhh(data["proband"], "complex");
  create_add_person_to_fhh_widget();
}

function create_remove_person_from_fhh_widget() {
  $("#remove_person_from_fhh").empty();
  var relative_select = $("<SELECT id='remove_person_select' />").append("<OPTION></OPTION>");

  var people = data["people"];
  $.each(people, function(person_id, details) {
    var option = $("<OPTION>" + details["relationship"] + " - " + details["name"] + "</OPTION>").attr("value", person_id);
    if (details["relationship"] != "Proband"
      && details["relationship"] != "Father"
      && details["relationship"] != "Mother"
      && details["relationship"] != "Paternal Grandfather"
      && details["relationship"] != "Paternal Grandmother"
      && details["relationship"] != "Maternal Grandfather"
      && details["relationship"] != "Maternal Grandmother")
    {
      relative_select.append(option);
    }
  });
  var remove_button = $("<BUTTON>Remove Relative</BUTTON>");
  remove_button.click(function (event) {
    person_id = $("#remove_person_select").val();
    if (!data["people"][person_id]["children"] || data["people"][person_id]["children"].length == 0) {
      var name = data["people"][person_id]["name"]
      delete data["people"][person_id];
      var card_to_remove = $(".fhh_card[person_id='" + person_id + "']");
      console.log(card_to_remove);
      card_to_remove.remove();
      alert (name + " was removed");
    } else {
      alert ("Cannot Remove Person with active Childred, remove them first");
    }
  });
  $("#remove_person_from_fhh").append(relative_select).append(remove_button);
}

function display_fhh(id, view) {
  $("#fhh_data").empty();
  if (!data  || !data["people"] || !data["proband"]) return; // Need a minimum in order to process at all

  var proband_id = data["proband"];
  data["people"][proband_id]["relationship"] = "Proband";

  // Make Proband Card
  var proband_div = $("<div></div>").addClass("fhh_card").attr("person_id", proband_id).attr("relationship", "Proband");
  $("#fhh_data").append(proband_div);

  // Make Parents Cards
  var father_id = data["people"][proband_id]["father"];
  var father_div = $("<div></div>").addClass("fhh_card").attr("person_id", father_id).attr("relationship", "Father");
  $("#fhh_data").append(father_div);
  data["people"][father_id]["relationship"] = "Father";

  var mother_id = data["people"][proband_id]["mother"];
  var mother_div = $("<div></div>").addClass("fhh_card").attr("person_id", mother_id).attr("relationship", "Mother");
  $("#fhh_data").append(mother_div);
  data["people"][mother_id]["relationship"] = "Mother";


  // Make Children Cards
  var children = data["people"][proband_id]["children"];
  if (children) {
    children.forEach(function(person_id) {
      var person_div =  $("<div></div>").addClass("fhh_card").attr("person_id", person_id).attr("relationship", "Child");
      $("#fhh_data").append(person_div);
      data["people"][person_id]["relationship"] = "Child";
    });
  }
  // Make Sibling Cards
  var full_siblings = get_full_siblings(data, proband_id, father_id, mother_id);
  full_siblings.forEach(function(person_id) {
    var person_div =  $("<div></div>").addClass("fhh_card").attr("person_id", person_id).attr("relationship", "Sibling");
    $("#fhh_data").append(person_div);
    data["people"][person_id]["relationship"] = "Sibling";


    // Make nephews_and_nieces cards
    var nephews_and_nieces = get_nephews_and_nieces(data, proband_id, father_id, mother_id);
    nephews_and_nieces.forEach(function(person_id) {
      var person_div =  $("<div></div>").addClass("fhh_card").attr("person_id", person_id).attr("relationship", "Nephew or Niece");
      $("#fhh_data").append(person_div);
      data["people"][person_id]["relationship"] = "Nephew or Niece";
    });
  });

// This is where we define what the cards look like
  $(".fhh_card").card({
    view:"complex"
  });

// This is where we add the data to all cards based on the person_id of the card

  $(".fhh_card").each(function(i) {
    var person_id = $(this).attr("person_id");
    var relationship = $(this).attr("relationship");
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

function get_nephews_and_nieces(d, proband_id, father_id, mother_id) {
  var nephews_and_nieces = [];

  var full_siblings = get_full_siblings(data, proband_id, father_id, mother_id);
  full_siblings.forEach(function(person_id) {
    var children = data["people"][person_id]["children"];
    if (children) nephews_and_nieces = nephews_and_nieces.concat(children);
  });
  return nephews_and_nieces;
}

function exportJson(data, exportName){
  console.log(data);
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

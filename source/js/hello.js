
var data = [];
var element;

$(document).ready(function() {
  // executes when HTML-Document is loaded and DOM is ready

  console.log("Starting ...");
  localStorage.setItem("fhh", "TEST");
  var item = localStorage.getItem("fhh");
  console.log(item);

  element = $("#fhh");

// Not needed since local storage is done now
/*  $.getJSON( "sampledata/lawrence_brem.json", function (d) {

    data = d;

    $("table.fhh").each(function() {
      element = $(this);
      display_fhh(data["proband"], "simple");
    });

  });
*/

  $("#simplified").click(function() {
    $("table.fhh").each(function() {
      element = $(this);
      element.empty();
      display_fhh(data["proband"], "simple");
    });
  });

  $("#demographics").click(function() {
    $("table.fhh").each(function() {
      element = $(this);
      element.empty();
      display_fhh(data["proband"], "demopgraphics");
    });
  });

  $("#clear").click(function() {
    data = [];
    display_fhh(data["proband"], "simple");
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

  $("#import").click(function() {
    $("#import_file").click();
  });


  $("#import_file").change(function(e) {

    var reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.onload = function(e) {
      alert ("Reading File");
      data = JSON.parse(e.target.result);
      console.log(data);
      display_fhh(data["proband"], "simple");
    };
    document.getElementById('import_file').value= null; // resets the value to allow reload
  });

});

function exportJson(data, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}


function add_header_to_fhh_table() {
  element.empty();
  element.append("<TR> <TH class='h_left'> Name </TH> <TH class='h_center'> Relationship </TH> <TH class='h_center'> Edit </TH> <TH class='h_center'> Delete </TH> </TR>");
}

function display_fhh(id, view) {
  // $( element ).text( JSON.stringify(data["people"][id]) );

  add_header_to_fhh_table();
  if (data == null || data["people"] == null) return; // Need a minimum in order to process at all
  console.log(data["people"][id]);

  var mother_id = data["people"][id]["mother"];
  var father_id = data["people"][id]["father"];
  var mother_name = "unknown";
  if (data["people"][mother_id] && data["people"][mother_id]["name"]) mother_name = data["people"][mother_id]["name"];
  var father_name = "unknown";
  if (data["people"][father_id] && data["people"][father_id]["name"])data["people"][father_id]["name"];

  add_person_to_table (id, "SELF", view, false);
  if (mother_id != null && mother_id != "") add_person_to_table (mother_id, "Mother", view, false);
  if (father_id != null && father_id != "") add_person_to_table (father_id, "Father", view, false);

  var children = data["people"][id]["children"];
  $.each( children, function( index, value ){
    add_person_to_table (value, "Child", view, true);
  });

  var full_siblings = get_full_siblings(id, father_id, mother_id);
  $.each( full_siblings, function( index, value ){
    add_person_to_table (value, "Sibling", view, true);
  });

  var full_nieces_nephews = get_nieces_nephews(id, full_siblings);
  console.log(full_nieces_nephews);
  $.each( full_nieces_nephews, function( index, value ){
    add_person_to_table (value, "Niece/Nephew", view, true);
  });
}

function get_full_siblings(id, father_id, mother_id) {
  var fathers_children = [];
  var mothers_children = [];

  if (data["people"][father_id] != null && data["people"][father_id]["children"] != null)
    fathers_children = data["people"][father_id]["children"];
  if (data["people"][mother_id] != null && data["people"][mother_id]["children"] != null)
    mothers_children = data["people"][mother_id]["children"];


  var common = $(fathers_children).filter(mothers_children);

  var siblings = [];
  $.each(common, function(i,v) {
    if (v != id) siblings.push(v);
  });
  console.log (siblings);
  return (siblings);
}

function get_nieces_nephews (id, siblings) {
  var nieces_nephews = [];
  $.each(siblings, function(i,v) {
    if (data["people"][v]["children"] != null)
      nieces_nephews = nieces_nephews.concat(data["people"][v]["children"]);
  });
  return nieces_nephews;

}

function add_person_to_table (id, relationship, view, deleteable) {
  var person = data["people"][id];
  var name = person["name"];

  if (view == "simple") {
    infobox = person["name"];
  } else {
    var gender = "";
    var weight = "";
    var height = "";
    var age_display = "";
    var race = "";
    var ethnicity = "";

    if (person["demographics"] != null) {
      gender = person["demographics"]["gender"];
      height = person["demographics"]["height_in_inches"];
      if (height == null) height = ""; else height += " inches";
      weight = person["demographics"]["weight_in_pounds"];
      if (weight == null) weight = ""; else weight += " pounds";

      var birthdate = person["demographics"]["birthdate_in_MM/DD/YYYY"];
      var age = person["demographics"]["age_in_years"];
      age_display = "";
      if (birthdate == null && age == null) age_display = "";
      else if (birthdate == null) age_display = age + "years";
      else if (age == null) age_display = birthdate;
      else age_display = birthdate + " (" + age + " years old)";

      race = person["demographics"]["race"];
      if (race == null) race = "";
      ethnicity = person["demographics"]["ethnicity"];
      if (ethnicity == null) ethnicity = "";
      var race_ethnicity = "&nbsp;";
      console.log (name + ":" + race + "," + ethnicity);
      if (race == "" && ethnicity == "") race_ethnicity = "&nbsp;";
      else if (race == "") race_ethnicity = ethnicity;
      else if (ethnicity == "") race_ethnicity = race;
      else race_ethnicity = race + " (" + ethnicity + ")";
    } else {
      height = ""; weight = "";
      race_ethnicity = ""; age_display = "";
    }
    var icon = "source/images/icon_male.png";
    if (gender != null && gender == 'female' || gender == 'F') icon = "source/images/icon_female.png";


      // Infobox has more information about the person than just the name, maybe later add diseases or key diseases
    var infobox = $("<TABLE>");
    infobox.append($("<TR>")
      .append($("<TD>").append("<IMG src=" + icon + " height='64' alt='silhouette' />"))
      .append($("<TD style='float:left;width:200px'>").append("<B>" + name + "</B>"
        + "<br/>" + height
        + "<br/>" + weight
      ))
      .append($("<TD style='float:right;'>").append("&nbsp;"
        + "<br/>" + race_ethnicity
        + "<br/>" + age_display
      ))
    );
  }
  var trashicon = "&nbsp;";
  if (deleteable) trashicon = "<IMG src='source/images/icon_trash.gif' />";

  element.append($("<TR>")
    .append( $("<TD class='person_name'>").append(infobox))
    .append( $("<TD class='relationship'>").append(relationship))
    .append( $("<TD class='edit'>").append("<IMG src='source/images/icon_pencil.gif' />"))
    .append( $("<TD class='trash'>").append(trashicon))
  );
}

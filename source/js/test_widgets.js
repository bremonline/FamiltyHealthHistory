
var data = [];

$(document).ready(function() {
  // executes when HTML-Document is loaded and DOM is ready
  $.getJSON( "sampledata/lawrence_brem.json", function (d) {
    data = d;

    var proband = d["proband"];

    // Make Proband
    var proband_div = $("<div></div>").addClass("fhh_card").attr("person_id", proband);
    $("#fhh_data").append(proband_div);

    var father_id = d["people"][proband]["father"];
    var father_div = $("<div></div>").addClass("fhh_card").attr("person_id", father_id);
    $("#fhh_data").append(father_div);

    var mother_id = d["people"][proband]["mother"];
    var mother_div = $("<div></div>").addClass("fhh_card").attr("person_id", mother_id);
    $("#fhh_data").append(mother_div);

    var children = d["people"][proband]["children"];
    children.forEach(function(person_id) {
      console.log(person_id);
      var person_div =  $("<div></div>").addClass("fhh_card").attr("person_id", person_id);
      $("#fhh_data").append(person_div);
    });

    var full_siblings = get_full_siblings(d, proband, father_id, mother_id);
    full_siblings.forEach(function(person_id) {
      console.log(person_id);
      var person_div =  $("<div></div>").addClass("fhh_card").attr("person_id", person_id);
      $("#fhh_data").append(person_div);
    });


    $(".fhh_card").card({
      view:"complex"
    });
    $(".fhh_card").each(function(i) {
      var person_id = $(this).attr("person_id");
      $(this).card("data", data["people"][person_id]);
    });
  });

});

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
  console.log (siblings);
  return (siblings);
}

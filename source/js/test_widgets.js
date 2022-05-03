
var data = [];

$(document).ready(function() {
  // executes when HTML-Document is loaded and DOM is ready
  $.getJSON( "sampledata/lawrence_brem.json", function (d) {
    data = d;

    $(".fhh_card").card({
      view:"complex"
    });
    $(".fhh_card").each(function(i) {
      var person_id = $(this).attr("person_id");
      $(this).card("data", data["people"][person_id])
    });
  });/*
  $("#fhh_card").card({
    data:
    {
      "name":"Lawrence Brem",
      "demographics": {
        "first_name":"Lawrence",
        "nickname":"Larry",
        "middle_name":"Mark",
        "last_name":"Brem",
        "gender": "male",
        "age_in_years":53,
        "weight_in_pounds":225,
        "height_in_inches":69,
        "birthdate_in_MM/DD/YYYY":"11/19/1968",
        "race" : "White",
        "ethnicity" : "Non-Hispanic"
      },
      "diseases": [{
        "Pre-diabetes": [{
        "age_of_diagnosis": 51,
        "concept_codes": {"ICD-10":"R73.01"}
      }],
        "Myopia": [{
        "age_of_diagnosis": 14
        }]
      }],
      "mother":"216f5c83-ec39-49b5-96de-ff17202a1271",
      "father":"0b029d11-87b1-4f14-80f2-b5f59c71d2c2",
      "children": [
      "941a6910-efc2-4858-b532-eeead065817d", "ad3501c5-1218-404d-b8a7-21350fab94bb"
      ]
    },
    view:"complex"}
  );
*/

//  $("#fhh_card").card();

});

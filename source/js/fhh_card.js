// This is the Family Health History Card Widget

(function ( $ ) {

  // These are globals for all fhh.cards
  possible_races = {
    "indian":"American Indian or Alaska Native",
    "asian":"Asian",
    "black":"Black or African-American",
    "hawaiian":"Native Hawaiian or Other Pacific Islander",
    "white":"White"
  }
  possible_ethnicities = {
    "hispanic":"Hispanic or Latino",
    "not_hispanic": "Not Hispanic or Latino",
    "jewish":"Ashkenazi Jewish"
  };

  $.widget("fhh.card",{

    options: {
      data:[],
      view:"simple"
    },
    display_element : function () {

      var d = this.options.data;

      if (this.options.view == "complex") {
        console.log(this.element.attr("relationship") + ":" + this.element.attr("person_id"));
        var relationship_box = get_relationship_box(d, this.element.attr("relationship"));
        var stats_box = get_stats_box(d, this.element.attr("person_id"));
        var race_ethnicity_box = get_race_ethnicity_box(d);
        var disease_box = get_disease_box(d);

        this.element.empty()
          .append(relationship_box)
          .append(stats_box)
          .append(race_ethnicity_box)
          .append(disease_box);
      } else {
         this.element.text(d["name"]);
      }

    },
    _create: function() {
    },
    data: function (d) {
      this.options.data = d;
      this.display_element();
    },
    person_id: function(person_id) {
      this.options.person_id = person_id;
    },
    relationship: function(relationship) {
      this.options.relationship = relationship;
    }
  });
}( jQuery ));

function get_demographics_value(d, key) {
  if (!d) return null;
  var demographics = d["demographics"];
  if (demographics == null) return null;
  return demographics[key];

}

function get_name(d) {
  if (!d) return "Unknown";
  var name = d["name"];
  if (name == null) return "Unknown";
  return name;
}

function get_relationship_box(d, relationship) {
  var div = $("<DIV>");
  div.append(relationship).addClass("fhh_title");
  return div;
}

function get_stats_box (d, person_id) {
// Adding picture box here


  var name = get_name(d);
  var gender = get_demographics_value(d, "gender");
  if (!gender) gender = "&nbsp;"
  var height_in_inches = get_demographics_value(d, "height_in_inches");
  var height_in_cm = get_demographics_value(d, "height_in_cm");
  var height_str = "&nbsp;";
  if (height_in_inches) height_str = Math.floor(height_in_inches/12) + " feet " + (height_in_inches%12)+ " inches";
  else if (height_in_cm) height_str = height_in_cm + " cm";
  var weight_in_pounds = get_demographics_value(d, "weight_in_pounds");
  var weight_in_kilograms = get_demographics_value(d, "weight_in_kilograms");
  var weight_str = "&nbsp;";
  if (weight_in_pounds) weight_str = weight_in_pounds + " pounds";
  else if (weight_in_kilograms) weight_str = weight_in_kilograms + " kilograms";

  var birthdate = get_demographics_value(d, "birthdate");
  var age = get_demographics_value(d, "age");
  var estimated_age = get_demographics_value(d, "estimated_age");

  var birthdate_age = "&nbsp;";
  if (birthdate) birthdate_age = birthdate;
  else if (age) birthdate_age = age + " years";
  else if (estimated_age) birthdate_age = estimated_age;
  else birthdate_age = "&nbsp;";


  var icon = "source/images/icon_male.png";
  gender = get_demographics_value(d,"gender");
  if (gender && gender == 'Female' || gender == 'F') icon = "source/images/icon_female.png";
  var picture_box = $("<DIV><IMG src=" + icon + " height='64' alt='silhouette' /></DIV>");
  picture_box.addClass("fhh_picture_box");


  var edit_image_element = $("<IMG class='edit' src='source/images/icon_pencil.gif' />");
  var trash_image_element = $("<IMG class='trash' src='source/images/icon_trash.gif' />");
  edit_image_element.click({person_id:person_id, data:d} , click_edit);
  edit_image_element.css("cursor","pointer");
  picture_box.append("<br/>").append(edit_image_element).append(trash_image_element);

  var stats_box = $("<DIV><B>" + name + "</B><BR/>" + gender + "<BR/>" + birthdate_age + "<BR/>" + height_str + "<BR/>" + weight_str + "</DIV>");
  stats_box.addClass("fhh_stats_box");

  var div = $("<DIV>");
  div.append(picture_box).append(stats_box);
  return div;
}

function get_race_ethnicity_box(d) {


  var races = get_demographics_value(d, "races");
  var race_string = "";
  if (races && races.length > 0) {
    if (races.length == 1) race_string = "<B>Race:</B><br/>";
    else race_string = "<B>Races:</B><br/>";
    $.each(races, function (id, name) {
      race_string = race_string + possible_races[name] + "<br/>"
    });
  }

  var ethnicities = get_demographics_value(d, "ethnicities");
  var ethnicity_string = "";
  if (ethnicities && ethnicities.length > 0) {
    if (ethnicities.length == 1) ethnicity_string = "<B>Ethnicity:</B><br/>";
    else ethnicity_string = "<B>Ethnicities:</B><br/>";
    $.each(ethnicities, function (id, name) {
      ethnicity_string = ethnicity_string + possible_ethnicities[name] + "<br/>"
    });
  } else {
    ethnicity_string = "&nbsp;"
  }
  var box;
  if (race_string && race_string != ""){
    box = $("<DIV>" + race_string + "<BR/>"+ ethnicity_string + "</DIV>");
  } else {
    box = $("<DIV>" + ethnicity_string + "</DIV>");

  }
  box.addClass("fhh_race_ethnicity_box");

  return box;

}

function get_disease_box (d) {
  var div = $("<DIV>");

  var diseases = d["diseases"];
  $.each( diseases, function( disease_name, info ) {
    console.log(info["age_of_diagnosis"]);

    if (info['age_of_diagnosis']) {
      div.append( disease_name + " (at " + info['age_of_diagnosis'] + " years) <br/>" );
    } else {
      div.append( disease_name + "<br/>");
    }
  });

  div.addClass("fhh_disease_box");
  return div;
}

function click_edit(event) {
  var d = $("<div></div>");

  d.dialog({
    modal:true,
    position: {my:"center top", at:"center top"},
    buttons: [
      {
        text: "Cancel", click: function() {
          $( this ).dialog( "close" );
          d.remove();
        }
      }, {
        text: "Submit", click: function() {
          console.log(event);
          action_update_person(d, event.data.person_id, event.data.data);
          $( this ).dialog( "close" );
          d.remove();
        }
      }
    ]
  });
  var data = event.data.data;

  var t = $("<TABLE>");
  t.addClass("edit_dialog");

  set_full_name_in_dialog(data, t);
  set_gender_in_dialog(data, t);
  set_height_id_dialog(data, t);
  set_weight_in_dialog(data, t);
  set_age_in_dialog(data, t);
  set_race_in_dialog(data, t);
  set_ethnicity_in_dialog(data, t);

  d.append(t);

}

function set_full_name_in_dialog(data, t) {
  var full_name = "";
  if (data["name"]) full_name = data["name"];
  var full_name_label = $("<LABEL for='d_fullname'>Full Name</LABEL>");
  var full_name_input = $("<INPUT type='text' id='d_fullname'></INPUT>");
  full_name_input.val(full_name);
  t.append("<TR>")
    .append($("<TD>").append(full_name_label))
    .append($("<TD>").append(full_name_input));
}

function set_gender_in_dialog(data, t) {
  var gender = "";
  if (data["demographics"] && data["demographics"]["gender"]) gender = data["demographics"]["gender"];

  var gender_label = $("<LABEL for='d_gender'>Gender at Birth</LABEL>");
  var gender_input = $("<SELECT id='d_gender'><OPTION></OPTION><OPTION>Unknown</OPTION><OPTION>Male</OPTION><OPTION>Female</OPTION></SELECT>");
  gender_input.val(gender);
  t.append("<TR>")
    .append($("<TD>").append(gender_label))
    .append($("<TD>").append(gender_input));
}

function set_height_id_dialog(data, t){
  var height_in_inches = "";
  if (data["demographics"] && data["demographics"]["height_in_inches"]) height_in_inches = data["demographics"]["height_in_inches"];
  var height_in_cm = "";
  if (data["demographics"] && data["demographics"]["height_in_cm"]) height_in_cm = data["demographics"]["height_in_cm"];

  var height_label = $("<LABEL for='d_height'>Height</LABEL>");
  var height_in_feet_inches = $("<DIV>")
  var feet_input = $("<INPUT type='text' id='d_feet' size='3'></INPUT>");
  var feet_label = $("<LABEL for='d_feet'> ft </LABEL>");
  var inches_input = $("<INPUT type='text' id='d_inches' size='3'></INPUT>");
  var inches_label = $("<LABEL for='d_inches'> in </LABEL>");
  var height_in_feet_inches = $("<DIV>").append(feet_input).append(feet_label).append(inches_input).append(inches_label);

  var cm_input = $("<INPUT type='text' id='d_cm' size='5'></INPUT>");
  var cm_label = $("<LABEL for='d_cm'> cm </LABEL>");
  var height_in_cm_input = $("<DIV>").append(" - or - ").append(cm_input).append(cm_label);

  var height_input = $("<DIV>").append(height_in_feet_inches).append(height_in_cm_input);
  if (height_in_inches) {
    var feet = Math.floor(height_in_inches/12);
    var inches = height_in_inches % 12;
    feet_input.val(feet);
    inches_input.val(inches);
  }
  if (height_in_cm) {
    cm_input.val(height_in_cm);
  }
  t.append("<TR>")
    .append($("<TD>").append(height_label))
    .append($("<TD>").append(height_input));
}

function set_weight_in_dialog(data, t) {
  var weight_in_pounds = "";
  var weight_in_kilograms = "";
  if (data["demographics"] && data["demographics"]["weight_in_pounds"]) weight_in_pounds = data["demographics"]["weight_in_pounds"];
  if (data["demographics"] && data["demographics"]["weight_in_kilograms"]) weight_in_kilograms = data["demographics"]["weight_in_kilograms"];

  var weight_label = $("<LABEL for='d_weight'>Weight</LABEL>");
  var weight_input = $("<INPUT type='text' id='d_weight' size='5'></INPUT>");
  var weight_units = $("<SELECT id='d_weight_units'><OPTION></OPTION><OPTION>lb</OPTION><OPTION>kg</OPTION></SELECT>");
  var weight_input_div = $("<DIV>").append(weight_input).append(" ").append(weight_units);

  if (weight_in_pounds) {
    weight_input.val(weight_in_pounds);
    weight_units.val("lb");
  } else if (weight_in_kilograms) {
    weight_input.val(weight_in_kilograms);
    weight_units.val("kg");
  }

  t.append("<TR>")
    .append($("<TD>").append(weight_label))
    .append($("<TD>").append(weight_input_div));
}

function set_age_in_dialog(data, t) {
  var age_type = $("<SELECT id='d_age_type'><OPTION></OPTION><OPTION>Birthdate</OPTION><OPTION>Age</OPTION><OPTION>Est. Age</OPTION></SELECT>");
  var age_input = $("<INPUT type='text' id='d_age' size='3'></INPUT>")
  var age_input_div = $("<DIV id='d_age_input_div'>").append(age_input).append(" years").hide();
  var birthdate_input = $("<INPUT type='text' id='d_birthdate' size='10'></INPUT>").hide();
  birthdate_input.datepicker({changeMonth:true, changeYear:true, yearRange:"-120:+1"});

  var estimated_age_input = $("<SELECT id = 'd_estimated_age'>")
    .append("<OPTION></OPTION>")
    .append("<OPTION>Unknown</OPTION>")
    .append("<OPTION>Pre-Birth</OPTION>")
    .append("<OPTION>Newborn</OPTION>")
    .append("<OPTION>In Infancy</OPTION>")
    .append("<OPTION>In Childhood</OPTION>")
    .append("<OPTION>20-29 Years</OPTION>")
    .append("<OPTION>30-39 Years</OPTION>")
    .append("<OPTION>40-49 Years</OPTION>")
    .append("<OPTION>50-59 Years</OPTION>")
    .append("<OPTION>60 Years or older</OPTION>")
    .hide();

  var age_div = $("<DIV id='d_age_div'>");
  age_div.append(age_input_div).append(birthdate_input).append(estimated_age_input);



  var age = "";
  var birthdate = "";
  var estimated_age = "";
  if (data["demographics"] && data["demographics"]["age"]) age = data["demographics"]["age"];
  if (data["demographics"] && data["demographics"]["birthdate"]) birthdate = data["demographics"]["birthdate"];
  if (data["demographics"] && data["demographics"]["estimated_age"]) estimated_age = data["demographics"]["estimated_age"];


  if (age) {
    age_input_div.show();
    birthdate_input.hide();
    estimated_age_input.hide();
    age_input.val(age)
    age_type.val("Age");
  } else if (birthdate) {
    age_input_div.hide();
    birthdate_input.show();
    estimated_age_input.hide();
    birthdate_input.val(birthdate);
    age_type.val("Birthdate");
  } else if (estimated_age) {
    age_input_div.hide();
    birthdate_input.hide();
    estimated_age_input.show();
    estimated_age_input.val(estimated_age);
    age_type.val("Est. Age");
  }

  age_type.change(change_age_type);

  t.append("<TR>")
    .append($("<TD>").append(age_type))
    .append($("<TD>").append(age_div));
}

function change_age_type() {
  var age_type = $("#d_age_type").val()
  if (age_type && age_type == "Age") {
    $("#d_age_input_div").show();
    $("#d_birthdate").hide();
    $("#d_estimated_age").hide();
  } else if (age_type && age_type == "Birthdate") {
      $("#d_age_input_div").hide();
      $("#d_birthdate").show();
      $("#d_estimated_age").hide();
    } else if (age_type && age_type == "Est. Age") {
      $("#d_age_input_div").hide();
      $("#d_birthdate").hide();
      $("#d_estimated_age").show();
    } else {
      $("#d_age_input_div").hide();
      $("#d_birthdate").hide();
      $("#d_estimated_age").hide();
    }
}

function set_race_in_dialog(data, t) {
  var races = [];
  if (data["demographics"] && data["demographics"]["races"]) races = data["demographics"]["races"];

  var race_label = $("<LABEL for='d_race'>Race</LABEL>");
  var race_input = $("<DIV style='font-size:small'>");


  $.each( possible_races, function( id, name ) {
    check = races.includes(id)
    checkbox = $("<INPUT type='checkbox'></INPUT>").attr("id", id).attr("checked", check);
    race_input.append(checkbox).append(name + "<br/>");
  });

  t.append("<TR>")
    .append($("<TD>").append(race_label))
    .append($("<TD>").append(race_input));
}

function set_ethnicity_in_dialog(data, t) {
  var ethnicities = [];
  if (data["demographics"] && data["demographics"]["ethnicities"]) ethnicities = data["demographics"]["ethnicities"];

  var ethnicity_label = $("<LABEL for='d_race'>Ethnicity</LABEL>");
  var ethnicity_input = $("<DIV style='font-size:small'>");



  $.each( possible_ethnicities, function( id, name ) {
    check = ethnicities.includes(id)
    checkbox = $("<INPUT type='checkbox'></INPUT>").attr("id", id).attr("checked", check);
    ethnicity_input.append(checkbox).append(name + "<br/>");
  });

  t.append("<TR>")
    .append($("<TD>").append(ethnicity_label))
    .append($("<TD>").append(ethnicity_input));
}

function action_update_person(dialog, person_id, data) {

  var fullname = dialog.find("#d_fullname").val();
  if (fullname != data['name']) data['name'] = fullname;

  // demographics needs that object in the json
  if (!data['demographics']) {
    data['demographics'] = {};
  }

  var gender = dialog.find("#d_gender").val();
  if (gender && gender != "") data['demographics']['gender'] = gender;

  var feet=parseInt(dialog.find("#d_feet").val());
  var inches=parseInt(dialog.find("#d_inches").val());
  var cm = parseInt(dialog.find("#d_cm").val());
  // Feet-inches takes precidence
  if (feet || inches) {
    console.log((feet * 12) + inches);
    data['demographics']['height_in_inches'] = (feet * 12) + inches;
    delete data['demographics']['height_in_cm'];
  } else if (cm) {
    data['demographics']['height_in_cm'] = cm;
    delete data['demographics']['height_in_inches'];
  }

  var weight = dialog.find("#d_weight").val();
  var weight_units = dialog.find("#d_weight_units").val();

  if (weight && weight_units && weight_units=="lb") {
    data['demographics']['weight_in_pounds'] = weight;
    delete data['demographics']['weight_in_kilograms'];

  } else if (weight && weight_units && weight_units=="kg"){
    data['demographics']['weight_in_kilograms'] = weight;
    delete data['demographics']['weight_in_pounds'];
  }

// Birthdate, Age, or Estimated Age
  var age_type = dialog.find("#d_age_type").val();
  var age = parseInt(dialog.find("#d_age").val());
  var birthdate = dialog.find("#d_birthdate").val();
  var estimated_age = dialog.find("#d_estimated_age").val();

  console.log(age_type);
  console.log(age);
  console.log(birthdate);
  console.log(estimated_age);

  if (age_type && age_type == 'Age') {
    data['demographics']['age'] = age;
    delete data['demographics']['birthdate'];
    delete data['demographics']['estimated_age'];
  } else if (age_type && age_type == 'Birthdate') {
    delete data['demographics']['age'];
    data['demographics']['birthdate'] = birthdate;
    delete data['demographics']['estimated_age'];
  } else if (age_type && age_type == 'Est. Age'){
    delete data['demographics']['age'];
    delete data['demographics']['birthdate'];
    data['demographics']['estimated_age'] = estimated_age;
  }

// Races

  var races = [];
  $.each( possible_races, function( id, name ) {
    if ( $("#" + id).prop('checked') ) {
      races.push(id);
    }
  });
  data['demographics']['races'] = races;

// ethnicitis
  var ethnicities = [];
  $.each( possible_ethnicities, function( id, name ) {
    if ( $("#" + id).prop('checked') ) {
      ethnicities.push(id);
    }
  });
  data['demographics']['ethnicities'] = ethnicities;

  // Now we have to refresh the card.
  $(".fhh_card[person_id=" + person_id + "]").card("display_element");
}

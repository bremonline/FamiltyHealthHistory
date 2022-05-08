// This is the Family Health History Card Widget

(function ( $ ) {
  races = ["American Indian or Alaska Native", "Asian", "Black or African-American",
        "Native Hawaiian or Other Pacific Islander", "White"];
  ethnicities = ["Hispanic or Latino", "Not Hispanic or Latino", "Ashkenazi Jewish"];

  $.widget("fhh.card",{


    options: {
      data:[],
      view:"simple",
    },
    _display_element : function () {
      var d = this.options.data;
      if (this.options.view == "simple") this.element.text(d["name"]);
      else {
        var picture_box = get_picture_box(d);
        var name_height_weight_box = get_name_height_weight_box(d);
        var race_ethnicity_age_box = get_race_ethnicity_age_box(d);
        var edit_remove_box = get_edit_remove_box(d);

        this.element.empty()
          .append(picture_box)
          .append(name_height_weight_box)
          .append(race_ethnicity_age_box)
//          .append(edit_remove_box);
      }
    },
    _create: function() {
      this._display_element();
    },
    data: function (d) {
      this.options.data = d;
      this._display_element();
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

function get_picture_box(d) {
  var icon = "source/images/icon_male.png";
  gender = get_demographics_value(d,"gender");
  if (gender && gender == 'female' || gender == 'F') icon = "source/images/icon_female.png";
  var picture_box = $("<DIV><IMG src=" + icon + " height='64' alt='silhouette' /></DIV>");
  picture_box.css("display","inline-block");
  picture_box.css("text-align","center");

  var edit_image_element = $("<IMG class='edit' src='source/images/icon_pencil.gif' />");
  var trash_image_element = $("<IMG class='trash' src='source/images/icon_trash.gif' />");

  edit_image_element.click({data:d} , click_edit);
  edit_image_element.css("cursor","pointer");
  picture_box.append("<br/>").append(edit_image_element).append(trash_image_element);
  return picture_box;
}

function get_name_height_weight_box (d) {
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

  var box = $("<DIV><B>" + name + "</B><BR/>" + gender + "<BR/>"+ height_str + "<BR/>" + weight_str + "</DIV>");
  box.css("display","inline-block");
  box.css("flex-grow","3");
  return box;
}

function get_race_ethnicity_age_box(d) {
  var birthdate = get_demographics_value(d, "birthdate");
  var age = get_demographics_value(d, "age");
  var estimated_age = get_demographics_value(d, "estimated_age");

  var birthdate_age = "&nbsp;";
  if (birthdate) birthdate_age = birthdate;
  else if (age) birthdate_age = age + " years";
  else if (estimated_age) birthdate_age = estimated_age;
  else birthdate_age = "&nbsp;";

  var race = get_demographics_value(d, "race");
  if (!race) race = "&nbsp;"
  var ethnicity = get_demographics_value(d, "ethnicity");
  if (!ethnicity) ethnicity = "&nbsp;"

  var box = $("<DIV><br/>" + birthdate_age + "<BR/>" + race + "<BR/>"+ ethnicity + "</DIV>");
  box.css("display","inline-block");
  box.css("flex-grow","2");
  return box;

}

function get_edit_remove_box(d) {
  var edit_image_element = $("<IMG class='edit' src='source/images/icon_pencil.gif' />");
  var trash_image_element = $("<IMG class='trash' src='source/images/icon_trash.gif' />");

  edit_image_element.click({data:d} , click_edit);
  edit_image_element.css("cursor","pointer");

  var box = $("<DIV></DIV>");
  box.append(edit_image_element).append("<br/>").append(trash_image_element);
  box.css("display","inline-block");
  box.css("vertical-align", "center")
  box.css("flex-grow","1");
  box.css("text-align","right");
  box.css("padding","10px");
  return box;
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
          $( this ).dialog( "close" );
          d.remove();
        }
      }
    ]
  });
  var data = event.data.data;
  var race_list = event;
  console.log(race_list);

  var t = $("<TABLE>");

  set_full_name_in_dialog(data, t);
  set_gender_in_dialog(data, t);
  set_height_id_dialog(data, t);
  set_weight_in_dialog(data, t);
  set_age_in_dialog(data, t);
  set_race_in_dialog(data, t, race_list);

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
  var gender_input = $("<SELECT><OPTION></OPTION><OPTION>Unknown</OPTION><OPTION>Male</OPTION><OPTION>Female</OPTION></SELECT>");
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
    console.log(height_in_cm);
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
  var weight_units = $("<SELECT><OPTION></OPTION><OPTION>Pounds</OPTION><OPTION>Kilograms</OPTION></SELECT>");
  var weight_input_div = $("<DIV>").append(weight_input).append(" ").append(weight_units);

  if (weight_in_pounds) {
    weight_input.val(weight_in_pounds);
    weight_units.val("Pounds");
  } else if (weight_in_kilograms) {
    weight_input.val(weight_in_kilograms);
    weight_units.val("Kilograms");
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
  var race = [];
  if (data["demographics"] && data["demographics"]["race"]) race = data["demographics"]["race"];

  console.log(races);
  console.log(race);

  var race_label = $("<LABEL for='d_race'>Race</LABEL>");
  var race_input = $("<DIV style='font-size:x-small'>");


  jQuery.each( races, function( i, v ) {
    console.log(v);
    race_input.append(v + "<br/>")
  });

  t.append("<TR>")
    .append($("<TD>").append(race_label))
    .append($("<TD>").append(race_input));
}

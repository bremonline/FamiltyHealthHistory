// This is the Family Health History Card Widget

(function ( $ ) {

  $.widget("fhh.card",{

    options: {
      data:[],
      view:"simple"
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
          .append(edit_remove_box);
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
  return picture_box;
}

function get_name_height_weight_box (d) {
  var name = get_name(d);
  var gender = get_demographics_value(d, "gender");
  if (!gender) gender = "&nbsp;"
  var height = get_demographics_value(d, "height_in_inches");
  var height_str = "&nbsp;";
  if (height) height_str = Math.floor(height/12) + " feet " + (height%12)+ " inches";
  var weight = get_demographics_value(d, "weight_in_pounds");
  var weight_str = "&nbsp;";
  if (weight) weight_str = weight + " pounds";

  var box = $("<DIV><B>" + name + "</B><BR/>" + gender + "<BR/>"+ height_str + "<BR/>" + weight_str + "</DIV>");
  box.css("display","inline-block");
  box.css("flex-grow","3");
  return box;
}

function get_race_ethnicity_age_box(d) {
  var birthdate = get_demographics_value(d, "birthdate_in_MM/DD/YYYY");
  var age = get_demographics_value(d, "age_in_years");

  var birthdate_age = "&nbsp;";
  if (birthdate && age) birthdate_age = birthdate + " (" + age + " years)";
  else if (birthdate && !age) birthdate_age = birthdate;
  else if (!birthdate && age) birthdate_age = age + " years";
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
        }
      }, {
        text: "Submit", click: function() {
          $( this ).dialog( "close" );
        }
      }
    ]
  });
  var data = event.data.data;

  var t = $("<TABLE>");


  // Setting the Full Name in the Dialog
  var full_name = "";
  if (data["name"]) full_name = data["name"];
  var full_name_label = $("<LABEL for='d_fullname'>Full Name</LABEL>");
  var full_name_input = $("<INPUT type='text' id='d_fullname'></INPUT>");
  full_name_input.val(full_name);
  t.append("<TR>")
    .append($("<TD>").append(full_name_label))
    .append($("<TD>").append(full_name_input));

    // Setting the Gender pulldown in the dialog
  var gender = "";
  if (data["demographics"] && data["demographics"]["gender"]) gender = data["demographics"]["gender"];

  var gender_label = $("<LABEL for='d_gender'>Gender at Birth</LABEL>");
  var gender_input = $("<SELECT><OPTION></OPTION><OPTION>Unknown</OPTION><OPTION>Male</OPTION><OPTION>Female</OPTION></SELECT>");
  console.log(gender);
  gender_input.val(gender);
  t.append("<TR>")
    .append($("<TD>").append(gender_label))
    .append($("<TD>").append(gender_input));

    // Setting the height in the dialog
    var height_in_inches = "";
    if (data["demographics"] && data["demographics"]["height_in_inches"]) height_in_inches = data["demographics"]["height_in_inches"];
    var height_in_cm = "";
    if (data["demographics"] && data["demographics"]["height_in_cm"]) height_in_cm = data["demographics"]["height_in_cm"];
    var height_label = $("<LABEL for='d_height'>Height</LABEL>");

    var height_label = $("<LABEL for='d_height'>Height</LABEL>");
    var height_in_feet_inches = $("<DIV>")
    var feet_input = $("<INPUT type='text' id='d_feet' size='3'></INPUT>");
    var feet_label = $("<LABEL for='d_feet'> feet </LABEL>");
    var inches_input = $("<INPUT type='text' id='d_inches' size='3'></INPUT>");
    var inches_label = $("<LABEL for='d_inches'> inches </LABEL>");
    var height_in_feet_inches = $("<DIV>").append(feet_input).append(feet_label).append(inches_input).append(inches_label);

    var cm_input = $("<INPUT type='text' id='d_cm' size='5'></INPUT>");
    var cm_label = $("<LABEL for='d_cm'> cm </LABEL>");
    var height_in_cm = $("<DIV>").append(" - or - ").append(cm_input).append(cm_label);

    var height_input = $("<DIV>").append(height_in_feet_inches).append(height_in_cm);
    if (height_in_inches) {
      var feet = Math.floor(height_in_inches/12);
      var inches = height_in_inches % 12;
      feet_input.val(feet);
      inches_input.val(inches);
    }
    if (height_in_cm) {

    }
    t.append("<TR>")
      .append($("<TD>").append(height_label))
      .append($("<TD>").append(height_input));


  d.append(t);
}

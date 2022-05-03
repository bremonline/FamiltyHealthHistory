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
        this.element.empty().append(picture_box).append(name_height_weight_box).append(race_ethnicity_age_box);
      }
      this.element.css("border", "2px solid black");
      this.element.css("padding", "5px");
      this.element.css("vertical-align", "top");
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
  var picture_box = $("<SPAN><IMG src=" + icon + " height='64' alt='silhouette' /></SPAN>");
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

  var box = $("<SPAN><B>" + name + "</B><BR/>" + gender + "<BR/>"+ height_str + "<BR/>" + weight_str + "</SPAN>");
  box.css("display","inline-block");
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

  var box = $("<SPAN><br/>" + birthdate_age + "<BR/>" + race + "<BR/>"+ ethnicity + "</SPAN>");
  box.css("display","inline-block");
  return box;

}

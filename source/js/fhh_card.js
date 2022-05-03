// This is the Family Health History Card Widget

(function ( $ ) {

  $.widget("fhh.card",{

    options: {
      data:[],
      view:"simple"
    },

    _create: function() {
      console.log (this.options.data);
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

  });
}( jQuery ));

function get_picture_box(d) {
  var demographics = d["demographics"];
  var icon = "source/images/icon_male.png";
  if (demographics != null) {
    gender = demographics["gender"];
    if (gender != null && gender == 'female' || gender == 'F') icon = "source/images/icon_female.png";
  }
  var picture_box = $("<SPAN><IMG src=" + icon + " height='64' alt='silhouette' /></SPAN>");
  return picture_box;
}

function get_name_height_weight_box (d) {
  var name = get_name(d);
  var gender = get_gender(d);
  var height = get_height(d);
  var weight = get_weight(d);
  var box = $("<SPAN><B>" + name + "</B><BR/>" + gender + "<BR/>"+ height + "<BR/>" + weight + "</SPAN>");
  box.css("display","inline-block");
  return box;
}
function get_name(d) {
  var name = d["name"];
  if (name == null) return "Unknown";
  return name;
}
function get_gender (d) {
  var demographics = d["demographics"];
  if (demographics == null) return "&nbsp;";
  return demographics["gender"];

}
function get_height(d) {
  var demographics = d["demographics"];
  if (demographics == null) return "&nbsp;";
  var height = demographics["height_in_inches"];
  if (height == null) height = ""; else height += " inches";
  return height;
}
function get_weight(d) {
  var demographics = d["demographics"];
  if (demographics == null) return "&nbsp;";
  var weight = demographics["weight_in_pounds"];
  if (weight == null) weight = ""; else weight += " pounds";
  return weight;
}

function get_race_ethnicity_age_box(d) {
  var birthdate_age = get_birthdate_and_age(d);
  var race = get_race(d);
  var ethnicity = get_ethnicity(d);

  var demographics = d["demographics"];
  if (demographics == null) return "&nbsp;";

  var box = $("<SPAN><br/>" + birthdate_age + "<BR/>" + race + "<BR/>"+ ethnicity + "</SPAN>");
  box.css("display","inline-block");
  return box;

}
function get_birthdate_and_age(d) {
  var demographics = d["demographics"];
  if (demographics == null) return "&nbsp;";

  var birthdate = demographics["birthdate_in_MM/DD/YYYY"];
  var age = demographics["age_in_years"];
  var age_display;
  if (birthdate == null && age == null) age_display = "&nbsp;";
  else if (birthdate == null) age_display = age + "years";
  else if (age == null) age_display = birthdate;
  else age_display = birthdate + " (" + age + " years old)";

  return age_display;
}
function get_race(d) {
  var demographics = d["demographics"];
  if (demographics == null) return "&nbsp;";
  var race  = demographics["race"];
  if (race == null) race = "";
  return race;
}
function get_ethnicity(d) {
  var demographics = d["demographics"];
  if (demographics == null) return "&nbsp;";
  var ethnicity  = demographics["ethnicity"];
  if (ethnicity == null) ethnicity = "";
  return ethnicity;
}

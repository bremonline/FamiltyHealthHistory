
var data = [];

const unit = 50;
const space = 200;
const diagram_height = 1200;
const vertical = 200;
var offset;

(function ( $ ) {
$.widget("fhh.pedigree",{

    options: {
      data:[]
    },
    display: function () {

      var d = this.options.data;
      data = d;

      // The following sets the patners for all has_children
      find_and_set_partners();
      find_and_set_blood_relatives();

      // The following fake person is necessary to space the childless people correctly (each childless person needs a fake child)
      d["people"]["placeholder"] = {};
      d["people"]["placeholder"]["demographics"] = {};
      d["people"]["placeholder"]["demographics"]["gender"] = "Unknown";

      console.log(data);
      var proband_id = data["proband"];
      var father_id = data["people"][proband_id]["father"];
      var mother_id = data["people"][proband_id]["mother"];

      var paternal_grandfather_id = data["people"][father_id]["father"];
      var paternal_grandmother_id = data["people"][father_id]["mother"];
      var maternal_grandfather_id = data["people"][mother_id]["father"];
      var maternal_grandmother_id = data["people"][mother_id]["mother"];


      var dads_siblings = find_children(paternal_grandfather_id, father_id);
      var moms_siblings = find_children(maternal_grandfather_id, mother_id);
      var paternal_cousins = find_all_children_from_list(dads_siblings);
      var maternal_cousins = find_all_children_from_list(moms_siblings);
      var full_brothers = find_full_sons(father_id, mother_id, proband_id);
      var full_sisters = find_full_daughters(father_id, mother_id, proband_id);
      var brothers_children = find_all_children_from_list(full_brothers);
      var sisters_children = find_all_children_from_list(full_sisters);
      var sons = find_sons_from_one_parent(proband_id);
      var daughters = find_daughters_from_one_parent(proband_id);
      var paternal_cousins_children = find_all_children_from_list(paternal_cousins);
      var maternal_cousins_children = find_all_children_from_list(maternal_cousins);
      var sons_children = find_all_children_from_list(sons);
      var daughters_children = find_all_children_from_list(daughters);

// Now, Starting at the bottom, set the Pedigree Location for each couple

      set_location_grandchildren_generation(sons_children, daughters_children);
      set_location_children_generation(paternal_cousins_children, brothers_children, sons, daughters, sisters_children, maternal_cousins_children, );
      set_location_proband_generation(paternal_cousins, full_brothers, proband_id, full_sisters, maternal_cousins);
      set_location_parents_generation(dads_siblings, father_id, mother_id, moms_siblings);
      set_location_grandparents_generation(paternal_grandfather_id, paternal_grandmother_id, maternal_grandfather_id, maternal_grandmother_id);


//      var proband_row = build_row();

      var min_index_left = 0;
      var max_index_right = 0;
      $.each(data["people"], function (person, details) {
        if (details && details["pedigree"] && details["pedigree"]["location"] < min_index_left) min_index_left = details["pedigree"]["location"];
        if (details && details["pedigree"] && details["pedigree"]["location"] > max_index_right) max_index_right = details["pedigree"]["location"];
      });
      max_index_right++;

      console.log(min_index_left + "," + max_index_right);

      var all_blood_relatives = [];

      all_blood_relatives = all_blood_relatives.concat(sons_children, daughters_children);
      all_blood_relatives = all_blood_relatives.concat(paternal_cousins_children, brothers_children, sons, daughters, sisters_children, maternal_cousins_children,);
      all_blood_relatives = all_blood_relatives.concat(paternal_cousins, full_brothers, full_sisters, maternal_cousins);
      all_blood_relatives = all_blood_relatives.concat(dads_siblings,moms_siblings);
      all_blood_relatives.push(proband_id);
      all_blood_relatives.push(father_id);
      all_blood_relatives.push(paternal_grandfather_id, maternal_grandfather_id);

      var patriarchs = [paternal_grandfather_id, maternal_grandfather_id];
      $.each(data['people'], function (person_id, details) {
        var generation = get_generation_of_relative(person_id, patriarchs);
        if (details['blood']) details["gen"] = generation;
      });

//      $.each(data['people'], function (person_id, details) {
//        if (details['blood']) console.log (person_id + "(" + details['name'] + "):" + details['gen'])
//      });

      console.log(data);

//      console.log(all_blood_relatives);
      display_svg(-min_index_left, all_blood_relatives, max_index_right);

    },
    _create: function() {

    },
    data: function (d) {
      this.options.data = d;
    },
    person_id: function(p_id) {
      this.options.person_id = p_id;
    },
    relationship: function(relationship) {
      this.options.relationship = relationship;
    }
  });
}( jQuery ));


function display_svg(left_side, all_blood_relatives, right_side) {
  const diagram_width = (left_side + 1 + right_side) * space;
  offset = (left_side + 1);

  var diagram = $("#fhh_pedigree");
  var svg = $(createSvg("svg"))
    .attr('width', diagram_width)
    .attr('height', diagram_height);
  diagram.empty().append(svg);

  var already_part_of_couple = [];

  $.each(all_blood_relatives, function (index, person) {
    if (already_part_of_couple.indexOf(person) === -1) {
      var couple;
      if (data['people'][person] && data['people'][person]['partners'] && data['people'][person]['partners'][0]) {
        var partner_id=data['people'][person]['partners'][0];
//        console.log ("Making Couple:"+ data['people'][person]['name'] + " " + data['people'][partner_id]['name']);
        couple = make_couple(person, partner_id);
      } else {
//        console.log ("Making Single:" + " " + data['people'][person]['name']);
        couple = make_couple(person);
      }
      draw_couple(svg, couple, offset);
      already_part_of_couple.push(person);
    }
  });
  draw_proband_arrow(svg, offset);
}

function make_couple (first_person, second_person = null) {
  var pedigree = data['people'][first_person]['pedigree'];

  var couple = {"male":null, "female":null, "pedigree":pedigree};

  if (!second_person) {
    if (data["people"][first_person]["demographics"]["gender"] == "Male") {
      couple['male'] = first_person;
    } else {
      // Note: Unknown will occupied female spot
      couple['female'] = first_person;
    }
  } else {
    if (data["people"][first_person]["demographics"]["gender"] == "Male") {
      couple['male'] = first_person;
      couple['female'] = second_person;
    } else {
      couple['male'] = second_person;
      couple['female'] = first_person;
    }
  }
  return couple;
}

function draw_couple(svg, couple) {
  // Do not draw the "placeholder" id, it is there to line up childless people

  var male_id = couple["male"];
  var female_id = couple["female"];
  if (female_id == "placeholder") return;

  if (male_id == null && does_person_have_children(female_id)) {
    male_id = "Unknown";
  }
  if (female_id == null && does_person_have_children(male_id)) {
    female_id = "Unknown";
  }


  var proband_id = data["proband"];

//  console.log(couple);
  var location = couple["pedigree"]["location"];
  var generation = couple["pedigree"]["generation"];

  if (male_id) {
    draw_male (svg, male_id, location, generation);
    if (data["people"][male_id]) {
      var name = data["people"][male_id]["name"];
      draw_name (svg, name, location, generation, true);
      connect_to_parent(svg, male_id, "Male", offset, generation, location);
    }
  }

  if (female_id) {
    if (data["people"][female_id] && data["people"][female_id]['demographics'] && data["people"][female_id]['demographics']['gender'] == "Female") {
      draw_female (svg, female_id, location, generation);
    } else {
      draw_unknown (svg, female_id, location, generation);
    }
    var name = "";
    if (data["people"][female_id] && data["people"][female_id]["name"]) name = data["people"][female_id]["name"];
    draw_name (svg, name, location, generation, false);
    connect_to_parent(svg, female_id, "Female", offset, generation, location);
  }

  if (male_id && female_id) {
    draw_link (svg, location, generation)
  }
}


function draw_name (svg, name, location, generation, male=true) {
  var x = (offset+location)*space;
  var y = generation*vertical;
  if (!male) x = ((offset+location)*space)+2*unit;

  var name_text = $(createSvg("text"))
    .attr("x", x).attr("y", y+40)
    .attr("font-family", "arial")
    .attr("font-size", "12")
    .attr("text-anchor", "middle")
    .append(name);
  svg.append(name_text);
}

function draw_male(svg, id, location, generation) {

  var x = (offset+location)*space;
  var y = generation*vertical;
  var color = "yellow";
  if (id == "Unknown") color = "white";
  var has_parent = false;
  if (data["people"][id] && data["people"][id]["father"]) has_parent = true;
  if (data["people"][id] && data["people"][id]["mother"]) has_parent = true;

  if (data["people"][id] && data["people"][id]['partners']) color = 'grey';
  if (data["people"][id] && data["people"][id]["blood"]) color = "yellow";

  var rect = $(createSvg("rect"))
    .attr("id",id)
    .attr("x",x-unit/2).attr("y",y-unit/2)
    .attr("height",unit).attr("width",unit)
    .attr("stroke","black")
    .attr("fill",color);
  svg.append(rect);
  if (id && id != "Unknown" && has_parent) {
    var line = $(createSvg("line"))
      .attr("x1",x).attr("y1",y-unit/2)
      .attr("x2",x).attr("y2",y-unit)
      .attr("stroke","black");
    svg.append(line);
  }
  rect.on("click", function (e) { sayHi(e)});

}

// Functions to help with drawing
function draw_female(svg, id, location, generation) {
  var x = ((offset+location)*space)+2*unit;
  var y = generation*vertical;


  var color = "yellow";
  if (id == "Unknown") color = "white";
  var has_parent = false;
  if (data["people"][id] && data["people"][id]["father"]) has_parent = true;
  if (data["people"][id] && data["people"][id]["mother"]) has_parent = true;

  if (data["people"][id] && data["people"][id]['partners']) color = 'grey';
  if (data["people"][id] && data["people"][id]["blood"]) color = "yellow";

  var circle = $(createSvg("circle"))
    .attr("id",id)
    .attr("cx",x).attr("cy",y)
    .attr("r",unit/2)
    .attr("stroke","black")
    .attr("fill",color);
  svg.append(circle);
  circle.on("click", function (e) { sayHi(e)});
  if (id && id != "Unknown" && has_parent) {
    var line = $(createSvg("line"))
      .attr("x1",x).attr("y1",y-unit/2)
      .attr("x2",x).attr("y2",y-unit)
      .attr("stroke","black");
    svg.append(line);
  }
}

function draw_unknown(svg, id, location, generation) {
  var x = ((offset+location)*space)+2*unit;
  var y = generation*vertical;

  var color = "yellow";
  if (id == "Unknown") color = "white";
  var has_parent = false;
  if (data["people"][id] && data["people"][id]["father"]) has_parent = true;
  if (data["people"][id] && data["people"][id]["mother"]) has_parent = true;

  var points = "";
  points += (x) + "," + (y-unit/2) + " ";
  points += (x+unit/2) + "," + (y) + " ";
  points += (x) + "," + (y + unit/2) + " ";
  points += (x-unit/2) + "," + (y);

  var polygon = $(createSvg("polygon"))
    .attr("id",id)
    .attr("points", points)
    .attr("stroke","black")
    .attr("fill",color);
  svg.append(polygon);
  polygon.on("click", function (e) { sayHi(e)});
  if (id && id != "Unknown" && has_parent) {
    var line = $(createSvg("line"))
      .attr("x1",x).attr("y1",y-unit/2)
      .attr("x2",x).attr("y2",y-unit)
      .attr("stroke","black");
    svg.append(line);
  }
}

function draw_link(svg, location, generation) {
  var x = (offset+location)*space+unit;
  var y = generation*vertical;

  var x1 = x - unit/2;
  var x2 = x + unit/2;
  var y1 = y;
  var y2 = y;


  var line = $(createSvg("line"))
    .attr("x1",x1).attr("y1",y1)
    .attr("x2",x2).attr("y2",y2)
    .attr("stroke","black");
  svg.append(line);
  var line = $(createSvg("line"))
    .attr("x1",x).attr("y1",y)
    .attr("x2",x).attr("y2",y+space-unit)
    .attr("stroke","black");
  svg.append(line);

}

function draw_connector(svg, x1, y1, x2, y2) {
  var line = $(createSvg("line"))
    .attr("x1",x1).attr("y1",y1)
    .attr("x2",x2).attr("y2",y2)
    .attr("stroke","black");
  svg.append(line);

}

function connect_to_parent(svg, id, gender, offset, generation, location) {
  // Protects against the non-real people
  if (!data["people"][id]) return;

  if (gender == "Male") gender_offset = 0;
  else gender_offset = 2*unit;

  var paternal_pedigree = {};
  var father_id = data["people"][id]["father"];
  var mother_id = data["people"][id]["mother"];
  if (father_id || mother_id) {
    if (father_id && data['people'][father_id]['pedigree']) paternal_pedigree = data['people'][father_id]['pedigree'];
    else if (mother_id && data['people'][mother_id]['pedigree']) paternal_pedigree = data['people'][mother_id]['pedigree'];

    if (paternal_pedigree) {
      var paternal_parent_location = paternal_pedigree["location"];
      draw_connector(svg, (location+offset)*space+gender_offset, generation*vertical-unit,
                          (paternal_parent_location+offset)*space+unit,generation*vertical-unit);
    }
  }
}
function draw_proband_arrow (svg, offset) {

  var proband_center_y = vertical * 3; // Always 3rd generation
  var proband_center_x = offset * space;

  var points = "";

  var proband_id = data["proband"];
  var gender = data["people"][proband_id]["demographics"]["gender"];
  if (gender == "Male") {
    points += (proband_center_x - unit/2) + "," + (proband_center_y) + " ";
    points += (proband_center_x-unit/2-unit/4) + "," + (proband_center_y-unit/8) + " ";
    points += (proband_center_x-unit/2-unit/4) + "," + (proband_center_y+unit/8);
    x1 = (proband_center_x - unit/2);
    x2 = (proband_center_x - unit);
  } else {
    points += (proband_center_x + 2*unit + unit/2) + "," + (proband_center_y) + " ";
    points += (proband_center_x + 2*unit + unit/2+unit/4) + "," + (proband_center_y-unit/8) + " ";
    points += (proband_center_x + 2*unit + unit/2+unit/4) + "," + (proband_center_y+unit/8);

//    points += (proband_center_x + unit*2+unit/2) + "," + (proband_center_y+unit/4) + " ";
//    points += (proband_center_x + unit*2+unit/2+unit/4) + "," + (proband_center_y+unit/4) + " ";
//    points += (proband_center_x + unit*2+unit/2) + "," + (proband_center_y+unit/2);
    x1 = (proband_center_x + 3*unit);
    x2 = (proband_center_x + 2*unit + unit/2);
  }

  console.log(points);
  var polygon = $(createSvg("polygon"))
    .attr("points", points)
    .attr("stroke","black")
    .attr("fill","black");
  svg.append(polygon);

  var line = $(createSvg("line"))
    .attr("x1",x1).attr("y1",proband_center_y)
    .attr("x2",x2).attr("y2",proband_center_y)
    .attr("stroke","black");
  svg.append(line);

}
///////////////////////////////////////////////////////////////////////////////

function find_last_child_pedigree(parent_id) {
  var children = find_children(parent_id);
  var num_children = children.length;
  if (num_children && num_children > 0) {
    var pedigree = data["people"][children[num_children-1]]["pedigree"];
    return pedigree;
  } else {
    return 0;
  }
}

// Sometimes we need to find siblings, in which case we want to remove the person_being_checked
function find_children(parent_id, exception_id) {
  var children = [];
  $.each(data['people'], function(person_id, details){
    if (details['father'] == parent_id || details['mother'] == parent_id) {
      if (person_id != exception_id) children.push(person_id);
    }
  });
  return children;
}

function find_sons_from_one_parent(parent_id, exception_id) {
  var children = [];
  $.each(data['people'], function(person_id, details){
    if (details['father'] == parent_id || details['mother'] == parent_id) {
      if (data["people"][person_id] && data["people"][person_id]["demographics"]["gender"] == "Male" && person_id != exception_id) children.push(person_id);
    }
  });
  return children;
}

function find_full_sons(father_id, mother_id, exception_id) {
  var children = [];
  $.each(data['people'], function(person_id, details){
    if (details['father'] == father_id && details['mother'] == mother_id) {
      if (data["people"][person_id] && data["people"][person_id]["demographics"]["gender"] == "Male" && person_id != exception_id ) children.push(person_id);
    }
  });
  return children;
}

function find_daughters_from_one_parent(parent_id, exception_id) {
  var children = [];
  $.each(data['people'], function(person_id, details){
    if (details['father'] == parent_id || details['mother'] == parent_id) {
      if (data["people"][person_id] && data["people"][person_id]["demographics"]["gender"] == "Female" && person_id != exception_id) children.push(person_id);
    }
  });
  return children;
}

function find_full_daughters(father_id, mother_id, exception_id) {
  var children = [];
  $.each(data['people'], function(person_id, details){
    if (details['father'] == father_id && details['mother'] == mother_id) {
      if (data["people"][person_id] && data["people"][person_id]["demographics"]["gender"] == "Female" && person_id != exception_id) children.push(person_id);
    }
  });
  return children;
}

function find_all_children_from_list(list) {
  var children = [];

  // Note: go through list twice, first time is all people with children, then again to ensure the list will have all parents
  $.each(list, function (index, person) {
    var c = find_children(person);
    if (c.length > 0) children = children.concat(c);
    else children.push("placeholder");
  });

  return children;
}

function does_person_have_children(potential_parent_id) {
  var has_children = false;
  $.each(data['people'], function(person_id, details){
    if (details['father'] == potential_parent_id || details['mother'] == potential_parent_id) {
      has_children = true;
    }
  });
  return has_children;
}

function find_and_set_partners() {
  $.each(data['people'], function(person_id, details){
    if (details['father'] && details['mother']) {
      var father_id = details['father'];
      var mother_id = details['mother'];

      if (!data['people'][father_id]['partners']) {
        data['people'][father_id]['partners'] = [ mother_id ];
      } else if (data['people'][father_id]['partners'].indexOf(mother_id) === -1) {
        data['people'][father_id]['partners'].push(mother_id);
      }

      if (!data['people'][mother_id]['partners']) {
        data['people'][mother_id]['partners'] = [ father_id ];
      } else if (data['people'][mother_id]['partners'].indexOf(father_id) === -1) {
        data['people'][mother_id]['partners'].push(father_id);
      }
    }
  });
}

function find_and_set_blood_relatives() {
  // Blood Relative shares paternal or maternal maternal_grandfather_id
  var proband_id = data["proband"];
  var father_id = data["people"][proband_id]["father"];
  var mother_id = data["people"][proband_id]["mother"];

  var paternal_grandfather_id = data["people"][father_id]["father"];
  var paternal_grandmother_id = data["people"][father_id]["mother"];
  var maternal_grandfather_id = data["people"][mother_id]["father"];
  var maternal_grandmother_id = data["people"][mother_id]["mother"];

  set_blood_and_check_children(paternal_grandfather_id);
  set_blood_and_check_children(maternal_grandfather_id);

  data["people"][paternal_grandmother_id]["blood"] = true;
  data["people"][maternal_grandmother_id]["blood"] = true;

}

function set_blood_and_check_children(id) {
  data['people'][id]['blood'] = true;

  var children = find_children(id);
  $.each(children, function(index, child){
    set_blood_and_check_children(child);
  });
}

///  Locations in the Peigree Functions

// This generation has no children so spacing is easy, left of center are sons_children, right is daughters_children,
// should be possible to add brothers and sisters grandchildren

// Below is a recursive function to determine which generation the person is in.
// patriarchs is a list of all the males from the first generation (grandparents?)
function get_generation_of_relative(person_id, patriarchs, generation = 1) {
  var father_id = data['people'][person_id]["father"];
  var mother_id = data['people'][person_id]["mother"];
  if (data['people'][father_id] && data['people'][father_id]['father']) generation = get_generation_of_relative(father_id, patriarchs, generation);
  else if (data['people'][mother_id] && data['people'][mother_id]['father']) generation = get_generation_of_relative(mother_id, patriarchs, generation);
  if (!father_id && !mother_id) return generation;
  else return generation + 1;
}

function set_relatives_location(relatives) {
  $.each(relatives, function(index, person_id) {
    var child_pedigree = find_last_child_pedigree(person_id);
    var num_children = find_children(person_id).length;
    data["people"][person_id]["pedigree"] = [];
    data["people"][person_id]["pedigree"]["generation"] = 3;
    if (child_pedigree) {
      data["people"][person_id]["pedigree"]["location"] = child_pedigree["location"] + 1;
      index_left = child_pedigree["location"];
    } else {
      index_left = index_left - 1;
      data["people"][person_id]["pedigree"]["location"] = index_left;
    }

  });
}

function set_location_grandchildren_generation(sons_children, daughters_children) {
  index_left = set_location_general(sons_children, -1, -1, 5);
  index_right = set_location_general(daughters_children, +1, 1, 5);
}

function set_location_children_generation(paternal_cousins_children, brothers_children, sons, daughters, sisters_children, maternal_cousins_children) {
  // Start towards center heading out with sons, then brothers children evenly follow
  var index_left = -1;
  var index_right = 1;

  index_left = set_location_general(sons, -1, index_left, 4);
  index_left = set_location_general(brothers_children, -1, index_left, 4);
  index_left = set_location_general(paternal_cousins_children, -1, index_left, 4);

  index_right = set_location_general(daughters, +1, index_right, 4);
  index_right = set_location_general(sisters_children, +1, index_right, 4);
  index_right = set_location_general(maternal_cousins_children, +1, index_right, 4);

}

function set_location_proband_generation(paternal_cousins, full_brothers, proband_id, full_sisters, maternal_cousins) {
  var index_left = 0;
  var index_right = 1;

  data["people"][proband_id]["pedigree"] = {"location":0,"generation":3};

  var index_left = set_location_general(full_brothers, -1, 0, 3);
  set_location_general(paternal_cousins, -1, index_left, 3);
  var index_right = set_location_general(full_sisters, +1, 1, 3);
  set_location_general(maternal_cousins, +1, index_right, 3);

}

function set_location_parents_generation(dads_siblings, father_id, mother_id, moms_siblings) {
  var index_left = 0;
  var index_right = 1;

  data["people"][father_id]["pedigree"] = {"location":0,"generation":2};
  data["people"][mother_id]["pedigree"] = {"location":0,"generation":2};

  set_location_general(dads_siblings, -1, 0, 2);
  set_location_general(moms_siblings, +1, 1, 2);
}

function set_location_grandparents_generation(paternal_grandfather_id, paternal_grandmother_id, maternal_grandfather_id, maternal_grandmother_id) {
  data["people"][paternal_grandfather_id]["pedigree"] = {"location":-1,"generation":1};
  data["people"][paternal_grandmother_id]["pedigree"] = {"location":-1,"generation":1};
  data["people"][maternal_grandfather_id]["pedigree"] = {"location":1,"generation":1};
  data["people"][maternal_grandmother_id]["pedigree"] = {"location":1,"generation":1};;
}

function set_location_great_grandparents_generation() {
  var proband_id = data["proband"];
  var father_id = data["people"][proband_id]["father"];
  var mother_id = data["people"][proband_id]["mother"];

  var pp = data["people"][father_id]["father"];
  var pm = data["people"][father_id]["mother"];
  var mp = data["people"][mother_id]["father"];
  var mm = data["people"][mother_id]["mother"];

  var great_grandparents = {};
  if (data["people"][pp]["father"]) great_grandparents['ppp'] = data["people"][pp]["father"];
  if (data["people"][pp]["mother"]) great_grandparents['ppm'] = data["people"][pp]["mother"];
  if (data["people"][pm]["father"]) great_grandparents['pmp'] = data["people"][pm]["father"];
  if (data["people"][pm]["mother"]) great_grandparents['pmm'] = data["people"][pm]["mother"];

  if (data["people"][mp]["father"]) great_grandparents['mpp'] = data["people"][mp]["father"];
  if (data["people"][mp]["mother"]) great_grandparents['mpm'] = data["people"][mp]["mother"];
  if (data["people"][mm]["father"]) great_grandparents['mmp'] = data["people"][mm]["father"];
  if (data["people"][mm]["mother"]) great_grandparents['mmm'] = data["people"][mm]["mother"];

  if (great_grandparents.length > 0) {
    if (data['people'][great_grandparents['ppp']]) data['people'][great_grandparents['ppp']]['pedigree'] = {'location':-2, 'generation':0};
  }


}

function set_location_general(group, direction, starting_index, generation) {
  var location_index = starting_index;

  $.each(group, function(index, person_id){
    var child_pedigree = find_last_child_pedigree(person_id);
    var num_children = find_children(person_id).length;
    data["people"][person_id]["pedigree"] = {};
    data["people"][person_id]["pedigree"]["generation"] = generation;
    if (child_pedigree  && child_pedigree["location"]) {
      data["people"][person_id]["pedigree"]["location"] = child_pedigree["location"];
      location_index = child_pedigree["location"] + direction;
    } else {
      location_index = location_index + direction;
      data["people"][person_id]["pedigree"]["location"] = location_index;
    }
  });
  return location_index;
}

// Below function needed for svg to work.
function createSvg(tagName) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
}
function sayHi(e) {
  var id = e.target.attributes.id.value;
  alert(id + "\n" + JSON.stringify(data["people"][id], null, 2));
}

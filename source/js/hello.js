$(document).ready(function() {
  // executes when HTML-Document is loaded and DOM is ready
  alert("document is ready");

  $.getJSON( "sampledata/lawrence_brem.json", function (data) {
    alert("json is read");
    console.log(data);
  });

  
});

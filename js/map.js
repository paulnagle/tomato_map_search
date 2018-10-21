const tomato_map_search = function($) {
  "use strict";

  var DEBUG = true;
  // Dont forget to comment all of this
  var map = null;
  var circle = null;
  var markerClusterer = null;
  var myLatLng = new L.latLng(53.341318, -6.270205); // Irish Service Office
  var searchZoom = 10; // default to 10
  var meeting_formats = [];
  var jsonQuery;

  var sunCount = 0;
  var monCount = 0;
  var tueCount = 0;
  var wedCount = 0;
  var thuCount = 0;
  var friCount = 0;
  var satCount = 0;

  var sunExpandLi = "";
  var monExpandLi = "";
  var tueExpandLi = "";
  var wedExpandLi = "";
  var thuExpandLi = "";
  var friExpandLi = "";
  var satExpandLi = "";

  var openTable = "<div class='table-responsive'>";
  openTable    += " <table class='table table-bordered table-striped display'>";
  openTable    += "  <thead>";
  openTable    += "   <tr>";
  openTable    += "    <th>Name</th>";
  openTable    += "    <th>Time</th>";
  openTable    += "    <th>Location</th>";
  openTable    += "    <th>Format</th>";
  openTable    += "    <th>Directions</th>";
  openTable    += "   </tr>";
  openTable    += "  </thead>";
  openTable    += "  <tbody>";

  var closeTable = "  </tbody></table></div></div>";

  var naIcon = L.MakiMarkers.icon({
    icon: "marker",
    color: "#f00",
    size: "l"
  });

  var get_unique_id = function() {
    return '_' + Math.random().toString(36).substr(2, 9);
  };

  var isEmpty = function(object) {
    for (var i in object) {
      return true;
    }
    return false;
  }

  // This function creates a new map, then runs a new search.
  var newMap = function() {
    DEBUG && console && console.log("Running newMap()");
    map = L.map('map-canvas', {
      minZoom: 7,
      maxZoom: 17,
      detectRetina: true
    });
    map.spin(true);

    map.on('load', function(e) { // Fired when the map is initialized (when its center and zoom are set for the first time)

      map.on('moveend', function(e) {
        DEBUG && console && console.log("****map moveend event**** : ", e);
        runSearch();
      });

      DEBUG && console && console.log("****map load event**** : ", e);
      runSearch();
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.setView(myLatLng, 9);
    L.control.locate().addTo(map);
    map.spin(false);
  }

  // This function converts a number to a day of the week
  var dayOfWeekAsString = function(dayIndex) {
    return ["not a day?", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
  }

  var getMapCornerDistance = function() {
    var mapCornerDistance = (map.distance(map.getBounds().getNorthEast(), map.getBounds().getSouthWest()) / 1000) / 2;
    DEBUG && console && console.log("mapCornerDistance : ", mapCornerDistance);

    return mapCornerDistance;
  }

  // This function generates the URL to query the BMLT based on the settings in the Settings Panel
  var buildSearchURL = function() {
    var search_url = "https://tomato.na-bmlt.org/main_server/client_interface/json/";
    search_url += "?switcher=GetSearchResults";
    search_url += "&geo_width_km=" + getMapCornerDistance();
    search_url += "&long_val=" + map.getCenter().lng;
    search_url += "&lat_val=" + map.getCenter().lat;
    search_url += "&sort_key=sort_results_by_distance";
    search_url += "&data_field_key=meeting_name,weekday_tinyint,start_time,location_text,location_street,location_info,distance_in_km,latitude,longitude,formats";
    search_url += "&get_used_formats";
    search_url += "&callingApp=tomato_map_search";

    DEBUG && console && console.log("Search URL = " + search_url);

    return search_url;
  }

  var isMeetingOnMap = function(meeting) {
    var thisMeetingLocation =  new L.LatLng(meeting.latitude, meeting.longitude);
    if (map.getBounds().contains(thisMeetingLocation)) {
//      DEBUG && console && console.log("This meeting is on the map");
      return true;
    } else {
//      DEBUG && console && console.log("NOT on the map");
      return false;
    }
  }

  var processSingleJSONMeetingResult = function(val) {
    if (isMeetingOnMap(val)) {

      var resultID = get_unique_id();

      var markerContent = "<h4>" + val.meeting_name + "</h4>";
      markerContent += "<i>" + dayOfWeekAsString(val.weekday_tinyint)
      markerContent += "&nbsp;" + val.start_time.substring(0, 5) + "</i><br />";
      markerContent +=  val.location_text + "<br />" + val.location_street + "<br />";
      markerContent += "<i>" + val.location_info + "</i><br />";
      markerContent += '<a href="http://maps.google.com/maps?';
      markerContent += '&daddr='
      markerContent += val.latitude + ',' + val.longitude;
      markerContent += '"  target="_blank">Directions</a>';

      var listContent = "<tr  id='" + resultID + "' >";
      listContent += "<td>" + val.meeting_name + "</td>";
      listContent += "<td>" + dayOfWeekAsString(val.weekday_tinyint)
      listContent += "&nbsp;" + val.start_time.substring(0, 5) + "</td>";
      listContent += "<td>" + val.location_text + "&nbsp;" + val.location_street + "<br>";
      listContent += "<i>" + val.location_info + "</i></td>";
      listContent += "<td>" + val.formats + "</td>";
      listContent += '<td><a href="http://maps.google.com/maps?daddr=';
      listContent += val.latitude + ',' + val.longitude;
      listContent += '"  target="_blank">Directions </a></li></td>';
      listContent += "</tr>";

      switch (val.weekday_tinyint) {
        case "1":
          sunCount++;
          sunExpandLi = sunExpandLi + listContent;
          break;
        case "2":
          monCount++;
          monExpandLi = monExpandLi + listContent;
          break;
        case "3":
          tueCount++;
          tueExpandLi = tueExpandLi + listContent;
          break;
        case "4":
          wedCount++;
          wedExpandLi = wedExpandLi + listContent;
          break;
        case "5":
          thuCount++;
          thuExpandLi = thuExpandLi + listContent;
          break;
        case "6":
          friCount++;
          friExpandLi = friExpandLi + listContent;
          break;
        case "7":
          satCount++;
          satExpandLi = satExpandLi + listContent;
          break;
      }

      // Add markers to the markerClusterer Layer
      var aMarker = L.marker([val.latitude, val.longitude], {
        icon: naIcon
      });
      aMarker.unique_id = resultID;
      aMarker.dayOfWeek = val.weekday_tinyint;
      aMarker.bindPopup(markerContent, {
        autoPan: false,
        className: 'custom-popup'
      });
      aMarker.on("click", highlightMeeting);
      markerClusterer.addLayer(aMarker);
    }
  }

  var highlightMeeting = function(e) {
    var nav_link;

    switch (e.target.dayOfWeek) {
      case "1":
        $("#myTab li:eq(0) a").tab('show');
        break;
      case "2":
        $("#myTab li:eq(1) a").tab('show');
        break;
      case "3":
        $("#myTab li:eq(2) a").tab('show');
        break;
      case "4":
        $("#myTab li:eq(3) a").tab('show');
        break;
      case "5":
        $("#myTab li:eq(4) a").tab('show');
        break;
      case "6":
        $("#myTab li:eq(5) a").tab('show');
        break
      case "7":
        $("#myTab li:eq(6) a").tab('show');
        break;
    }
    $("tr").removeClass("table-primary");
    $("#" + e.target.unique_id).addClass("table-primary");
  }

  // This function runs the query to the BMLT and displays the results on the map
  var runSearch = function() {
    DEBUG && console && console.log("**** runSearch()****");

    if (jsonQuery) {
      DEBUG && console && console.log("*ABORTING OLD QUERY");
      map.spin(false);
      jsonQuery.abort();
    }

    if (markerClusterer) {
      map.removeLayer(markerClusterer);
    }

    if (map) {
      map.spin(true);
    }

    sunCount = monCount = tueCount = wedCount = thuCount = friCount = satCount = 0;
    sunExpandLi = monExpandLi = tueExpandLi = wedExpandLi = thuExpandLi = friExpandLi = satExpandLi = "";

    meeting_formats = [];

    var search_url = buildSearchURL();

    jsonQuery = $.getJSON(search_url, function(data) {
      DEBUG && console && console.log("**** runSearch() -> getJSON");

      $("#list-results").empty();

      markerClusterer = new L.markerClusterGroup({
        showCoverageOnHover: false,
        removeOutsideVisibleBounds: false
      });

      if (!jQuery.isEmptyObject(data.meetings)) {
        DEBUG && console && console.log("**** Some meetings were returned ****");
      //  DEBUG && console && console.log(JSON.stringify(data.meetings));

        $.each(data.meetings, function(key, val) {
          processSingleJSONMeetingResult(val);
        });
      } else {
        DEBUG && console && console.log("**** No meetings were returned ****");
      }

      var result = "<div class='tab-content' id='myTabContent'>";

      result += "<div id='sunday' class='tab-pane fade show active' role='tabpanel' aria-labelledby='sunday-tab'>";
      result += openTable;
      result += sunExpandLi;
      result += closeTable;

      result += "  <div id='monday' class='tab-pane fade' role='tabpanel' aria-labelledby='monday-tab'>";
      result += openTable;
      result += monExpandLi;
      result += closeTable;

      result += "  <div id='tuesday' class='tab-pane fade' role='tabpanel' aria-labelledby='tuesday-tab'>";
      result += openTable;
      result += tueExpandLi;
      result += closeTable;

      result += "  <div id='wednesday' class='tab-pane fade' role='tabpanel' aria-labelledby='wednesday-tab'>";
      result += openTable;
      result += wedExpandLi;
      result += closeTable;

      result += "  <div id='thursday' class='tab-pane fade' role='tabpanel' aria-labelledby='thursday-tab'>";
      result += openTable;
      result += thuExpandLi;
      result += closeTable;

      result += "  <div id='friday' class='tab-pane fade' role='tabpanel' aria-labelledby='friday-tab'>";
      result += openTable;
      result += friExpandLi;
      result += closeTable;

      result += "  <div id='saturday' class='tab-pane fade' role='tabpanel' aria-labelledby='saturday-tab'>";
      result += openTable;
      result += satExpandLi;
      result += closeTable;

      result += "</div>";
      document.getElementById("list_result").innerHTML = result;
      document.getElementById("sunday-badge").innerHTML = sunCount;
      document.getElementById("monday-badge").innerHTML = monCount;
      document.getElementById("tuesday-badge").innerHTML = tueCount;
      document.getElementById("wednesday-badge").innerHTML = wedCount;
      document.getElementById("thursday-badge").innerHTML = thuCount;
      document.getElementById("friday-badge").innerHTML = friCount;
      document.getElementById("saturday-badge").innerHTML = satCount;

      map.addLayer(markerClusterer);
      map.spin(false);
    });
  }

  // Expose one public method to be called from the html page
  return {
    doIt: function() {
      newMap();
    }
  };
}(jQuery);

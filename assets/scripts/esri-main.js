// This file includes Esri Map API calls using API v3.27
// Features Used:
//     == Create a map: https://developers.arcgis.com/javascript/3/jssamples/map_simple.html
//     == Add Home Button: https://developers.arcgis.com/javascript/3/jssamples/widget_home.html
//     == For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
//     == Find current user's location: https://developers.arcgis.com/javascript/3/jssamples/widget_locate.html
//     == Create Simple Markup: https://developers.arcgis.com/javascript/3/jssamples/graphics_svg_path.html

var esriMap, openStreetMapLayer;
// Abu Dhabi Coordinates
var mapCenterCoordinates = [54.366669, 24.466667];
var allBusesStops = [];
var allBusLines = [];
var iconPath = "M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z";

require(["esri/map", "esri/symbols/SimpleMarkerSymbol", "esri/graphic", "esri/layers/OpenStreetMapLayer",
    "dojo/_base/array", "dojo/dom-style",
    "esri/dijit/HomeButton", "esri/dijit/LocateButton", "dojo/domReady!"
], function (Map, SimpleMarkerSymbol, Graphic, OpenStreetMapLayer, arrayUtils, domStyle, HomeButton, LocateButton) {
    esriMap = new Map("map", {
        basemap: "osm",
        center: mapCenterCoordinates,
        zoom: 13,
        sliderStyle: "small"
    });
    openStreetMapLayer = new OpenStreetMapLayer();
    esriMap.addLayer(openStreetMapLayer);

    // Add a home button
    var home = new HomeButton({
        map: esriMap
    }, "HomeButton");
    home.startup();

    // GeoLocation button
    var geoLocate = new LocateButton({
        map: esriMap
    }, "LocateButton");
    geoLocate.startup();
});

/**
 * @description returns bus line stops and route's points
 * @TODO this should be from a rest api not a static list
 * @param {string} busLineID 
 */
function getBusLineData(busLineID) {
    var busLine = busLines.find(function (line) {
        return line.Id === busLineID;
    });
    if (busLine) {
        $('#busStopsSection').hide();
        $('#busStops').html('');
        for (var stop of busLine.Stops) {
            $('#busStops').append('<li id="' + stop.Id + '">' + stop.Name + '</li>');
        }

        $('#busStopsSection').show();
    }
    return busLine;
}


$(function () {
    /**
     * @description bind click action on each bus line in the list to get its
     * points and stops
     */
    $('.card > .list-group > .list-group-item').click(function (event) {
        $('.card > .list-group > .list-group-item').removeClass('active');
        $(event.target).addClass('active');    
    });
});

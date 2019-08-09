// This file includes Esri Map API calls using API v4.12
// Features Used:
//     == Create a map: https://developers.arcgis.com/javascript/latest/guide/create-a-starter-app/
//     == Draw points: https://developers.arcgis.com/javascript/latest/guide/display-point-line-and-polygon-graphics/
//     == Change point symbol to picture: https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-PictureMarkerSymbol.html
//     == Display popup: https://developers.arcgis.com/javascript/latest/guide/configure-pop-ups/
/*
    Known Limitations:   
    ==================

    Rendering SVG documents is not supported in IE11.
    SVG documents must include a definition for width and height to load properly in Firefox.
    Animated gif/png images are not supported. See the Custom WebGL layer view sample to learn how to accomplish this using WebGL.
    The height and width of the symbol is restricted to no more than 200px.
*/

var map, view;
// Abu Dhabi Coordinates
var mapCenterCoordinates = [54.366669, 24.466667];
var allBusesStops = [];
var allBusLines = [];
var iconPath = "M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z";

require([
    "esri/Map" /* Create a 2D map */ ,
    "esri/views/MapView",
    "esri/Graphic" /* For points */ ,
    "esri/layers/FeatureLayer" /* for pop-ups */
], function (Map, MapView, Graphic, FeatureLayer) {

    map = new Map({
        basemap: "streets-navigation-vector"
    });

    view = new MapView({
        container: "map",
        map: map,
        center: mapCenterCoordinates,
        zoom: 11
    });
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
        $('#busStops li').click(function (event) {
            view.goTo({
                target: event.target.id,
                zoom: 15
            });
        });
        $('#busStopsSection').show();
    }
    return busLine;
}

/**
 * @description return all stops
 */
function getAllBusesStops() {
    allBusesStops = [];
    for (var busLine of busLines) {
        for (var stop of busLine.Stops) {
            allBusesStops.push(stop);
        }
    }
}

/**
 * @description draw bus line stops
 * @param {object} busLineData 
 */
function drawBusLinePoints(busLineData) {
    if (busLineData && busLineData.Stops) {
        var point, pictureMarkerSymbol, pointGraphic;
        for (var stop of busLineData.Stops) {
            point = {
                type: "point",
                longitude: stop.Location[0],
                latitude: stop.Location[1]
            };

            pictureMarkerSymbol = {
                type: "picture-marker", // autocasts as new PictureMarkerSymbol()
                url: "https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png",
                width: "19px",
                declaredClass: "map-point"
            };

            pointGraphic = new Graphic({
                geometry: point,
                symbol: pictureMarkerSymbol,
                popupTemplate: {
                    title: stop.title
                }
            });

            view.graphic.add(pointGraphic);
        }
    }
}

$(function () {
    /**
     * @description bind click action on each bus line in the list to get its
     * points and stops
     */
    $('.card > .list-group > .list-group-item').click(function (event) {
        $('.card > .list-group > .list-group-item').removeClass('active');
        $(event.target).addClass('active');
        // Get bus line data
        var busLineData = getBusLineData(event.target.id);
        // Draw bus line stops' markers
        drawBusLinePoints(busLineData);
        // Center the map tp see all markers
        setMapToPosition(mapCenterCoordinates.lat, mapCenterCoordinates.lng, 12);
    });
});

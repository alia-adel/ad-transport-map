// This file includes Esri Map API calls using API v4.12
// Features Used:
//     == Create a map: https://developers.arcgis.com/javascript/latest/guide/create-a-starter-app/
//     == Draw points and lines: https://developers.arcgis.com/javascript/latest/guide/display-point-line-and-polygon-graphics/
//     == Change point symbol to picture: https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-PictureMarkerSymbol.html
//     == Display popup: https://developers.arcgis.com/javascript/latest/guide/configure-pop-ups/
//     == Home Button: https://developers.arcgis.com/javascript/latest/sample-code/widgets-home/index.html (but the widget was used on MapView instead of ViewScene)
/*
    Known Limitations:   
    ==================

    Rendering SVG documents is not supported in IE11.
    SVG documents must include a definition for width and height to load properly in Firefox.
    Animated gif/png images are not supported. See the Custom WebGL layer view sample to learn how to accomplish this using WebGL.
    The height and width of the symbol is restricted to no more than 200px.
*/

var map, view, allPoints = new Map();
// Abu Dhabi Coordinates
var mapCenterCoordinates = [54.366669, 24.466667];
var allBusesStops = [];
var allBusLines = [];
var iconPath = "M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z";

require([
    "esri/Map" /* Create a 2D map */ ,
    "esri/views/MapView",
    "esri/Graphic" /* For points */ ,
    "esri/widgets/Home"
], function (Map, MapView, Graphic, Home) {

    map = new Map({
        basemap: "streets-navigation-vector"
    });

    view = new MapView({
        container: "map",
        map: map,
        center: mapCenterCoordinates,
        zoom: 11
    });

    var homeBtn = new Home({
        view: view
    });

    // Add the home button to the top left corner of the view
    view.ui.add(homeBtn, "top-left");

    view.on("click", function (event) {
        // Search for graphics at the clicked location. View events can be used
        // as screen locations as they expose an x,y coordinate that conforms
        // to the ScreenPoint definition.
        console.log(`Long: ${event.mapPoint.longitude}, Lat: ${event.mapPoint.latitude}`);
    });
});

/**
 * @description get random coor for each bus
 * @param {string} busNumber 
 */
function getRandomColor(busNumber) {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

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
            foundPoint = allPoints.get(event.target.id);
            if (foundPoint) {
                view.goTo({
                    target: foundPoint.Location,
                    zoom: 18
                });
                view.popup.open({
                    location: foundPoint.Location,
                    title: foundPoint.Name // content displayed in the popup
                });
                $('#bus-id').text(foundPoint.Id);
                $('#bus-name').text(foundPoint.Name);
                $('.stop-info').show();
            }
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
        require(["esri/Graphic" /* For points */ ,
            "esri/geometry/Polyline" /* For Lines */
        ], function (Graphic, Polyline) {
            var busLinePath = [];
            for (var stop of busLineData.Stops) {
                if (!this.allPoints.get(stop.Id)) {
                    busLinePath.push(stop.Location);
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
                            title: stop.Name
                        },
                        stopID: stop.Id
                    });

                    this.allPoints.set(stop.Id, stop);
                    view.graphics.add(pointGraphic);
                }
            }
            //=== Draw bus stops connected line
            var simpleLineSymbol = {
                type: "simple-line",
                color: getRandomColor(busLineData.Number),
                width: 2
            };

            var polyline = new Polyline({
                paths: busLinePath
            });

            var polylineGraphic = new Graphic({
                geometry: polyline,
                symbol: simpleLineSymbol
            });

            view.graphics.add(polylineGraphic);
        });

    }
}

/**
 * @description remove all points & lines from map 
 */
function clearMap() {
    if (this.view && this.view.graphics) {
        this.view.graphics.items = [];
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
        view.goTo({
            target: mapCenterCoordinates,
            zoom: 12
        });
    });
});

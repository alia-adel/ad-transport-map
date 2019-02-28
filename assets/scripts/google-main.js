var googleMap;
var allBusesStops = [];
var allBusLines = [];
var allMarkers = [];
// Abu Dhabi Coordinates
var mapCenterCoordinates = {
    lat: 24.466667,
    lng: 54.366669
};

/**
 * @description Initialize Google Map with Abu Dhabi, UAE as center
 */
function initMap() {
    googleMap = new google.maps.Map(document.getElementById('map'), {
        center: mapCenterCoordinates,
        zoom: 12
    });

    // Create the DIV to hold the control and call the CenterControl()
    // constructor passing in this DIV.
    var centerControlDiv = document.createElement('div');
    new CenterControl(centerControlDiv);
    centerControlDiv.index = 1;
    googleMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(centerControlDiv);

    var refreshControlDIV = document.createElement('div');
    new RefreshMapControl(refreshControlDIV);
    refreshControlDIV.index = 2;
    googleMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(refreshControlDIV);
}

/**
 * @description get random coor for each bus
 * @param {string} busNumber 
 */
function getRandomColor(busNumber) {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}

/**
 * @description Sets the map position to the given latitude & longtitude 
 * & with the given zoom level
 * 
 * @param {float} lat 
 * @param {float} lng 
 */
function setMapToPosition(lat, lng, zoom) {
    googleMap.setCenter(mapCenterCoordinates);
    googleMap.setZoom(zoom);
}


/**
 * @description The CenterControl adds a control to the map that recenters the map mapInitialPos
 * This constructor takes the control DIV as an argument.
 * Credits: https://developers.google.com/maps/documentation/javascript/examples/control-custom
 * 
 * @param {Object} controlDiv
 * @constructor
 */
function CenterControl(controlDiv) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    $(controlUI).addClass('map-ctrl-outer');
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    $(controlText).addClass('map-ctrl-inner');
    controlText.innerHTML = '<i class="fas fa-home"></i>';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Old Cairo center.
    controlUI.addEventListener('click', function () {
        setMapToPosition(mapCenterCoordinates.lat, mapCenterCoordinates.lng, 12);
    });
}

/**
 * @description The RefreshMapControl adds a control to the map that remove all bus lines along with their markers
 * This constructor takes the control DIV as an argument.
 * Credits: https://developers.google.com/maps/documentation/javascript/examples/control-custom
 * 
 * @param {Object} controlDiv
 * @constructor
 */
function RefreshMapControl(controlDiv) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    $(controlUI).addClass('map-ctrl-outer mt-2');
    controlUI.title = 'Click to reset the map';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    $(controlText).addClass('map-ctrl-inner');
    controlText.innerHTML = '<i class="fas fa-redo-alt"></i>';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Old Cairo center.
    controlUI.addEventListener('click', function () {
        clearMarkers();
    });
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
    if(busLine){
        $('#busStopsSection').hide();
        $('#busStops').html('');
        for(var stop of busLine.Stops){
            $('#busStops').append('<li>' + stop.Name +  '</li>');
        }        
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
 * @description return google map markers for all stops
 * in the given bus line data
 * @param {object} busLineData 
 */
function drawBusLineMarkers(busLineData) {
    if (busLineData && busLineData.Stops) {
        for (var stop of busLineData.Stops) {
            var duplicateMarker = allMarkers.find(function (marker) {
                // console.log(`
                //     Stop (Lat, Lng): ${stop.Location[1]} , ${stop.Location[0]}
                //     Loop Marker (Lat, Lng): ${marker.position.lat()} , ${marker.position.lng()}
                //     Parsed: ${Number.parseFloat(marker.position.lat()).toFixed(5)}, ${Number.parseFloat(marker.position.lng()).toFixed(5)}
                // `);
                return (Number.parseFloat(marker.position.lat()).toFixed(5) === stop.Location[1] &&
                    Number.parseFloat(marker.position.lng()).toFixed(5) === stop.Location[0]);
            });
            if (!duplicateMarker) {


                var marker = new google.maps.Marker({
                    position: {
                        lat: stop.Location[1],
                        lng: stop.Location[0]
                    },
                    map: googleMap
                });

                var infoWindow = new google.maps.InfoWindow({
                    content: stop.Name,
                    maxWidth: 200
                });

                marker.addListener('click', function () {
                    setMapToPosition(marker.position.lat(), marker.position.lng(), 20);
                    infoWindow.open(googleMap, marker);
                });

                allMarkers.push(marker);
            }
        }
    }
}

/**
 * @description draws the bus line based on the
 * Array of longtitude, latitude provided
 * @param {Array} busLineData 
 */
function drawBusLine(busLineData) {
    var formattedBusLinePoints = [];
    for (var linePoint of busLineData.Points) {
        formattedBusLinePoints.push({
            lat: linePoint[1],
            lng: linePoint[0]
        });
    }

    allBusLines.push(new google.maps.Polyline({
        path: formattedBusLinePoints,
        geodesic: true,
        strokeColor: getRandomColor(busLineData.Number),
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: googleMap
    }));

}


/**
 * @description clear all markers
 */
function clearMarkers() {
    $('.card > .list-group > .list-group-item').removeClass('active');
    allMarkers.map(function (marker) {
        marker.setMap(null);
    });

    allBusLines.map(function (line) {
        line.setMap(null);
    });

    $('#busStopsSection').hide();
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
        // Draw bus line
        drawBusLine(busLineData);
        // Draw bus line stops' markers
        drawBusLineMarkers(busLineData);
    });

    $('#reset-markers').click(function () {
        clearMarkers();
        setMapToPosition(mapCenterCoordinates.lat, mapCenterCoordinates.lng, 12);
    });

});
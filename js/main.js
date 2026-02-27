// assign the access token
mapboxgl.accessToken =
    'pk.eyJ1IjoibGl6c2FyYWJpYSIsImEiOiJjbW00bTFqZWswZGZ5MnBweG1keTdyNzV6In0.PJM-qRxO4DiAHL9jPBgA3Q';

// declare the map object
let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 11, // starting zoom
    minZoom: 10,
    center: [-122.33, 47.60] // Seattle center
});

// declare the coordinated chart as well as other variables.
let collisionChart = null,
    severityCounts = {},
    numCollisions = 0;

// create a few constant variables.
const grades = [1, 2, 3],
    colors = ['rgb(208,209,230)', 'rgb(103,169,207)', 'rgb(1,108,89)'],
    radii = [4, 10, 18];

// create the legend object and anchor it to the html element with id legend.
const legend = document.getElementById('legend');

//set up legend grades content and labels
let labels = ['<strong>Collision Severity</strong>'], vbreak;

//iterate through grades and create a scaled circle and label for each
for (var i = 0; i < grades.length; i++) {
    vbreak = grades[i];
    // you need to manually adjust the radius of each dot on the legend 
    // in order to make sure the legend can be properly referred to the dot on the map.
    dot_radii = 2 * radii[i];
    labels.push(
        '<p class="break"><i class="dot" style="background:' + colors[i] + '; width: ' + dot_radii +
        'px; height: ' +
        dot_radii + 'px; "></i> <span class="dot-label" style="top: ' + dot_radii / 2 + 'px;">' + vbreak +
        '</span></p>');

}
const source =
    '<p style="text-align: right; font-size:10pt">Source: <a href="https://data-seattlecitygis.opendata.arcgis.com/datasets/504838adcb124cf4a434e33bf420c4ad_0/explore?filters=eyJNT0REVFRNIjpbMTc2NzI1NDQwMDAwMCwxNzcxOTIwMDAwMDAwXX0%3D&location=47.614571%2C-122.333041%2C11">Seattle Open Data Portal</a></p>';

// join all the labels and the source to create the legend content.
legend.innerHTML = labels.join('') + source;



// define the asynchronous function to load geojson data.
async function geojsonFetch() {

    // Await operator is used to wait for a promise. 
    // An await can cause an async function to pause until a Promise is settled.
    let response;
    response = await fetch('assets/collisions.geojson');
    collisions = await response.json();



    //load data to the map as new layers.
    //map.on('load', function loadingData() {
    map.on('load', () => { //simplifying the function statement: arrow with brackets to define a function

        // when loading a geojson, there are two steps
        // add a source of the data and then add the layer out of the source
        map.addSource('collisions', {
            type: 'geojson',
            data: collisions
        });


        map.addLayer({
                'id': 'collisions-point',
                'type': 'circle',
                'source': 'collisions',
                'minzoom': 10,
                'paint': {
                    // increase the radii of the circle as mag value increases
                    'circle-radius': [
                        'match',
                        ['get', 'SEVERITYCODE'],
                        "1", 4,
                        "2", 10,
                        "3", 18,
                        4
                    ] 
                    ,
                    // change the color of the circle as mag value increases
                    'circle-color': [
                        'match',
                        ['get', 'SEVERITYCODE'],
                        "1", colors[0],
                        "2", colors[1],
                        "3", colors[2],
                        'rgba(255,255,255,0.5)'
                    ]
                    ,
                    'circle-stroke-color': 'white',
                    'circle-stroke-width': 1,
                    'circle-opacity': 0.7
                }
            },
            'waterway-label' // make the thematic layer above the waterway-label layer.
        );


        // click on each dot to view magnitude in a popup
        map.on('click', 'collisions-point', (event) => {
            new mapboxgl.Popup()
                .setLngLat(event.features[0].geometry.coordinates)
                .setHTML(`<strong>Severity:</strong> ${event.features[0].properties.SEVERITYDESC}<br>
                    <strong>Injuries:</strong> ${event.features[0].properties.INJURIES}<br>
                    <strong>Fatalities:</strong> ${event.features[0].properties.FATALITIES}`
                )
                .addTo(map);
        });



        // initial chart build
        updateChart(collisions);
    });


    // update chart when map view changes
    map.on('idle', () => {
        updateChart(collisions);
    });
}

// chart update function
function updateChart(collisions) {

    severityCounts = calCollisions(collisions, map.getBounds());

    numCollisions =
        severityCounts["1"] +
        severityCounts["2"] +
        severityCounts["3"];

    document.getElementById("collision-count").innerHTML = numCollisions;

    let x = Object.keys(severityCounts);
    x.unshift("severity");

    let y = Object.values(severityCounts);
    y.unshift("#");

    if (!collisionChart) {

        collisionChart = c3.generate({
            size: {
                height: 350,
                width: 460
            },
            data: {
                x: 'severity',
                columns: [x, y],
                type: 'bar',
                colors: {
                    '#': (d) => colors[d.x]
                },
                onclick: function (d) {

                    let level = x[1 + d.x]; // STRING value

                    map.setFilter('collisions-point',
                        ['==', ['get', 'SEVERITYCODE'], level]
                    );
                }
            },
            axis: {
                x: { type: 'category' },
                y: { tick: { fit: true } }
            },
            legend: { show: false },
            bindto: "#collision-chart"
        });

    } else {

        collisionChart.load({
            columns: [x, y]
        });
    }
}


// calculate counts within bbox
function calCollisions(currentCollisions, currentMapBounds) {

    let severityClasses = {
        "1": 0,
        "2": 0,
        "3": 0
    };

    currentCollisions.features.forEach(function (d) {

        if (!d.geometry || !d.geometry.coordinates) return;

        if (currentMapBounds.contains(d.geometry.coordinates)) {

            let severity = d.properties.SEVERITYCODE;

            if (severityClasses[severity] !== undefined) {
                severityClasses[severity] += 1;
            }
        }
    });

    return severityClasses;
}


// reset button
const reset = document.getElementById('reset');
reset.addEventListener('click', () => {

    map.flyTo({
        zoom: 11,
        center: [-122.33, 47.60]
    });

    map.setFilter('collisions-point', null);
});


// call function
geojsonFetch();
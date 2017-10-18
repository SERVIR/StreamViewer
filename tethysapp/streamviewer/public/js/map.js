/*****************************************************************************
 * FILE:    MAP JS
 * DATE:    10 October 2017
 * AUTHOR: Sarva Pulla
 * COPYRIGHT: (c) SERVIR GLOBAL 2017
 * LICENSE: MIT
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/

var LIBRARY_OBJECT = (function() {
    // Wrap the library in a package function
    "use strict"; // And enable strict mode for this library

    /************************************************************************
     *                      MODULE LEVEL / GLOBAL VARIABLES
     *************************************************************************/
    var current_day, // Global Variable for storing the information of the current timestep.
        layers,
        map,
        public_interface,				// Object returned by the module
        streamflows, // Stores the streamflow information that is passed from the backend
        vector_layer,
        vector_source;


    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/

    var animate,
        init_all,
        init_events,
        init_vars,
        init_map;

    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/

    init_vars = function(){
        var $sf_element = $('#streamflow');
        streamflows = $sf_element.attr('data-streamflows');
        streamflows = JSON.parse(streamflows);
    };

    init_map = function(){

        // var base_map = new ol.layer.Tile({
        //     source: new ol.source.BingMaps({
        //         key: '5TC0yID7CYaqv3nVQLKe~xWVt4aXWMJq2Ed72cO4xsA~ApdeyQwHyH_btMjQS1NJ7OHKY8BK-W-EMQMrIavoQUMYXeZIQOUURnKGBOC7UCt4',
        //         imagerySet: 'AerialWithLabels' // Options 'Aerial', 'AerialWithLabels', 'Road'
        //     })
        // });

        var attribution = new ol.Attribution({
            html: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/" target="_blank">ArcGIS</a>'
        });

        var base_map = new ol.layer.Tile({
            crossOrigin: 'anonymous',
            source: new ol.source.XYZ({
                attributions: [attribution],
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/' +
                'World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
            })
        });

        // The colors for the streamflows
        var very_high = [0,55,172,0.81];
        var high = [112, 137, 182,0.81];
        var normal = [206, 206, 206,0.81];
        var low = [200, 96, 95,0.81];
        var very_low = [193, 0, 0,0.81];

        var styleCache = {};

        // Defining the default styling
        var default_style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'transparent'
            }),
            stroke: new ol.style.Stroke({
                color: 'transparent',
                width: 4
            })
        });

        // Change the styling of the streams layer based on the properties of the streams ids

        function styleFunction(feature, resolution) {

            // Getting the stream id for the feature

            var stream_id = feature.getId().split(".")[1];


            if(current_day != null){

                // Finding the index of the stream id for the current day
                var index = -1;
                for (var i = 0; i < current_day.length; ++i) {
                    if (current_day[i][1] == stream_id) {
                        index = i;
                        break;
                    }
                }

                // If there is no index or if it doesn't exist just return the default styling

                if (index=="-1") {
                    return [default_style];
                }

                // check the cache and create a new style for the current stream if its not been created before.
                if (index!="-1") {

                    // Declaring the streamflow for the current feature

                    var avg_val = current_day[index][2];

                    // You can set different styles based on the resolution of the map.
                    if(resolution < 600){

                        // Setting the styles based on the streamflow value

                        if(avg_val > 250000){
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: very_high
                            }),
                            stroke: new ol.style.Stroke({
                                color: very_high,
                                width: 10
                            })
                        });
                    }else if(avg_val > 50000 && avg_val < 250000){
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: high
                            }),
                            stroke: new ol.style.Stroke({
                                color: high,
                                width: 8
                            })
                        });
                    }else if(avg_val > 15000 && avg_val < 50000){
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: normal
                            }),
                            stroke: new ol.style.Stroke({
                                color: normal,
                                width: 6
                            })
                        });
                    }else if(avg_val > 500 && avg_val < 15000 ){
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: low
                            }),
                            stroke: new ol.style.Stroke({
                                color: low,
                                width: 4
                            })
                        });
                    }
                    else if(avg_val < 500){
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: very_low
                            }),
                            stroke: new ol.style.Stroke({
                                color: very_low,
                                width: 2
                            })
                        });
                    }

                }
                return [styleCache[index]];
            }else{
                return [default_style];
            }
                    }



        }

        // The actual streams layer. typename follows the following format 'workspace:layer_name'
        vector_source = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: function(extent) {
                return 'http://tethys.servirglobal.net:8181/geoserver/wfs/?service=WFS&' +
                    'version=1.1.0&request=GetFeature&typename=test:hsv_streams&' +
                    'outputFormat=application/json&srsname=EPSG:3857&' +
                    'bbox=' + extent.join(',') + ',EPSG:3857';
            },
            strategy: ol.loadingstrategy.bbox,
            wrapX: false
        });

        // Declare the styling function

        vector_layer = new ol.layer.Vector({
            source: vector_source,
            style:styleFunction
        });

        layers = [base_map,vector_layer];
        map = new ol.Map({
            target: 'map',
            layers: layers,
            view: new ol.View({
                center: ol.proj.fromLonLat([-86.5861,34.7304]),
                zoom: 9
            })
        });

    };

    // Map Events go here. For now its only handling any changes in teh window size.
    init_events = function() {
        (function () {
            var target, observer, config;
            // select the target node
            target = $('#app-content-wrapper')[0];

            observer = new MutationObserver(function () {
                window.setTimeout(function () {
                    map.updateSize();
                }, 350);
            });
            $(window).on('resize', function () {
                map.updateSize();
            });

            config = {attributes: true};

            observer.observe(target, config);
        }());
    };


    // Functino for animating the streams.
    animate = function(){
        var i = 0; //Starting point of the loop. This is day one.

        // The following code can be modified to work for a slider or play button.

        var intv = setInterval(function() {
                current_day = streamflows[i]; // Get the current timestep values
                var actual_day = i + 1; // Just for display
                var day_display = '<h6 style="color:white;">Day ' + actual_day+'</h6>';
                document.getElementById('current-day').innerHTML = day_display;

                vector_layer.getSource().changed(); // Refresh the source to let the styling take effect for the current day streamflow values
                ++i; // Go to the next day
                if (i===streamflows.length) i=0; // If you go the end of the forecast go to the first timestep. Esentially looping the animation.
        }, 3000); // Change the 3000 to change the interval between the animation. Currently its taking 3 seconds between a timestep.
    };

    init_all = function(){
        init_vars();
        init_map();
        init_events();
        animate();
    };


    /************************************************************************
     *                        DEFINE PUBLIC INTERFACE
     *************************************************************************/
    /*
     * Library object that contains public facing functions of the package.
     * This is the object that is returned by the library wrapper function.
     * See below.
     * NOTE: The functions in the public interface have access to the private
     * functions of the library because of JavaScript function scope.
     */
    public_interface = {

    };

    /************************************************************************
     *                  INITIALIZATION / CONSTRUCTOR
     *************************************************************************/

    // Initialization: jQuery function that gets called when
    // the DOM tree finishes loading

    $(function() {
        init_all();

    });

    return public_interface;

}()); // End of package wrapper
// NOTE: that the call operator (open-closed parenthesis) is used to invoke the library wrapper
// function immediately after being parsed.
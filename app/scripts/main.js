/*global require*/
'use strict';

require.config({
    shim: {
        d3: {
            exports: 'd3',
            init:function(){
                d3.id = (function(){var a = 0; return function(){return a++}})();
                return d3;
            }
        },
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/lodash/dist/lodash.underscore',
        bootstrap: '../bower_components/sass-bootstrap/dist/js/bootstrap',
        d3: '../bower_components/d3/d3',
        hammerjs: '../bower_components/hammerjs/hammer',
        hammer_jquery: '../bower_components/jquery-hammerjs/jquery.hammer'
    }
});

require([
    'backbone',
    'views/html-workspace',
    'views/sidemenu'
], function (Backbone, workspace, menu) {
    // console.log(d3);
    // console.log(window)
    // console.log($().hammer);
    // console.log(require('d3'));
    var ws = new workspace();
    var sm = new menu({workspace: ws});
    ws.setSidemenu(sm);
    Backbone.history.start();
});

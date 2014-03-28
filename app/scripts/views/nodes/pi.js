/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'views/html-put',
    'views/html-node'
], function ($, _, Backbone, d3,Put,Node) {
    'use strict';

    var PINodeView = Node.extend({
    	name: "PI",
    	initialize: function(options) {
    		Node.prototype.initialize.call(this,options);
    		this.addPut(
                {
                    name: "output",
                    put: this.createOutput({
                            x: 120,
                            y: 50,
                            noVisual: options.noVisual
                        })
                });
    		this.value = Math.PI;
            
            this.update();
    	},
		process: function(){
			return this.value;
		}
    });


    return PINodeView;
});

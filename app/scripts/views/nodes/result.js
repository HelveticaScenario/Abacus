/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'views/html-put',
    'views/html-node',
    'hammer_jquery'
], function ($, _, Backbone, d3,Put,Node) {
    'use strict';

    var ResultNodeView = Node.extend({
    	name: 'Result',
    	initialize: function(options) {
    		Node.prototype.initialize.call(this,options);
    		this.addPut(
    			{
    				name: "input",
    				put: this.createInput({
		        			x: 20,
		        			y: 50,
                            noVisual: options.noVisual
		        		})
    			});
			var self = this;
			
			// $(this.info.node()).hammer().on('tap',printResult);
			// printResult.call(this.info.node());
			this.getValue();
    	},
		process: function(){
			return this.input.getValue();
		}
    });


    return ResultNodeView;
});

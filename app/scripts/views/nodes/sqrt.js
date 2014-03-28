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

    var SqrtNodeView = Node.extend({
    	name: 'Sqrt',
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
    		this.addPut(
    			{
    				name: "input1",
    				put: this.createInput({
		        			x: 20,
		        			y: 30,
                            noVisual: options.noVisual
		        		})
    			});
    	},
		process: function(){
			return Math.sqrt(this.input1.getValue());
		}
    });


    return SqrtNodeView;
});

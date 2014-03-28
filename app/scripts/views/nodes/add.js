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

    var AddNodeView = Node.extend({
    	name: 'Add',
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
    		this.addPut({
    				name:"input1",
    				put:this.createInput({
		        			x: 20,
		        			y: 30,
                            noVisual: options.noVisual
		        		})
    			});
    		this.addPut({
    			name:"input2",
    		 	put:this.createInput({
	        			x: 20,
	        			y: 70,
                            noVisual: options.noVisual
	        		})
    		 });
    	},
		process: function(){
			return this.input1.getValue() + this.input2.getValue();
		}
    });


    return AddNodeView;
});

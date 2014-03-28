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

    var ValNodeView = Node.extend({
    	name: "Value",
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
    		this.value = 1;
            if(!this.hidden){
                var self = this;
                var setValue = function() {
                    if(!self.hidden){
                        self.value = Number(prompt("Please enter a number."));
                        self.update();
                    }
                }
                $(this.resultDisplay.node()).hammer().on('tap',setValue);
            }
            Node.prototype.update.call(this);
    	},
		process: function(){
			return this.value;
		}
    });


    return ValNodeView;
});

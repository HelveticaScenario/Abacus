/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'd3'
], function ($, _, Backbone, d3) {
    'use strict';
    var LineView = Backbone.View.extend({
    	initialize: function(options) {
    		this.workspace = options.workspace;
    		this.puts = [];
    		this.data = options.data;
    		this.id = d3.id();
    		this.data.self = this;
    		if(!options.noVisual){
                console.log(this.data);
                var self = this;
                var line = this.line = this.workspace.nodeContainer
                    .append('div')
                    .classed('putt',true)
                    .data([this.data])
                    .attr('id',"id"+this.id)
                    .style('-webkit-transform', 'translate('+ this.data.coords[0] +'px,'+ this.data.coords[1] +'px)rotateZ(0deg)scaleX(1)')
                    .style('transform', 'translate('+ this.data.coords[0] +'px,'+ this.data.coords[1] +'px)');
                this.data.poss = [{x:this.data.coords[0],y:this.data.coords[1]},{x:this.data.coords[0],y:this.data.coords[1]}];
                this.data.angle = 0;
                this.data.length = 1;
                this.setElement(line.node());
            } else {
                this.hidden = true;
            }
			this.addPut(options.put);
    	},
    	addPut: function(put) {
    		if (this.puts.length >= 2) {
    			return;
    		};
    		var self = this;
			this.puts.push(put);            
    		put.updateLineFun = function(){
                if(!self.hidden){
                    self.updateEnd(put.node);
                }
			};
			put.node.updateLines.push(put.updateLineFun);
            put.update();
			return put.updateLineFun;
    	},
    	removePut: function(put) {
    		var idx = put.node.updateLines.indexOf(put.updateLineFun);
    		if (idx !== -1) {
    			put.node.updateLines = put.node.updateLines.slice(0,idx).concat(put.node.updateLines.slice(idx+1));
    			delete put.updateLineFun;
    			put.line = undefined;
    		};
    		idx = this.puts.indexOf(put);
    		if (idx !== -1) {
				this.puts = this.puts.slice(0,idx).concat(this.puts.slice(idx+1));
    		};
            put.update();
    	},
    	remove: function(){
			var _puts = this.puts.slice();
			var self = this;
			_puts.forEach(function(p) {
				self.removePut(p);
			});
			Backbone.View.prototype.remove.apply(this);
    	},
    	updateEnd: function(node){
    		// console.log(node, this.puts);
    		var i = -1;
    		if (this.puts[0] && node === this.puts[0].node) {
				i = 0;
    		} else if(this.puts[1] && node === this.puts[1].node){
    			i = 1;
    		}
    		// console.log(i);
    		if (i !== -1) {
				var d = d3.select(node.el).datum();
				// console.log(d);
				var o = d3.select(this.puts[i].el).datum();
				// console.log(o);
                this.data.poss[i].x = d.x+o.x+o.self.offs.x;
                this.data.poss[i].y = d.y+o.y+o.self.offs.y;
                this.updatePos();
    		}
    	},
        updatePos: function() {
            var p = this.data.poss;
            var len = this.data.length = Math.sqrt(Math.pow(p[0].x - p[1].x,2)+Math.pow(p[0].y - p[1].y,2))/2;
            var x  = ((p[0].x - p[1].x)/2)+p[1].x;
            var y = ((p[0].y - p[1].y)/2)+p[1].y;
            var angle = this.data.angle = Math.atan2((p[0].y - p[1].y),(p[0].x - p[1].x));
            this.line.style('-webkit-transform', 'translate('+ x +'px,'+ y +'px)rotateZ('+angle+'rad)scaleX('+len+')')
                    .style('transform', 'translate('+ x +'px,'+ y +'px)rotateZ('+angle+'rad)scaleX('+len+')');
        },
    	getOtherNode: function(node){
    		if (this.puts[0] && this.puts[1]) {
    			if (node === this.puts[0].node) {
					return this.puts[1].node;
    			} else if(node === this.puts[1].node){
    				return this.puts[0].node;
    			}
    		}
    	},
    	getOtherPut: function(put){
    		if (this.puts[0] && this.puts[1]) {
    			if (put === this.puts[0]) {
					return this.puts[1];
    			} else if(put === this.puts[1]){
    				return this.puts[0];
    			}
    		}
    	},
    	getPut: function(node){
    		if (this.puts[0] && node === this.puts[0].node) {
				return this.puts[0];
    		} else if(this.puts[1] && node === this.puts[1].node){
    			return this.puts[1];
    		}
    	},
    	getOtherEndIndex: function(put) {
    		if (this.puts[0] && put === this.puts[0]) {
				return 1;
			} else if(this.puts[1] && put === this.puts[1]){
				return 0;
			}
    	}
    });
    return LineView;
});

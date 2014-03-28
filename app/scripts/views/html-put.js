/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'views/line'
], function ($, _, Backbone, d3,Line) {
    'use strict';
    var PutView = Backbone.View.extend({
    	initialize: function(options) {
    		this.workspace = options.workspace;
    		this.node = options.node;
    		this.type = options.type;
    		this.label = options.label;
    		this.data = options.data;
    		this.data.self = this;
    		if(!options.data.noVisual){
    			var self = this;
	    		// console.log(workspace);
	    		var dot = d3.select(this.node.el)
	    			// .selectAll("circle")
					.append("div")
					.attr("class", "put")
					.style({
						'top': this.data.y + 'px',
						'left': this.data.x + 'px'
					})
					// .attr("r", 10)
					// .text("HAPPY!")
					// .attr("cx", this.data.x)
					// .attr("cy", this.data.y)
					.data([this.data])
					.call(this.drag);
				this.setElement(dot.node());
				dot = d3.select(this.el);
				var dimens = [dot.style('width'),dot.style('height')];
				this.offs = {
					x: Number(dimens[0].substr(0,dimens[0].length-2))/2,
					y: Number(dimens[1].substr(0,dimens[1].length-2))/2
				};
				// workspace.nodeContainer = d3.select('#dots').selectAll('circle');
				// console.log(dot);
    		} else {
    			this.hidden = true;
    		}
    	},
    	dragstarted: function(d) {
    		if(!d.self.workspace.isFunctionMode){
    			d.self.activeDrag = true;
    			var self = d.self;
				d3.event.sourceEvent.preventDefault();
	        	d3.event.sourceEvent.stopPropagation();
				d3.select(this).classed("dragging", true);
				var d = d3.select(self.node.el).datum();
				var o = d3.select(self.el).datum();
	        	var coords = [d.x + o.x + o.self.offs.x, d.y + o.y + o.self.offs.y];
				// console.log(coords);
				if (!self.line) {
					self.line = new Line({
						workspace: self.workspace,
						put: self,
						data: {
							coords:coords
						}
					});
				};
				self.otherEndIndex = self.line.getOtherEndIndex(self);
    		}
		},

		dragged: function(d) {
			if(d.self.activeDrag){
				d3.event.sourceEvent.preventDefault();
	        	d3.event.sourceEvent.stopPropagation();
	        	var self = d.self;
	        	var coords = d3.mouse(self.workspace.container.node());
	        	// self.line.line.attr('data-x'+(self.otherEndIndex+1),coords[0]/self.workspace.scale).attr('data-y'+(self.otherEndIndex+1),coords[1]/self.workspace.scale);
	        	self.line.data.poss[self.otherEndIndex].x = coords[0]/self.workspace.scale;
                self.line.data.poss[self.otherEndIndex].y = coords[1]/self.workspace.scale;
                self.line.updatePos();
			}
		},

		dragended: function(d) {
			if(d.self.activeDrag){
				d3.event.sourceEvent.preventDefault();
	        	d3.event.sourceEvent.stopPropagation();
	        	d3.select(this).classed("dragging", false);
	        	var coords = d3.mouse(d.self.workspace.container.node());
	        	var target = d3.select(window.document.elementFromPoint(coords[0]+d.self.workspace.translate[0],coords[1]+d.self.workspace.translate[1]));
	        	// console.log(target,coords,window.document.elementFromPoint(coords[0]+d.self.workspace.translate[0],coords[1]+d.self.workspace.translate[1]));

				if (target.classed("put")) {
					var p = target.datum().self;
					if (p.node === d.self.node || p.type === d.self.type) {
						// console.log(2);
						d.self.line.remove();
						delete d.self.line;
						return;
					};
					if (p.line) {
						p.line.remove()
					};
					p.line = d.self.line;
					// console.log(p);
					d.self.line.addPut(p)();
				} else {
					// console.log(1);
					d.self.line.remove();
					delete d.self.line;
				}
				d.self.activeDrag = false;
			}
		},
		getValue: function() {
			if (this.type === PutView.types.INPUT || this.type === PutView.types.PASSTHROUGH_INPUT) {
				if (this.line) {
					return this.line.getOtherPut(this).getValue();
				}
			} else if(this.type === PutView.types.OUTPUT){
				return this.node.getValue();
			} else if(this.type === PutView.types.PASSTHROUGH_OUTPUT){
				return this.internalPut.getValue();
			}
		},
		update: function() {
			if (this.type === PutView.types.OUTPUT || this.type === PutView.types.PASSTHROUGH_OUTPUT) {
				if (this.line) {
					return this.line.getOtherPut(this).update();
				}
			} else if(this.type === PutView.types.INPUT){
				return this.node.update();
			} else if(this.type === PutView.types.PASSTHROUGH_INPUT){
				return this.internalPut.update();
			}
		},
		changeSelectionMode: function(newMode, calledBy, direction) {
			if(this.line){
				return this.line.getOtherPut(this).node.changeSelectionMode(newMode, calledBy, direction);
			}
		},
		getSelectionMode: function() {
			if(this.line){
				return this.line.getOtherPut(this).node.selectionMode;
			} else 
				return "DESELECTED";
		},
		makeDirty: function() {
			if (this.type === PutView.types.OUTPUT || this.type === PutView.types.PASSTHROUGH_OUTPUT) {
				if (this.line) {
					return this.line.getOtherPut(this).makeDirty();
				} else {
					return {};
				}
			} else if(this.type === PutView.types.INPUT){
				return this.node.makeDirty();
			} else if(this.type === PutView.types.PASSTHROUGH_INPUT){
				return this.internalPut.makeDirty();
			}
		},
		toJSON: function() {
			if (this.line) {
				return this.line.getOtherPut(this).node.toJSON();
			} else if(this.internalPut){
				return this.internalPut.toJSON();
			}
		},
		remove: function() {
			this.line && this.line.remove();
			Backbone.View.prototype.remove.call(this);
		}
    });

	PutView.prototype.drag = d3.behavior.drag()
				.origin(function (d) {
					return d;
				})
				.on("dragstart", PutView.prototype.dragstarted)
				.on("drag", PutView.prototype.dragged)
				.on("dragend", PutView.prototype.dragended);
	// console.log(new NodeView().drag === new NodeView().drag);
	// console.log(NodeView.prototype);
	PutView.types = {};
	PutView.types.INPUT = "INPUT";
	PutView.types.OUTPUT = "OUTPUT";
	PutView.types.PASSTHROUGH_INPUT = "PASSTHROUGH_INPUT";
	PutView.types.PASSTHROUGH_OUTPUT = "PASSTHROUGH_OUTPUT";
    return PutView;
});

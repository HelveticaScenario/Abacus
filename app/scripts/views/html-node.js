/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'views/html-put',
    'hammer_jquery'
], function ($, _, Backbone, d3,Put,hammer) {
    'use strict';
    function hasAnySelected(arr) {
    	var stop = false;
		arr.forEach(function(e) {
			if (!stop) {
				if (e.put.getSelectionMode() !== NodeView.DESELECTED) {
					stop = true;
				};
			};
		});
		return stop;
    }
    function hasAnyDeselected(arr) {
    	var stop = false;
		arr.forEach(function(e) {
			if (!stop) {
				if (e.put.getSelectionMode() === NodeView.DESELECTED) {
					stop = true;
				};
			};
		});
		return stop;
    }

    var NodeView = Backbone.View.extend({
    	result: undefined,
    	isDirty: false,
    	changeSelectionMode: function(newMode, calledBy, direction, forceDeselect) { //calledBy will be the node that called this function, else null or undefined if called by workspace (initial caller)
    		if (newMode === this.selectionMode && calledBy) {
    			return;
    		} else if(forceDeselect){
    			this.deselect();
				var self = this;
    			this.selectionMode = NodeView.DESELECTED;
				this.inputs.forEach(function(e){
					e.put.changeSelectionMode(NodeView.DESELECTED,self,NodeView.DIRECTION_DOWN,true);
				});
    		} else if(newMode === this.selectionMode){
    			this.changeSelectionMode(NodeView.DESELECTED);
    		} else if (newMode === NodeView.DESELECTED) {
    			if(!calledBy && this.selectionMode !== NodeView.SELECTED_BODY){ // called by workspace
    				this.deselect();
    				var self = this;
    				var oldSelection = this.selectionMode;
    				this.selectionMode = NodeView.DESELECTED;
	    			if(oldSelection === NodeView.SELECTED_HEAD || oldSelection === NodeView.SELECTED_BRANCH){
	    				this.inputs.forEach(function(e){
	    					e.put.changeSelectionMode(NodeView.DESELECTED,self,NodeView.DIRECTION_DOWN);
	    				});
	    			}
	    			if(oldSelection === NodeView.SELECTED_LEAF && hasAnySelected(this.inputs)){
	    				this.changeSelectionMode(NodeView.SELECTED_BODY);
	    			} else if(oldSelection === NodeView.SELECTED_LEAF || oldSelection === NodeView.SELECTED_BRANCH){
	    				this.outputs.forEach(function(e){
	    					e.put.changeSelectionMode(NodeView.DESELECTED,self,NodeView.DIRECTION_UP);
	    				});
	    			}
    			} else if(calledBy && this.selectionMode !== NodeView.SELECTED_HEAD){
    				if(this.selectionMode === NodeView.SELECTED_BRANCH && direction === NodeView.DIRECTION_UP){ //dont deselect branch if any other limbs are selected
    					var stop = false;
    					this.inputs.forEach(function(e) {
    						if (!stop) {
    							if (e.put.getSelectionMode() !== NodeView.DESELECTED) {
    								stop = true;
    							};
    						};
    					});
    					if(!stop){
    						this.deselect();
    						var self = this;
    						this.selectionMode = NodeView.DESELECTED;
    						this.outputs.forEach(function(e){
		    					e.put.changeSelectionMode(NodeView.DESELECTED,self,NodeView.DIRECTION_UP);
		    				});
    					}
    				} else if(this.selectionMode !== NodeView.SELECTED_LEAF && direction === NodeView.DIRECTION_UP){
    					this.deselect();
						var self = this;
						this.selectionMode = NodeView.DESELECTED;
    					this.outputs.forEach(function(e) {
    						e.put.changeSelectionMode(NodeView.DESELECTED,self,NodeView.DIRECTION_UP);
    					});
    				} 
    				// else if(this.selectionMode === NodeView.SELECTED_LEAF && direction === NodeView.DIRECTION_DOWN){
    				// 	var stop = false;
    				// 	this.inputs.forEach(function(e) {
    				// 		if (!stop) {
    				// 			if (e.put.getSelectionMode() !== NodeView.DESELECTED) {
    				// 				stop = true;
    				// 			};
    				// 		};
    				// 	});
    				// 	if(!stop){
    				// 		this.deselect();
    				// 		this.selectionMode = NodeView.DESELECTED;
    				// 	}
    				// } 
    				else if(direction === NodeView.DIRECTION_DOWN){
    					this.deselect();
						var self = this;
						this.selectionMode = NodeView.DESELECTED;
    					this.inputs.forEach(function(e) {
    						e.put.changeSelectionMode(NodeView.DESELECTED,self,NodeView.DIRECTION_DOWN);
    					});
    				}
    			}
    			
    		} else if(newMode === NodeView.SELECTED_HEAD){ //should always be the first node selected, enforced by workspace
    			d3.select(this.el).classed("head", true);
    			this.selectionMode = NodeView.SELECTED_HEAD;
    		} else if(newMode === NodeView.SELECTED_LEAF){
    			this.deselect();
				d3.select(this.el).classed("leaf", true);
				if(this.selectionMode === NodeView.DESELECTED){
					this.selectionMode = NodeView.SELECTED_LEAF;
					this.outputs.forEach(function(e) {
    						e.put.changeSelectionMode(NodeView.SELECTED_BODY,self,NodeView.DIRECTION_UP);
    					});
				} else
					this.selectionMode = NodeView.SELECTED_LEAF;
    		} else if(newMode === NodeView.SELECTED_BODY && this.selectionMode === NodeView.DESELECTED){
    			if (this.inputs.length > 1) {
					d3.select(this.el).classed("branch", true);
					this.selectionMode = NodeView.SELECTED_BRANCH;
					this.outputs.forEach(function(e) {
    						e.put.changeSelectionMode(NodeView.SELECTED_BODY,self,NodeView.DIRECTION_UP);
    					});
    			} else {
    				d3.select(this.el).classed("selected", true);
					this.selectionMode = NodeView.SELECTED_BODY;
					this.outputs.forEach(function(e) {
    						e.put.changeSelectionMode(NodeView.SELECTED_BODY,self,NodeView.DIRECTION_UP);
    					});
    			}
    		}
    	},
    	deselect: function() {
    		d3.select(this.el).classed("selected head leaf branch", false);
    	},
    	addPut: function(putConf) {
    		if(!putConf.name){
    			throw new Error("putConf needs a name!");
    		}
    		if(!putConf.put){
    			throw new Error("putConf needs a put!");
    		}
    		var put = putConf.put;
    		this[putConf.name] = put;
    		if(put.type === Put.types.INPUT){
    			this.inputs.push(putConf);
    		} else if (put.type === Put.types.OUTPUT){
    			this.outputs.push(putConf);
    		}
    	},
    	createInput: function(data) {
    		return this.createPut(data,Put.types.INPUT);
    	},
    	createOutput: function(data) {
    		return this.createPut(data,Put.types.OUTPUT);
    	},
    	createPut: function(data, type) {
    		return new Put({
		        		workspace: this.workspace,
		        		node: this,
		        		type: type,
		        		data: data});
    	},
    	initialize: function(options) {
    		this.inputs = [];
    		this.outputs = [];
    		var workspace  = this.workspace = options.workspace;
    		this.data = options.coords;
    		var self = this.data.self = this;
    		this.updateLines = [];
    		if(!options.noVisual){
    			var rect;
	    		var node = rect = workspace.nodeContainer.append(function() {
	    			return self.el;
	    		})
		    		.data([options.coords])
		    		.style('-webkit-transform', function(d) {
		    			return 'translate('+ d.x +'px,'+ d.y +'px)';
		    		})
		    		.style('transform', function(d) {
		    			return 'translate('+ d.x +'px,'+ d.y +'px)';
		    		})
					// .style('top', function(d) {
		   //  			return d.y +'px';
		   //  		})
		   //  		.style('left', function(d) {
		   //  			return d.x +'px';
		   //  		})
		    		.attr("class", "node")
		    		// .attr("transform", function (d) { 
		    		// 	return "translate(" + d.x + "," + d.y + ")"; 
		    		// })
		    		.call(this.drag);
	    		// this.setElement(node.node());
	    		// console.log(node);
	    // 		var rect = node
					// .append("rect")
					// .attr("class", "node")
					// // .attr("width", 140)
					// // .attr("height", 100);
				this.width = Number(node.style('width').substr(0,node.style('width').length-2));
				this.height = Number(node.style('height').substr(0,node.style('height').length-2));
				this.nameDisplay = node.append('div').text(this.name).classed('info', true);
				this.resultDisplay = node.append('div').classed('info', true);
				
				this.$el.hammer().on("tap",function(e) {
					console.log(self.workspace.isFunctionMode);
					if(self.workspace.isFunctionMode){
						self.workspace.toggleToFunctionTree(self);
					}
				});
				this.selectionMode = "DESELECTED";
    		} else {
    			this.hidden = true;
    			var self = this;
    			this.nameDisplay = this.resultDisplay = {
    				node:function() {
    					return self;
    				},
    				text: function() {
    					
    				}
    			};
    		}
    		
    	},
    	dragstarted: function(d) {
			d3.event.sourceEvent.preventDefault();
	    	d3.event.sourceEvent.stopPropagation();
			d3.select(this)
				.classed("dragging", true);
		},

		dragged: function(d) {
			d3.event.sourceEvent.preventDefault();
			d3.event.sourceEvent.stopPropagation();
			d.x += d3.event.dx / d.self.workspace.scale;
            d.y += d3.event.dy / d.self.workspace.scale;
            d3.select(this)
            	.style('-webkit-transform', 'translate('+ d.x +'px,'+ d.y +'px)')
	    		.style('transform', 'translate('+ d.x +'px,'+ d.y +'px)');
	    		// .style('top', d.y +'px')
	    		// .style('left', d.x +'px');
        	d.self.updateLines.forEach(function(f) {
        		f();
        	});

		},
		dragended: function(d) {
			// console.log(d,this,d3.event);

			d3.select(this).classed("dragging", false);
			var mouse = d3.mouse(d.self.workspace.container.node());
			var distLeft = d3.mouse(this)[0];
			// console.log(d3.mouse(this)[0]);
			var t = (d.self.workspace.sidemenu.offset+mouse[0]+d.self.workspace.translate[0]-distLeft);
			// console.log(d.self.workspace.sidemenu.offset,mouse[0],d.self.workspace.translate[0],distLeft);

            if (t >= window.innerWidth) {
                d.self.remove();
            };
		},
		getValue: function(){
			if(this.isDirty){
				this.result = this.process();
    			this.isDirty = false;
    			if(!this.hidden){
	    			$(this.resultDisplay.node()).text(String(this.result));
	    		}
			}
    		return this.result;
		},
		makeDirty: function() {
			var obj = {};
			if(!this.isDirty){
				this.isDirty = true;
				var count = 0;
				if(this.outputs.length !== 0){
					this.outputs.forEach(function(e) {
						var heads = e.put.makeDirty();
						for(var i in heads){
							if(obj[i] === undefined){
								count++;
								obj[i] = heads[i];
							}
						}
					})
				}
				if(count === 0){
					obj[this.cid] = this;
				}
			}
			return obj;
		},
		update: function() {
			var heads = this.makeDirty();
            for(var i in heads){
                heads[i].getValue();
            }
		},
		process: function() {},
		remove: function() {
			function r(e) {
				e.put.remove();
			}
			this.outputs.forEach(r);
			this.inputs.forEach(r);
			Backbone.View.prototype.remove.call(this);
		},
		toJSON: function() {
			var obj = {
				type: this.name,
				input:{},
				exposed:{}
			};
			this.inputs.forEach(function(e) {
				if(e.put.getSelectionMode() !== NodeView.DESELECTED){
					obj.input[e.name] = e.put.toJSON();
				} else {
					obj.exposed[e.name] = e.name;
				}
			});
			obj.input["value"] = this.value;
			return obj;
		}
    });

	NodeView.prototype.drag = d3.behavior.drag()
				.origin(function (d) {
					return d;
				})
				.on("dragstart", NodeView.prototype.dragstarted)
				.on("drag", NodeView.prototype.dragged)
				.on("dragend", NodeView.prototype.dragended);
	// console.log(new NodeView().drag === new NodeView().drag);
	// console.log(NodeView.prototype);
	NodeView.DESELECTED = "DESELECTED";
	NodeView.SELECTED_BODY = "SELECTED_BODY";
	NodeView.SELECTED_HEAD = "SELECTED_HEAD";
	NodeView.SELECTED_LEAF = "SELECTED_LEAF";
	NodeView.SELECTED_FAUX_LEAF = "SELECTED_BRANCH";
	NodeView.DIRECTION_DOWN = "DOWN";
	NodeView.DIRECTION_UP = "UP";
    return NodeView;
});

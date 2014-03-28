/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    // 'templates',
    'd3',
    'views/allDaNodes',
    'views/nodes/template',
    'hammer_jquery'
], function ($, _, Backbone, d3,nodes,template) {
    'use strict';
    // console.log(nodes);

    var SidemenuView = Backbone.View.extend({
    	initialize: function(options) {
            this.workspace = options.workspace;
    		this.setElement(d3.select('#sidemenu').node());
    		// this.$el.html(this.template());
    		var width = $(document.body).width();
    		this.min = this.offset = 40;
    		this.max = 300; 
    		this.$el.css({
    			'left':(width-this.offset)+'px',
    			'width': this.max+'px'
			});
			this.list = d3.select('#list');
			// nodes = _.sortBy(nodes,function(node) {
			// 	return node.prototype.name;
			// });
			var list = '<div class="row"><%- name %></div>'
			var self = this;
            var d3Window = d3.select(window);
            var addNode = function(n) {
                options.workspace.operators[n.prototype.name.toLowerCase()] = n;
                var item = self.list.append('div').classed('row',true).text(n.prototype.name);
                var origin = {x:999990,y:999990};
                var drag = d3.behavior.drag()
                .origin(function (d) {
                    return origin;
                });
                var instance;
                function onDragEnd () {
                    d3.event.sourceEvent.preventDefault();
                    d3.event.sourceEvent.stopPropagation();
                    instance.dragended.call(instance.el,instance.data);
                    var mouse = d3.mouse(self.workspace.container.node());
                    // console.log(mouse,e);
                    if ((self.offset+mouse[0]+self.workspace.translate[0]) >= window.innerWidth) {
                        instance.remove();
                    };
                    instance = undefined;
                }
                function onDrag () {
                    d3.event.sourceEvent.preventDefault();
                    d3.event.sourceEvent.stopPropagation();
                    instance.dragged.call(instance.el,instance.data);
                    
                }
                function onDragStart () {
                    d3.event.sourceEvent.preventDefault();
                    d3.event.sourceEvent.stopPropagation();
                    var mouse = d3.mouse(self.workspace.container.node());
                    var coords = {
                            x: mouse[0]/self.workspace.scale,
                            y: mouse[1]/self.workspace.scale
                        };
                    // console.log(coords);
                    origin = coords;
                    instance = new n({
                        workspace: self.workspace,
                        coords: coords
                    });
                    console.log(instance);
                    instance.dragstarted.call(instance.el,instance.data);
                }
                item.call(drag);
                drag.on("dragstart", onDragStart);
                drag.on("drag", onDrag);
                drag.on("dragend", onDragEnd);
            }
			nodes.forEach(addNode);
            this.addCustomNode = function(name, graph) {
                if (typeof graph === "string") {
                    graph = JSON.parse(graph);
                }
                var newNodeType = template.extend({
                    templateGraph: graph,
                    name: name
                });
                addNode(newNodeType);
            }
    		this.dragstart = function(d) {
    			// console.log(d3.event);
    		};
    		this.dragged = function(d) {
    			d.self.offset -= d3.event.dx;
    			if (d.self.offset>d.self.max) {
    				d.self.offset = d.self.max;
    			} else if (d.self.offset < d.self.min){
    				d.self.offset = d.self.min;
    			}
    			d.self.$el.addClass('sidemenu').css('left', (width-d.self.offset)+'px');
    		};
    		this.dragend = function(d) {
    			// console.log(d3.event);
    		};
    		this.drag = d3.behavior.drag()
				.origin(function (d) {
					return d;
				})
				// .on("dragstart", this.dragstart)
				.on("drag", this.dragged)
				// .on("dragend", this.dragended);
			d3.select(this.el).data([{x:0,y:0,self:this}]).call(this.drag);
            $("toggleFunMode").hammer().on('tap',function() {
                options.workspace.isFunctionMode = !options.workspace.isFunctionMode;
            });
    	},
        template: JST['app/scripts/templates/sidemenu.ejs']
    });

    return SidemenuView;
});

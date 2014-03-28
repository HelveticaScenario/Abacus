/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'd3',
    'views/nodes/val',
    'views/nodes/result',
    'views/nodes/add',
    'views/html-node'
], function($, _, Backbone, JST, d3, Val, Result, Add,Node) {
    'use strict';
    var ghettocount = 0;
    function getDocHeight() {
        var D = document;
        return Math.max(
            D.body.scrollHeight, D.documentElement.scrollHeight,
            D.body.offsetHeight, D.documentElement.offsetHeight,
            D.body.clientHeight, D.documentElement.clientHeight
        );
    }
    var head;
    var WorkspaceView = Backbone.View.extend({
        operators: {},
        isFunctionMode: false,
        toggleFunctionMode: function() {
            if(this.isFunctionMode){
                if(head){
                    head.changeSelectionMode(Node.DESELECTED, undefined, undefined, true); // force all deselect;
                    head = undefined;
                }
                this.isFunctionMode = false;
                return;
            }
            this.isFunctionMode = true;
        },
        toggleToFunctionTree: function(node){
            if(head){
                if(node === head){
                    head.changeSelectionMode(Node.DESELECTED, undefined, undefined, true);
                    head = undefined;
                    return;
                } else {
                    node.changeSelectionMode(Node.SELECTED_LEAF);
                }
            } else {
                head = node;
                node.changeSelectionMode(Node.SELECTED_HEAD);
            }
        },
        makeFunction: function(){
            var fun = head.toJSON();
            console.log(fun);
            this.sidemenu.addCustomNode("Test", fun);
            head.changeSelectionMode(Node.DESELECTED, undefined, undefined, true);
            head = undefined;
            this.isFunctionMode = false;
        },
        initialize: function() {
            var self = this;
            this.width = $(document.body).width(),
            this.height = getDocHeight();
            this.scale = 1;
            this.translate = [0,0];
            this.zoomed = function() {
                var hats;
                self.container.style('-webkit-transform', 'translate('+ d3.event.translate[0] +'px,'+ d3.event.translate[1] +'px)scale(' + d3.event.scale + ')');
                self.container.style('transform', 'translate('+ d3.event.translate[0] +'px,'+ d3.event.translate[1] +'px)scale(' + d3.event.scale + ')');
                self.scale = d3.event.scale;
                self.translate = d3.event.translate;
            };
            this.zoom = d3.behavior.zoom()
                .scaleExtent([0.2, 10])
                .on("zoom", this.zoomed);

            d3.select(window.document)
                .on("keypress", _.partial(this.abc, self));


            this.d3el = d3.select(this.el)
                .style({'position': 'fixed',
                        'top':0,
                        'left':0,
                        'width':this.width+'px',
                        'height':this.height+'px'})
                .call(this.zoom)
                .on("dblclick.zoom", null);

            

            this.rect = this.d3el.append('div')
                .style({'position': 'fixed',
                        'top':0,
                        'left':0,
                        'width':this.width+'px',
                        'height':this.height+'px',
                        'pointer-events': 'all'})
                .attr('id', 'rect')
                // .on("mousedown", _.partial(this.abc, this));
                

            this.container = this.nodeContainer = this.d3el.append('div')
                .attr('id', 'container')
                .style({'-webkit-transform-origin': 'top left'})
                .style('position','absolute')
                .style('-webkit-transform', 'scale(1)')
                .style('top', '0px')
                .style('left', '0px');

            window.document.body.appendChild(this.el);



            // new Result({
            //         workspace: this,
            //         coords: {
            //             x: 0,
            //             y: 0
            //         }
            //     });

        },
        keypress: function(keycode, callback) {
            // console.log(d3.event.keyCode);
            if (d3.event.keyCode === keycode) {
                d3.event.preventDefault();
                return callback.apply(this, Array.prototype.slice.call(arguments,2));
            };
        },

        x: function(workspace) {
            workspace.q = !workspace.q;
            // console.log(workspace.q);
        },
        abc: function(workspace){
            d3.event.preventDefault();
            if(d3.event.keyCode === 13){
                workspace.toggleFunctionMode();
                console.log("Function Mode is now "+ workspace.isFunctionMode);
            }
            if (d3.event.keyCode === 32) {
                if (workspace.isFunctionMode && head) {
                    workspace.makeFunction();
                }
            }
            
        },
        setSidemenu: function(sm) {
            this.sidemenu = sm;
        },
        template: JST['app/scripts/templates/workspace.ejs']
    });

    return WorkspaceView;
});

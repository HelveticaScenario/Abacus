/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'views/html-put',
    'views/html-node',
    'views/line'
], function ($, _, Backbone, d3,Put,Node,Line) {
    'use strict';
    var test = {
        type: "add",
        input: {
            input1: {
                type: "add",
                input: {},
                exposed: {input1: "input1",
                input2: "input2"}
            },
            input2: {
                type: "pi",
                input: {},
                exposed: {}
            }
        },
        exposed: {}
    }

    var TemplateNodeView = Node.extend({
    	name: "template",
    	initialize: function(options) {
    		Node.prototype.initialize.call(this,options);
            var exposed = {};
            function gen(t){
                var el = new options.workspace.operators[t.type.toLowerCase()]({workspace: options.workspace, noVisual: true,coords:{}});
                _.keys(t.input).forEach(function(e) {
                    if(e === "value"){
                        el.value = t.input.value;
                        return;
                    }
                    var i = gen(t.input[e]);
                    el[e].line = new Line({
                        workspace: options.workspace,
                        put: el[e],
                        noVisual:true,
                        data: {
                            
                        }
                    });
                    i.outputs[0].put.line = el[e].line;
                    el[e].line.addPut(i.outputs[0].put);
                });
                _.keys(t.exposed).forEach(function(e) {
                    exposed[e] = el[t.exposed[e]];
                })
                return el;
            }
            this.graph = gen(this.templateGraph);
    		this.addPut(
                {
                    name: "output",
                    put: this.createPassThroughOutput({
                            x: 120,
                            y: 50
                        },this.graph.outputs[0].put)
                });
            var self = this;
    		_.keys(exposed).forEach(function(e,idx) {
                self.addPut(
                {
                    name: e,
                    put: self.createPassThroughInput({
                            x: 20,
                            y: 20+(20*idx)
                        },exposed[e])
                });
            });
            var heads = {};
            this.inputs.forEach(function(e) {
                var _heads = e.put.makeDirty();
                for(var i in _heads){
                    if(heads[i] !== undefined){
                        heads[i] = _heads[i];
                    }
                }
            });
            for(var i in heads){
                heads[i].getValue();
            }
    	},
        createPassThroughPut: function(data,type,internalPut) {
            var put = this.createPut(data,type);
            put.internalPut = internalPut;
            put.internalPut.line = new Line({
                        workspace: this.workspace,
                        put: put.internalPut,
                        noVisual:true,
                        data: {
                            
                        }
                    });
            put.internalPut.line.addPut(put);
            return put;
        },
        createPassThroughOutput: function(data,internalPut) {
            return this.createPassThroughPut(data,Put.types.PASSTHROUGH_OUTPUT,internalPut);

        },
        createPassThroughInput: function(data,internalPut) {
            return this.createPassThroughPut(data,Put.types.PASSTHROUGH_INPUT,internalPut);
        },
		process: function(){
			return this.graph.getValue();
		}
    });


    return TemplateNodeView;
});

/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var TestmodelModel = Backbone.Model.extend({
        defaults: {
        }
    });

    return TestmodelModel;
});

/*global define*/

define([
    'views/nodes/add',
    'views/nodes/subtract',
    'views/nodes/multiply',
    'views/nodes/divide',
    'views/nodes/pi',
    'views/nodes/pow',
    'views/nodes/sqrt',
    'views/nodes/val'
    // 'views/nodes/result'
], function () {
    'use strict';
    return Array.prototype.slice.call(arguments);
});

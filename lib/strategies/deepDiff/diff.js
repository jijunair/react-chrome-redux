"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = diffObjects;

var _constants = require("../constants");

var objectConstructor = {}.constructor;

function isObject(o) {
  return (typeof o === "undefined" ? "undefined" : _typeof(o)) === "object" && o !== null && o.constructor === objectConstructor;
}

function shouldTreatAsValue(oldObj, newObj) {
  return !isObject(newObj) || (typeof newObj === "undefined" ? "undefined" : _typeof(newObj)) !== (typeof oldObj === "undefined" ? "undefined" : _typeof(oldObj)) || Array.isArray(newObj);
}

function diffValues(oldObj, newObj, shouldContinue, context) {
  // If it's a non-object, or if the type is changing, or if it's an array,
  // just go with the current value.
  if (shouldTreatAsValue(oldObj, newObj) || !shouldContinue(oldObj, newObj, context)) {
    return { change: _constants.DIFF_STATUS_UPDATED, value: newObj };
  }
  // If it's an object, compute the differences for each key.
  return { change: _constants.DIFF_STATUS_KEYS_UPDATED, value: diffObjects(oldObj, newObj, shouldContinue, context) };
}

/**
 * Performs a deep diff on two objects, created a nested list of patches. For objects, each key is compared.
 * If keys are not equal by reference, diffing continues on the key's corresponding values in the old and new
 * objects. If keys have been removed, they are recorded as such.
 * Non-object values that are not equal (including arrays by reference) are recorded as updated values.
 * The shouldContinue function is called on every potential value comparison with the current and previous objects
 * (at the present state in the tree) and the current path through the tree as an additional `context` parameter.
 * Returning false from this function will treat the current value as an updated value, regardless of whether or
 * not it is actually an object.
 * @param {Object} oldObj The old object
 * @param {Object} newObj The new object
 * @param {Function} shouldContinue Called with oldObj, newObj, and context, which is the current object path
 * Return false to stop diffing and treat everything under the current key as an updated value
 * @param {*} context
 */
function diffObjects(oldObj, newObj) {
  var shouldContinue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
    return true;
  };
  var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  var difference = [];

  // For each key in the current state,
  // get the differences in values.
  Object.keys(newObj).forEach(function (key) {
    if (oldObj[key] !== newObj[key]) {
      difference.push(_extends({
        key: key
      }, diffValues(oldObj[key], newObj[key], shouldContinue, context.concat(key))));
    }
  });

  // For each key previously present,
  // record its deletion.
  Object.keys(oldObj).forEach(function (key) {
    if (!newObj.hasOwnProperty(key)) {
      difference.push({
        key: key, change: _constants.DIFF_STATUS_REMOVED
      });
    }
  });

  return difference;
}
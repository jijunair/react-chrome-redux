"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = patchObject;

var _constants = require("../constants");

/**
 * Patches the given object according to the specified list of patches.
 * @param {Object} obj The object to patch
 * @param {Array} difference The array of differences generated from diffing
 */
function patchObject(obj, difference) {
  if (!difference.length) {
    return obj;
  }

  // Start with a shallow copy of the object.
  var newObject = _extends({}, obj);

  // Iterate through the patches.
  difference.forEach(function (patch) {
    // If the value is an object whose keys are being updated,
    // then recursively patch the object.
    if (patch.change === _constants.DIFF_STATUS_KEYS_UPDATED) {
      newObject[patch.key] = patchObject(newObject[patch.key], patch.value);
    }
    // If the key has been deleted, delete it.
    else if (patch.change === _constants.DIFF_STATUS_REMOVED) {
        Reflect.deleteProperty(newObject, patch.key);
      }
      // If the key has been updated to a new value, update it.
      else if (patch.change === _constants.DIFF_STATUS_UPDATED) {
          newObject[patch.key] = patch.value;
        }
  });
  return newObject;
}
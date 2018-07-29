"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (obj, difference) {
  var newObj = Object.assign({}, obj);

  difference.forEach(function (_ref) {
    var change = _ref.change,
        key = _ref.key,
        value = _ref.value;

    switch (change) {
      case _constants.DIFF_STATUS_UPDATED:
        newObj[key] = value;
        break;

      case _constants.DIFF_STATUS_REMOVED:
        Reflect.deleteProperty(newObj, key);
        break;

      default:
      // do nothing
    }
  });

  return newObj;
};

var _constants = require("../constants");
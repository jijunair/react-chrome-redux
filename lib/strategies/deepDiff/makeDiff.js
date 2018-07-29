'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeDiff;

var _diff = require('./diff');

var _diff2 = _interopRequireDefault(_diff);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A higher order function that takes a `shouldContinue` function
 * and returns a custom deep diff function that uses the provided
 * `shouldContinue` function to decide when to stop traversing
 * the state tree.
 * @param {Function} shouldContinue A function, called during
 * diffing just after each state tree traversal, which should
 * return a boolean indicating whether or not to continue down
 * the tree, or to just treat the current object as a value. It
 * is called with the old state, the new state, and the current
 * position in the state tree (provided as a list of keys so far).
 */
function makeDiff(shouldContinue) {
  return function (oldObj, newObj) {
    return (0, _diff2.default)(oldObj, newObj, shouldContinue);
  };
}
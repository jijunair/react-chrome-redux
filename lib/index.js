'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.alias = exports.wrapStore = exports.applyMiddleware = exports.Store = undefined;

var _Store = require('./store/Store');

var _Store2 = _interopRequireDefault(_Store);

var _applyMiddleware = require('./store/applyMiddleware');

var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

var _wrapStore = require('./wrap-store/wrapStore');

var _wrapStore2 = _interopRequireDefault(_wrapStore);

var _alias = require('./alias/alias');

var _alias2 = _interopRequireDefault(_alias);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Store = _Store2.default;
exports.applyMiddleware = _applyMiddleware2.default;
exports.wrapStore = _wrapStore2.default;
exports.alias = _alias2.default;
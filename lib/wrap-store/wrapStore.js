'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('../constants');

var _serialization = require('../serialization');

var _diff = require('../strategies/shallowDiff/diff');

var _diff2 = _interopRequireDefault(_diff);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Responder for promisified results
 * @param  {object} dispatchResult The result from `store.dispatch()`
 * @param  {function} send         The function used to respond to original message
 * @return {undefined}
 */
var promiseResponder = function promiseResponder(dispatchResult, send) {
  Promise.resolve(dispatchResult).then(function (res) {
    send({
      error: null,
      value: res
    });
  }).catch(function (err) {
    console.error('error dispatching result:', err);
    send({
      error: err.message,
      value: null
    });
  });
};

/**
 * Wraps a Redux store so that proxy stores can connect to it.
 * @param {Object} store A Redux store
 * @param {Object} options An object of form {portName, dispatchResponder, serializer, deserializer}, where `portName` is a required string and defines the name of the port for state transition changes, `dispatchResponder` is a function that takes the result of a store dispatch and optionally implements custom logic for responding to the original dispatch message,`serializer` is a function to serialize outgoing message payloads (default is passthrough), `deserializer` is a function to deserialize incoming message payloads (default is passthrough), and diffStrategy is one of the included diffing strategies (default is shallow diff) or a custom diffing function.
 */

exports.default = function (store, _ref) {
  var portName = _ref.portName,
      dispatchResponder = _ref.dispatchResponder,
      _ref$serializer = _ref.serializer,
      serializer = _ref$serializer === undefined ? _serialization.noop : _ref$serializer,
      _ref$deserializer = _ref.deserializer,
      deserializer = _ref$deserializer === undefined ? _serialization.noop : _ref$deserializer,
      _ref$diffStrategy = _ref.diffStrategy,
      diffStrategy = _ref$diffStrategy === undefined ? _diff2.default : _ref$diffStrategy;

  if (!portName) {
    throw new Error('portName is required in options');
  }
  if (typeof serializer !== 'function') {
    throw new Error('serializer must be a function');
  }
  if (typeof deserializer !== 'function') {
    throw new Error('deserializer must be a function');
  }
  if (typeof diffStrategy !== 'function') {
    throw new Error('diffStrategy must be one of the included diffing strategies or a custom diff function');
  }

  // set dispatch responder as promise responder
  if (!dispatchResponder) {
    dispatchResponder = promiseResponder;
  }

  /**
   * Respond to dispatches from UI components
   */
  var dispatchResponse = function dispatchResponse(request, sender, sendResponse) {
    if (request.type === _constants.DISPATCH_TYPE && request.portName === portName) {
      var action = Object.assign({}, request.payload, {
        _sender: sender
      });

      var dispatchResult = null;

      try {
        dispatchResult = store.dispatch(action);
      } catch (e) {
        dispatchResult = Promise.reject(e.message);
        console.error(e);
      }

      dispatchResponder(dispatchResult, sendResponse);
      return true;
    }
  };

  /**
  * Setup for state updates
  */
  var connectState = function connectState(port) {
    if (port.name !== portName) {
      return;
    }

    var serializedMessagePoster = (0, _serialization.withSerializer)(serializer)(function () {
      return port.postMessage.apply(port, arguments);
    });

    var prevState = store.getState();

    var patchState = function patchState() {
      var state = store.getState();
      var diff = diffStrategy(prevState, state);

      if (diff.length) {
        prevState = state;

        serializedMessagePoster({
          type: _constants.PATCH_STATE_TYPE,
          payload: diff
        });
      }
    };

    // Send patched state down connected port on every redux store state change
    var unsubscribe = store.subscribe(patchState);

    // when the port disconnects, unsubscribe the sendState listener
    port.onDisconnect.addListener(unsubscribe);

    // Send store's initial state through port
    serializedMessagePoster({
      type: _constants.STATE_TYPE,
      payload: prevState
    });
  };

  var withPayloadDeserializer = (0, _serialization.withDeserializer)(deserializer);
  var shouldDeserialize = function shouldDeserialize(request) {
    return request.type === _constants.DISPATCH_TYPE && request.portName === portName;
  };

  /**
   * Setup action handler
   */
  withPayloadDeserializer(function () {
    var _chrome$runtime$onMes;

    return (_chrome$runtime$onMes = chrome.runtime.onMessage).addListener.apply(_chrome$runtime$onMes, arguments);
  })(dispatchResponse, shouldDeserialize);

  /**
   * Setup external action handler
   */
  if (chrome.runtime.onMessageExternal) {
    withPayloadDeserializer(function () {
      var _chrome$runtime$onMes2;

      return (_chrome$runtime$onMes2 = chrome.runtime.onMessageExternal).addListener.apply(_chrome$runtime$onMes2, arguments);
    })(dispatchResponse, shouldDeserialize);
  } else {
    console.warn('runtime.onMessageExternal is not supported');
  }

  /**
   * Setup extended connection
   */
  chrome.runtime.onConnect.addListener(connectState);

  /**
   * Setup extended external connection
   */
  if (chrome.runtime.onConnectExternal) {
    chrome.runtime.onConnectExternal.addListener(connectState);
  } else {
    console.warn('runtime.onConnectExternal is not supported');
  }
};
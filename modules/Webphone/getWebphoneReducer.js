'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVideoElementPreparedReducer = getVideoElementPreparedReducer;
exports.getConnectionStatusReducer = getConnectionStatusReducer;
exports.getErrorCodeReducer = getErrorCodeReducer;
exports.getConnectRetryCountsReducer = getConnectRetryCountsReducer;
exports.getWebphoneCountsReducer = getWebphoneCountsReducer;
exports.getActiveSessionIdReducer = getActiveSessionIdReducer;
exports.getRingSessionIdReducer = getRingSessionIdReducer;
exports.getSessionsReducer = getSessionsReducer;
exports.getMinimizedReducer = getMinimizedReducer;
exports.getUserMediaReducer = getUserMediaReducer;
exports.default = getWebphoneReducer;

var _redux = require('redux');

var _getModuleStatusReducer = require('../../lib/getModuleStatusReducer');

var _getModuleStatusReducer2 = _interopRequireDefault(_getModuleStatusReducer);

var _connectionStatus = require('./connectionStatus');

var _connectionStatus2 = _interopRequireDefault(_connectionStatus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getVideoElementPreparedReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var _ref = arguments[1];
    var type = _ref.type;

    if (type === types.videoElementPrepared) return true;
    return state;
  };
}

function getConnectionStatusReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _connectionStatus2.default.disconnected;
    var _ref2 = arguments[1];
    var type = _ref2.type;

    switch (type) {
      case types.connect:
      case types.reconnect:
        return _connectionStatus2.default.connecting;
      case types.registered:
        return _connectionStatus2.default.connected;
      case types.unregistered:
        return _connectionStatus2.default.disconnected;
      case types.disconnect:
        return _connectionStatus2.default.disconnecting;
      case types.connectError:
      case types.registrationFailed:
        return _connectionStatus2.default.connectFailed;
      default:
        return state;
    }
  };
}

function getErrorCodeReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var _ref3 = arguments[1];
    var type = _ref3.type,
        _ref3$errorCode = _ref3.errorCode,
        errorCode = _ref3$errorCode === undefined ? state : _ref3$errorCode;

    switch (type) {
      case types.connectError:
      case types.registrationFailed:
        return errorCode;
      default:
        return state;
    }
  };
}

function getConnectRetryCountsReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var _ref4 = arguments[1];
    var type = _ref4.type;

    switch (type) {
      case types.reconnect:
        return state + 1;
      case types.resetRetryCounts:
      case types.registered:
        return 0;
      default:
        return state;
    }
  };
}

function getWebphoneCountsReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var _ref5 = arguments[1];
    var type = _ref5.type;

    switch (type) {
      case types.reconnect:
      case types.connect:
        return state + 1;
      case types.connectError:
      case types.disconnect:
      case types.registrationFailed:
        return state - 1;
      default:
        return state;
    }
  };
}

function getActiveSessionIdReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var _ref6 = arguments[1];
    var type = _ref6.type,
        sessionId = _ref6.sessionId;

    switch (type) {
      case types.callStart:
        return sessionId;
      case types.callEnd:
        if (sessionId === state) {
          return null;
        }
        return state;
      case types.disconnect:
        return null;
      default:
        return state;
    }
  };
}

function getRingSessionIdReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var _ref7 = arguments[1];
    var type = _ref7.type,
        sessionId = _ref7.sessionId;

    switch (type) {
      case types.callRing:
        return sessionId;
      case types.callStart:
      case types.callEnd:
        if (sessionId === state) {
          return null;
        }
        return state;
      case types.disconnect:
        return null;
      default:
        return state;
    }
  };
}

function getSessionsReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var _ref8 = arguments[1];
    var type = _ref8.type,
        sessions = _ref8.sessions;

    switch (type) {
      case types.updateSessions:
        return sessions;
      case types.destroySessions:
        return [];
      default:
        return state;
    }
  };
}

function getMinimizedReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var _ref9 = arguments[1];
    var type = _ref9.type;

    switch (type) {
      case types.toggleMinimized:
        return !state;
      case types.resetMinimized:
        return false;
      default:
        return state;
    }
  };
}

function getUserMediaReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var _ref10 = arguments[1];
    var type = _ref10.type;

    switch (type) {
      case types.getUserMediaSuccess:
        return true;
      default:
        return state;
    }
  };
}

function getWebphoneReducer(types) {
  return (0, _redux.combineReducers)({
    status: (0, _getModuleStatusReducer2.default)(types),
    videoElementPrepared: getVideoElementPreparedReducer(types),
    connectionStatus: getConnectionStatusReducer(types),
    connectRetryCounts: getConnectRetryCountsReducer(types),
    errorCode: getErrorCodeReducer(types),
    webphoneCounts: getWebphoneCountsReducer(types),
    activeSessionId: getActiveSessionIdReducer(types),
    ringSessionId: getRingSessionIdReducer(types),
    sessions: getSessionsReducer(types),
    minimized: getMinimizedReducer(types)
  });
}
//# sourceMappingURL=getWebphoneReducer.js.map

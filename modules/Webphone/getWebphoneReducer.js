'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVideoElementPreparedReducer = getVideoElementPreparedReducer;
exports.getConnectionStatusReducer = getConnectionStatusReducer;
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
    var type = _ref.type,
        _ref$videoElementPrep = _ref.videoElementPrepared,
        videoElementPrepared = _ref$videoElementPrep === undefined ? state : _ref$videoElementPrep;

    if (type === types.init) return videoElementPrepared;
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
        return _connectionStatus2.default.connecting;
      case types.registered:
        return _connectionStatus2.default.connected;
      case types.registrationFailed:
      case types.unregistered:
        return _connectionStatus2.default.disconnected;
      case types.disconnect:
        return _connectionStatus2.default.disconnecting;
      default:
        return state;
    }
  };
}

function getWebphoneReducer(types) {
  return (0, _redux.combineReducers)({
    status: (0, _getModuleStatusReducer2.default)(types),
    videoElementPrepared: getVideoElementPreparedReducer(types),
    connectionStatus: getConnectionStatusReducer(types)
  });
}
//# sourceMappingURL=getWebphoneReducer.js.map

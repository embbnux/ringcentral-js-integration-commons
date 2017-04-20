'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMinimizedReducer = getMinimizedReducer;
exports.getSessionReducer = getSessionReducer;
exports.default = getWebphoneReducer;

var _redux = require('redux');

var _getModuleStatusReducer = require('../../lib/getModuleStatusReducer');

var _getModuleStatusReducer2 = _interopRequireDefault(_getModuleStatusReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getMinimizedReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var _ref = arguments[1];
    var type = _ref.type;

    switch (type) {
      case types.toggleMinimized:
        return !state;
      case types.newSession:
        return false;
      default:
        return state;
    }
  };
}

function getSessionReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var _ref2 = arguments[1];
    var type = _ref2.type,
        session = _ref2.session;

    switch (type) {
      case types.newSession:
        return {
          id: session.id,
          type: session.type,
          toPhoneNumber: session.request.to.uri.user,
          fromPhoneNumber: session.request.from.uri.user,
          status: session.status
        };
      case types.destroySession:
        return null;
      default:
        return state;
    }
  };
}

function getWebphoneReducer(types) {
  return (0, _redux.combineReducers)({
    status: (0, _getModuleStatusReducer2.default)(types),
    minimized: getMinimizedReducer(types),
    session: getSessionReducer(types)
  });
}
//# sourceMappingURL=getActiveCallReducer.js.map

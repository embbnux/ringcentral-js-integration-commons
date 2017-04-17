'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMinimizedReducer = getMinimizedReducer;
exports.getActiveReducer = getActiveReducer;
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

function getActiveReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var _ref2 = arguments[1];
    var type = _ref2.type;

    switch (type) {
      case types.newSession:
        return true;
      case types.destroySession:
        return false;
      default:
        return state;
    }
  };
}

function getWebphoneReducer(types) {
  return (0, _redux.combineReducers)({
    status: (0, _getModuleStatusReducer2.default)(types),
    minimized: getMinimizedReducer(types),
    active: getActiveReducer(types)
  });
}
//# sourceMappingURL=getActiveCallReducer.js.map

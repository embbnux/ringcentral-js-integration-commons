'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCallsReducer = getCallsReducer;
exports.getCallStatusReducer = getCallStatusReducer;
exports.default = getRecentCallsReducer;

var _redux = require('redux');

var _getModuleStatusReducer = require('../../lib/getModuleStatusReducer');

var _getModuleStatusReducer2 = _interopRequireDefault(_getModuleStatusReducer);

var _callStatus = require('./callStatus');

var _callStatus2 = _interopRequireDefault(_callStatus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getCallsReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var _ref = arguments[1];
    var type = _ref.type,
        calls = _ref.calls;

    if (type === types.loadSuccess) return calls;else if (type === types.loadReset) return [];
    return state;
  };
}

function getCallStatusReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var _ref2 = arguments[1];
    var type = _ref2.type;

    switch (type) {
      case types.initLoad:
        return _callStatus2.default.loading;
      case types.loadReset:
      case types.loadSuccess:
        return _callStatus2.default.loaded;
      default:
        return state;
    }
  };
}

function getRecentCallsReducer(types) {
  return (0, _redux.combineReducers)({
    status: (0, _getModuleStatusReducer2.default)(types),
    calls: getCallsReducer(types),
    callStatus: getCallStatusReducer(types)
  });
}
//# sourceMappingURL=getRecentCallsReducer.js.map

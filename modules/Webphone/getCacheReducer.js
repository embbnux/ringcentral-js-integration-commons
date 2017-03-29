'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWebphoneCountsReducer = getWebphoneCountsReducer;
exports.default = getCacheReducer;

var _redux = require('redux');

function getWebphoneCountsReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var _ref = arguments[1];
    var type = _ref.type;

    switch (type) {
      case types.connect:
        return state + 1;
      case types.connectError:
      case types.disconnect:
        return state - 1;
      default:
        return state;
    }
  };
}

function getCacheReducer(types) {
  return (0, _redux.combineReducers)({
    webphoneCounts: getWebphoneCountsReducer(types)
  });
}
//# sourceMappingURL=getCacheReducer.js.map

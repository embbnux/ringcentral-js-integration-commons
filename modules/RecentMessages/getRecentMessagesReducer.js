'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMessagesReducer = getMessagesReducer;
exports.getMessageStatusReducer = getMessageStatusReducer;
exports.default = getRecentMessagesReducer;

var _redux = require('redux');

var _messageStatus = require('./messageStatus');

var _messageStatus2 = _interopRequireDefault(_messageStatus);

var _getModuleStatusReducer = require('../../lib/getModuleStatusReducer');

var _getModuleStatusReducer2 = _interopRequireDefault(_getModuleStatusReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getMessagesReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var _ref = arguments[1];
    var type = _ref.type,
        messages = _ref.messages;

    if (type === types.loadSuccess) return messages;else if (type === types.loadReset) return [];
    return state;
  };
}

function getMessageStatusReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var _ref2 = arguments[1];
    var type = _ref2.type;

    switch (type) {
      case types.initLoad:
        return _messageStatus2.default.loading;
      case types.loadReset:
      case types.loadSuccess:
        return _messageStatus2.default.loaded;
      default:
        return state;
    }
  };
}

function getRecentMessagesReducer(types) {
  return (0, _redux.combineReducers)({
    status: (0, _getModuleStatusReducer2.default)(types),
    messages: getMessagesReducer(types),
    messageStatus: getMessageStatusReducer(types)
  });
}
//# sourceMappingURL=getRecentMessagesReducer.js.map

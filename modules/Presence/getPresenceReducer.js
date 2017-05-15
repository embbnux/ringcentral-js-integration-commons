'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDndStatusReducer = getDndStatusReducer;
exports.getPresenceStatusReducer = getPresenceStatusReducer;
exports.getUserStatusReducer = getUserStatusReducer;
exports.getMessageReducer = getMessageReducer;
exports.default = getPresenceReducer;

var _redux = require('redux');

var _getModuleStatusReducer = require('../../lib/getModuleStatusReducer');

var _getModuleStatusReducer2 = _interopRequireDefault(_getModuleStatusReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDndStatusReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var _ref = arguments[1];
    var type = _ref.type,
        _ref$dndStatus = _ref.dndStatus,
        dndStatus = _ref$dndStatus === undefined ? state : _ref$dndStatus;

    switch (type) {
      case types.notification:
      case types.fetchSuccess:
      case types.updateSuccess:
        return dndStatus;
      case types.resetSuccess:
        return null;
      default:
        return state;
    }
  };
}

function getPresenceStatusReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var _ref2 = arguments[1];
    var type = _ref2.type,
        _ref2$presenceStatus = _ref2.presenceStatus,
        presenceStatus = _ref2$presenceStatus === undefined ? state : _ref2$presenceStatus;

    switch (type) {
      case types.notification:
      case types.fetchSuccess:
      case types.updateSuccess:
        return presenceStatus;
      case types.resetSuccess:
        return null;
      default:
        return state;
    }
  };
}

function getUserStatusReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var _ref3 = arguments[1];
    var type = _ref3.type,
        _ref3$userStatus = _ref3.userStatus,
        userStatus = _ref3$userStatus === undefined ? state : _ref3$userStatus;

    switch (type) {
      case types.notification:
      case types.fetchSuccess:
      case types.updateSuccess:
        return userStatus;
      case types.resetSuccess:
        return null;
      default:
        return state;
    }
  };
}

function getMessageReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var _ref4 = arguments[1];
    var type = _ref4.type,
        _ref4$message = _ref4.message,
        message = _ref4$message === undefined ? state : _ref4$message;

    switch (type) {
      case types.notification:
      case types.fetchSuccess:
      case types.updateSuccess:
        return message;
      case types.resetSuccess:
        return null;
      default:
        return state;
    }
  };
}

function getPresenceReducer(types) {
  return (0, _redux.combineReducers)({
    status: (0, _getModuleStatusReducer2.default)(types),
    dndStatus: getDndStatusReducer(types),
    presenceStatus: getPresenceStatusReducer(types),
    userStatus: getUserStatusReducer(types),
    message: getMessageReducer(types)
  });
}
//# sourceMappingURL=getPresenceReducer.js.map

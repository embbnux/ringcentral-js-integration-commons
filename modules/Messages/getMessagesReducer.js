'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCurrentPageReducer = getCurrentPageReducer;
exports.getSearchInputReducer = getSearchInputReducer;
exports.getPerPageReducer = getPerPageReducer;
exports.default = getMessagesReducer;

var _redux = require('redux');

var _getModuleStatusReducer = require('../../lib/getModuleStatusReducer');

var _getModuleStatusReducer2 = _interopRequireDefault(_getModuleStatusReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getCurrentPageReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var _ref = arguments[1];
    var type = _ref.type,
        _ref$page = _ref.page,
        page = _ref$page === undefined ? state : _ref$page;

    switch (type) {
      case types.previousPage:
        return Math.max(state - 1, 0);
      case types.nextPage:
        return state + 1;
      case types.setPage:
        return page;
      case types.resetSuccess:
        return 0;
      default:
        return state;
    }
  };
}

function getSearchInputReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var _ref2 = arguments[1];
    var type = _ref2.type,
        _ref2$input = _ref2.input,
        input = _ref2$input === undefined ? '' : _ref2$input;

    switch (type) {
      case types.updateSearchInput:
        return input;
      case types.resetSuccess:
        return '';
      default:
        return state;
    }
  };
}

function getPerPageReducer(types) {
  var defaultPerPage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultPerPage;
    var _ref3 = arguments[1];
    var type = _ref3.type,
        _ref3$perPage = _ref3.perPage,
        perPage = _ref3$perPage === undefined ? defaultPerPage : _ref3$perPage;

    switch (type) {
      case types.setPerPage:
        return perPage;
      case types.resetSuccess:
        return defaultPerPage;
      default:
        return state;
    }
  };
}

function getMessagesReducer(types, defaultPerPage) {
  return (0, _redux.combineReducers)({
    status: (0, _getModuleStatusReducer2.default)(types),
    currentPage: getCurrentPageReducer(types),
    perPage: getPerPageReducer(types, defaultPerPage),
    searchInput: getSearchInputReducer(types)
  });
}
//# sourceMappingURL=getMessagesReducer.js.map

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.getMatchRecordReducer = getMatchRecordReducer;
exports.getDataMapReducer = getDataMapReducer;
exports.default = getStorageReducer;

var _redux = require('redux');

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getMatchRecordReducer(actionTypes) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _ref = arguments[1];
    var type = _ref.type,
        data = _ref.data,
        sourceName = _ref.sourceName,
        expiredKeys = _ref.expiredKeys;

    switch (type) {
      case actionTypes.matchSuccess:
        {
          var _ret = function () {
            var now = Date.now();
            var entries = {};
            (0, _keys2.default)(data).forEach(function (query) {
              var result = data[query].length ? _helpers.matchResult.found : _helpers.matchResult.notFound;
              entries[(0, _helpers.getCacheKey)(sourceName, query)] = {
                result: result,
                timestamp: now
              };
            });
            return {
              v: (0, _extends3.default)({}, state, entries)
            };
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
        }
      case actionTypes.cleanUp:
      case actionTypes.initSuccess:
        if (expiredKeys.length) {
          var _ret2 = function () {
            var newState = {};
            (0, _keys2.default)(state).forEach(function (key) {
              if (expiredKeys.indexOf(key) === -1) {
                newState[key] = state[key];
              }
            });
            return {
              v: newState
            };
          }();

          if ((typeof _ret2 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret2)) === "object") return _ret2.v;
        }
        return state;
      default:
        return state;
    }
  };
}

function getDataMapReducer(actionTypes) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _ref2 = arguments[1];
    var type = _ref2.type,
        data = _ref2.data,
        sourceName = _ref2.sourceName,
        expiredKeys = _ref2.expiredKeys;

    switch (type) {
      case actionTypes.matchSuccess:
        {
          var _ret3 = function () {
            var newState = (0, _extends3.default)({}, state);
            (0, _keys2.default)(data).forEach(function (query) {
              if (newState[query] && newState[query].length > 0) {
                newState[query] = newState[query].filter(function (item) {
                  return item.source !== sourceName;
                });
              } else {
                newState[query] = [];
              }
              if (data[query] && data[query].length > 0) {
                newState[query] = newState[query].concat(data[query].map(function (item) {
                  return (0, _extends3.default)({}, item, {
                    source: sourceName
                  });
                }));
              }
            });
            return {
              v: newState
            };
          }();

          if ((typeof _ret3 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret3)) === "object") return _ret3.v;
        }
      case actionTypes.cleanUp:
      case actionTypes.initSuccess:
        if (expiredKeys.length) {
          var _ret4 = function () {
            var deleteMap = {};
            expiredKeys.forEach(function (key) {
              var _parseCacheKey = (0, _helpers.parseCacheKey)(key),
                  _parseCacheKey2 = (0, _slicedToArray3.default)(_parseCacheKey, 2),
                  source = _parseCacheKey2[0],
                  query = _parseCacheKey2[1];

              if (!deleteMap[query]) deleteMap[query] = {};
              deleteMap[query][source] = true;
            });
            var newState = {};
            (0, _keys2.default)(state).forEach(function (query) {
              var newSet = state[query].filter(function (item) {
                return !(deleteMap[query] && deleteMap[query][item.source]);
              });
              if (newSet.length > 0) {
                newState[query] = newSet;
              }
            });
            return {
              v: newState
            };
          }();

          if ((typeof _ret4 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret4)) === "object") return _ret4.v;
        }
        return state;
      default:
        return state;
    }
  };
}

function getStorageReducer(actionTypes) {
  return (0, _redux.combineReducers)({
    dataMap: getDataMapReducer(actionTypes),
    matchRecord: getMatchRecordReducer(actionTypes)
  });
}
//# sourceMappingURL=getCacheReducer.js.map

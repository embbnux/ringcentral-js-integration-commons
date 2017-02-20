'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Presence2 = require('../Presence');

var _Presence3 = _interopRequireDefault(_Presence2);

var _moduleStatus = require('../../enums/moduleStatus');

var _moduleStatus2 = _interopRequireDefault(_moduleStatus);

var _actionTypes = require('./actionTypes');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

var _getDetailedPresenceReducer = require('./getDetailedPresenceReducer');

var _getDetailedPresenceReducer2 = _interopRequireDefault(_getDetailedPresenceReducer);

var _callLogHelpers = require('../../lib/callLogHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var presenceRegExp = /\/presence(\?.*)?/;

var DetailedPresence = function (_Presence) {
  (0, _inherits3.default)(DetailedPresence, _Presence);

  function DetailedPresence(_ref) {
    var _this2 = this;

    var auth = _ref.auth,
        client = _ref.client,
        subscription = _ref.subscription,
        connectivityMonitor = _ref.connectivityMonitor,
        onRinging = _ref.onRinging,
        onNewCall = _ref.onNewCall,
        onCallUpdated = _ref.onCallUpdated,
        onCallEnded = _ref.onCallEnded,
        options = (0, _objectWithoutProperties3.default)(_ref, ['auth', 'client', 'subscription', 'connectivityMonitor', 'onRinging', 'onNewCall', 'onCallUpdated', 'onCallEnded']);
    (0, _classCallCheck3.default)(this, DetailedPresence);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DetailedPresence.__proto__ || (0, _getPrototypeOf2.default)(DetailedPresence)).call(this, (0, _extends3.default)({}, options, {
      actionTypes: _actionTypes2.default
    })));

    _this._subscriptionHandler = function (message) {
      if (presenceRegExp.test(message.event) && message.body) {
        var _message$body = message.body,
            activeCalls = _message$body.activeCalls,
            dndStatus = _message$body.dndStatus;

        _this.store.dispatch({
          type: _this.actionTypes.notification,
          activeCalls: activeCalls,
          dndStatus: dndStatus,
          timestamp: Date.now()
        });
      }
    };

    _this._onStateChange = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(_this._auth.loggedIn && _this._subscription.ready && (!_this._connectivityMonitor || _this._connectivityMonitor.ready) && _this.status === _moduleStatus2.default.pending)) {
                _context.next = 9;
                break;
              }

              _this.store.dispatch({
                type: _this.actionTypes.init
              });
              if (_this._connectivityMonitor) {
                _this._connectivity = _this._connectivityMonitor.connectivity;
              }
              _context.next = 5;
              return _this.fetch();

            case 5:
              _this._subscription.subscribe('/account/~/extension/~/presence?detailedTelephonyState=true');
              _this.store.dispatch({
                type: _this.actionTypes.initSuccess
              });
              _context.next = 10;
              break;

            case 9:
              if ((!_this._auth.loggedIn || !_this._subscription.ready || _this._connectivityMonitor && !_this._connectivityMonitor.ready) && _this.ready) {
                _this._lastProcessedCalls = [];
                _this.store.dispatch({
                  type: _this.actionTypes.resetSuccess
                });
              } else if (_this.ready && _this._subscription.ready && _this._subscription.message && _this._subscription.message !== _this._lastMessage) {
                _this._lastMessage = _this._subscription.message;
                _this._subscriptionHandler(_this._lastMessage);
              } else if (_this.ready && _this._connectivityMonitor && _this._connectivityMonitor.ready && _this._connectivity !== _this._connectivityMonitor.connectivity) {
                _this._connectivity = _this._connectivityMonitor.connectivity;
                // fetch data on regain connectivity
                if (_this._connectivity) {
                  _this._fetch();
                }
              } else if (_this.ready && _this._lastProcessedCalls !== _this.calls) {
                (function () {
                  var oldCalls = [].concat((0, _toConsumableArray3.default)(_this._lastProcessedCalls));
                  _this._lastProcessedCalls = _this.calls;

                  _this.calls.forEach(function (call) {
                    var oldCallIndex = oldCalls.findIndex(function (item) {
                      return item.sessionId === call.sessionId;
                    });
                    var onRingingCalled = false;
                    if (oldCallIndex === -1) {
                      if (typeof _this._onNewCall === 'function') {
                        _this._onNewCall(call);
                      }
                      if (typeof _this._onRinging === 'function' && !onRingingCalled && (0, _callLogHelpers.isRinging)(call)) {
                        _this._onRinging();
                        onRingingCalled = true;
                      }
                    } else {
                      var oldCall = oldCalls[oldCallIndex];
                      oldCalls.splice(oldCallIndex, 1);
                      if (call.telephonyStatus !== oldCall.telephonyStatus && typeof _this._onCallUpdated === 'function') {
                        _this._onCallUpdated(call);
                      }
                    }
                  });
                  oldCalls.forEach(function (call) {
                    if (typeof _this._onCallEnded === 'function') {
                      _this._onCallEnded(call);
                    }
                  });
                })();
              }

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this2);
    }));

    _this._auth = auth;
    _this._client = client;
    _this._subscription = subscription;
    _this._connectivityMonitor = connectivityMonitor;
    _this._onRinging = onRinging;
    _this._onNewCall = onNewCall;
    _this._onCallUpdated = onCallUpdated;
    _this._onCallEnded = onCallEnded;

    _this._reducer = (0, _getDetailedPresenceReducer2.default)(_this.actionTypes);
    _this._lastMessage = null;
    _this.addSelector('sessionIdList', function () {
      return _this.state.calls;
    }, function (calls) {
      return calls.map(function (call) {
        return call.sessionId;
      });
    });
    _this._lastProcessedCalls = [];
    return _this;
  }

  (0, _createClass3.default)(DetailedPresence, [{
    key: 'initialize',
    value: function initialize() {
      this.store.subscribe(this._onStateChange);
    }
  }, {
    key: '_fetch',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var ownerId, _json, activeCalls, dndStatus;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.store.dispatch({
                  type: this.actionTypes.fetch
                });
                ownerId = this._auth.ownerId;
                _context2.prev = 2;
                _context2.next = 5;
                return this._client.service.platform().get('/account/~/extension/~/presence?detailedTelephonyState=true');

              case 5:
                _json = _context2.sent.json();
                activeCalls = _json.activeCalls;
                dndStatus = _json.dndStatus;

                if (this._auth.ownerId === ownerId) {
                  this.store.dispatch({
                    type: this.actionTypes.fetchSuccess,
                    activeCalls: activeCalls,
                    dndStatus: dndStatus,
                    timestamp: Date.now()
                  });
                  this._promise = null;
                }
                _context2.next = 14;
                break;

              case 11:
                _context2.prev = 11;
                _context2.t0 = _context2['catch'](2);

                if (this._auth.ownerId === ownerId) {
                  this.store.dispatch({
                    type: this.actionTypes.fetchError,
                    error: _context2.t0
                  });
                  this._promise = null;
                }

              case 14:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[2, 11]]);
      }));

      function _fetch() {
        return _ref3.apply(this, arguments);
      }

      return _fetch;
    }()
  }, {
    key: 'calls',
    get: function get() {
      return this.state.calls;
    }
  }, {
    key: 'sessionIdList',
    get: function get() {
      return this._selectors.sessionIdList();
    }
  }]);
  return DetailedPresence;
}(_Presence3.default);

exports.default = DetailedPresence;
//# sourceMappingURL=index.js.map

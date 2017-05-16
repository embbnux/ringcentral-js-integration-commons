'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

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

var _RcModule2 = require('../../lib/RcModule');

var _RcModule3 = _interopRequireDefault(_RcModule2);

var _getPresenceReducer = require('./getPresenceReducer');

var _getPresenceReducer2 = _interopRequireDefault(_getPresenceReducer);

var _actionTypes = require('./actionTypes');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

var _loginStatus = require('../Auth/loginStatus');

var _loginStatus2 = _interopRequireDefault(_loginStatus);

var _moduleStatuses = require('../../enums/moduleStatuses');

var _moduleStatuses2 = _interopRequireDefault(_moduleStatuses);

var _dndStatus = require('./dndStatus');

var _dndStatus2 = _interopRequireDefault(_dndStatus);

var _presenceStatus = require('./presenceStatus');

var _presenceStatus2 = _interopRequireDefault(_presenceStatus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var presenceEndPoint = /.*\/presence(\?.*)?/;

var DELAY_TIME = 2 * 1000;

var Presence = function (_RcModule) {
  (0, _inherits3.default)(Presence, _RcModule);

  function Presence(_ref) {
    var auth = _ref.auth,
        client = _ref.client,
        subscription = _ref.subscription,
        _ref$actionTypes = _ref.actionTypes,
        actionTypes = _ref$actionTypes === undefined ? _actionTypes2.default : _ref$actionTypes,
        options = (0, _objectWithoutProperties3.default)(_ref, ['auth', 'client', 'subscription', 'actionTypes']);
    (0, _classCallCheck3.default)(this, Presence);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Presence.__proto__ || (0, _getPrototypeOf2.default)(Presence)).call(this, (0, _extends3.default)({}, options, {
      actionTypes: actionTypes
    })));

    _this._subscriptionHandler = function (message) {
      if (message && presenceEndPoint.test(message.event) && message.body) {
        _this.store.dispatch((0, _extends3.default)({
          type: _this.actionTypes.notification
        }, message.body));
      }
    };

    _this._auth = auth;
    _this._client = client;
    _this._subscription = subscription;

    _this._reducer = (0, _getPresenceReducer2.default)(_this.actionTypes);
    _this._lastMessage = null;

    _this.setAvailable = _this.setAvailable.bind(_this);
    _this.setBusy = _this.setBusy.bind(_this);
    _this.setDoNotDisturb = _this.setDoNotDisturb.bind(_this);
    _this.setInvisible = _this.setInvisible.bind(_this);
    _this._delayTimeoutId = null;
    return _this;
  }

  (0, _createClass3.default)(Presence, [{
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      this.store.subscribe((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(_this2._auth.loginStatus === _loginStatus2.default.loggedIn && _this2._subscription.ready && _this2.status === _moduleStatuses2.default.pending)) {
                  _context.next = 8;
                  break;
                }

                _this2.store.dispatch({
                  type: _this2.actionTypes.init
                });
                _context.next = 4;
                return _this2.fetch();

              case 4:
                _this2._subscription.subscribe('/account/~/extension/~/presence');
                _this2.store.dispatch({
                  type: _this2.actionTypes.initSuccess
                });
                _context.next = 9;
                break;

              case 8:
                if ((_this2._auth.loginStatus !== _loginStatus2.default.loggedIn || !_this2._subscription.ready) && _this2.ready) {
                  _this2.store.dispatch({
                    type: _this2.actionTypes.resetSuccess
                  });
                } else if (_this2.ready && _this2._subscription.ready && _this2._subscription.message && _this2._subscription.message !== _this2._lastMessage) {
                  _this2._lastMessage = _this2._subscription.message;
                  _this2._subscriptionHandler(_this2._lastMessage);
                }

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2);
      })));
    }
  }, {
    key: '_fetch',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var ownerId, data;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.store.dispatch({
                  type: this.actionTypes.fetch
                });
                _context2.prev = 1;
                ownerId = this._auth.ownerId;
                _context2.next = 5;
                return this._client.account().extension().presence().get();

              case 5:
                data = _context2.sent;

                if (ownerId === this._auth.ownerId) {
                  this.store.dispatch((0, _extends3.default)({
                    type: this.actionTypes.fetchSuccess
                  }, data));
                }
                this._promise = null;
                _context2.next = 15;
                break;

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2['catch'](1);

                this._promise = null;
                this.store.dispatch({
                  type: this.actionTypes.fetchError,
                  error: _context2.t0
                });
                throw _context2.t0;

              case 15:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1, 10]]);
      }));

      function _fetch() {
        return _ref3.apply(this, arguments);
      }

      return _fetch;
    }()
  }, {
    key: 'fetch',
    value: function fetch() {
      if (!this._promise) {
        this._promise = this._fetch();
      }
      return this._promise;
    }
  }, {
    key: '_update',
    value: function _update(params) {
      var oldStatus = {
        dndStatus: this.dndStatus,
        userStatus: this.userStatus
      };
      this.store.dispatch((0, _extends3.default)({
        type: this.actionTypes.update
      }, params));
      this._delayUpdate(params, oldStatus);
    }
  }, {
    key: '_delayUpdate',
    value: function _delayUpdate(params, oldStatus) {
      var _this3 = this;

      this._clearDelayTimeout();
      this._delayTimeoutId = setTimeout((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
        var ownerId, platform, response, data;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _this3._delayTimeoutId = null;
                _context3.prev = 1;
                ownerId = _this3._auth.ownerId;
                platform = _this3._client.service.platform();
                _context3.next = 6;
                return platform.put('/account/~/extension/~/presence', params);

              case 6:
                response = _context3.sent;
                data = response.json();

                if (ownerId === _this3._auth.ownerId) {
                  _this3.store.dispatch((0, _extends3.default)({
                    type: _this3.actionTypes.updateSuccess
                  }, data));
                }
                _context3.next = 15;
                break;

              case 11:
                _context3.prev = 11;
                _context3.t0 = _context3['catch'](1);

                _this3.store.dispatch((0, _extends3.default)({
                  type: _this3.actionTypes.updateError,
                  error: _context3.t0
                }, oldStatus));
                console.error(_context3.t0);

              case 15:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this3, [[1, 11]]);
      })), DELAY_TIME);
    }
  }, {
    key: '_clearDelayTimeout',
    value: function _clearDelayTimeout() {
      if (this._delayTimeoutId) clearTimeout(this._delayTimeoutId);
    }
  }, {
    key: '_getUpdateStatusParams',
    value: function _getUpdateStatusParams(userStatusParams) {
      var params = {
        dndStatus: this.dndStatus,
        userStatus: userStatusParams
      };
      if (params.dndStatus !== _dndStatus2.default.takeAllCalls && params.dndStatus !== _dndStatus2.default.doNotAcceptDepartmentCalls) {
        params.dndStatus = _dndStatus2.default.takeAllCalls;
      }
      return params;
    }
  }, {
    key: 'setAvailable',
    value: function setAvailable() {
      if (this.presenceStatus === _presenceStatus2.default.available) {
        return;
      }
      var params = this._getUpdateStatusParams(_presenceStatus2.default.available);
      this._update(params);
    }
  }, {
    key: 'setBusy',
    value: function setBusy() {
      if (this.presenceStatus === _presenceStatus2.default.busy && this.dndStatus !== _dndStatus2.default.doNotAcceptAnyCalls) {
        return;
      }
      var params = this._getUpdateStatusParams(_presenceStatus2.default.busy);
      this._update(params);
    }
  }, {
    key: 'setDoNotDisturb',
    value: function setDoNotDisturb() {
      if (this.presenceStatus === _presenceStatus2.default.busy && this.dndStatus === _dndStatus2.default.doNotAcceptAnyCalls) {
        return;
      }
      var params = {
        dndStatus: _dndStatus2.default.doNotAcceptAnyCalls,
        userStatus: _presenceStatus2.default.busy
      };
      this._update(params);
    }
  }, {
    key: 'setInvisible',
    value: function setInvisible() {
      if (this.presenceStatus === _presenceStatus2.default.offline) {
        return;
      }
      var params = this._getUpdateStatusParams(_presenceStatus2.default.offline);
      this._update(params);
    }
  }, {
    key: 'toggleAcceptCallQueueCalls',
    value: function toggleAcceptCallQueueCalls() {
      var params = {
        userStatus: this.userStatus
      };
      if (this.dndStatus === _dndStatus2.default.takeAllCalls) {
        params.dndStatus = _dndStatus2.default.doNotAcceptDepartmentCalls;
      } else if (this.dndStatus === _dndStatus2.default.doNotAcceptDepartmentCalls) {
        params.dndStatus = _dndStatus2.default.takeAllCalls;
      }
      if (params.dndStatus) {
        this._update(params);
      }
    }
  }, {
    key: 'status',
    get: function get() {
      return this.state.status;
    }
  }, {
    key: 'ready',
    get: function get() {
      return this.state.status === _moduleStatuses2.default.ready;
    }
  }, {
    key: 'dndStatus',
    get: function get() {
      return this.state.dndStatus;
    }
  }, {
    key: 'userStatus',
    get: function get() {
      return this.state.userStatus;
    }
  }, {
    key: 'message',
    get: function get() {
      return this.state.message;
    }
  }, {
    key: 'presenceStatus',
    get: function get() {
      return this.state.presenceStatus;
    }
  }]);
  return Presence;
}(_RcModule3.default);

exports.default = Presence;
//# sourceMappingURL=index.js.map

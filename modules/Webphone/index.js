'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

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

var _desc, _value, _class;

var _ringcentralWebPhone = require('ringcentral-web-phone');

var _ringcentralWebPhone2 = _interopRequireDefault(_ringcentralWebPhone);

var _incoming = require('ringcentral-web-phone/audio/incoming.ogg');

var _incoming2 = _interopRequireDefault(_incoming);

var _outgoing = require('ringcentral-web-phone/audio/outgoing.ogg');

var _outgoing2 = _interopRequireDefault(_outgoing);

var _RcModule2 = require('../../lib/RcModule');

var _RcModule3 = _interopRequireDefault(_RcModule2);

var _sleep = require('../../lib/sleep');

var _sleep2 = _interopRequireDefault(_sleep);

var _moduleStatuses = require('../../enums/moduleStatuses');

var _moduleStatuses2 = _interopRequireDefault(_moduleStatuses);

var _connectionStatus = require('./connectionStatus');

var _connectionStatus2 = _interopRequireDefault(_connectionStatus);

var _sessionStatus = require('./sessionStatus');

var _sessionStatus2 = _interopRequireDefault(_sessionStatus);

var _actionTypes = require('./actionTypes');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

var _callDirections = require('../../enums/callDirections');

var _callDirections2 = _interopRequireDefault(_callDirections);

var _webphoneErrors = require('./webphoneErrors');

var _webphoneErrors2 = _interopRequireDefault(_webphoneErrors);

var _ensureExist = require('../../lib/ensureExist');

var _ensureExist2 = _interopRequireDefault(_ensureExist);

var _proxify = require('../../lib/proxy/proxify');

var _proxify2 = _interopRequireDefault(_proxify);

var _webphoneHelper = require('./webphoneHelper');

var _getWebphoneReducer = require('./getWebphoneReducer');

var _getWebphoneReducer2 = _interopRequireDefault(_getWebphoneReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var FIRST_THREE_RETRIES_DELAY = 10 * 1000;
var FOURTH_RETRIES_DELAY = 30 * 1000;
var FIFTH_RETRIES_DELAY = 60 * 1000;
var MAX_RETRIES_DELAY = 2 * 60 * 1000;

var Webphone = (_class = function (_RcModule) {
  (0, _inherits3.default)(Webphone, _RcModule);

  function Webphone(_ref) {
    var appKey = _ref.appKey,
        appName = _ref.appName,
        appVersion = _ref.appVersion,
        alert = _ref.alert,
        auth = _ref.auth,
        client = _ref.client,
        rolesAndPermissions = _ref.rolesAndPermissions,
        _ref$webphoneLogLevel = _ref.webphoneLogLevel,
        webphoneLogLevel = _ref$webphoneLogLevel === undefined ? 3 : _ref$webphoneLogLevel,
        storage = _ref.storage,
        contactMatcher = _ref.contactMatcher,
        extensionDevice = _ref.extensionDevice,
        options = (0, _objectWithoutProperties3.default)(_ref, ['appKey', 'appName', 'appVersion', 'alert', 'auth', 'client', 'rolesAndPermissions', 'webphoneLogLevel', 'storage', 'contactMatcher', 'extensionDevice']);
    (0, _classCallCheck3.default)(this, Webphone);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Webphone.__proto__ || (0, _getPrototypeOf2.default)(Webphone)).call(this, (0, _extends3.default)({}, options, {
      actionTypes: _actionTypes2.default
    })));

    _this._appKey = appKey;
    _this._appName = appName;
    _this._appVersion = appVersion;
    _this._alert = alert;
    _this._webphoneLogLevel = webphoneLogLevel;
    _this._auth = (0, _ensureExist2.default)(auth, 'auth');
    _this._client = (0, _ensureExist2.default)(client, 'client');
    _this._rolesAndPermissions = (0, _ensureExist2.default)(rolesAndPermissions, 'rolesAndPermissions');
    _this._extensionDevice = (0, _ensureExist2.default)(extensionDevice, 'extensionDevice');
    _this._storage = storage;
    _this._storageWebphoneCountsKey = 'webphoneCounts';
    _this._contactMatcher = contactMatcher;
    _this._webphone = null;
    _this._remoteVideo = null;
    _this._localVideo = null;

    _this._activeSession = null;
    _this._sessions = new _map2.default();

    _this._reducer = (0, _getWebphoneReducer2.default)(_this.actionTypes);

    storage.registerReducer({
      key: _this._storageWebphoneCountsKey,
      reducer: (0, _getWebphoneReducer.getWebphoneCountsReducer)(_this.actionTypes)
    });

    _this.addSelector('sessionPhoneNumbers', function () {
      return _this.sessions;
    }, function (sessions) {
      var outputs = [];
      sessions.forEach(function (session) {
        outputs.push(session.to);
        outputs.push(session.from);
      });
      return outputs;
    });

    if (_this._contactMatcher) {
      _this._contactMatcher.addQuerySource({
        getQueriesFn: _this._selectors.sessionPhoneNumbers,
        readyCheckFn: function readyCheckFn() {
          return _this.ready;
        }
      });
    }
    return _this;
  }

  (0, _createClass3.default)(Webphone, [{
    key: '_prepareVideoElement',
    value: function _prepareVideoElement() {
      this._remoteVideo = document.createElement('video');
      this._remoteVideo.setAttribute('hidden', 'hidden');
      this._localVideo = document.createElement('video');
      this._localVideo.setAttribute('hidden', 'hidden');
      this._localVideo.setAttribute('muted', 'muted');
      document.body.appendChild(this._remoteVideo);
      document.body.appendChild(this._localVideo);

      this.store.dispatch({
        type: this.actionTypes.videoElementPrepared
      });
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
          window.addEventListener('load', function () {
            _this2._prepareVideoElement();
          });
        } else {
          this._prepareVideoElement();
        }
        window.addEventListener('unload', function () {
          _this2._disconnect();
        });
      }
      this.store.subscribe(function () {
        return _this2._onStateChange();
      });
    }
    // initializeProxy() {
    //   navigator.webkitGetUserMedia({ audio: true });
    // }

  }, {
    key: '_onStateChange',
    value: function _onStateChange() {
      if (this._shouldInit()) {
        this.store.dispatch({
          type: this.actionTypes.initSuccess
        });
      } else if (this._shouldReset()) {
        this.store.dispatch({
          type: this.actionTypes.resetSuccess
        });
        this.disconnect();
      }
    }
  }, {
    key: '_shouldInit',
    value: function _shouldInit() {
      return this._auth.loggedIn && this._rolesAndPermissions.ready && this._extensionDevice.ready && !this.ready;
    }
  }, {
    key: '_shouldReset',
    value: function _shouldReset() {
      return (!this._auth.loggedIn || !this._rolesAndPermissions.ready || !this._extensionDevice.ready) && this.ready;
    }
  }, {
    key: '_sipProvision',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var response;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this._client.service.platform().post('/client-info/sip-provision', {
                  sipInfo: [{ transport: 'WSS' }]
                });

              case 2:
                response = _context.sent;
                return _context.abrupt('return', response.json());

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _sipProvision() {
        return _ref2.apply(this, arguments);
      }

      return _sipProvision;
    }()
  }, {
    key: '_createWebphone',
    value: function _createWebphone(provisionData) {
      var _this3 = this;

      this._webphone = new _ringcentralWebPhone2.default(provisionData, {
        appKey: this._appKey,
        appName: this._appName,
        appVersion: this._appVersion,
        uuid: this._auth.endpoingId,
        logLevel: this._webphoneLogLevel, // error 0, warn 1, log: 2, debug: 3
        audioHelper: {
          enabled: true, // enables audio feedback when web phone is ringing or making a call
          incoming: _incoming2.default, // path to audio file for incoming call
          outgoing: _outgoing2.default // path to aduotfile for outgoing call
        }
      });

      var onRegistered = function onRegistered() {
        _this3.store.dispatch({
          type: _this3.actionTypes.registered
        });
      };
      var onUnregistered = function onUnregistered() {
        _this3.store.dispatch({
          type: _this3.actionTypes.unregistered
        });
      };
      var onRegistrationFailed = function onRegistrationFailed(error) {
        var needToReconnect = true;
        var errorCode = void 0;
        console.error(error);
        _this3._webphone.userAgent.removeAllListeners();
        _this3._webphone = null;
        if (error && error.reason_phrase && error.reason_phrase.indexOf('Too Many Contacts') > -1) {
          errorCode = _webphoneErrors2.default.webphoneCountOverLimit;
          _this3._alert.warning({
            message: errorCode
          });
          needToReconnect = false;
        }
        _this3.store.dispatch({
          type: _this3.actionTypes.registrationFailed,
          errorCode: errorCode,
          error: error
        });
        if (needToReconnect) {
          _this3._connect(needToReconnect);
        }
      };
      this._webphone.userAgent.audioHelper.setVolume(0.3);
      this._webphone.userAgent.on('registered', onRegistered);
      this._webphone.userAgent.on('unregistered', onUnregistered);
      this._webphone.userAgent.once('registrationFailed', onRegistrationFailed);
      this._webphone.userAgent.on('invite', function (session) {
        console.debug('UA invite');
        _this3._onInvite(session);
      });
      (0, _webphoneHelper.patchUserAgent)(this._webphone.userAgent);
    }
  }, {
    key: '_connect',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var reconnect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var sipProvision, needToReconnect, errorCode;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;

                if (!reconnect) {
                  _context2.next = 4;
                  break;
                }

                _context2.next = 4;
                return this._retrySleep();

              case 4:
                if (!(this.connectionStatus === _connectionStatus2.default.connecting)) {
                  _context2.next = 6;
                  break;
                }

                return _context2.abrupt('return');

              case 6:
                if (!(reconnect && this.connectionStatus !== _connectionStatus2.default.connectFailed)) {
                  _context2.next = 9;
                  break;
                }

                this.store.dispatch({
                  type: this.actionTypes.resetRetryCounts
                });
                return _context2.abrupt('return');

              case 9:

                this.store.dispatch({
                  type: reconnect ? this.actionTypes.reconnect : this.actionTypes.connect
                });

                _context2.next = 12;
                return this._sipProvision();

              case 12:
                sipProvision = _context2.sent;

                if (!(this.connectionStatus === _connectionStatus2.default.disconnecting)) {
                  _context2.next = 15;
                  break;
                }

                return _context2.abrupt('return');

              case 15:
                this._createWebphone(sipProvision);
                _context2.next = 33;
                break;

              case 18:
                _context2.prev = 18;
                _context2.t0 = _context2['catch'](0);

                console.error(_context2.t0);
                this._alert.warning({
                  message: _webphoneErrors2.default.connectFailed,
                  ttl: 0,
                  allowDuplicates: false
                });
                needToReconnect = true;
                errorCode = void 0;

                if (!(_context2.t0 && _context2.t0.message && _context2.t0.message.indexOf('Feature [WebPhone] is not available') > -1)) {
                  _context2.next = 29;
                  break;
                }

                this._rolesAndPermissions.refreshServiceFeatures();
                needToReconnect = false;
                errorCode = _webphoneErrors2.default.notWebphonePermission;
                return _context2.abrupt('return');

              case 29:
                this.store.dispatch({
                  type: this.actionTypes.connectError,
                  errorCode: errorCode,
                  error: _context2.t0
                });

                if (!needToReconnect) {
                  _context2.next = 33;
                  break;
                }

                _context2.next = 33;
                return this._connect(needToReconnect);

              case 33:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 18]]);
      }));

      function _connect() {
        return _ref3.apply(this, arguments);
      }

      return _connect;
    }()
  }, {
    key: 'connect',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this._auth.checkIsLoggedIn();

              case 2:
                _context3.t1 = _context3.sent;

                if (!_context3.t1) {
                  _context3.next = 5;
                  break;
                }

                _context3.t1 = this.enabled;

              case 5:
                _context3.t0 = _context3.t1;

                if (!_context3.t0) {
                  _context3.next = 8;
                  break;
                }

                _context3.t0 = this.connectionStatus === _connectionStatus2.default.disconnected;

              case 8:
                if (!_context3.t0) {
                  _context3.next = 19;
                  break;
                }

                if ((0, _webphoneHelper.isBrowerSupport)()) {
                  _context3.next = 13;
                  break;
                }

                this.store.dispatch({
                  type: this.actionTypes.connectError,
                  errorCode: _webphoneErrors2.default.browserNotSupported
                });
                this._alert.warning({
                  message: _webphoneErrors2.default.browserNotSupported,
                  ttl: 0
                });
                return _context3.abrupt('return');

              case 13:
                if (!(this._extensionDevice.phoneLines.length === 0)) {
                  _context3.next = 17;
                  break;
                }

                this.store.dispatch({
                  type: this.actionTypes.connectError,
                  errorCode: _webphoneErrors2.default.notOutboundCallWithoutDL
                });
                this._alert.warning({
                  message: _webphoneErrors2.default.notOutboundCallWithoutDL
                });
                return _context3.abrupt('return');

              case 17:
                _context3.next = 19;
                return this._connect();

              case 19:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function connect() {
        return _ref4.apply(this, arguments);
      }

      return connect;
    }()
  }, {
    key: '_disconnect',
    value: function _disconnect() {
      var _this4 = this;

      if (this.connectionStatus === _connectionStatus2.default.connected || this.connectionStatus === _connectionStatus2.default.connecting || this.connectionStatus === _connectionStatus2.default.connectFailed) {
        this.store.dispatch({
          type: this.actionTypes.disconnect
        });
        if (this._webphone) {
          this._sessions.forEach(function (session) {
            _this4.hangup(session);
          });
          if (this._webphone.userAgent) {
            this._webphone.userAgent.stop();
            this._webphone.userAgent.unregister();
          }
          this._webphone = null;
          this._activeSession = null;
          this._sessions = new _map2.default();
          this._removeActiveSession();
          this._updateSessions();
        }
        this.store.dispatch({
          type: this.actionTypes.unregistered
        });
      }
    }
  }, {
    key: 'disconnect',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this._disconnect();

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function disconnect() {
        return _ref5.apply(this, arguments);
      }

      return disconnect;
    }()
  }, {
    key: '_onNewCall',
    value: function _onNewCall() {
      if (this._contactMatcher) {
        this._contactMatcher.triggerMatch();
      }
    }
  }, {
    key: '_onAccepted',
    value: function _onAccepted(session) {
      var _this5 = this;

      session.on('accepted', function () {
        console.log('accepted');
        session.callStatus = _sessionStatus2.default.connected;
        _this5._updateCurrentSessionAndSessions(session);
      });
      session.on('progress', function () {
        console.log('progress...');
        session.callStatus = _sessionStatus2.default.connecting;
        _this5._updateCurrentSessionAndSessions(session);
      });
      session.on('rejected', function () {
        console.log('rejected');
        session.callStatus = _sessionStatus2.default.finished;
        _this5._removeSession(session);
      });
      session.on('failed', function (response, cause) {
        console.log('Event: Failed');
        console.log(cause);
        session.callStatus = _sessionStatus2.default.finished;
        _this5._removeSession(session);
      });
      session.on('terminated', function () {
        console.log('Event: Terminated');
        session.callStatus = _sessionStatus2.default.finished;
        _this5._removeSession(session);
      });
      session.on('cancel', function () {
        console.log('Event: Cancel');
        session.callStatus = _sessionStatus2.default.finished;
        _this5._removeSession(session);
      });
      session.on('refer', function () {
        console.log('Event: Refer');
      });
      session.on('replaced', function (newSession) {
        session.callStatus = _sessionStatus2.default.replaced;
        newSession.callStatus = _sessionStatus2.default.connected;
        newSession.direction = _callDirections2.default.inbound;
        _this5._addSession(newSession);
        _this5.onAccepted(newSession);
      });
      session.on('muted', function () {
        console.log('Event: Muted');
        session.isOnMute = true;
        session.callStatus = _sessionStatus2.default.onMute;
      });
      session.on('unmuted', function () {
        console.log('Event: Unmuted');
        session.isOnMute = false;
        session.callStatus = _sessionStatus2.default.connected;
      });
      session.on('hold', function () {
        console.log('Event: hold');
        session.callStatus = _sessionStatus2.default.onHold;
      });
      session.on('unhold', function () {
        console.log('Event: unhold');
        session.callStatus = _sessionStatus2.default.connected;
      });
    }
  }, {
    key: '_onInvite',
    value: function _onInvite(session) {
      var _this6 = this;

      session.creationTime = Date.now();
      session.direction = _callDirections2.default.inbound;
      session.callStatus = _sessionStatus2.default.connecting;
      if (!this._activeSession) {
        this._activeSession = session;
        this.store.dispatch({
          type: this.actionTypes.updateCurrentSession,
          session: (0, _webphoneHelper.normalizeSession)(session)
        });
      }
      (0, _webphoneHelper.patchIncomingSession)(session);
      this._addSession(session);
      session.on('rejected', function () {
        console.log('Event: Rejected');
        _this6._removeSession(session);
      });
      this._onNewCall();
    }
  }, {
    key: 'answer',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context5.next = 3;
                  break;
                }

                return _context5.abrupt('return');

              case 3:
                _context5.prev = 3;

                if (this._activeSession && !this._activeSession.isOnHold().local && this._activeSession !== session) {
                  this._activeSession.hold();
                }
                this._setActiveSession(session);
                this._onAccepted(session, 'inbound');
                _context5.next = 9;
                return session.accept(this.acceptOptions);

              case 9:
                this._resetMinimized();
                _context5.next = 17;
                break;

              case 12:
                _context5.prev = 12;
                _context5.t0 = _context5['catch'](3);

                console.log('Accept failed');
                this._removeSession(session);
                this._removeActiveSession();

              case 17:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[3, 12]]);
      }));

      function answer(_x2) {
        return _ref6.apply(this, arguments);
      }

      return answer;
    }()
  }, {
    key: 'reject',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(sessionId) {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                this._sessionHandleWithId(sessionId, function (session) {
                  session.reject();
                });

              case 1:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function reject(_x3) {
        return _ref7.apply(this, arguments);
      }

      return reject;
    }()
  }, {
    key: 'resume',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(sessionId) {
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                this.unhold(sessionId);
                this._resetMinimized();

              case 2:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function resume(_x4) {
        return _ref8.apply(this, arguments);
      }

      return resume;
    }()
  }, {
    key: 'forward',
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(forwardNumber, sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context8.next = 3;
                  break;
                }

                return _context8.abrupt('return');

              case 3:
                _context8.prev = 3;
                _context8.next = 6;
                return session.forward(forwardNumber, this.acceptOptions);

              case 6:
                console.log('Forwarded');
                _context8.next = 12;
                break;

              case 9:
                _context8.prev = 9;
                _context8.t0 = _context8['catch'](3);

                console.error(_context8.t0);

              case 12:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this, [[3, 9]]);
      }));

      function forward(_x5, _x6) {
        return _ref9.apply(this, arguments);
      }

      return forward;
    }()
  }, {
    key: 'increaseVolume',
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(sessionId) {
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                this._sessionHandleWithId(sessionId, function (session) {
                  session.ua.audioHelper.setVolume((session.ua.audioHelper.volume != null ? session.ua.audioHelper.volume : 0.5) + 0.1);
                });

              case 1:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function increaseVolume(_x7) {
        return _ref10.apply(this, arguments);
      }

      return increaseVolume;
    }()
  }, {
    key: 'decreaseVolume',
    value: function () {
      var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(sessionId) {
        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                this._sessionHandleWithId(sessionId, function (session) {
                  session.ua.audioHelper.setVolume((session.ua.audioHelper.volume != null ? session.ua.audioHelper.volume : 0.5) - 0.1);
                });

              case 1:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function decreaseVolume(_x8) {
        return _ref11.apply(this, arguments);
      }

      return decreaseVolume;
    }()
  }, {
    key: 'mute',
    value: function () {
      var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(sessionId) {
        var _this7 = this;

        return _regenerator2.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                this._sessionHandleWithId(sessionId, function (session) {
                  session.isOnMute = true;
                  session.mute();
                  _this7._updateCurrentSessionAndSessions(session);
                });

              case 1:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function mute(_x9) {
        return _ref12.apply(this, arguments);
      }

      return mute;
    }()
  }, {
    key: 'unmute',
    value: function () {
      var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(sessionId) {
        var _this8 = this;

        return _regenerator2.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                this._sessionHandleWithId(sessionId, function (session) {
                  session.isOnMute = false;
                  session.unmute();
                  _this8._updateCurrentSessionAndSessions(session);
                });

              case 1:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function unmute(_x10) {
        return _ref13.apply(this, arguments);
      }

      return unmute;
    }()
  }, {
    key: 'hold',
    value: function () {
      var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(sessionId) {
        var _this9 = this;

        return _regenerator2.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                this._sessionHandleWithId(sessionId, function (session) {
                  session.hold();
                  _this9._updateCurrentSessionAndSessions(session);
                });

              case 1:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function hold(_x11) {
        return _ref14.apply(this, arguments);
      }

      return hold;
    }()
  }, {
    key: 'unhold',
    value: function () {
      var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context14.next = 3;
                  break;
                }

                return _context14.abrupt('return');

              case 3:
                if (session.isOnHold().local) {
                  session.unhold();
                }
                this._sessions.forEach(function (sessionItem, sessionItemId) {
                  if (session.id !== sessionItemId) {
                    if (!sessionItem.isOnHold().local) {
                      sessionItem.hold();
                    }
                  }
                });
                this._setActiveSession(session);
                this._updateCurrentSessionAndSessions(session);

              case 7:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function unhold(_x12) {
        return _ref15.apply(this, arguments);
      }

      return unhold;
    }()
  }, {
    key: 'startRecord',
    value: function () {
      var _ref16 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context15.next = 3;
                  break;
                }

                return _context15.abrupt('return');

              case 3:
                _context15.prev = 3;
                _context15.next = 6;
                return session.startRecord();

              case 6:
                session.isOnRecord = true;
                console.log('Recording Started');
                _context15.next = 14;
                break;

              case 10:
                _context15.prev = 10;
                _context15.t0 = _context15['catch'](3);

                session.isOnRecord = false;
                console.error(_context15.t0);

              case 14:
                this._updateCurrentSessionAndSessions(session);

              case 15:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this, [[3, 10]]);
      }));

      function startRecord(_x13) {
        return _ref16.apply(this, arguments);
      }

      return startRecord;
    }()
  }, {
    key: 'stopRecord',
    value: function () {
      var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context16.next = 3;
                  break;
                }

                return _context16.abrupt('return');

              case 3:
                _context16.prev = 3;
                _context16.next = 6;
                return session.stopRecord();

              case 6:
                session.isOnRecord = false;
                console.log('Recording Stopped');
                _context16.next = 14;
                break;

              case 10:
                _context16.prev = 10;
                _context16.t0 = _context16['catch'](3);

                session.isOnRecord = true;
                console.error(_context16.t0);

              case 14:
                this._updateCurrentSessionAndSessions(session);

              case 15:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this, [[3, 10]]);
      }));

      function stopRecord(_x14) {
        return _ref17.apply(this, arguments);
      }

      return stopRecord;
    }()
  }, {
    key: 'park',
    value: function () {
      var _ref18 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee17(sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context17.next = 3;
                  break;
                }

                return _context17.abrupt('return');

              case 3:
                _context17.prev = 3;
                _context17.next = 6;
                return session.park();

              case 6:
                console.log('Parked');
                _context17.next = 12;
                break;

              case 9:
                _context17.prev = 9;
                _context17.t0 = _context17['catch'](3);

                console.error(_context17.t0);

              case 12:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this, [[3, 9]]);
      }));

      function park(_x15) {
        return _ref18.apply(this, arguments);
      }

      return park;
    }()
  }, {
    key: 'transfer',
    value: function () {
      var _ref19 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee18(transferNumber, sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context18.next = 3;
                  break;
                }

                return _context18.abrupt('return');

              case 3:
                _context18.prev = 3;
                _context18.next = 6;
                return session.transfer(transferNumber);

              case 6:
                console.log('Transferred');
                _context18.next = 12;
                break;

              case 9:
                _context18.prev = 9;
                _context18.t0 = _context18['catch'](3);

                console.error(_context18.t0);

              case 12:
              case 'end':
                return _context18.stop();
            }
          }
        }, _callee18, this, [[3, 9]]);
      }));

      function transfer(_x16, _x17) {
        return _ref19.apply(this, arguments);
      }

      return transfer;
    }()
  }, {
    key: 'transferWarm',
    value: function () {
      var _ref20 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee20(transferNumber, sessionId) {
        var _this10 = this;

        var session, newSession;
        return _regenerator2.default.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context20.next = 3;
                  break;
                }

                return _context20.abrupt('return');

              case 3:
                _context20.prev = 3;
                _context20.next = 6;
                return session.hold();

              case 6:
                newSession = session.ua.invite(transferNumber, {
                  media: this.acceptOptions.media
                });

                newSession.once('accepted', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee19() {
                  return _regenerator2.default.wrap(function _callee19$(_context19) {
                    while (1) {
                      switch (_context19.prev = _context19.next) {
                        case 0:
                          _context19.prev = 0;
                          _context19.next = 3;
                          return session.warmTransfer(newSession);

                        case 3:
                          console.log('Transferred');
                          _context19.next = 9;
                          break;

                        case 6:
                          _context19.prev = 6;
                          _context19.t0 = _context19['catch'](0);

                          console.error(_context19.t0);

                        case 9:
                        case 'end':
                          return _context19.stop();
                      }
                    }
                  }, _callee19, _this10, [[0, 6]]);
                })));
                _context20.next = 13;
                break;

              case 10:
                _context20.prev = 10;
                _context20.t0 = _context20['catch'](3);

                console.error(_context20.t0);

              case 13:
              case 'end':
                return _context20.stop();
            }
          }
        }, _callee20, this, [[3, 10]]);
      }));

      function transferWarm(_x18, _x19) {
        return _ref20.apply(this, arguments);
      }

      return transferWarm;
    }()
  }, {
    key: 'flip',
    value: function () {
      var _ref22 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee21(flipValue, sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context21.next = 3;
                  break;
                }

                return _context21.abrupt('return');

              case 3:
                _context21.prev = 3;
                _context21.next = 6;
                return session.flip(flipValue);

              case 6:
                console.log('Flipped');
                _context21.next = 12;
                break;

              case 9:
                _context21.prev = 9;
                _context21.t0 = _context21['catch'](3);

                console.error(_context21.t0);

              case 12:
              case 'end':
                return _context21.stop();
            }
          }
        }, _callee21, this, [[3, 9]]);
      }));

      function flip(_x20, _x21) {
        return _ref22.apply(this, arguments);
      }

      return flip;
    }()
  }, {
    key: 'sendDTMF',
    value: function () {
      var _ref23 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee22(dtmfValue, sessionId) {
        return _regenerator2.default.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                this._sessionHandleWithId(sessionId, function (session) {
                  try {
                    session.dtmf(dtmfValue);
                  } catch (e) {
                    console.error(e);
                  }
                });

              case 1:
              case 'end':
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function sendDTMF(_x22, _x23) {
        return _ref23.apply(this, arguments);
      }

      return sendDTMF;
    }()
  }, {
    key: 'hangup',
    value: function () {
      var _ref24 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee23(sessionId) {
        var _this11 = this;

        return _regenerator2.default.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                this._sessionHandleWithId(sessionId, function (session) {
                  try {
                    session.terminate();
                  } catch (e) {
                    console.error(e);
                    _this11._removeSession(session);
                  }
                });

              case 1:
              case 'end':
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function hangup(_x24) {
        return _ref24.apply(this, arguments);
      }

      return hangup;
    }()
  }, {
    key: 'toVoiceMail',
    value: function () {
      var _ref25 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee24(sessionId) {
        var _this12 = this;

        return _regenerator2.default.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                this._sessionHandleWithId(sessionId, function (session) {
                  try {
                    session.toVoiceMail();
                  } catch (e) {
                    console.error(e);
                    _this12._removeSession(session);
                  }
                });

              case 1:
              case 'end':
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function toVoiceMail(_x25) {
        return _ref25.apply(this, arguments);
      }

      return toVoiceMail;
    }()
  }, {
    key: 'replyWithMessage',
    value: function () {
      var _ref26 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee25(sessionId, replyOptions) {
        var _this13 = this;

        return _regenerator2.default.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                this._sessionHandleWithId(sessionId, function (session) {
                  try {
                    session.replyWithMessage(replyOptions);
                  } catch (e) {
                    console.error(e);
                    _this13._removeSession(session);
                  }
                });

              case 1:
              case 'end':
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function replyWithMessage(_x26, _x27) {
        return _ref26.apply(this, arguments);
      }

      return replyWithMessage;
    }()
  }, {
    key: '_sessionHandleWithId',
    value: function _sessionHandleWithId(sessionId, func) {
      var session = this._sessions.get(sessionId);
      if (!session) {
        return null;
      }
      return func(session);
    }
  }, {
    key: 'makeCall',
    value: function () {
      var _ref27 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee26(_ref28) {
        var toNumber = _ref28.toNumber,
            fromNumber = _ref28.fromNumber,
            homeCountryId = _ref28.homeCountryId;
        var session;
        return _regenerator2.default.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                if (this._webphone) {
                  _context26.next = 3;
                  break;
                }

                this._alert.warning({
                  message: this.errorCode,
                  ttl: 0
                });
                return _context26.abrupt('return');

              case 3:
                session = this._webphone.userAgent.invite(toNumber, {
                  media: this.acceptOptions.media,
                  fromNumber: fromNumber,
                  homeCountryId: homeCountryId
                });

                session.direction = _callDirections2.default.outbound;
                session.callStatus = _sessionStatus2.default.connecting;
                session.creationTime = Date.now();
                this._onAccepted(session);
                if (this._activeSession && !this._activeSession.isOnHold().local) {
                  this._activeSession.hold();
                }
                this._addSession(session);
                this._setActiveSession(session);
                this._resetMinimized();
                this._onNewCall();
                return _context26.abrupt('return', session);

              case 14:
              case 'end':
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function makeCall(_x28) {
        return _ref27.apply(this, arguments);
      }

      return makeCall;
    }()
  }, {
    key: '_addSession',
    value: function _addSession(session) {
      this._sessions.set(session.id, session);
      this.store.dispatch({
        type: this.actionTypes.updateSessions,
        sessions: [].concat((0, _toConsumableArray3.default)(this._sessions.values())).map(_webphoneHelper.normalizeSession)
      });
    }
  }, {
    key: '_removeSession',
    value: function _removeSession(session) {
      this._cleanActiveSession(session);
      this._sessions.delete(session.id);
      this.store.dispatch({
        type: this.actionTypes.updateSessions,
        sessions: [].concat((0, _toConsumableArray3.default)(this._sessions.values())).map(_webphoneHelper.normalizeSession)
      });
    }
  }, {
    key: '_setActiveSession',
    value: function _setActiveSession(session) {
      this._activeSession = session;
      this.store.dispatch({
        type: this.actionTypes.updateCurrentSession,
        session: (0, _webphoneHelper.normalizeSession)(session)
      });
    }
  }, {
    key: '_removeActiveSession',
    value: function _removeActiveSession() {
      this._activeSession = null;
      this.store.dispatch({
        type: this.actionTypes.destroyCurrentSession
      });
    }
  }, {
    key: '_cleanActiveSession',
    value: function _cleanActiveSession(session) {
      if (session !== this._activeSession) {
        return;
      }
      this._removeActiveSession();
    }
  }, {
    key: '_updateCurrentSessionAndSessions',
    value: function _updateCurrentSessionAndSessions(session) {
      if (session === this._activeSession) {
        this._updateCurrentSession(session);
      }
      this._updateSessions();
    }
  }, {
    key: '_updateCurrentSession',
    value: function _updateCurrentSession(session) {
      this.store.dispatch({
        type: this.actionTypes.updateCurrentSession,
        session: (0, _webphoneHelper.normalizeSession)(session)
      });
    }
  }, {
    key: '_updateSessions',
    value: function _updateSessions() {
      this.store.dispatch({
        type: this.actionTypes.updateSessions,
        sessions: [].concat((0, _toConsumableArray3.default)(this._sessions.values())).map(_webphoneHelper.normalizeSession)
      });
    }
  }, {
    key: 'toggleMinimized',
    value: function () {
      var _ref29 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee27() {
        return _regenerator2.default.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                this.store.dispatch({
                  type: this.actionTypes.toggleMinimized
                });

              case 1:
              case 'end':
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function toggleMinimized() {
        return _ref29.apply(this, arguments);
      }

      return toggleMinimized;
    }()
  }, {
    key: '_resetMinimized',
    value: function _resetMinimized() {
      this.store.dispatch({
        type: this.actionTypes.resetMinimized
      });
    }
  }, {
    key: '_retrySleep',
    value: function () {
      var _ref30 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee28() {
        return _regenerator2.default.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                if (!(this.connectRetryCounts < 3)) {
                  _context28.next = 3;
                  break;
                }

                _context28.next = 3;
                return (0, _sleep2.default)(FIRST_THREE_RETRIES_DELAY);

              case 3:
                if (!(this.connectRetryCounts === 3)) {
                  _context28.next = 6;
                  break;
                }

                _context28.next = 6;
                return (0, _sleep2.default)(FOURTH_RETRIES_DELAY);

              case 6:
                if (!(this.connectRetryCounts === 4)) {
                  _context28.next = 9;
                  break;
                }

                _context28.next = 9;
                return (0, _sleep2.default)(FIFTH_RETRIES_DELAY);

              case 9:
                if (!(this.connectRetryCounts > 4)) {
                  _context28.next = 12;
                  break;
                }

                _context28.next = 12;
                return (0, _sleep2.default)(MAX_RETRIES_DELAY);

              case 12:
              case 'end':
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function _retrySleep() {
        return _ref30.apply(this, arguments);
      }

      return _retrySleep;
    }()
  }, {
    key: 'status',
    get: function get() {
      return this.state.status;
    }
  }, {
    key: 'activeSession',
    get: function get() {
      return this._activeSession;
    }
  }, {
    key: 'originalSessions',
    get: function get() {
      return this._sessions;
    }
  }, {
    key: 'ready',
    get: function get() {
      return this.state.status === _moduleStatuses2.default.ready;
    }
  }, {
    key: 'minimized',
    get: function get() {
      return this.state.minimized;
    }
  }, {
    key: 'currentSession',
    get: function get() {
      return this.state.currentSession;
    }
  }, {
    key: 'sessions',
    get: function get() {
      return this.state.sessions;
    }
  }, {
    key: 'videoElementPrepared',
    get: function get() {
      return this.state.videoElementPrepared;
    }
  }, {
    key: 'enabled',
    get: function get() {
      return this._rolesAndPermissions.webphoneEnabled;
    }
  }, {
    key: 'connectionStatus',
    get: function get() {
      return this.state.connectionStatus;
    }
  }, {
    key: 'webphoneCounts',
    get: function get() {
      return this._storage.getItem(this._storageWebphoneCountsKey);
    }
  }, {
    key: 'connectRetryCounts',
    get: function get() {
      return this.state.connectRetryCounts;
    }
  }, {
    key: 'acceptOptions',
    get: function get() {
      return {
        media: {
          render: {
            remote: this._remoteVideo,
            local: this._localVideo
          }
        }
      };
    }
  }, {
    key: 'errorCode',
    get: function get() {
      return this.state.errorCode;
    }
  }]);
  return Webphone;
}(_RcModule3.default), (_applyDecoratedDescriptor(_class.prototype, '_sipProvision', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, '_sipProvision'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_connect', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, '_connect'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'connect', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'connect'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'disconnect', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'disconnect'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'answer', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'answer'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'reject', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'reject'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'resume', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'resume'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'forward', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'forward'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'increaseVolume', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'increaseVolume'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'decreaseVolume', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'decreaseVolume'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'mute', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'mute'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'unmute', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'unmute'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'hold', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'hold'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'unhold', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'unhold'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'startRecord', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'startRecord'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'stopRecord', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'stopRecord'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'park', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'park'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'transfer', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'transfer'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'transferWarm', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'transferWarm'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'flip', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'flip'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'sendDTMF', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'sendDTMF'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'hangup', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'hangup'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'toVoiceMail', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'toVoiceMail'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'replyWithMessage', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'replyWithMessage'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'makeCall', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'makeCall'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'toggleMinimized', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'toggleMinimized'), _class.prototype)), _class);
exports.default = Webphone;
//# sourceMappingURL=index.js.map

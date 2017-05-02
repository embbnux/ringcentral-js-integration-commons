'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

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

var _moduleStatus = require('../../enums/moduleStatus');

var _moduleStatus2 = _interopRequireDefault(_moduleStatus);

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

var _webphoneHelper = require('./webphoneHelper');

var _getWebphoneReducer = require('./getWebphoneReducer');

var _getWebphoneReducer2 = _interopRequireDefault(_getWebphoneReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FIRST_THREE_RETRIES_DELAY = 10 * 1000;
var FOURTH_RETRIES_DELAY = 30 * 1000;
var FIFTH_RETRIES_DELAY = 60 * 1000;
var MAX_RETRIES_DELAY = 2 * 60 * 1000;

var Webphone = function (_RcModule) {
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
        options = (0, _objectWithoutProperties3.default)(_ref, ['appKey', 'appName', 'appVersion', 'alert', 'auth', 'client', 'rolesAndPermissions', 'webphoneLogLevel', 'storage']);
    (0, _classCallCheck3.default)(this, Webphone);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Webphone.__proto__ || (0, _getPrototypeOf2.default)(Webphone)).call(this, (0, _extends3.default)({}, options, {
      actionTypes: _actionTypes2.default
    })));

    _this._appKey = appKey;
    _this._appName = appName;
    _this._appVersion = appVersion;
    _this._alert = alert;
    _this._webphoneLogLevel = webphoneLogLevel;
    _this._auth = auth;
    _this._client = client;
    _this._rolesAndPermissions = rolesAndPermissions;
    _this._storage = storage;
    _this._storageWebphoneCountsKey = 'webphoneCounts';
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

    _this.toggleMinimized = _this.toggleMinimized.bind(_this);
    _this.answer = _this.answer.bind(_this);
    _this.reject = _this.reject.bind(_this);
    _this.resume = _this.resume.bind(_this);
    _this.hangup = _this.hangup.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(Webphone, [{
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        this._remoteVideo = document.createElement('video');
        this._remoteVideo.setAttribute('hidden', 'hidden');
        this._localVideo = document.createElement('video');
        this._localVideo.setAttribute('hidden', 'hidden');
        this._localVideo.setAttribute('muted', 'muted');
        document.body.appendChild(this._remoteVideo);
        document.body.appendChild(this._localVideo);
        window.onbeforeunload = function () {
          _this2.disconnect();
        };
        this.store.dispatch({
          type: this.actionTypes.init,
          videoElementPrepared: true
        });
      } else {
        this.store.dispatch({
          type: this.actionTypes.init,
          videoElementPrepared: false
        });
      }
      this.store.subscribe(function () {
        return _this2._onStateChange();
      });
    }
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
      return this._auth.loggedIn && this._rolesAndPermissions.ready && !this.ready;
    }
  }, {
    key: '_shouldReset',
    value: function _shouldReset() {
      return (!this._auth.loggedIn || !this._rolesAndPermissions.ready) && this.ready;
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
                _context.prev = 0;
                _context.next = 3;
                return this._client.service.platform().post('/client-info/sip-provision', {
                  sipInfo: [{ transport: 'WSS' }]
                });

              case 3:
                response = _context.sent;
                return _context.abrupt('return', response.json());

              case 7:
                _context.prev = 7;
                _context.t0 = _context['catch'](0);

                console.error(_context.t0);
                throw new Error(_webphoneErrors2.default.getSipProvisionError);

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 7]]);
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
          outgoing: _outgoing2.default }
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
        _this3._webphone.userAgent.removeAllListeners();
        _this3._webphone = null;
      };
      var onRegistrationFailed = function onRegistrationFailed(error) {
        _this3.store.dispatch({
          type: _this3.actionTypes.registrationFailed,
          error: error
        });
        _this3._webphone.userAgent.removeAllListeners();
        _this3._webphone = null;
        _this3._connect(true);
      };
      this._webphone.userAgent.audioHelper.setVolume(0.3);
      this._webphone.userAgent.on('registered', onRegistered);
      this._webphone.userAgent.on('unregistered', onUnregistered);
      this._webphone.userAgent.once('registrationFailed', onRegistrationFailed);
      this._webphone.userAgent.on('invite', function (session) {
        console.log('UA invite');
        _this3._onInvite(session);
      });
      (0, _webphoneHelper.patchUserAgent)(this._webphone.userAgent);
    }
  }, {
    key: '_connect',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var reconnect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var sipProvision;
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
                _context2.next = 24;
                break;

              case 18:
                _context2.prev = 18;
                _context2.t0 = _context2['catch'](0);

                this.store.dispatch({
                  type: this.actionTypes.connectError,
                  error: _context2.t0
                });
                this._alert.warning({
                  message: _webphoneErrors2.default.connectFailed,
                  ttl: 0,
                  allowDuplicates: false
                });
                _context2.next = 24;
                return this._connect(true);

              case 24:
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
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(hasFromNumber) {
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
                  _context3.next = 20;
                  break;
                }

                if ((0, _webphoneHelper.isBrowerSupport)()) {
                  _context3.next = 12;
                  break;
                }

                this._alert.warning({
                  message: _webphoneErrors2.default.browserNotSupported,
                  ttl: 0
                });
                return _context3.abrupt('return');

              case 12:
                if (!(this.webphoneCounts >= 5)) {
                  _context3.next = 15;
                  break;
                }

                this._alert.warning({
                  message: _webphoneErrors2.default.webphoneCountOverLimit
                });
                return _context3.abrupt('return');

              case 15:
                if (hasFromNumber) {
                  _context3.next = 18;
                  break;
                }

                this._alert.warning({
                  message: _webphoneErrors2.default.notOutboundCallWithoutDL
                });
                return _context3.abrupt('return');

              case 18:
                _context3.next = 20;
                return this._connect();

              case 20:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function connect(_x2) {
        return _ref4.apply(this, arguments);
      }

      return connect;
    }()
  }, {
    key: 'disconnect',
    value: function disconnect() {
      var _this4 = this;

      if (this.connectionStatus === _connectionStatus2.default.connected || this.connectionStatus === _connectionStatus2.default.connecting || this.connectionStatus === _connectionStatus2.default.connectFailed) {
        this.store.dispatch({
          type: this.actionTypes.disconnect
        });
        if (this._webphone) {
          this._webphone.userAgent.stop();
          this._webphone.userAgent.unregister();
          this._sessions.forEach(function (session) {
            _this4.hangup(session);
          });
        }
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
          session: session
        });
      }
      (0, _webphoneHelper.patchIncomingSession)(session);
      this._addSession(session);
      session.on('rejected', function () {
        console.log('Event: Rejected');
        _this6._removeSession(session);
      });
    }
  }, {
    key: 'answer',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context4.next = 3;
                  break;
                }

                return _context4.abrupt('return');

              case 3:
                _context4.prev = 3;

                if (this._activeSession && !this._activeSession.isOnHold().local && this._activeSession !== session) {
                  this._activeSession.hold();
                }
                this._setActiveSession(session);
                this._onAccepted(session, 'inbound');
                _context4.next = 9;
                return session.accept(this.acceptOptions);

              case 9:
                this._resetMinimized();
                _context4.next = 17;
                break;

              case 12:
                _context4.prev = 12;
                _context4.t0 = _context4['catch'](3);

                console.log('Accept failed');
                this._removeSession(session);
                this._removeActiveSession();

              case 17:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[3, 12]]);
      }));

      function answer(_x3) {
        return _ref5.apply(this, arguments);
      }

      return answer;
    }()
  }, {
    key: 'reject',
    value: function reject(sessionId) {
      var session = this._sessions.get(sessionId);
      if (!session) {
        return;
      }
      session.reject();
    }
  }, {
    key: 'resume',
    value: function resume(sessionId) {
      this.unhold(sessionId);
      this._resetMinimized();
    }
  }, {
    key: 'forward',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(forwardNumber, sessionId) {
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
                _context5.next = 6;
                return session.forward(forwardNumber, this.acceptOptions);

              case 6:
                console.log('Forwarded');
                _context5.next = 12;
                break;

              case 9:
                _context5.prev = 9;
                _context5.t0 = _context5['catch'](3);

                console.error(_context5.t0);

              case 12:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[3, 9]]);
      }));

      function forward(_x4, _x5) {
        return _ref6.apply(this, arguments);
      }

      return forward;
    }()
  }, {
    key: 'increaseVolume',
    value: function increaseVolume(sessionId) {
      var session = this._sessions.get(sessionId);
      if (!session) {
        return;
      }
      session.ua.audioHelper.setVolume((session.ua.audioHelper.volume != null ? session.ua.audioHelper.volume : 0.5) + 0.1);
    }
  }, {
    key: 'decreaseVolume',
    value: function decreaseVolume(sessionId) {
      var session = this._sessions.get(sessionId);
      if (!session) {
        return;
      }
      session.ua.audioHelper.setVolume((session.ua.audioHelper.volume != null ? session.ua.audioHelper.volume : 0.5) - 0.1);
    }
  }, {
    key: 'mute',
    value: function mute(sessionId) {
      var session = this._sessions.get(sessionId);
      if (!session) {
        return;
      }
      session.isOnMute = true;
      session.mute();
      this._updateCurrentSessionAndSessions(session);
    }
  }, {
    key: 'unmute',
    value: function unmute(sessionId) {
      var session = this._sessions.get(sessionId);
      if (!session) {
        return;
      }
      session.isOnMute = false;
      session.unmute();
      this._updateCurrentSessionAndSessions(session);
    }
  }, {
    key: 'hold',
    value: function hold(sessionId) {
      var session = this._sessions.get(sessionId);
      if (!session) {
        return;
      }
      session.hold();
      this._updateCurrentSessionAndSessions(session);
    }
  }, {
    key: 'unhold',
    value: function unhold(sessionId) {
      var session = this._sessions.get(sessionId);
      if (!session) {
        return;
      }
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
    }
  }, {
    key: 'startRecord',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context6.next = 3;
                  break;
                }

                return _context6.abrupt('return');

              case 3:
                _context6.prev = 3;
                _context6.next = 6;
                return session.startRecord();

              case 6:
                session.isOnRecord = true;
                console.log('Recording Started');
                _context6.next = 14;
                break;

              case 10:
                _context6.prev = 10;
                _context6.t0 = _context6['catch'](3);

                session.isOnRecord = false;
                console.error(_context6.t0);

              case 14:
                this._updateCurrentSessionAndSessions(session);

              case 15:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this, [[3, 10]]);
      }));

      function startRecord(_x6) {
        return _ref7.apply(this, arguments);
      }

      return startRecord;
    }()
  }, {
    key: 'stopRecord',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context7.next = 3;
                  break;
                }

                return _context7.abrupt('return');

              case 3:
                _context7.prev = 3;
                _context7.next = 6;
                return session.stopRecord();

              case 6:
                session.isOnRecord = false;
                console.log('Recording Stopped');
                _context7.next = 14;
                break;

              case 10:
                _context7.prev = 10;
                _context7.t0 = _context7['catch'](3);

                session.isOnRecord = true;
                console.error(_context7.t0);

              case 14:
                this._updateCurrentSessionAndSessions(session);

              case 15:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this, [[3, 10]]);
      }));

      function stopRecord(_x7) {
        return _ref8.apply(this, arguments);
      }

      return stopRecord;
    }()
  }, {
    key: 'park',
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(sessionId) {
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
                return session.park();

              case 6:
                console.log('Parked');
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

      function park(_x8) {
        return _ref9.apply(this, arguments);
      }

      return park;
    }()
  }, {
    key: 'transfer',
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(transferNumber, sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context9.next = 3;
                  break;
                }

                return _context9.abrupt('return');

              case 3:
                _context9.prev = 3;
                _context9.next = 6;
                return session.transfer(transferNumber);

              case 6:
                console.log('Transferred');
                _context9.next = 12;
                break;

              case 9:
                _context9.prev = 9;
                _context9.t0 = _context9['catch'](3);

                console.error(_context9.t0);

              case 12:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this, [[3, 9]]);
      }));

      function transfer(_x9, _x10) {
        return _ref10.apply(this, arguments);
      }

      return transfer;
    }()
  }, {
    key: 'transferWarm',
    value: function () {
      var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(transferNumber, sessionId) {
        var _this7 = this;

        var session, newSession;
        return _regenerator2.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context11.next = 3;
                  break;
                }

                return _context11.abrupt('return');

              case 3:
                _context11.prev = 3;
                _context11.next = 6;
                return session.hold();

              case 6:
                newSession = session.ua.invite(transferNumber, {
                  media: this.acceptOptions.media
                });

                newSession.once('accepted', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10() {
                  return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                      switch (_context10.prev = _context10.next) {
                        case 0:
                          _context10.prev = 0;
                          _context10.next = 3;
                          return session.warmTransfer(newSession);

                        case 3:
                          console.log('Transferred');
                          _context10.next = 9;
                          break;

                        case 6:
                          _context10.prev = 6;
                          _context10.t0 = _context10['catch'](0);

                          console.error(_context10.t0);

                        case 9:
                        case 'end':
                          return _context10.stop();
                      }
                    }
                  }, _callee10, _this7, [[0, 6]]);
                })));
                _context11.next = 13;
                break;

              case 10:
                _context11.prev = 10;
                _context11.t0 = _context11['catch'](3);

                console.error(_context11.t0);

              case 13:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this, [[3, 10]]);
      }));

      function transferWarm(_x11, _x12) {
        return _ref11.apply(this, arguments);
      }

      return transferWarm;
    }()
  }, {
    key: 'flip',
    value: function () {
      var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(flipValue, sessionId) {
        var session;
        return _regenerator2.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                session = this._sessions.get(sessionId);

                if (session) {
                  _context12.next = 3;
                  break;
                }

                return _context12.abrupt('return');

              case 3:
                _context12.prev = 3;
                _context12.next = 6;
                return session.flip(flipValue);

              case 6:
                console.log('Flipped');
                _context12.next = 12;
                break;

              case 9:
                _context12.prev = 9;
                _context12.t0 = _context12['catch'](3);

                console.error(_context12.t0);

              case 12:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this, [[3, 9]]);
      }));

      function flip(_x13, _x14) {
        return _ref13.apply(this, arguments);
      }

      return flip;
    }()
  }, {
    key: 'sendDTMF',
    value: function sendDTMF(dtmfValue, sessionId) {
      var session = this._sessions.get(sessionId);
      if (!session) {
        return;
      }
      try {
        session.dtmf(dtmfValue);
      } catch (e) {
        console.error(e);
      }
    }
  }, {
    key: 'hangup',
    value: function hangup(sessionId) {
      var session = this._sessions.get(sessionId);
      if (!session) {
        return;
      }
      try {
        session.terminate();
      } catch (e) {
        console.log(e);
        this._removeSession(session);
      }
    }
  }, {
    key: 'makeCall',
    value: function makeCall(_ref14) {
      var toNumber = _ref14.toNumber,
          fromNumber = _ref14.fromNumber,
          homeCountryId = _ref14.homeCountryId;

      var session = this._webphone.userAgent.invite(toNumber, {
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
      return session;
    }
  }, {
    key: '_addSession',
    value: function _addSession(session) {
      this._sessions.set(session.id, session);
      this.store.dispatch({
        type: this.actionTypes.updateSessions,
        sessions: this._sessions
      });
    }
  }, {
    key: '_removeSession',
    value: function _removeSession(session) {
      this._cleanActiveSession(session);
      this._sessions.delete(session.id);
      this.store.dispatch({
        type: this.actionTypes.updateSessions,
        sessions: this._sessions
      });
    }
  }, {
    key: '_setActiveSession',
    value: function _setActiveSession(session) {
      this._activeSession = session;
      this.store.dispatch({
        type: this.actionTypes.updateCurrentSession,
        session: session
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
        session: session
      });
    }
  }, {
    key: '_updateSessions',
    value: function _updateSessions() {
      this.store.dispatch({
        type: this.actionTypes.updateSessions,
        sessions: this._sessions
      });
    }
  }, {
    key: 'toggleMinimized',
    value: function toggleMinimized() {
      this.store.dispatch({
        type: this.actionTypes.toggleMinimized
      });
    }
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
      var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13() {
        return _regenerator2.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                if (!(this.connectRetryCounts < 3)) {
                  _context13.next = 3;
                  break;
                }

                _context13.next = 3;
                return (0, _sleep2.default)(FIRST_THREE_RETRIES_DELAY);

              case 3:
                if (!(this.connectRetryCounts === 3)) {
                  _context13.next = 6;
                  break;
                }

                _context13.next = 6;
                return (0, _sleep2.default)(FOURTH_RETRIES_DELAY);

              case 6:
                if (!(this.connectRetryCounts === 4)) {
                  _context13.next = 9;
                  break;
                }

                _context13.next = 9;
                return (0, _sleep2.default)(FIFTH_RETRIES_DELAY);

              case 9:
                if (!(this.connectRetryCounts > 4)) {
                  _context13.next = 12;
                  break;
                }

                _context13.next = 12;
                return (0, _sleep2.default)(MAX_RETRIES_DELAY);

              case 12:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function _retrySleep() {
        return _ref15.apply(this, arguments);
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
      return this.state.status === _moduleStatus2.default.ready;
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
      return this.videoElementPrepared && this._rolesAndPermissions.webphoneEnabled;
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
  }]);
  return Webphone;
}(_RcModule3.default);

exports.default = Webphone;
//# sourceMappingURL=index.js.map

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.getLogId = getLogId;
exports.conversationLogIdentityFunction = conversationLogIdentityFunction;

var _LoggerBase2 = require('../../lib/LoggerBase');

var _LoggerBase3 = _interopRequireDefault(_LoggerBase2);

var _ensureExist = require('../../lib/ensureExist');

var _ensureExist2 = _interopRequireDefault(_ensureExist);

var _actionTypes = require('./actionTypes');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

var _getDataReducer = require('./getDataReducer');

var _getDataReducer2 = _interopRequireDefault(_getDataReducer);

var _messageTypes = require('../../enums/messageTypes');

var _messageTypes2 = _interopRequireDefault(_messageTypes);

var _messageHelper = require('../../lib/messageHelper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getLogId(_ref) {
  var conversationId = _ref.conversationId,
      date = _ref.date;

  return conversationId + '/' + date;
}

function conversationLogIdentityFunction(conversation) {
  return conversation.conversationLogId;
}

var ConversationLogger = function (_LoggerBase) {
  (0, _inherits3.default)(ConversationLogger, _LoggerBase);

  function ConversationLogger(_ref2) {
    var contactMatcher = _ref2.contactMatcher,
        conversationMatcher = _ref2.conversationMatcher,
        dateTimeFormat = _ref2.dateTimeFormat,
        extensionInfo = _ref2.extensionInfo,
        messageStore = _ref2.messageStore,
        rolesAndPermissions = _ref2.rolesAndPermissions,
        storage = _ref2.storage,
        tabManager = _ref2.tabManager,
        _ref2$isLoggedContact = _ref2.isLoggedContact,
        isLoggedContact = _ref2$isLoggedContact === undefined ? function () {
      return false;
    } : _ref2$isLoggedContact,
        _ref2$formatDateTime = _ref2.formatDateTime,
        formatDateTime = _ref2$formatDateTime === undefined ? function () {
      return dateTimeFormat.formatDateTime.apply(dateTimeFormat, arguments);
    } : _ref2$formatDateTime,
        options = (0, _objectWithoutProperties3.default)(_ref2, ['contactMatcher', 'conversationMatcher', 'dateTimeFormat', 'extensionInfo', 'messageStore', 'rolesAndPermissions', 'storage', 'tabManager', 'isLoggedContact', 'formatDateTime']);
    (0, _classCallCheck3.default)(this, ConversationLogger);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ConversationLogger.__proto__ || (0, _getPrototypeOf2.default)(ConversationLogger)).call(this, (0, _extends3.default)({}, options, {
      name: 'conversationLogger',
      actionTypes: _actionTypes2.default,
      identityFunction: conversationLogIdentityFunction
    })));

    _this._contactMatcher = _ensureExist2.default.call(_this, contactMatcher, 'contactMatcher');
    _this._conversationMatcher = _ensureExist2.default.call(_this, conversationMatcher, 'conversationMatcher');
    _this._dateTimeFormat = _ensureExist2.default.call(_this, dateTimeFormat, 'dateTimeFormat');
    _this._extensionInfo = _ensureExist2.default.call(_this, extensionInfo, 'extensionInfo');
    _this._messageStore = _ensureExist2.default.call(_this, messageStore, 'messageStore');
    _this._rolesAndPermissions = _ensureExist2.default.call(_this, rolesAndPermissions, 'rolesAndPermissions');
    _this._storage = _ensureExist2.default.call(_this, storage, 'storage');
    _this._tabManager = _ensureExist2.default.call(_this, tabManager, 'tabManager');
    _this._isLoggedContact = isLoggedContact;
    _this._formatDateTime = formatDateTime;
    _this._storageKey = _this._name + 'Data';
    _this._storage.registerReducer({
      key: _this._storageKey,
      reducer: (0, _getDataReducer2.default)(_this.actionTypes)
    });

    _this.addSelector('conversationLogMap', function () {
      return _this._messageStore.messages;
    }, function () {
      return _this._extensionInfo.extensionNumber;
    }, function (messages, extensionNumber) {
      var mapping = {};
      messages.slice().sort(_messageHelper.sortByDate).forEach(function (message) {
        var conversationId = message.conversationId;
        var date = _this._formatDateTime({
          type: 'date',
          utcTimestamp: message.creationTime
        });
        if (!mapping[conversationId]) {
          mapping[conversationId] = {};
        }
        if (!mapping[conversationId][date]) {
          mapping[conversationId][date] = (0, _extends3.default)({
            conversationLogId: getLogId({ conversationId: conversationId, date: date }),
            conversationId: conversationId,
            creationTime: message.createTime, // for sorting
            date: date,
            type: message.type,
            messages: []
          }, (0, _messageHelper.getNumbersFromMessage)({ extensionNumber: extensionNumber, message: message }));
        }
        mapping[conversationId][date].messages.push(message);
      });
      return mapping;
    });

    _this.addSelector('conversationLogIds', _this._selectors.conversationLogMap, function (conversationLogMap) {
      var logIds = [];
      (0, _keys2.default)(conversationLogMap).forEach(function (conversationId) {
        (0, _keys2.default)(conversationLogMap[conversationId]).forEach(function (date) {
          logIds.push(conversationLogMap[conversationId][date].conversationLogId);
        });
      });
      return logIds;
    });
    _this.addSelector('uniqueNumbers', _this._selectors.conversationLogMap, function (conversationLogMap) {
      var output = [];
      var numberMap = {};
      function addIfNotExist(contact) {
        var number = contact.phoneNumber || contact.extensionNumber;
        if (number && !numberMap[number]) {
          output.push(number);
          numberMap[number] = true;
        }
      }
      (0, _keys2.default)(conversationLogMap).forEach(function (conversationId) {
        (0, _keys2.default)(conversationLogMap[conversationId]).forEach(function (date) {
          var conversation = conversationLogMap[conversationId][date];
          addIfNotExist(conversation.self);
          conversation.correspondents.forEach(addIfNotExist);
        });
      });
      return output;
    });

    _this._contactMatcher.addQuerySource({
      getQueriesFn: _this._selectors.uniqueNumbers,
      readyCheckFn: function readyCheckFn() {
        return _this._messageStore.ready && _this._extensionInfo.ready;
      }
    });
    _this._conversationMatcher.addQuerySource({
      getQueriesFn: _this._selectors.conversationLogIds,
      readyCheckFn: function readyCheckFn() {
        return _this._messageStore.ready && _this._extensionInfo.ready;
      }
    });

    _this._lastProcessedConversationLogMap = null;
    return _this;
  }

  (0, _createClass3.default)(ConversationLogger, [{
    key: '_shouldInit',
    value: function _shouldInit() {
      return this.pending && this._contactMatcher.ready && this._conversationMatcher.ready && this._dateTimeFormat.ready && this._extensionInfo.ready && this._messageStore.ready && this._rolesAndPermissions.ready && this._storage.ready && this._tabManager.ready && this._readyCheckFunction();
    }
  }, {
    key: '_shouldReset',
    value: function _shouldReset() {
      return this.ready && (!this._contactMatcher.ready || !this._conversationMatcher.ready || !this._dateTimeFormat.ready || !this._extensionInfo.ready || !this._messageStore.ready || !this._rolesAndPermissions.ready || !this._storage.ready || !this._tabManager.ready || !this._readyCheckFunction());
    }
  }, {
    key: '_onReset',
    value: function _onReset() {
      this._lastProcessedConversations = null;
      this._lastAutoLog = null;
    }
  }, {
    key: '_processConversationLog',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref4) {
        var _this2 = this;

        var conversation = _ref4.conversation;
        var selfNumber, selfMatches, correspondentMatches, selfEntity, lastRecord, correspondentEntity, lastActivity;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this._conversationMatcher.triggerMatch();

              case 2:
                if (!(this._conversationMatcher.dataMapping[conversation.conversationLogId] && this._conversationMatcher.dataMapping[conversation.conversationLogId].length)) {
                  _context.next = 6;
                  break;
                }

                // update conversation
                this._autoLogConversation({
                  conversation: conversation
                });
                _context.next = 19;
                break;

              case 6:
                if (!(this.autoLog && conversation.type === _messageTypes2.default.sms)) {
                  _context.next = 19;
                  break;
                }

                _context.next = 9;
                return this._contactMatcher.triggerMatch();

              case 9:
                selfNumber = conversation.self && (conversation.self.phoneNumber || conversation.self.extensionNumber);
                selfMatches = selfNumber && this._contactMatcher.dataMapping[conversation.self] || [];
                correspondentMatches = conversation.correspondents && conversation.correspondents.reduce(function (result, contact) {
                  var number = contact.phoneNumber || contact.extensionNumber;
                  return number && _this2._contactMatcher.dataMapping[number] ? result.concat(_this2._contactMatcher.dataMapping[number]) : result;
                }, []) || [];
                selfEntity = selfMatches && selfMatches.length === 1 && selfMatches[0] || null;

                // check older dates for existing selected entity match

                lastRecord = (0, _keys2.default)(this.conversationLogMap[conversation.conversationId]).map(function (date) {
                  return _this2.conversationLogMap[conversation.conversationId][date];
                }).sort(_messageHelper.sortByDate)[1];
                correspondentEntity = void 0;

                if (lastRecord && this._conversationMatcher.dataMapping[lastRecord.conversationLogId] && this._conversationMatcher.dataMapping[lastRecord.conversationLogId].length) {
                  lastActivity = this._conversationMatcher.dataMapping[lastRecord.conversationLogId][0];

                  correspondentEntity = correspondentMatches.find(function (item) {
                    return _this2._isLoggedContact(conversation, lastActivity, item);
                  });
                }
                correspondentEntity = correspondentEntity || correspondentMatches && correspondentMatches.length === 1 && correspondentMatches[0] || null;
                _context.next = 19;
                return this._autoLogConversation({
                  conversation: conversation,
                  selfEntity: selfEntity,
                  correspondentEntity: correspondentEntity
                });

              case 19:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _processConversationLog(_x) {
        return _ref3.apply(this, arguments);
      }

      return _processConversationLog;
    }()
  }, {
    key: '_processConversationLogMap',
    value: function _processConversationLogMap() {
      var _this3 = this;

      if (this.ready && this._lastAutoLog !== this.autoLog) {
        this._lastAutoLog = this.autoLog;
        if (this.autoLog) {
          // force conversation log checking when switch auto log to on
          this._lastProcessedConversationLogMap = null;
        }
      }
      if (this.ready && this._lastProcessedConversations !== this.conversationLogMap) {
        this._conversationMatcher.triggerMatch();
        this._contactMatcher.triggerMatch();
        var oldMap = this._lastProcessedConversations || {};
        this._lastProcessedConversations = this.conversationLogMap;
        if (this._tabManager.active) {
          (0, _keys2.default)(this._lastProcessedConversations).forEach(function (conversationId) {
            (0, _keys2.default)(_this3._lastProcessedConversations[conversationId]).forEach(function (date) {
              var conversation = _this3._lastProcessedConversations[conversationId][date];
              if (!oldMap[conversationId] || !oldMap[conversationId][date] || conversation.messages[0].id !== oldMap[conversationId][date].messages[0].id) {
                _this3._processConversationLog({
                  conversation: conversation
                });
              }
            });
          });
        }
      }
    }
  }, {
    key: '_onStateChange',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _get3.default)(ConversationLogger.prototype.__proto__ || (0, _getPrototypeOf2.default)(ConversationLogger.prototype), '_onStateChange', this).call(this);

              case 2:
                this._processConversationLogMap();

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _onStateChange() {
        return _ref5.apply(this, arguments);
      }

      return _onStateChange;
    }()
  }, {
    key: '_autoLogConversation',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(_ref7) {
        var conversation = _ref7.conversation,
            selfEntity = _ref7.selfEntity,
            correspondentEntity = _ref7.correspondentEntity;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.log({
                  conversation: conversation,
                  selfEntity: selfEntity,
                  correspondentEntity: correspondentEntity
                });

              case 2:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _autoLogConversation(_x2) {
        return _ref6.apply(this, arguments);
      }

      return _autoLogConversation;
    }()
  }, {
    key: 'log',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(_ref9) {
        var conversation = _ref9.conversation,
            options = (0, _objectWithoutProperties3.default)(_ref9, ['conversation']);
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                (0, _get3.default)(ConversationLogger.prototype.__proto__ || (0, _getPrototypeOf2.default)(ConversationLogger.prototype), 'log', this).call(this, (0, _extends3.default)({ item: conversation }, options));

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function log(_x3) {
        return _ref8.apply(this, arguments);
      }

      return log;
    }()
  }, {
    key: 'logConversation',
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(_ref11) {
        var _this4 = this;

        var conversationId = _ref11.conversationId,
            correspondentEntity = _ref11.correspondentEntity,
            redirect = _ref11.redirect,
            options = (0, _objectWithoutProperties3.default)(_ref11, ['conversationId', 'correspondentEntity', 'redirect']);
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!this.conversationLogMap[conversationId]) {
                  _context5.next = 3;
                  break;
                }

                _context5.next = 3;
                return _promise2.default.all((0, _keys2.default)(this.conversationLogMap[conversationId]).map(function (date) {
                  return _this4.conversationLogMap[conversationId][date];
                }).sort(_messageHelper.sortByDate).map(function (conversation, idx) {
                  return _this4.log((0, _extends3.default)({}, options, {
                    conversation: conversation,
                    correspondentEntity: correspondentEntity,
                    redirect: redirect && idx === 0 }));
                }));

              case 3:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function logConversation(_x4) {
        return _ref10.apply(this, arguments);
      }

      return logConversation;
    }()
  }, {
    key: 'setAutoLog',
    value: function setAutoLog(autoLog) {
      if (this.ready && autoLog !== this.autoLog) {
        this.store.dispatch({
          type: this.actionTypes.setAutoLog,
          autoLog: autoLog
        });
      }
    }
  }, {
    key: 'getConversationLogId',
    value: function getConversationLogId(message) {
      var conversationId = message.conversationId;
      var date = this._formatDateTime({
        type: 'date',
        utcTimestamp: message.creationTime
      });
      return getLogId({
        conversationId: conversationId,
        date: date
      });
    }
  }, {
    key: 'available',
    get: function get() {
      var _rolesAndPermissions$ = this._rolesAndPermissions.serviceFeatures,
          SMSReceiving = _rolesAndPermissions$.SMSReceiving,
          PagerReceiving = _rolesAndPermissions$.PagerReceiving;

      return !!(SMSReceiving && SMSReceiving.enabled || PagerReceiving && PagerReceiving.enabled);
    }
  }, {
    key: 'autoLog',
    get: function get() {
      return this._storage.getItem(this._storageKey).autoLog;
    }
  }, {
    key: 'conversationLogMap',
    get: function get() {
      return this._selectors.conversationLogMap();
    }
  }, {
    key: 'conversationLogIds',
    get: function get() {
      return this._selectors.conversationLogIds();
    }
  }, {
    key: 'dataMapping',
    get: function get() {
      return this._conversationMatcher.dataMapping;
    }
  }]);
  return ConversationLogger;
}(_LoggerBase3.default);

exports.default = ConversationLogger;
//# sourceMappingURL=index.js.map

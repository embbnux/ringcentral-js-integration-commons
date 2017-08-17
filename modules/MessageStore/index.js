'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

var _desc, _value, _class;

exports.processResponseData = processResponseData;

var _Pollable2 = require('../../lib/Pollable');

var _Pollable3 = _interopRequireDefault(_Pollable2);

var _moduleStatuses = require('../../enums/moduleStatuses');

var _moduleStatuses2 = _interopRequireDefault(_moduleStatuses);

var _batchApiHelper = require('../../lib/batchApiHelper');

var _messageHelper = require('../../lib/messageHelper');

var messageHelper = _interopRequireWildcard(_messageHelper);

var _messageStoreHelper = require('./messageStoreHelper');

var messageStoreHelper = _interopRequireWildcard(_messageStoreHelper);

var _actionTypes = require('./actionTypes');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

var _getMessageStoreReducer = require('./getMessageStoreReducer');

var _getMessageStoreReducer2 = _interopRequireDefault(_getMessageStoreReducer);

var _getDataReducer = require('./getDataReducer');

var _getDataReducer2 = _interopRequireDefault(_getDataReducer);

var _sleep = require('../../lib/sleep');

var _sleep2 = _interopRequireDefault(_sleep);

var _proxify = require('../../lib/proxy/proxify');

var _proxify2 = _interopRequireDefault(_proxify);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function processResponseData(data) {
  var records = data.records.slice();
  return {
    records: records.reverse(),
    syncTimestamp: new Date(data.syncInfo.syncTime).getTime(),
    syncToken: data.syncInfo.syncToken
  };
}
var DEFAULT_TTL = 30 * 60 * 1000;
var DEFAULT_TIME_TO_RETRY = 62 * 1000;
var DEFAULT_DAY_SPAN = 7;

var MessageStore = (_class = function (_Pollable) {
  (0, _inherits3.default)(MessageStore, _Pollable);

  function MessageStore(_ref) {
    var alert = _ref.alert,
        client = _ref.client,
        auth = _ref.auth,
        _ref$ttl = _ref.ttl,
        ttl = _ref$ttl === undefined ? DEFAULT_TTL : _ref$ttl,
        _ref$timeToRetry = _ref.timeToRetry,
        timeToRetry = _ref$timeToRetry === undefined ? DEFAULT_TIME_TO_RETRY : _ref$timeToRetry,
        _ref$daySpan = _ref.daySpan,
        daySpan = _ref$daySpan === undefined ? DEFAULT_DAY_SPAN : _ref$daySpan,
        storage = _ref.storage,
        subscription = _ref.subscription,
        connectivityMonitor = _ref.connectivityMonitor,
        _ref$polling = _ref.polling,
        polling = _ref$polling === undefined ? false : _ref$polling,
        options = (0, _objectWithoutProperties3.default)(_ref, ['alert', 'client', 'auth', 'ttl', 'timeToRetry', 'daySpan', 'storage', 'subscription', 'connectivityMonitor', 'polling']);
    (0, _classCallCheck3.default)(this, MessageStore);

    var _this = (0, _possibleConstructorReturn3.default)(this, (MessageStore.__proto__ || (0, _getPrototypeOf2.default)(MessageStore)).call(this, (0, _extends3.default)({}, options, {
      actionTypes: _actionTypes2.default
    })));

    _this._alert = alert;
    _this._client = client;
    _this._storage = storage;
    _this._subscription = subscription;
    _this._connectivityMonitor = connectivityMonitor;
    _this._reducer = (0, _getMessageStoreReducer2.default)(_this.actionTypes);
    _this._ttl = ttl;
    _this._timeToRetry = timeToRetry;
    _this._daySpan = daySpan;
    _this._auth = auth;
    _this._promise = null;
    _this._lastSubscriptionMessage = null;
    _this._storageKey = 'messageStore';
    _this._polling = polling;

    _this._storage.registerReducer({
      key: _this._storageKey,
      reducer: (0, _getDataReducer2.default)(_this.actionTypes)
    });

    _this.addSelector('unreadCounts', function () {
      return _this.allConversations;
    }, function (conversations) {
      var unreadCounts = 0;
      conversations.forEach(function (conversation) {
        if (messageHelper.messageIsTextMessage(conversation)) {
          unreadCounts += conversation.unreadCounts;
        }
      });
      return unreadCounts;
    });

    _this.addSelector('textConversations', function () {
      return _this.allConversations;
    }, function (conversations) {
      return conversations.filter(function (conversation) {
        return messageHelper.messageIsTextMessage(conversation);
      });
    });

    _this.addSelector('faxMessages', function () {
      return _this.allConversations;
    }, function (conversations) {
      return conversations.filter(function (conversation) {
        return messageHelper.messageIsFax(conversation);
      });
    });

    _this.addSelector('voicemailMessages', function () {
      return _this.allConversations;
    }, function (conversations) {
      return conversations.filter(function (conversation) {
        return messageHelper.messageIsVoicemail(conversation);
      });
    });
    return _this;
  }

  (0, _createClass3.default)(MessageStore, [{
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      this.store.subscribe(function () {
        return _this2._onStateChange();
      });
    }
  }, {
    key: '_onStateChange',
    value: function _onStateChange() {
      if (this._shouldInit()) {
        this.store.dispatch({
          type: this.actionTypes.init
        });
        if (this._shouleCleanCache()) {
          this._cleanUpCache();
        }
        if (this._connectivityMonitor) {
          this._connectivity = this._connectivityMonitor.connectivity;
        }
        this._initMessageStore();
      } else if (this._shouldReset()) {
        this._resetModuleStatus();
      } else if (this.ready) {
        this._subscriptionHandler();
        this._checkConnectivity();
      }
    }
  }, {
    key: '_shouldInit',
    value: function _shouldInit() {
      return this._storage.ready && this._subscription.ready && (!this._connectivityMonitor || this._connectivityMonitor.ready) && this.pending;
    }
  }, {
    key: '_shouldReset',
    value: function _shouldReset() {
      return (!this._storage.ready || !this._subscription.ready || !!this._connectivityMonitor && !this._connectivityMonitor.ready) && this.ready;
    }
  }, {
    key: '_shouleCleanCache',
    value: function _shouleCleanCache() {
      return this._auth.isFreshLogin || Date.now() - this.updatedTimestamp > this.ttl;
    }
  }, {
    key: '_resetModuleStatus',
    value: function _resetModuleStatus() {
      this.store.dispatch({
        type: this.actionTypes.resetSuccess
      });
    }
  }, {
    key: '_cleanUpCache',
    value: function _cleanUpCache() {
      this.store.dispatch({
        type: this.actionTypes.cleanUp
      });
    }
  }, {
    key: 'findConversationById',
    value: function findConversationById(id) {
      return this.conversationMap[id.toString()];
    }
  }, {
    key: '_initMessageStore',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return this._syncMessages();

              case 3:
                this._subscription.subscribe('/account/~/extension/~/message-store');
                _context.next = 9;
                break;

              case 6:
                _context.prev = 6;
                _context.t0 = _context['catch'](0);

                console.error(_context.t0);

              case 9:
                this.store.dispatch({
                  type: this.actionTypes.initSuccess
                });

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 6]]);
      }));

      function _initMessageStore() {
        return _ref2.apply(this, arguments);
      }

      return _initMessageStore;
    }()
  }, {
    key: '_subscriptionHandler',
    value: function _subscriptionHandler() {
      var accountExtesionEndPoint = /\/message-store$/;
      var message = this._subscription.message;
      if (message && message !== this._lastSubscriptionMessage && accountExtesionEndPoint.test(message.event) && message.body && message.body.changes) {
        this._lastSubscriptionMessage = this._subscription.message;
        this._syncMessages();
      }
    }
  }, {
    key: '_checkConnectivity',
    value: function _checkConnectivity() {
      if (this._connectivityMonitor && this._connectivityMonitor.ready && this._connectivity !== this._connectivityMonitor.connectivity) {
        this._connectivity = this._connectivityMonitor.connectivity;
        if (this._connectivity) {
          this._syncMessages();
        }
      }
    }
  }, {
    key: '_messageSyncApi',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(params) {
        var response;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._client.account().extension().messageSync().list(params);

              case 2:
                response = _context2.sent;
                return _context2.abrupt('return', response);

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _messageSyncApi(_x) {
        return _ref3.apply(this, arguments);
      }

      return _messageSyncApi;
    }()
  }, {
    key: '_recursiveFSync',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(_ref5) {
        var dateFrom = _ref5.dateFrom,
            _ref5$dateTo = _ref5.dateTo,
            dateTo = _ref5$dateTo === undefined ? null : _ref5$dateTo,
            syncToken = _ref5.syncToken,
            _ref5$recordsLength = _ref5.recordsLength,
            recordsLength = _ref5$recordsLength === undefined ? 0 : _ref5$recordsLength;

        var MAX_MSG_LENGTH, params, response, records, _dateTo, lastResponse;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                MAX_MSG_LENGTH = 500;
                params = messageStoreHelper.getMessageSyncParams({
                  dateFrom: dateFrom,
                  dateTo: dateTo,
                  syncToken: syncToken,
                  daySpan: this._daySpan
                });
                _context3.next = 4;
                return this._messageSyncApi(params);

              case 4:
                response = _context3.sent;
                records = response.records;

                recordsLength += records.length;

                if (!(recordsLength > MAX_MSG_LENGTH || !response.syncInfo.olderRecordsExist)) {
                  _context3.next = 9;
                  break;
                }

                return _context3.abrupt('return', {
                  records: records,
                  syncInfo: response.syncInfo
                });

              case 9:
                _context3.next = 11;
                return (0, _sleep2.default)(1000);

              case 11:
                _dateTo = new Date(response.records[response.records.length - 1].creationTime);
                _context3.next = 14;
                return this._recursiveFSync({
                  dateFrom: dateFrom,
                  dateTo: _dateTo,
                  syncToken: syncToken,
                  recordsLength: recordsLength
                });

              case 14:
                lastResponse = _context3.sent;
                return _context3.abrupt('return', {
                  records: records.concat(lastResponse.records),
                  syncInfo: response.syncInfo
                });

              case 16:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _recursiveFSync(_x2) {
        return _ref4.apply(this, arguments);
      }

      return _recursiveFSync;
    }()
  }, {
    key: '_updateMessagesFromSync',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
        var response, oldSyncToken, params, _processResponseData, records, syncTimestamp, syncToken;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                response = void 0;

                this.store.dispatch({
                  type: this.actionTypes.sync
                });
                _context4.prev = 2;
                oldSyncToken = this.syncToken;
                params = messageStoreHelper.getMessageSyncParams({
                  syncToken: oldSyncToken,
                  daySpan: this._daySpan
                });

                if (oldSyncToken) {
                  _context4.next = 11;
                  break;
                }

                _context4.next = 8;
                return this._recursiveFSync((0, _extends3.default)({}, params));

              case 8:
                response = _context4.sent;
                _context4.next = 14;
                break;

              case 11:
                _context4.next = 13;
                return this._messageSyncApi(params);

              case 13:
                response = _context4.sent;

              case 14:
                _processResponseData = processResponseData(response), records = _processResponseData.records, syncTimestamp = _processResponseData.syncTimestamp, syncToken = _processResponseData.syncToken;

                this.store.dispatch({
                  type: this.actionTypes.syncSuccess,
                  records: records,
                  syncTimestamp: syncTimestamp,
                  syncToken: syncToken
                });
                if (this._polling) {
                  this._startPolling();
                }
                _context4.next = 23;
                break;

              case 19:
                _context4.prev = 19;
                _context4.t0 = _context4['catch'](2);

                if (this._polling) {
                  this._startPolling(this.timeToRetry);
                } else {
                  this._retry();
                }
                throw _context4.t0;

              case 23:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[2, 19]]);
      }));

      function _updateMessagesFromSync() {
        return _ref6.apply(this, arguments);
      }

      return _updateMessagesFromSync;
    }()
  }, {
    key: '_updateConversationFromSync',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(conversationId) {
        var response, conversation, oldSyncToken, params, _processResponseData2, records, syncTimestamp, syncToken;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                response = void 0;
                conversation = this.conversationMap[conversationId.toString()];

                if (conversation) {
                  _context5.next = 4;
                  break;
                }

                return _context5.abrupt('return');

              case 4:
                this.store.dispatch({
                  type: this.actionTypes.sync
                });
                oldSyncToken = conversation.syncToken;
                params = messageStoreHelper.getMessageSyncParams({
                  syncToken: oldSyncToken,
                  conversationId: conversation.id,
                  daySpan: this._daySpan
                });

                if (oldSyncToken) {
                  _context5.next = 13;
                  break;
                }

                _context5.next = 10;
                return this._recursiveFSync((0, _extends3.default)({}, params));

              case 10:
                response = _context5.sent;
                _context5.next = 16;
                break;

              case 13:
                _context5.next = 15;
                return this._messageSyncApi(params);

              case 15:
                response = _context5.sent;

              case 16:
                _processResponseData2 = processResponseData(response), records = _processResponseData2.records, syncTimestamp = _processResponseData2.syncTimestamp, syncToken = _processResponseData2.syncToken;

                this.store.dispatch({
                  type: this.actionTypes.syncConversationSuccess,
                  records: records,
                  syncTimestamp: syncTimestamp,
                  syncToken: syncToken,
                  syncConversationId: conversation.id
                });

              case 18:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _updateConversationFromSync(_x3) {
        return _ref7.apply(this, arguments);
      }

      return _updateConversationFromSync;
    }()
  }, {
    key: '_syncMessages',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
        var _this3 = this;

        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this._sync((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
                  return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                      switch (_context6.prev = _context6.next) {
                        case 0:
                          _context6.next = 2;
                          return _this3._updateMessagesFromSync();

                        case 2:
                        case 'end':
                          return _context6.stop();
                      }
                    }
                  }, _callee6, _this3);
                })));

              case 2:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function _syncMessages() {
        return _ref8.apply(this, arguments);
      }

      return _syncMessages;
    }()
  }, {
    key: 'fetchData',
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this._syncMessages();

              case 2:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function fetchData() {
        return _ref10.apply(this, arguments);
      }

      return fetchData;
    }()
  }, {
    key: 'syncConversation',
    value: function () {
      var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(id) {
        var _this4 = this;

        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this._sync((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
                  return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                      switch (_context9.prev = _context9.next) {
                        case 0:
                          _context9.next = 2;
                          return _this4._updateConversationFromSync(id);

                        case 2:
                        case 'end':
                          return _context9.stop();
                      }
                    }
                  }, _callee9, _this4);
                })));

              case 2:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function syncConversation(_x4) {
        return _ref11.apply(this, arguments);
      }

      return syncConversation;
    }()
  }, {
    key: '_sync',
    value: function () {
      var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(syncFunction) {
        var _this5 = this;

        return _regenerator2.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                if (!this._promise) {
                  this._promise = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11() {
                    return _regenerator2.default.wrap(function _callee11$(_context11) {
                      while (1) {
                        switch (_context11.prev = _context11.next) {
                          case 0:
                            _context11.prev = 0;
                            _context11.next = 3;
                            return syncFunction();

                          case 3:
                            _this5._promise = null;
                            _context11.next = 11;
                            break;

                          case 6:
                            _context11.prev = 6;
                            _context11.t0 = _context11['catch'](0);

                            _this5._onSyncError();
                            _this5._promise = null;
                            throw _context11.t0;

                          case 11:
                          case 'end':
                            return _context11.stop();
                        }
                      }
                    }, _callee11, _this5, [[0, 6]]);
                  }))();
                }
                _context12.next = 3;
                return this._promise;

              case 3:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function _sync(_x5) {
        return _ref13.apply(this, arguments);
      }

      return _sync;
    }()
  }, {
    key: '_onSyncError',
    value: function _onSyncError() {
      this.store.dispatch({
        type: this.actionTypes.syncError
      });
    }
  }, {
    key: '_updateMessageApi',
    value: function () {
      var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(messageId, status) {
        var body, updateRequest;
        return _regenerator2.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                body = {
                  readStatus: status
                };
                _context13.next = 3;
                return this._client.account().extension().messageStore(messageId).put(body);

              case 3:
                updateRequest = _context13.sent;
                return _context13.abrupt('return', updateRequest);

              case 5:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function _updateMessageApi(_x6, _x7) {
        return _ref15.apply(this, arguments);
      }

      return _updateMessageApi;
    }()
  }, {
    key: '_batchUpdateMessagesApi',
    value: function () {
      var _ref16 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(messageIds, body) {
        var ids, platform, responses;
        return _regenerator2.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                ids = decodeURIComponent(messageIds.join(','));
                platform = this._client.service.platform();
                _context14.next = 4;
                return (0, _batchApiHelper.batchPutApi)({
                  platform: platform,
                  url: '/account/~/extension/~/message-store/' + ids,
                  body: body
                });

              case 4:
                responses = _context14.sent;
                return _context14.abrupt('return', responses);

              case 6:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function _batchUpdateMessagesApi(_x8, _x9) {
        return _ref16.apply(this, arguments);
      }

      return _batchUpdateMessagesApi;
    }()
  }, {
    key: '_updateMessagesApi',
    value: function () {
      var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(messageIds, status) {
        var result, UPDATE_MESSAGE_ONCE_COUNT, leftIds, rightIds, body, responses, results, rightResults;
        return _regenerator2.default.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                if (!(messageIds.length === 1)) {
                  _context15.next = 5;
                  break;
                }

                _context15.next = 3;
                return this._updateMessageApi(messageIds[0], status);

              case 3:
                result = _context15.sent;
                return _context15.abrupt('return', [result]);

              case 5:
                UPDATE_MESSAGE_ONCE_COUNT = 20;
                leftIds = messageIds.slice(0, UPDATE_MESSAGE_ONCE_COUNT);
                rightIds = messageIds.slice(UPDATE_MESSAGE_ONCE_COUNT);
                body = leftIds.map(function () {
                  return { body: { readStatus: status } };
                });
                _context15.next = 11;
                return this._batchUpdateMessagesApi(leftIds, body);

              case 11:
                responses = _context15.sent;
                results = [];

                responses.forEach(function (res) {
                  if (res.response().status === 200) {
                    results.push(res.json());
                  }
                });

                if (!(rightIds.length > 0)) {
                  _context15.next = 19;
                  break;
                }

                _context15.next = 17;
                return this._updateMessagesApi(rightIds, status);

              case 17:
                rightResults = _context15.sent;

                if (rightResults.length > 0) {
                  results.concat(rightResults);
                }

              case 19:
                return _context15.abrupt('return', results);

              case 20:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function _updateMessagesApi(_x10, _x11) {
        return _ref17.apply(this, arguments);
      }

      return _updateMessagesApi;
    }()
  }, {
    key: 'readMessages',
    value: function () {
      var _ref18 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(conversationId) {
        var conversation, unreadMessageIds, updatedMessages;
        return _regenerator2.default.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                conversation = this.conversationMap[conversationId];

                if (conversation) {
                  _context16.next = 3;
                  break;
                }

                return _context16.abrupt('return', null);

              case 3:
                unreadMessageIds = (0, _keys2.default)(conversation.unreadMessages);

                if (!(unreadMessageIds.length === 0)) {
                  _context16.next = 6;
                  break;
                }

                return _context16.abrupt('return', null);

              case 6:
                _context16.prev = 6;
                _context16.next = 9;
                return this._updateMessagesApi(unreadMessageIds, 'Read');

              case 9:
                updatedMessages = _context16.sent;

                this.store.dispatch({
                  type: this.actionTypes.updateMessages,
                  records: updatedMessages
                });
                _context16.next = 16;
                break;

              case 13:
                _context16.prev = 13;
                _context16.t0 = _context16['catch'](6);

                console.error(_context16.t0);

              case 16:
                return _context16.abrupt('return', null);

              case 17:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this, [[6, 13]]);
      }));

      function readMessages(_x12) {
        return _ref18.apply(this, arguments);
      }

      return readMessages;
    }()
  }, {
    key: 'searchMessagesText',
    value: function searchMessagesText(searchText) {
      return this.messages.filter(function (message) {
        if (message.subject && message.subject.toLowerCase().indexOf(searchText) >= 0) {
          return true;
        }
        return false;
      });
    }
  }, {
    key: 'updateConversationRecipientList',
    value: function () {
      var _ref19 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee17(conversationId, recipients) {
        return _regenerator2.default.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                this.store.dispatch({
                  type: this.actionTypes.updateConversationRecipients,
                  conversationId: conversationId,
                  recipients: recipients
                });

              case 1:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function updateConversationRecipientList(_x13, _x14) {
        return _ref19.apply(this, arguments);
      }

      return updateConversationRecipientList;
    }()
  }, {
    key: 'pushMessages',
    value: function () {
      var _ref20 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee18(records) {
        return _regenerator2.default.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                this.store.dispatch({
                  type: this.actionTypes.updateMessages,
                  records: records
                });

              case 1:
              case 'end':
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function pushMessages(_x15) {
        return _ref20.apply(this, arguments);
      }

      return pushMessages;
    }()
  }, {
    key: 'pushMessage',
    value: function pushMessage(record) {
      this.pushMessages([record]);
    }
  }, {
    key: 'cache',
    get: function get() {
      return this._storage.getItem(this._storageKey);
    }
  }, {
    key: 'messages',
    get: function get() {
      return this.cache.data.messages;
    }
  }, {
    key: 'allConversations',
    get: function get() {
      return this.cache && this.cache.data.conversations || [];
    }
  }, {
    key: 'voicemailMessages',
    get: function get() {
      return this._selectors.voicemailMessages();
    }
  }, {
    key: 'faxMessages',
    get: function get() {
      return this._selectors.faxMessages();
    }
  }, {
    key: 'conversations',
    get: function get() {
      return this._selectors.textConversations();
    }
  }, {
    key: 'conversationMap',
    get: function get() {
      return this.cache.data.conversationMap;
    }
  }, {
    key: 'updatedTimestamp',
    get: function get() {
      return this.cache.updatedTimestamp;
    }
  }, {
    key: 'syncTimestamp',
    get: function get() {
      return this.cache.data.syncTimestamp;
    }
  }, {
    key: 'syncToken',
    get: function get() {
      return this.cache.syncToken;
    }
  }, {
    key: 'status',
    get: function get() {
      return this.state.status;
    }
  }, {
    key: 'unreadCounts',
    get: function get() {
      return this._selectors.unreadCounts();
    }
  }, {
    key: 'messageStoreStatus',
    get: function get() {
      return this.state.messageStoreStatus;
    }
  }, {
    key: 'ready',
    get: function get() {
      return this.status === _moduleStatuses2.default.ready;
    }
  }, {
    key: 'pending',
    get: function get() {
      return this.status === _moduleStatuses2.default.pending;
    }
  }, {
    key: 'ttl',
    get: function get() {
      return this._ttl;
    }
  }, {
    key: 'timeToRetry',
    get: function get() {
      return this._timeToRetry;
    }
  }]);
  return MessageStore;
}(_Pollable3.default), (_applyDecoratedDescriptor(_class.prototype, 'fetchData', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'fetchData'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'syncConversation', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'syncConversation'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'readMessages', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'readMessages'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'updateConversationRecipientList', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'updateConversationRecipientList'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'pushMessages', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'pushMessages'), _class.prototype)), _class);
exports.default = MessageStore;
//# sourceMappingURL=index.js.map

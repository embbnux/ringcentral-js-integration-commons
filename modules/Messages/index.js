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

var _moduleStatuses = require('../../enums/moduleStatuses');

var _moduleStatuses2 = _interopRequireDefault(_moduleStatuses);

var _ensureExist = require('../../lib/ensureExist');

var _ensureExist2 = _interopRequireDefault(_ensureExist);

var _actionTypes = require('./actionTypes');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

var _getMessagesReducer = require('./getMessagesReducer');

var _getMessagesReducer2 = _interopRequireDefault(_getMessagesReducer);

var _messageHelper = require('../../lib/messageHelper');

var _cleanNumber = require('../../lib/cleanNumber');

var _cleanNumber2 = _interopRequireDefault(_cleanNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Messages = function (_RcModule) {
  (0, _inherits3.default)(Messages, _RcModule);

  function Messages(_ref) {
    var messageStore = _ref.messageStore,
        extensionInfo = _ref.extensionInfo,
        _ref$defaultPerPage = _ref.defaultPerPage,
        defaultPerPage = _ref$defaultPerPage === undefined ? 20 : _ref$defaultPerPage,
        contactMatcher = _ref.contactMatcher,
        conversationMatcher = _ref.conversationMatcher,
        conversationLogger = _ref.conversationLogger,
        options = (0, _objectWithoutProperties3.default)(_ref, ['messageStore', 'extensionInfo', 'defaultPerPage', 'contactMatcher', 'conversationMatcher', 'conversationLogger']);
    (0, _classCallCheck3.default)(this, Messages);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Messages.__proto__ || (0, _getPrototypeOf2.default)(Messages)).call(this, (0, _extends3.default)({}, options, {
      actionTypes: _actionTypes2.default
    })));

    _this._contactMatcher = contactMatcher;
    _this._conversationLogger = conversationLogger;
    _this._messageStore = _ensureExist2.default.call(_this, messageStore, 'messageStore');
    _this._extensionInfo = _ensureExist2.default.call(_this, extensionInfo, 'extensionInfo');
    _this._reducer = (0, _getMessagesReducer2.default)(_this.actionTypes, defaultPerPage);

    _this.addSelector('uniqueNumbers', function () {
      return _this._messageStore.conversations;
    }, function (messages) {
      var output = [];
      var numberMap = {};
      function addIfNotExist(number) {
        if (!numberMap[number]) {
          output.push(number);
          numberMap[number] = true;
        }
      }
      messages.forEach(function (message) {
        if (message.from && message.from.phoneNumber) {
          addIfNotExist(message.from.phoneNumber);
        } else if (message.from && message.from.extensionNumber) {
          addIfNotExist(message.from.extensionNumber);
        }
        if (message.to && message.to.length > 0) {
          message.to.forEach(function (toUser) {
            if (toUser && toUser.phoneNumber) {
              addIfNotExist(toUser.phoneNumber);
            } else if (toUser && toUser.extensionNumber) {
              addIfNotExist(toUser.extensionNumber);
            }
          });
        }
      });
      return output;
    });
    _this.addSelector('effectiveSearchString', function () {
      return _this.state.searchInput;
    }, function (input) {
      if (input.length >= 3) return input;
      return '';
    });
    _this.addSelector('allConversations', function () {
      return _this._messageStore.conversations;
    }, function () {
      return _this._extensionInfo.extensionNumber;
    }, function () {
      return _this._contactMatcher && _this._contactMatcher.dataMapping;
    }, function () {
      return _this._conversationLogger && _this._conversationLogger.loggingMap;
    }, function () {
      return _this._conversationLogger && _this._conversationLogger.dataMapping;
    }, function (conversations, extensionNumber) {
      var contactMapping = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var loggingMap = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var conversationLogMapping = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      return conversations.map(function (message) {
        var _getNumbersFromMessag = (0, _messageHelper.getNumbersFromMessage)({ extensionNumber: extensionNumber, message: message }),
            self = _getNumbersFromMessag.self,
            correspondents = _getNumbersFromMessag.correspondents;

        var selfNumber = self && (self.phoneNumber || self.extensionNumber);
        var selfMatches = selfNumber && contactMapping[selfNumber] || [];
        var correspondentMatches = correspondents.reduce(function (matches, contact) {
          var number = contact && (contact.phoneNumber || contact.extensionNumber);
          return number && contactMapping[number] && contactMapping[number].length ? matches.concat(contactMapping[number]) : matches;
        }, []);
        var conversationLogId = _this._conversationLogger ? _this._conversationLogger.getConversationLogId(message) : null;
        var isLogging = !!(conversationLogId && loggingMap[conversationLogId]);
        var conversationMatches = conversationLogMapping[conversationLogId] || [];
        return (0, _extends3.default)({}, message, {
          self: self,
          selfMatches: selfMatches,
          correspondents: correspondents,
          correspondentMatches: correspondentMatches,
          conversationLogId: conversationLogId,
          isLogging: isLogging,
          conversationMatches: conversationMatches
        });
      });
    });
    _this.addSelector('filteredConversations', _this._selectors.allConversations, function () {
      return _this._selectors.effectiveSearchString();
    }, function (allConversations, effectiveSearchString) {
      if (effectiveSearchString !== '') {
        var searchResults = [];
        allConversations.forEach(function (message) {
          var searchNumber = (0, _cleanNumber2.default)(effectiveSearchString, false);
          if (searchNumber !== '' && message.correspondents.find(function (contact) {
            return (0, _cleanNumber2.default)(contact.phoneNumber || contact.extensionNumber || '').indexOf(searchNumber) > -1;
          })) {
            // match by phoneNumber or extensionNumber
            searchResults.push((0, _extends3.default)({}, message, {
              matchOrder: 0
            }));
            return;
          }
          if (message.correspondentMatches.length) {
            if (message.correspondentMatches.find(function (entity) {
              return entity.name && entity.name.indexOf(effectiveSearchString) > -1;
            })) {
              // match by entity's name
              searchResults.push((0, _extends3.default)({}, message, {
                matchOrder: 0
              }));
              return;
            }
          } else if (message.correspondents.find(function (contact) {
            return (contact.name || '').indexOf(effectiveSearchString) > -1;
          })) {
            searchResults.push((0, _extends3.default)({}, message, {
              matchOrder: 0
            }));
            return;
          }

          // try match messages of the same conversation
          if (message.subject.indexOf(effectiveSearchString) > -1) {
            searchResults.push((0, _extends3.default)({}, message, {
              matchOrder: 1
            }));
            return;
          }
          var matchedMessage = _this._messageStore.messages.find(function (item) {
            return item.conversationId === message.conversationId && item.subject.indexOf(effectiveSearchString) > -1;
          });
          if (matchedMessage) {
            searchResults.push((0, _extends3.default)({}, message, {
              matchedMessage: matchedMessage,
              matchOrders: 1
            }));
          }
        });
        return searchResults.sort(_messageHelper.sortSearchResults);
      }
      return allConversations;
    });

    if (_this._contactMatcher) {
      _this._contactMatcher.addQuerySource({
        getQueriesFn: _this._selectors.uniqueNumbers,
        readyCheckFn: function readyCheckFn() {
          return _this._messageStore.ready;
        }
      });
    }

    _this._lastProcessedNumbers = null;
    return _this;
  }

  (0, _createClass3.default)(Messages, [{
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      this.store.subscribe(function () {
        return _this2._onStateChange();
      });
    }
  }, {
    key: '_onStateChange',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this._shouldInit()) {
                  _context.next = 8;
                  break;
                }

                this.store.dispatch({
                  type: this.actionTypes.init
                });

                if (!this._contactMatcher) {
                  _context.next = 5;
                  break;
                }

                _context.next = 5;
                return this._contactMatcher.triggerMatch();

              case 5:
                this.store.dispatch({
                  type: this.actionTypes.initSuccess
                });
                _context.next = 9;
                break;

              case 8:
                if (this._shouldReset()) {
                  this.store.dispatch({
                    type: this.actionTypes.reset
                  });
                  this._lastProcessedNumbers = null;
                  this.store.dispatch({
                    type: this.actionTypes.resetSuccess
                  });
                } else if (this._lastProcessedNumbers !== this.uniqueNumbers) {
                  this._lastProcessedNumbers = this.uniqueNumbers;
                  if (this._contactMatcher) {
                    this._contactMatcher.triggerMatch();
                  }
                }

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _onStateChange() {
        return _ref2.apply(this, arguments);
      }

      return _onStateChange;
    }()
  }, {
    key: '_shouldInit',
    value: function _shouldInit() {
      return this._messageStore.ready && this._extensionInfo.ready && (!this._contactMatcher || this._contactMatcher.ready) && (!this._conversationLogger || this._conversationLogger.ready) && this.pending;
    }
  }, {
    key: '_shouldReset',
    value: function _shouldReset() {
      return (!this._messageStore.ready || !this._extensionInfo.ready || this._contactMatcher && !this._contactMatcher.ready || this._conversationLogger && !this._conversationLogger.ready) && this.ready;
    }
  }, {
    key: '_getCurrnetPageMessages',
    value: function _getCurrnetPageMessages(page) {
      this.store.dispatch({
        type: this.actionTypes.setPage,
        page: page
      });
    }
  }, {
    key: 'loadNextPageMessages',
    value: function loadNextPageMessages() {
      this.store.dispatch({
        type: this.actionTypes.nextPage
      });
    }
  }, {
    key: 'updateSearchInput',
    value: function updateSearchInput(input) {
      this.store.dispatch({
        type: this.actionTypes.updateSearchInput,
        input: input
      });
    }
  }, {
    key: 'status',
    get: function get() {
      return this.state.status;
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
    key: 'searchInput',
    get: function get() {
      return this.state.searchInput;
    }
  }, {
    key: 'allConversations',
    get: function get() {
      return this._selectors.allConversations();
    }
  }, {
    key: 'filteredConversations',
    get: function get() {
      return this._selectors.filteredConversations();
    }
  }]);
  return Messages;
}(_RcModule3.default);

exports.default = Messages;
//# sourceMappingURL=index.js.map

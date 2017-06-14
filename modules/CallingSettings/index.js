'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _RcModule2 = require('../../lib/RcModule');

var _RcModule3 = _interopRequireDefault(_RcModule2);

var _getCallingSettingsReducer = require('./getCallingSettingsReducer');

var _getCallingSettingsReducer2 = _interopRequireDefault(_getCallingSettingsReducer);

var _moduleStatuses = require('../../enums/moduleStatuses');

var _moduleStatuses2 = _interopRequireDefault(_moduleStatuses);

var _mapOptionToMode = require('./mapOptionToMode');

var _mapOptionToMode2 = _interopRequireDefault(_mapOptionToMode);

var _callingOptions = require('./callingOptions');

var _callingOptions2 = _interopRequireDefault(_callingOptions);

var _callingSettingsMessages = require('./callingSettingsMessages');

var _callingSettingsMessages2 = _interopRequireDefault(_callingSettingsMessages);

var _actionTypes = require('./actionTypes');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

var _proxify = require('../../lib/proxy/proxify');

var _proxify2 = _interopRequireDefault(_proxify);

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

var CallingSettings = (_class = function (_RcModule) {
  (0, _inherits3.default)(CallingSettings, _RcModule);

  function CallingSettings(_ref) {
    var alert = _ref.alert,
        brand = _ref.brand,
        extensionInfo = _ref.extensionInfo,
        extensionPhoneNumber = _ref.extensionPhoneNumber,
        forwardingNumber = _ref.forwardingNumber,
        storage = _ref.storage,
        rolesAndPermissions = _ref.rolesAndPermissions,
        tabManager = _ref.tabManager,
        onFirstLogin = _ref.onFirstLogin,
        webphone = _ref.webphone,
        options = (0, _objectWithoutProperties3.default)(_ref, ['alert', 'brand', 'extensionInfo', 'extensionPhoneNumber', 'forwardingNumber', 'storage', 'rolesAndPermissions', 'tabManager', 'onFirstLogin', 'webphone']);
    (0, _classCallCheck3.default)(this, CallingSettings);

    var _this = (0, _possibleConstructorReturn3.default)(this, (CallingSettings.__proto__ || (0, _getPrototypeOf2.default)(CallingSettings)).call(this, (0, _extends3.default)({}, options, {
      actionTypes: _actionTypes2.default
    })));

    _this._alert = alert;
    _this._brand = brand;
    _this._extensionInfo = extensionInfo;
    _this._extensionPhoneNumber = extensionPhoneNumber;
    _this._forwardingNumber = forwardingNumber;
    _this._storage = storage;
    _this._rolesAndPermissions = rolesAndPermissions;
    _this._tabManager = tabManager;
    _this._webphone = webphone;

    _this._callWithStorageKey = 'callingSettingsCallWith';
    _this._ringoutPromptStorageKey = 'callingSettingsRingoutPrompt';
    _this._myLocationStorageKey = 'callingSettingsMyLocation';
    _this._timestampStorageKey = 'callingSettingsTimestamp';
    _this._fromNumberStorageKey = 'fromCallIdNumber';

    _this._onFirstLogin = onFirstLogin;

    _this._storage.registerReducer({
      key: _this._callWithStorageKey,
      reducer: (0, _getCallingSettingsReducer.getCallWithReducer)(_this.actionTypes)
    });
    _this._storage.registerReducer({
      key: _this._ringoutPromptStorageKey,
      reducer: (0, _getCallingSettingsReducer.getRingoutPromptReducer)(_this.actionTypes)
    });
    _this._storage.registerReducer({
      key: _this._myLocationStorageKey,
      reducer: (0, _getCallingSettingsReducer.getMyLocationReducer)(_this.actionTypes)
    });
    _this._storage.registerReducer({
      key: _this._timestampStorageKey,
      reducer: (0, _getCallingSettingsReducer.getTimestampReducer)(_this.actionTypes)
    });
    _this._storage.registerReducer({
      key: _this._fromNumberStorageKey,
      reducer: (0, _getCallingSettingsReducer.getFromNumberReducer)(_this.actionTypes)
    });
    _this._reducer = (0, _getCallingSettingsReducer2.default)(_this.actionTypes);

    _this.addSelector('myPhoneNumbers', function () {
      return _this._extensionPhoneNumber.directNumbers;
    }, function () {
      return _this._extensionPhoneNumber.mainCompanyNumber;
    }, function () {
      return _this._extensionInfo.extensionNumber;
    }, function (directNumbers, mainCompanyNumber, extensionNumber) {
      var myPhoneNumbers = directNumbers.map(function (item) {
        return item.phoneNumber;
      });
      if (mainCompanyNumber && extensionNumber) {
        myPhoneNumbers.push(mainCompanyNumber.phoneNumber + '*' + extensionNumber);
      }
      return myPhoneNumbers;
    });

    _this.addSelector('otherPhoneNumbers', function () {
      return _this._forwardingNumber.flipNumbers;
    }, function () {
      return _this._extensionPhoneNumber.callerIdNumbers;
    }, function () {
      return _this._extensionPhoneNumber.directNumbers;
    }, function (flipNumbers, callerIdNumbers, directNumbers) {
      var filterMapping = {};
      callerIdNumbers.forEach(function (item) {
        filterMapping[item.phoneNumber] = true;
      });
      directNumbers.forEach(function (item) {
        filterMapping[item.phoneNumber] = true;
      });
      return flipNumbers.filter(function (item) {
        return !filterMapping[item.phoneNumber];
      }).sort(function (a, b) {
        return a.label === 'Mobile' && a.label !== b.label ? -1 : 1;
      }).map(function (item) {
        return item.phoneNumber;
      });
    });

    _this.addSelector('fromNumbers', function () {
      return _this._extensionPhoneNumber.callerIdNumbers;
    }, function (phoneNumbers) {
      return phoneNumbers.sort(function (firstItem, lastItem) {
        if (firstItem.usageType === 'DirectNumber') return -1;else if (lastItem.usageType === 'DirectNumber') return 1;else if (firstItem.usageType === 'MainCompanyNumber') return -1;else if (lastItem.usageType === 'MainCompanyNumber') return 1;else if (firstItem.usageType < lastItem.usageType) return -1;else if (firstItem.usageType > lastItem.usageType) return 1;
        return 0;
      });
    });

    _this.addSelector('callWithOptions', function () {
      return _this._rolesAndPermissions.ringoutEnabled;
    }, function () {
      return _this._rolesAndPermissions.webphoneEnabled;
    }, function () {
      return _this.otherPhoneNumbers.length > 0;
    }, function (ringoutEnabled, webphoneEnabled, hasOtherPhone) {
      var callWithOptions = [];
      if (_this._webphone && webphoneEnabled) {
        callWithOptions.push(_callingOptions2.default.browser);
      }
      callWithOptions.push(_callingOptions2.default.softphone);
      if (ringoutEnabled) {
        callWithOptions.push(_callingOptions2.default.myphone);
        if (hasOtherPhone) {
          callWithOptions.push(_callingOptions2.default.otherphone);
        }
        callWithOptions.push(_callingOptions2.default.customphone);
      }
      return callWithOptions;
    });
    _this.addSelector('availableNumbers', function () {
      return _this.myPhoneNumbers;
    }, function () {
      return _this.otherPhoneNumbers;
    }, function (myPhoneNumbers, otherPhoneNumbers) {
      var _ref2;

      return _ref2 = {}, (0, _defineProperty3.default)(_ref2, _callingOptions2.default.myphone, myPhoneNumbers), (0, _defineProperty3.default)(_ref2, _callingOptions2.default.otherphone, otherPhoneNumbers), _ref2;
    });
    return _this;
  }

  (0, _createClass3.default)(CallingSettings, [{
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      this.store.subscribe((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var defaultCallWith;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(_this2._storage.ready && _this2._extensionInfo.ready && _this2._extensionPhoneNumber.ready && _this2._forwardingNumber.ready && _this2._rolesAndPermissions.ready && _this2.status === _moduleStatuses2.default.pending)) {
                  _context.next = 14;
                  break;
                }

                _this2._myPhoneNumbers = _this2.myPhoneNumbers;
                _this2._otherPhoneNumbers = _this2.otherPhoneNumbers;
                _this2._ringoutEnabled = _this2._rolesAndPermissions.ringoutEnabled;
                _this2._webphoneEnabled = _this2._rolesAndPermissions.webphoneEnabled;
                _this2.store.dispatch({
                  type: _this2.actionTypes.init
                });
                if (!_this2.timestamp) {
                  // first time login
                  defaultCallWith = _this2.callWithOptions && _this2.callWithOptions[0];

                  _this2.store.dispatch({
                    type: _this2.actionTypes.setData,
                    callWith: defaultCallWith,
                    timestamp: Date.now()
                  });
                  _this2._alert.warning({
                    message: _this2._brand.id === '1210' ? _callingSettingsMessages2.default.firstLogin : _callingSettingsMessages2.default.firstLoginOther
                  });
                  if (typeof _this2._onFirstLogin === 'function') {
                    _this2._onFirstLogin();
                  }
                }
                _context.next = 9;
                return _this2._validateSettings();

              case 9:
                _context.next = 11;
                return _this2._initFromNumber();

              case 11:
                _this2.store.dispatch({
                  type: _this2.actionTypes.initSuccess
                });
                _context.next = 25;
                break;

              case 14:
                if (!(_this2.ready && (!_this2._storage.ready || !_this2._extensionInfo.ready || !_this2._extensionPhoneNumber.ready || !_this2._forwardingNumber.ready || !_this2._rolesAndPermissions.ready))) {
                  _context.next = 18;
                  break;
                }

                _this2.store.dispatch({
                  type: _this2.actionTypes.resetSuccess
                });
                _context.next = 25;
                break;

              case 18:
                if (!(_this2.ready && (_this2._ringoutEnabled !== _this2._rolesAndPermissions.ringoutEnabled || _this2._webphoneEnabled !== _this2._rolesAndPermissions.webphoneEnabled || _this2._myPhoneNumbers !== _this2.myPhoneNumbers || _this2._otherPhoneNumbers !== _this2.otherPhoneNumbers))) {
                  _context.next = 25;
                  break;
                }

                _this2._ringoutEnabled = _this2._rolesAndPermissions.ringoutEnabled;
                _this2._webphoneEnabled = _this2._rolesAndPermissions.webphoneEnabled;
                _this2._myPhoneNumbers = _this2.myPhoneNumbers;
                _this2._otherPhoneNumbers = _this2.otherPhoneNumbers;
                _context.next = 25;
                return _this2._validateSettings();

              case 25:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2);
      })));
    }
  }, {
    key: '_initFromNumber',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var fromNumber, fromNumberList;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                fromNumber = this.fromNumber;

                if (fromNumber) {
                  _context2.next = 5;
                  break;
                }

                fromNumberList = this.fromNumbers;
                _context2.next = 5;
                return this.updateFromNumber(fromNumberList[0]);

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _initFromNumber() {
        return _ref4.apply(this, arguments);
      }

      return _initFromNumber;
    }()
  }, {
    key: 'updateFromNumber',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(number) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.store.dispatch({
                  type: this.actionTypes.updateFromNumber,
                  number: number && number.phoneNumber
                });

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function updateFromNumber(_x) {
        return _ref5.apply(this, arguments);
      }

      return updateFromNumber;
    }()
  }, {
    key: '_setSoftPhoneToCallWith',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.store.dispatch({
                  type: this.actionTypes.setData,
                  callWith: _callingOptions2.default.softphone,
                  timestamp: Date.now()
                });

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _setSoftPhoneToCallWith() {
        return _ref6.apply(this, arguments);
      }

      return _setSoftPhoneToCallWith;
    }()
  }, {
    key: '_validateSettings',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!(!(this._webphoneEnabled && this._webphone) && this.callWith === _callingOptions2.default.browser)) {
                  _context5.next = 6;
                  break;
                }

                _context5.next = 3;
                return this._setSoftPhoneToCallWith();

              case 3:
                this._alert.danger({
                  message: _callingSettingsMessages2.default.webphonePermissionRemoved,
                  ttl: 0
                });
                _context5.next = 13;
                break;

              case 6:
                if (!(!this._ringoutEnabled && (this.callWith === _callingOptions2.default.myphone || this.callWith === _callingOptions2.default.otherphone || this.callWith === _callingOptions2.default.customphone))) {
                  _context5.next = 12;
                  break;
                }

                _context5.next = 9;
                return this._setSoftPhoneToCallWith();

              case 9:
                this._alert.danger({
                  message: _callingSettingsMessages2.default.permissionChanged,
                  ttl: 0
                });
                _context5.next = 13;
                break;

              case 12:
                if (this.callWith === _callingOptions2.default.otherphone && this._otherPhoneNumbers.indexOf(this.myLocation) === -1 || this.callWith === _callingOptions2.default.myphone && this._myPhoneNumbers.indexOf(this.myLocation) === -1) {
                  this.store.dispatch({
                    type: this.actionTypes.setData,
                    callWith: _callingOptions2.default.myphone,
                    myLocation: this._myPhoneNumbers[0],
                    timestamp: Date.now()
                  });
                  this._alert.danger({
                    message: _callingSettingsMessages2.default.phoneNumberChanged,
                    ttl: 0
                  });
                }

              case 13:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _validateSettings() {
        return _ref7.apply(this, arguments);
      }

      return _validateSettings;
    }()
  }, {
    key: '_warningEmergencyCallingNotAvailable',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (this.callWith === _callingOptions2.default.browser) {
                  this._alert.info({
                    message: _callingSettingsMessages2.default.emergencyCallingNotAvailable
                  });
                }

              case 1:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function _warningEmergencyCallingNotAvailable() {
        return _ref8.apply(this, arguments);
      }

      return _warningEmergencyCallingNotAvailable;
    }()
  }, {
    key: 'setData',
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(_ref10, withPrompt) {
        var callWith = _ref10.callWith,
            myLocation = _ref10.myLocation,
            ringoutPrompt = _ref10.ringoutPrompt;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                // TODO validate myLocation
                this.store.dispatch({
                  type: this.actionTypes.setData,
                  callWith: callWith,
                  myLocation: myLocation,
                  ringoutPrompt: ringoutPrompt,
                  timestamp: Date.now()
                });
                if (withPrompt) {
                  if (this.callWith === _callingOptions2.default.softphone) {
                    this._alert.info({
                      message: _callingSettingsMessages2.default.saveSuccessWithSoftphone
                    });
                  } else {
                    this._alert.info({
                      message: _callingSettingsMessages2.default.saveSuccess
                    });
                    this._warningEmergencyCallingNotAvailable();
                  }
                }

              case 2:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function setData(_x2, _x3) {
        return _ref9.apply(this, arguments);
      }

      return setData;
    }()
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
    key: 'callWith',
    get: function get() {
      return this._storage.getItem(this._callWithStorageKey);
    }
  }, {
    key: 'callingMode',
    get: function get() {
      return (0, _mapOptionToMode2.default)(this.callWith);
    }
  }, {
    key: 'callWithOptions',
    get: function get() {
      return this._selectors.callWithOptions();
    }
  }, {
    key: 'ringoutPrompt',
    get: function get() {
      return this._storage.getItem(this._ringoutPromptStorageKey);
    }
  }, {
    key: 'myLocation',
    get: function get() {
      return this._storage.getItem(this._myLocationStorageKey);
    }
  }, {
    key: 'timestamp',
    get: function get() {
      return this._storage.getItem(this._timestampStorageKey);
    }
  }, {
    key: 'myPhoneNumbers',
    get: function get() {
      return this._selectors.myPhoneNumbers();
    }
  }, {
    key: 'otherPhoneNumbers',
    get: function get() {
      return this._selectors.otherPhoneNumbers();
    }
  }, {
    key: 'availableNumbers',
    get: function get() {
      return this._selectors.availableNumbers();
    }
  }, {
    key: 'fromNumber',
    get: function get() {
      return this._storage.getItem(this._fromNumberStorageKey);
    }
  }, {
    key: 'fromNumbers',
    get: function get() {
      return this._selectors.fromNumbers();
    }
  }]);
  return CallingSettings;
}(_RcModule3.default), (_applyDecoratedDescriptor(_class.prototype, '_initFromNumber', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, '_initFromNumber'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'updateFromNumber', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'updateFromNumber'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_setSoftPhoneToCallWith', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, '_setSoftPhoneToCallWith'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_validateSettings', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, '_validateSettings'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_warningEmergencyCallingNotAvailable', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, '_warningEmergencyCallingNotAvailable'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setData', [_proxify2.default], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'setData'), _class.prototype)), _class);
exports.default = CallingSettings;
//# sourceMappingURL=index.js.map

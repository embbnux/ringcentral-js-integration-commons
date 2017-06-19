'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _RcModule2 = require('../../lib/RcModule');

var _RcModule3 = _interopRequireDefault(_RcModule2);

var _isBlank = require('../../lib/isBlank');

var _isBlank2 = _interopRequireDefault(_isBlank);

var _normalizeNumber = require('../../lib/normalizeNumber');

var _normalizeNumber2 = _interopRequireDefault(_normalizeNumber);

var _actionTypes = require('./actionTypes');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

var _moduleStatuses = require('../../enums/moduleStatuses');

var _moduleStatuses2 = _interopRequireDefault(_moduleStatuses);

var _getContactsReducer = require('./getContactsReducer');

var _getContactsReducer2 = _interopRequireDefault(_getContactsReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addPhoneToContact(contact, phone, type) {
  var phoneNumber = (0, _normalizeNumber2.default)({ phoneNumber: phone });
  if ((0, _isBlank2.default)(phoneNumber)) {
    return;
  }
  var existedPhone = contact.phoneNumbers.find(function (number) {
    return number && number.phoneNumber === phone;
  });
  if (existedPhone) {
    existedPhone.type = type;
  } else {
    contact.phoneNumbers.push({
      phoneNumber: phone,
      type: type
    });
  }
}

var Contacts = function (_RcModule) {
  (0, _inherits3.default)(Contacts, _RcModule);

  function Contacts(_ref) {
    var addressBook = _ref.addressBook,
        accountExtension = _ref.accountExtension,
        accountPhoneNumber = _ref.accountPhoneNumber,
        options = (0, _objectWithoutProperties3.default)(_ref, ['addressBook', 'accountExtension', 'accountPhoneNumber']);
    (0, _classCallCheck3.default)(this, Contacts);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Contacts.__proto__ || (0, _getPrototypeOf2.default)(Contacts)).call(this, (0, _extends3.default)({}, options, {
      actionTypes: _actionTypes2.default
    })));

    _this._addressBook = addressBook;
    _this._accountExtension = accountExtension;
    _this._accountPhoneNumber = accountPhoneNumber;
    _this._reducer = (0, _getContactsReducer2.default)(_this.actionTypes);

    _this.addSelector('companyContacts', function () {
      return _this._accountExtension.availableExtensions;
    }, function () {
      return _this._accountPhoneNumber.extensionToPhoneNumberMap;
    }, function (extensions, extensionToPhoneNumberMap) {
      var newExtensions = [];
      extensions.forEach(function (extension) {
        if (!(extension.status === 'Enabled' && ['DigitalUser', 'User'].indexOf(extension.type) >= 0)) {
          return;
        }
        var contact = {
          type: 'company',
          id: extension.id,
          firstName: extension.contact && extension.contact.firstName,
          lastName: extension.contact && extension.contact.lastName,
          email: extension.contact && extension.contact.email,
          extensionNumber: extension.ext,
          phoneNumbers: []
        };
        if ((0, _isBlank2.default)(contact.extensionNumber)) {
          return;
        }
        var phones = extensionToPhoneNumberMap[contact.extensionNumber];
        if (phones && phones.length > 0) {
          phones.forEach(function (phone) {
            addPhoneToContact(contact, phone.phoneNumber, 'directPhone');
          });
        }
        newExtensions.push(contact);
      });
      return newExtensions;
    });

    _this.addSelector('personalContacts', function () {
      return _this._addressBook.contacts;
    }, function (rawContacts) {
      var contacts = [];
      rawContacts.forEach(function (rawContact) {
        var contact = (0, _extends3.default)({
          type: 'personal',
          phoneNumbers: []
        }, rawContact);
        (0, _keys2.default)(contact).forEach(function (key) {
          if (key.toLowerCase().indexOf('phone') === -1) {
            return;
          }
          if (typeof contact[key] !== 'string') {
            return;
          }
          addPhoneToContact(contact, contact[key], key);
        });
        contacts.push(contact);
      });
      return contacts;
    });
    return _this;
  }

  (0, _createClass3.default)(Contacts, [{
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
          type: this.actionTypes.initSuccess
        });
      } else if (this._shouldReset()) {
        this._resetModuleStatus();
      }
    }
  }, {
    key: '_shouldInit',
    value: function _shouldInit() {
      return this._addressBook.ready && this._accountExtension.ready && this._accountPhoneNumber.ready && this.pending;
    }
  }, {
    key: '_shouldReset',
    value: function _shouldReset() {
      return (!this._addressBook.ready || !this._accountExtension.ready || !this._accountPhoneNumber.ready) && this.ready;
    }
  }, {
    key: '_resetModuleStatus',
    value: function _resetModuleStatus() {
      this.store.dispatch({
        type: this.actionTypes.resetSuccess
      });
    }
  }, {
    key: 'searchPhoneNumber',
    value: function searchPhoneNumber(phone) {
      var result = [];
      var phoneNumber = (0, _normalizeNumber2.default)({ phoneNumber: phone });
      var matchContact = function matchContact(contact) {
        var found = contact.extensionNumber && contact.extensionNumber === phoneNumber;
        if (!found) {
          contact.phoneNumbers.forEach(function (contactPhoneNumber) {
            if (!found && contactPhoneNumber.phoneNumber === phoneNumber) {
              found = true;
            }
          });
        }
        if (!found) {
          return;
        }
        var matchedContact = (0, _extends3.default)({}, contact, {
          phoneNumbers: [].concat((0, _toConsumableArray3.default)(contact.phoneNumbers)),
          entityType: 'contact',
          name: contact.firstName + ' ' + contact.lastName
        });
        if (contact.extensionNumber) {
          matchedContact.phoneNumbers.push({
            phoneType: 'extension',
            phoneNumber: contact.extensionNumber
          });
        }
        result.push(matchedContact);
      };
      this.personalContacts.forEach(matchContact);
      this.companyContacts.forEach(matchContact);
      return result;
    }
  }, {
    key: 'matchContacts',
    value: function matchContacts(_ref2) {
      var _this3 = this;

      var phoneNumbers = _ref2.phoneNumbers;

      var result = {};
      phoneNumbers.forEach(function (phoneNumber) {
        result[phoneNumber] = _this3.searchPhoneNumber(phoneNumber);
      });
      return result;
    }
  }, {
    key: 'status',
    get: function get() {
      return this.state.status;
    }
  }, {
    key: 'companyContacts',
    get: function get() {
      return this._selectors.companyContacts();
    }
  }, {
    key: 'personalContacts',
    get: function get() {
      return this._selectors.personalContacts();
    }
  }]);
  return Contacts;
}(_RcModule3.default);

exports.default = Contacts;
//# sourceMappingURL=index.js.map

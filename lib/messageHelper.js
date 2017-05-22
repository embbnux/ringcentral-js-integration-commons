'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.filterNumbers = filterNumbers;
exports.messageIsDeleted = messageIsDeleted;
exports.messageIsTextMessage = messageIsTextMessage;
exports.messageIsFax = messageIsFax;
exports.messageIsVoicemail = messageIsVoicemail;
exports.messageIsAcceptable = messageIsAcceptable;
exports.getMyNumberFromMessage = getMyNumberFromMessage;
exports.uniqueRecipients = uniqueRecipients;
exports.getRecipientNumbersFromMessage = getRecipientNumbersFromMessage;
exports.getRecipients = getRecipients;
exports.getNumbersFromMessage = getNumbersFromMessage;
exports.sortByDate = sortByDate;
exports.sortSearchResults = sortSearchResults;

var _messageTypes = require('../enums/messageTypes');

var _messageTypes2 = _interopRequireDefault(_messageTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function filterNumbers(numbers, filterNumber) {
  return numbers.filter(function (number) {
    if (filterNumber.phoneNumber) {
      return filterNumber.phoneNumber !== number.phoneNumber;
    }
    return filterNumber.extensionNumber !== number.extensionNumber;
  });
}

function messageIsDeleted(message) {
  return message.availability === 'Deleted';
}

function messageIsTextMessage(message) {
  return message.type !== _messageTypes2.default.fax && message.type !== _messageTypes2.default.voiceMail;
}

function messageIsFax(message) {
  return message.type === _messageTypes2.default.fax;
}

function messageIsVoicemail(message) {
  return message.type === _messageTypes2.default.voiceMail;
}

function messageIsAcceptable(message) {
  // do not show outbound faxes
  // do not show deleted messages
  return (message.type !== _messageTypes2.default.fax || message.direction === 'Inbound') && !messageIsDeleted(message);
}

function getMyNumberFromMessage(_ref) {
  var message = _ref.message,
      myExtensionNumber = _ref.myExtensionNumber;

  if (!message) {
    return null;
  }
  if (message.direction === 'Outbound') {
    return message.from;
  }
  if (message.type === _messageTypes2.default.pager) {
    var myNumber = message.to.find(function (number) {
      return number.extensionNumber === myExtensionNumber;
    });
    if (myNumber) {
      return myNumber;
    }
    return { extensionNumber: myExtensionNumber };
  }
  return message.to[0];
}

function uniqueRecipients(recipients) {
  var recipientMap = {};
  recipients.forEach(function (recipient) {
    recipientMap[(0, _stringify2.default)(recipient)] = recipient;
  });
  return (0, _values2.default)(recipientMap);
}

function getRecipientNumbersFromMessage(_ref2) {
  var message = _ref2.message,
      myNumber = _ref2.myNumber;

  if (!message) {
    return [];
  }
  if (message.type === _messageTypes2.default.sms) {
    if (message.direction === 'Outbound') {
      return message.to;
    }
    return [message.from];
  }
  var allRecipients = [message.from].concat(message.to);
  var recipients = filterNumbers(allRecipients, myNumber);
  if (recipients.length === 0) {
    recipients.push(myNumber);
  }
  return uniqueRecipients(recipients);
}

function getRecipients(_ref3) {
  var message = _ref3.message,
      myExtensionNumber = _ref3.myExtensionNumber;

  var myNumber = getMyNumberFromMessage({
    message: message,
    myExtensionNumber: myExtensionNumber
  });
  return getRecipientNumbersFromMessage({
    message: message,
    myNumber: myNumber
  });
}

function getNumbersFromMessage(_ref4) {
  var extensionNumber = _ref4.extensionNumber,
      message = _ref4.message;

  if (message.type === _messageTypes2.default.pager) {
    return {
      self: {
        extensionNumber: extensionNumber
      },
      correspondents: message.to && message.to.filter(function (entry) {
        return entry.extensionNumber !== extensionNumber;
      }) || []
    };
  }

  var inbound = message.direction === 'Inbound';
  var fromField = (message.from && Array.isArray(message.from) ? message.from : [message.from]) || [];
  var toField = (message.to && Array.isArray(message.to) ? message.to : [message.to]) || [];
  if (inbound) {
    return {
      self: toField[0],
      correspondents: fromField
    };
  }
  return {
    self: fromField[0],
    correspondents: toField
  };
}

function sortByDate(a, b) {
  var ta = new Date(a.creationTime).getTime();
  var tb = new Date(b.creationTime).getTime();
  if (ta === tb) return 0;
  return ta > tb ? -1 : 1;
}

function sortSearchResults(a, b) {
  if (a.matchOrder === b.matchOrder) return sortByDate(a, b);
  return a.matchOrder > b.matchOrder ? 1 : -1;
}
//# sourceMappingURL=messageHelper.js.map

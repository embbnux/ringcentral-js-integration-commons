'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Enum = require('../../lib/Enum');

var _Enum2 = _interopRequireDefault(_Enum);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new _Enum2.default(['init', 'resetSuccess', 'initSuccess', 'connect', 'connectError', 'registered', 'registrationFailed', 'disconnect', 'unregistered', 'reconnect', 'resetRetryCounts', 'updateCurrentSession', 'destroyCurrentSession', 'updateSessions', 'destroySessions', 'toggleMinimized'], 'webphone');
//# sourceMappingURL=actionTypes.js.map

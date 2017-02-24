'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Enum = require('../../lib/Enum');

var _Enum2 = _interopRequireDefault(_Enum);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new _Enum2.default(['login', 'loginSuccess', 'loginError', 'logout', 'logoutSuccess', 'logoutError', 'refresh', 'refreshSuccess', 'refreshError', 'beforeLogout', 'cancelLogout', 'init', 'initSuccess', 'tabSync', 'proxySetup', 'proxyRetry', 'proxyLoaded', 'proxyCleared'], 'authActionTypes');
//# sourceMappingURL=actionTypes.js.map
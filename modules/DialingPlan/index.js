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

var _fetchList = require('../../lib/fetchList');

var _fetchList2 = _interopRequireDefault(_fetchList);

var _DataFetcher2 = require('../../lib/DataFetcher');

var _DataFetcher3 = _interopRequireDefault(_DataFetcher2);

var _moduleStatuses = require('../../enums/moduleStatuses');

var _moduleStatuses2 = _interopRequireDefault(_moduleStatuses);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DialingPlan = function (_DataFetcher) {
  (0, _inherits3.default)(DialingPlan, _DataFetcher);

  function DialingPlan(_ref) {
    var _this2 = this;

    var client = _ref.client,
        options = (0, _objectWithoutProperties3.default)(_ref, ['client']);
    (0, _classCallCheck3.default)(this, DialingPlan);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DialingPlan.__proto__ || (0, _getPrototypeOf2.default)(DialingPlan)).call(this, (0, _extends3.default)({
      name: 'dialingPlan',
      client: client,
      polling: true,
      fetchFunction: function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return (0, _fetchList2.default)(function (params) {
                    return client.account().dialingPlan().list(params);
                  });

                case 2:
                  _context.t0 = function (p) {
                    return {
                      id: p.id,
                      isoCode: p.isoCode,
                      callingCode: p.callingCode
                    };
                  };

                  return _context.abrupt('return', _context.sent.map(_context.t0));

                case 4:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this2);
        }));

        return function fetchFunction() {
          return _ref2.apply(this, arguments);
        };
      }()
    }, options)));

    _this.addSelector('plans', function () {
      return _this.data;
    }, function (data) {
      return data || [];
    });
    return _this;
  }

  (0, _createClass3.default)(DialingPlan, [{
    key: 'plans',
    get: function get() {
      return this._selectors.plans();
    }
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
  }]);
  return DialingPlan;
}(_DataFetcher3.default);

exports.default = DialingPlan;
//# sourceMappingURL=index.js.map

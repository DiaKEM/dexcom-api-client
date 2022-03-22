"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DexcomApiClient = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _axios = _interopRequireDefault(require("axios"));

var _nodeSchedule = _interopRequireDefault(require("node-schedule"));

var _utils = require("./utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var APPLICATION_ID = 'd89443d2-327c-4a6f-89e5-496bbb0317db';

var DexcomApiClient = function DexcomApiClient(_ref) {
  var username = _ref.username,
      password = _ref.password,
      server = _ref.server,
      clientOpts = _ref.clientOpts;
  var targetServer = server === 'EU' ? 'shareous1.dexcom.com' : 'share2.dexcom.com';
  var sessionId = null;

  var client = _axios["default"].create(_objectSpread({
    baseURL: "https://".concat(targetServer, "/ShareWebServices/Services"),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }, clientOpts));

  var login = /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var payload, responses;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              payload = {
                accountName: username,
                password: password,
                applicationId: APPLICATION_ID
              };
              _context.prev = 1;
              _context.next = 4;
              return Promise.all([client.post('/General/AuthenticatePublisherAccount', payload), client.post('/General/LoginPublisherAccountByName', payload)]);

            case 4:
              responses = _context.sent;

              if (!responses.some(function (e) {
                return !(0, _utils.validate)(e);
              })) {
                _context.next = 7;
                break;
              }

              throw new Error('Login failed.');

            case 7:
              sessionId = responses[1].data;
              console.log('Logged in successfully', sessionId);
              _context.next = 14;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](1);
              throw new Error('Unable to login in');

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 11]]);
    }));

    return function login() {
      return _ref2.apply(this, arguments);
    };
  }();

  var loginAndTry = /*#__PURE__*/function () {
    var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(func) {
      var response;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              response = null;

              if (sessionId) {
                _context2.next = 4;
                break;
              }

              _context2.next = 4;
              return login();

            case 4:
              _context2.prev = 4;
              _context2.next = 7;
              return func.apply(null);

            case 7:
              response = _context2.sent;
              _context2.next = 17;
              break;

            case 10:
              _context2.prev = 10;
              _context2.t0 = _context2["catch"](4);
              _context2.next = 14;
              return login();

            case 14:
              _context2.next = 16;
              return func.apply(null);

            case 16:
              response = _context2.sent;

            case 17:
              return _context2.abrupt("return", response);

            case 18:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[4, 10]]);
    }));

    return function loginAndTry(_x) {
      return _ref3.apply(this, arguments);
    };
  }();

  var read = /*#__PURE__*/function () {
    var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
      var minutesAgo,
          count,
          _args4 = arguments;
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              minutesAgo = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : 1440;
              count = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : 288;
              return _context4.abrupt("return", loginAndTry( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
                var params, response;
                return _regenerator["default"].wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        params = {
                          sessionId: sessionId,
                          minutes: minutesAgo,
                          maxCount: count
                        };
                        _context3.next = 3;
                        return client.post('/Publisher/ReadPublisherLatestGlucoseValues', null, {
                          params: params
                        });

                      case 3:
                        response = _context3.sent;
                        return _context3.abrupt("return", response.data.map(_utils.transform));

                      case 5:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }))));

            case 3:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function read() {
      return _ref4.apply(this, arguments);
    };
  }();

  var readLast = /*#__PURE__*/function () {
    var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", read(9999, 1));

            case 1:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function readLast() {
      return _ref6.apply(this, arguments);
    };
  }();

  var observe = /*#__PURE__*/function () {
    var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(_ref7) {
      var _ref7$maxAttempts, maxAttempts, _ref7$delay, delay, listener, _yield$readLast, _yield$readLast2, data, rawMinutes, a, b, runPoints, proc;

      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _ref7$maxAttempts = _ref7.maxAttempts, maxAttempts = _ref7$maxAttempts === void 0 ? 50 : _ref7$maxAttempts, _ref7$delay = _ref7.delay, delay = _ref7$delay === void 0 ? 1000 : _ref7$delay, listener = _ref7.listener;
              _context7.next = 3;
              return readLast();

            case 3:
              _yield$readLast = _context7.sent;
              _yield$readLast2 = (0, _slicedToArray2["default"])(_yield$readLast, 1);
              data = _yield$readLast2[0];
              rawMinutes = data.date.getMinutes();
              a = String(rawMinutes).padStart(2, '0')[1];
              b = String(rawMinutes + 5).padStart(2, '0')[1];
              runPoints = ['0', '1', '2', '3', '4', '5'].reduce(function (acc, e) {
                return [].concat((0, _toConsumableArray2["default"])(acc), [e + a, e + b]);
              }, []);

              proc = function proc() {
                var attempt = 0;
                var interval = setInterval( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
                  var lastCgmData;
                  return _regenerator["default"].wrap(function _callee6$(_context6) {
                    while (1) {
                      switch (_context6.prev = _context6.next) {
                        case 0:
                          if (attempt >= maxAttempts) {
                            clearInterval(interval);
                          }

                          _context6.next = 3;
                          return read(1, 1);

                        case 3:
                          lastCgmData = _context6.sent;

                          if (lastCgmData.length) {
                            listener.apply(null, [lastCgmData[0]]);
                            clearInterval(interval);
                          }

                          attempt += 1;

                        case 6:
                        case "end":
                          return _context6.stop();
                      }
                    }
                  }, _callee6);
                })), delay);
              };

              return _context7.abrupt("return", _nodeSchedule["default"].scheduleJob("".concat(runPoints.join(','), " * * * *"), proc));

            case 12:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));

    return function observe(_x2) {
      return _ref8.apply(this, arguments);
    };
  }();

  return {
    login: login,
    read: read,
    readLast: readLast,
    observe: observe
  };
};

exports.DexcomApiClient = DexcomApiClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQudHMiXSwibmFtZXMiOlsiQVBQTElDQVRJT05fSUQiLCJEZXhjb21BcGlDbGllbnQiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwic2VydmVyIiwiY2xpZW50T3B0cyIsInRhcmdldFNlcnZlciIsInNlc3Npb25JZCIsImNsaWVudCIsImF4aW9zIiwiY3JlYXRlIiwiYmFzZVVSTCIsImhlYWRlcnMiLCJBY2NlcHQiLCJsb2dpbiIsInBheWxvYWQiLCJhY2NvdW50TmFtZSIsImFwcGxpY2F0aW9uSWQiLCJQcm9taXNlIiwiYWxsIiwicG9zdCIsInJlc3BvbnNlcyIsInNvbWUiLCJlIiwiRXJyb3IiLCJkYXRhIiwiY29uc29sZSIsImxvZyIsImxvZ2luQW5kVHJ5IiwiZnVuYyIsInJlc3BvbnNlIiwiYXBwbHkiLCJyZWFkIiwibWludXRlc0FnbyIsImNvdW50IiwicGFyYW1zIiwibWludXRlcyIsIm1heENvdW50IiwibWFwIiwidHJhbnNmb3JtIiwicmVhZExhc3QiLCJvYnNlcnZlIiwibWF4QXR0ZW1wdHMiLCJkZWxheSIsImxpc3RlbmVyIiwicmF3TWludXRlcyIsImRhdGUiLCJnZXRNaW51dGVzIiwiYSIsIlN0cmluZyIsInBhZFN0YXJ0IiwiYiIsInJ1blBvaW50cyIsInJlZHVjZSIsImFjYyIsInByb2MiLCJhdHRlbXB0IiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJsYXN0Q2dtRGF0YSIsImxlbmd0aCIsInNjaGVkdWxlIiwic2NoZWR1bGVKb2IiLCJqb2luIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLGNBQWMsR0FBRyxzQ0FBdkI7O0FBU08sSUFBTUMsZUFBZSxHQUFHLFNBQWxCQSxlQUFrQixPQUtKO0FBQUEsTUFKekJDLFFBSXlCLFFBSnpCQSxRQUl5QjtBQUFBLE1BSHpCQyxRQUd5QixRQUh6QkEsUUFHeUI7QUFBQSxN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WCxTQUFTLENBQUNZLElBQVYsQ0FBZSxHQUFmLENBQXhCLGVBQXVEVCxJQUF2RCxDQTlCTzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFIOztBQUFBLG9CQUFQZCxPQUFPO0FBQUE7QUFBQTtBQUFBLEtBQWI7O0FBZ0NBLFNBQU87QUFDTDNCLElBQUFBLEtBQUssRUFBTEEsS0FESztBQUVMa0IsSUFBQUEsSUFBSSxFQUFKQSxJQUZLO0FBR0xRLElBQUFBLFFBQVEsRUFBUkEsUUFISztBQUlMQyxJQUFBQSxPQUFPLEVBQVBBO0FBSkssR0FBUDtBQU1ELENBMUhNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZyB9IGZyb20gJ2F4aW9zJztcbmltcG9ydCBzY2hlZHVsZSBmcm9tICdub2RlLXNjaGVkdWxlJztcbmltcG9ydCB7IENHTURhdGFUeXBlLCB0cmFuc2Zvcm0sIHZhbGlkYXRlIH0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IEFQUExJQ0FUSU9OX0lEID0gJ2Q4OTQ0M2QyLTMyN2MtNGE2Zi04OWU1LTQ5NmJiYjAzMTdkYic7XG5cbnR5cGUgRGV4Y29tQXBpQ2xpZW50VHlwZSA9IHtcbiAgdXNlcm5hbWU6IHN0cmluZztcbiAgcGFzc3dvcmQ6IHN0cmluZztcbiAgc2VydmVyOiAnVVMnIHwgJ0VVJztcbiAgY2xpZW50T3B0cz86IEF4aW9zUmVxdWVzdENvbmZpZztcbn07XG5cbmV4cG9ydCBjb25zdCBEZXhjb21BcGlDbGllbnQgPSAoe1xuICB1c2VybmFtZSxcbiAgcGFzc3dvcmQsXG4gIHNlcnZlcixcbiAgY2xpZW50T3B0cyxcbn06IERleGNvbUFwaUNsaWVudFR5cGUpID0+IHtcbiAgY29uc3QgdGFyZ2V0U2VydmVyID1cbiAgICBzZXJ2ZXIgPT09ICdFVScgPyAnc2hhcmVvdXMxLmRleGNvbS5jb20nIDogJ3NoYXJlMi5kZXhjb20uY29tJztcbiAgbGV0IHNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3QgY2xpZW50ID0gYXhpb3MuY3JlYXRlKHtcbiAgICBiYXNlVVJMOiBgaHR0cHM6Ly8ke3RhcmdldFNlcnZlcn0vU2hhcmVXZWJTZXJ2aWNlcy9TZXJ2aWNlc2AsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0sXG4gICAgLi4uY2xpZW50T3B0cyxcbiAgfSk7XG5cbiAgY29uc3QgbG9naW4gPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIGFjY291bnROYW1lOiB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgYXBwbGljYXRpb25JZDogQVBQTElDQVRJT05fSUQsXG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZXMgPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGNsaWVudC5wb3N0KCcvR2VuZXJhbC9BdXRoZW50aWNhdGVQdWJsaXNoZXJBY2NvdW50JywgcGF5bG9hZCksXG4gICAgICAgIGNsaWVudC5wb3N0KCcvR2VuZXJhbC9Mb2dpblB1Ymxpc2hlckFjY291bnRCeU5hbWUnLCBwYXlsb2FkKSxcbiAgICAgIF0pO1xuXG4gICAgICBpZiAocmVzcG9uc2VzLnNvbWUoZSA9PiAhdmFsaWRhdGUoZSkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTG9naW4gZmFpbGVkLicpO1xuICAgICAgfVxuXG4gICAgICBzZXNzaW9uSWQgPSByZXNwb25zZXNbMV0uZGF0YTtcblxuICAgICAgY29uc29sZS5sb2coJ0xvZ2dlZCBpbiBzdWNjZXNzZnVsbHknLCBzZXNzaW9uSWQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGxvZ2luIGluJyk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGxvZ2luQW5kVHJ5ID0gYXN5bmMgPFQ+KGZ1bmM6ICgpID0+IFByb21pc2U8VD4gfCBUKSA9PiB7XG4gICAgbGV0IHJlc3BvbnNlID0gbnVsbDtcblxuICAgIGlmICghc2Vzc2lvbklkKSBhd2FpdCBsb2dpbigpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgZnVuYy5hcHBseShudWxsKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBhd2FpdCBsb2dpbigpO1xuXG4gICAgICByZXNwb25zZSA9IGF3YWl0IGZ1bmMuYXBwbHkobnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9O1xuXG4gIGNvbnN0IHJlYWQgPSBhc3luYyAobWludXRlc0FnbyA9IDE0NDAsIGNvdW50ID0gMjg4KTogUHJvbWlzZTxDR01EYXRhVHlwZVtdPiA9PlxuICAgIGxvZ2luQW5kVHJ5PENHTURhdGFUeXBlW10+KGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICBtaW51dGVzOiBtaW51dGVzQWdvLFxuICAgICAgICBtYXhDb3VudDogY291bnQsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNsaWVudC5wb3N0KFxuICAgICAgICAnL1B1Ymxpc2hlci9SZWFkUHVibGlzaGVyTGF0ZXN0R2x1Y29zZVZhbHVlcycsXG4gICAgICAgIG51bGwsXG4gICAgICAgIHsgcGFyYW1zIH1cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhLm1hcCh0cmFuc2Zvcm0pO1xuICAgIH0pO1xuXG4gIGNvbnN0IHJlYWRMYXN0ID0gYXN5bmMgKCkgPT4gcmVhZCg5OTk5LCAxKTtcblxuICB0eXBlIE9ic2VydmVySW5wdXRUeXBlID0ge1xuICAgIG1heEF0dGVtcHRzPzogbnVtYmVyO1xuICAgIGRlbGF5PzogbnVtYmVyO1xuICAgIGxpc3RlbmVyOiAoZGF0YTogQ0dNRGF0YVR5cGUpID0+IHZvaWQ7XG4gIH07XG4gIGNvbnN0IG9ic2VydmUgPSBhc3luYyAoe1xuICAgIG1heEF0dGVtcHRzID0gNTAsXG4gICAgZGVsYXkgPSAxMDAwLFxuICAgIGxpc3RlbmVyLFxuICB9OiBPYnNlcnZlcklucHV0VHlwZSkgPT4ge1xuICAgIGNvbnN0IFtkYXRhXSA9IGF3YWl0IHJlYWRMYXN0KCk7XG4gICAgY29uc3QgcmF3TWludXRlcyA9IGRhdGEuZGF0ZS5nZXRNaW51dGVzKCk7XG4gICAgY29uc3QgYSA9IFN0cmluZyhyYXdNaW51dGVzKS5wYWRTdGFydCgyLCAnMCcpWzFdO1xuICAgIGNvbnN0IGIgPSBTdHJpbmcocmF3TWludXRlcyArIDUpLnBhZFN0YXJ0KDIsICcwJylbMV07XG4gICAgY29uc3QgcnVuUG9pbnRzID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNSddLnJlZHVjZTxzdHJpbmdbXT4oXG4gICAgICAoYWNjLCBlKSA9PiBbLi4uYWNjLCBlICsgYSwgZSArIGJdLFxuICAgICAgW11cbiAgICApO1xuICAgIGNvbnN0IHByb2MgPSAoKSA9PiB7XG4gICAgICBsZXQgYXR0ZW1wdCA9IDA7XG4gICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKGF0dGVtcHQgPj0gbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxhc3RDZ21EYXRhID0gYXdhaXQgcmVhZCgxLCAxKTtcblxuICAgICAgICBpZiAobGFzdENnbURhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgbGlzdGVuZXIuYXBwbHkobnVsbCwgW2xhc3RDZ21EYXRhWzBdXSk7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgYXR0ZW1wdCArPSAxO1xuICAgICAgfSwgZGVsYXkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gc2NoZWR1bGUuc2NoZWR1bGVKb2IoYCR7cnVuUG9pbnRzLmpvaW4oJywnKX0gKiAqICogKmAsIHByb2MpO1xuICB9O1xuICByZXR1cm4ge1xuICAgIGxvZ2luLFxuICAgIHJlYWQsXG4gICAgcmVhZExhc3QsXG4gICAgb2JzZXJ2ZSxcbiAgfTtcbn07XG4iXX0=
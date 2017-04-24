"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isBrowerSupport = isBrowerSupport;
exports.normalizeSession = normalizeSession;
function isBrowerSupport() {
  var isChrome = !!navigator.userAgent.match(/Chrom(e|ium)/);
  if (!isChrome) {
    return false;
  }
  var chromeVersion = parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);
  if (chromeVersion >= 51) {
    return true;
  }
  return false;
}

function normalizeSession(session) {
  return {
    id: session.id,
    direction: session.direction,
    callStatus: session.callStatus,
    to: session.request.to.uri.user,
    from: session.request.from.uri.user,
    startTime: new Date(session.startTime).getTime(),
    isOnHold: !!session.isOnHold().local,
    isOnMute: !!session.isOnMute,
    isOnRecord: !!session.isOnRecord
  };
}
//# sourceMappingURL=webphoneHelper.js.map

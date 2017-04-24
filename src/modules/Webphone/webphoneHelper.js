export function isBrowerSupport() {
  const isChrome = !!(navigator.userAgent.match(/Chrom(e|ium)/));
  if (!isChrome) {
    return false;
  }
  const chromeVersion =
    parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);
  if (chromeVersion >= 51) {
    return true;
  }
  return false;
}

export function normalizeSession(session) {
  return {
    id: session.id,
    direction: session.direction,
    callStatus: session.callStatus,
    to: session.request.to.uri.user,
    from: session.request.from.uri.user,
    startTime: (new Date(session.startTime)).getTime(),
    isOnHold: !!session.isOnHold().local,
    isOnMute: !!session.isOnMute,
    isOnRecord: !!session.isOnRecord,
  };
}

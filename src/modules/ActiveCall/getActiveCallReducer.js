import { combineReducers } from 'redux';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';

export function getMinimizedReducer(types) {
  return (state = false, { type }) => {
    switch (type) {
      case types.toggleMinimized:
        return !state;
      case types.newSession:
        return false;
      default:
        return state;
    }
  };
}

export function getSessionReducer(types) {
  return (state = null, { type, session }) => {
    switch (type) {
      case types.newSession:
        return {
          id: session.id,
          type: session.type,
          to: session.request.to.uri.user,
          from: session.request.from.uri.user,
          status: session.status
        };
      case types.destroySession:
        return null;
      default:
        return state;
    }
  };
}

export default function getWebphoneReducer(types) {
  return combineReducers({
    status: getModuleStatusReducer(types),
    minimized: getMinimizedReducer(types),
    session: getSessionReducer(types),
  });
}

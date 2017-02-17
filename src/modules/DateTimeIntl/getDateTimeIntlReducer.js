import { combineReducers } from 'redux';
import dateTimeIntlStatus from './dateTimeIntlStatus';

export function getStatusReducer(actionTypes) {
  return (state = dateTimeIntlStatus.pending, { type }) => {
    switch (type) {
      case actionTypes.fetch:
        return dateTimeIntlStatus.fetching;

      case actionTypes.init:
      case actionTypes.fetchSuccess:
      case actionTypes.fetchError:
        return dateTimeIntlStatus.ready;

      case actionTypes.reset:
        return dateTimeIntlStatus.pending;

      default:
        return state;
    }
  };
}

export function getLastErrorReducer(actionTypes) {
  return (state = null, { type, error }) => {
    switch (type) {

      case actionTypes.fetchError:
        return error;

      case actionTypes.reset:
        return null;

      default:
        return state;
    }
  };
}

export default function getDateTimeIntlReducer(actionTypes) {
  return combineReducers({
    status: getStatusReducer(actionTypes),
    lastError: getLastErrorReducer(actionTypes),
  });
}

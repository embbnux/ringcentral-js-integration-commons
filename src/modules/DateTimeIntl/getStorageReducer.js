import { combineReducers } from 'redux';

export function getSettingsReducer(actionTypes) {
  return (state = {}, { type, provider, providerSettings }) => {
    switch (type) {

      case actionTypes.fetchSuccess:
        state[provider.providerName] = providerSettings;
        return state;

      case actionTypes.fetchError:
        delete state[provider.providerName];
        return state;

      case actionTypes.reset:
        return {};

      default:
        return state;
    }
  };
}

export function getValidityReducer(actionTypes) {
  return (state = {}, { type, provider }) => {
    switch (type) {

      case actionTypes.fetch:
        delete state[provider.providerName];
        return state;

      case actionTypes.fetchSuccess:
        state[provider.providerName] = true;
        return state;

      case actionTypes.fetchError:
        state[provider.providerName] = false;
        return state;

      case actionTypes.reset:
        return {};

      default:
        return state;
    }
  };
}

export function getTimestampReducer(actionTypes) {
  return (state = 0, { type, timestamp }) => {
    switch (type) {

      case actionTypes.fetchSuccess:
      case actionTypes.fetchError:
        return timestamp;

      case actionTypes.reset:
        return 0;

      default:
        return state;
    }
  };
}

export default function getStorageReducer(actionTypes) {
  return combineReducers({
    settings: getSettingsReducer(actionTypes),
    validity: getValidityReducer(actionTypes),
    timestamp: getTimestampReducer(actionTypes),
  });
}

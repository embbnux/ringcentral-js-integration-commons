import { combineReducers } from 'redux';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';

import contactsStatus from './contactsStatus';

export function getContactsStatusReducer(types) {
  return (state = contactsStatus.idle, { type }) => {
    switch (type) {
      case types.sync:
        return contactsStatus.syncing;
      case types.syncError:
      case types.syncSuccess:
        return contactsStatus.idle;
      default:
        return state;
    }
  };
}

export function getContactListReducer(types) {
  return (state = [], { type, records }) => {
    switch (type) {
      case types.syncSuccess:
        return records;
      case types.cleanUp:
        return [];
      default:
        return state;
    }
  };
}

export function getSyncTokenReducer(types) {
  return (state = null, { type, syncToken }) => {
    switch (type) {
      case types.syncSuccess:
        return syncToken;
      case types.cleanUp:
        return null;
      default:
        return state;
    }
  };
}

export default function getContactsReducer(types) {
  return combineReducers({
    status: getModuleStatusReducer(types),
    contactsStatus: getContactsStatusReducer(types),
  });
}

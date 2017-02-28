import { combineReducers } from 'redux';
import {
  pushRecordsToMessageData,
} from './messageStoreHelper';

const initialConversationsDataState = {
  conversations: [],
  conversationMap: {},
  messages: [],
};
export function getMessageDataReducer(types) {
  return (state = initialConversationsDataState, { type, records }) => {
    switch (type) {
      case types.syncSuccess:
        if (records.length === 0) {
          return state;
        }
        return pushRecordsToMessageData({
          ...state,
          records
        });
      case types.cleanUp:
        return initialConversationsDataState;
      default:
        return state;
    }
  };
}

export function getUpdatedTimestampReducer(types) {
  return (state = null, { type }) => {
    switch (type) {
      case types.syncSuccess:
        return Date.now();
      case types.resetSuccess:
        return null;
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

export function getSyncTimestampReducer(types) {
  return (state = null, { type, syncTimestamp }) => {
    switch (type) {
      case types.syncSuccess:
        return syncTimestamp;
      case types.resetSuccess:
        return null;
      default:
        return state;
    }
  };
}

export default function getDataReducer(types) {
  return combineReducers({
    data: getMessageDataReducer(types),
    updatedTimestamp: getUpdatedTimestampReducer(types),
    syncToken: getSyncTokenReducer(types),
    syncTimestamp: getSyncTimestampReducer(types),
  });
}

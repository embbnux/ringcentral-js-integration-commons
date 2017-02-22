import { combineReducers } from 'redux';
import { getCacheKey, parseCacheKey, matchResult } from './helpers';

function getMatchRecordReducer(actionTypes) {
  return (state = {}, { type, data, sourceName, expiredKeys }) => {
    switch (type) {
      case actionTypes.matchSuccess: {
        const now = Date.now();
        const entries = {};
        Object.keys(data).forEach((query) => {
          const result = data[query].length ? matchResult.found : matchResult.notFound;
          entries[getCacheKey(sourceName, query)] = {
            result,
            timestamp: now,
          };
        });
        return {
          ...state,
          ...entries,
        };
      }
      case actionTypes.cleanUp:
      case actionTypes.initSuccess:
        if (expiredKeys.length) {
          const newState = {};
          Object.keys(state).forEach((key) => {
            if (expiredKeys.indexOf(key) === -1) {
              newState[key] = state[key];
            }
          });
          return newState;
        }
        return state;
      default:
        return state;
    }
  };
}

function getDataMapReducer(actionTypes) {
  return (state = {}, { type, data, sourceName, expiredKeys }) => {
    switch (type) {
      case actionTypes.matchSuccess: {
        const newState = { ...state };
        Object.keys(data).forEach((query) => {
          newState[query] = (data[query] || []).map(item => ({
            ...item,
            source: sourceName,
          }));
        });
        return newState;
      }
      case actionTypes.cleanUp:
      case actionTypes.initSuccess:
        if (expiredKeys.length) {
          const deleteMap = {};
          expiredKeys.forEach((key) => {
            const [source, query] = parseCacheKey(key);
            if (!deleteMap[query]) deleteMap[query] = {};
            deleteMap[query][source] = true;
          });
          const newState = {};
          Object.keys(state).forEach((query) => {
            const newSet = state[query].filter(item => (
              !(deleteMap[query] && deleteMap[query][item.source])
            ));
            if (newSet.length) {
              newState[query] = newSet;
            }
          });
          return newState;
        }
        return state;
      default:
        return state;
    }
  };
}

export default function getStorageReducer(actionTypes) {
  return combineReducers({
    dataMap: getDataMapReducer(actionTypes),
    matchRecord: getMatchRecordReducer(actionTypes),
  });
}

import { combineReducers } from 'redux';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';

export function getSearchFilterReducer(types) {
  return (state = '', { type, searchfilter }) => {
    switch (type) {
      case types.updateFilter:
        if (searchfilter) {
          return searchfilter;
        }
        return state;
      default:
        return state;
    }
  };
}

export function getSourceFilterReducer(types) {
  return (state = '', { type, sourcefilter }) => {
    switch (type) {
      case types.updateFilter:
        if (sourcefilter) {
          return sourcefilter;
        }
        return state;
      default:
        return state;
    }
  };
}

export default function getContactsReducer(types) {
  return combineReducers({
    status: getModuleStatusReducer(types),
    searchFilter: getSearchFilterReducer(types),
    sourceFilter: getSourceFilterReducer(types),
  });
}

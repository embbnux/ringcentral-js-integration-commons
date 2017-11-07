import { combineReducers } from 'redux';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';

export function getSearchFilterReducer(types) {
  return (state = '', { type, searchFilter }) => {
    switch (type) {
      case types.updateFilter:
        if (searchFilter) {
          return searchFilter;
        }
        return state;
      default:
        return state;
    }
  };
}

export function getSourceFilterReducer(types) {
  return (state = '', { type, sourceFilter }) => {
    switch (type) {
      case types.updateFilter:
        if (sourceFilter) {
          return sourceFilter;
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

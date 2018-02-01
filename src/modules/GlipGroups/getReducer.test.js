import { expect } from 'chai';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';

import getReducer, {
  getDataReducer,
  getPageNumberReducer,
  getSearchFilterReducer,
  getCurrentGroupIdReducer,
  getTimestampReducer,
} from './getReducer';

import actionTypes from './actionTypes';

describe('GlipGroups :: getDataReducer', () => {
  it('getDataReducer should be a function', () => {
    expect(getDataReducer).to.be.a('function');
  });
  it('getDataReducer should return a reducer', () => {
    expect(getDataReducer()).to.be.a('function');
  });
  describe('dataReducer', () => {
    const reducer = getDataReducer(actionTypes);
    it('should have initial state of empty array', () => {
      expect(reducer(undefined, {})).to.deep.equal([]);
    });
  });
});

describe('GlipGroups :: getPageNumberReducer', () => {
  it('getPageNumberReducer should be a function', () => {
    expect(getPageNumberReducer).to.be.a('function');
  });
  it('getPageNumberReducer should return a reducer', () => {
    expect(getPageNumberReducer()).to.be.a('function');
  });
  describe('pageNumberReducer', () => {
    const reducer = getPageNumberReducer(actionTypes);
    it('should have initial state of 1', () => {
      expect(reducer(undefined, {})).to.equal(1);
    });
  });
});


describe('GlipGroups :: getSearchFilterReducer', () => {
  it('getSearchFilterReducer should be a function', () => {
    expect(getSearchFilterReducer).to.be.a('function');
  });
  it('getSearchFilterReducer should return a reducer', () => {
    expect(getSearchFilterReducer()).to.be.a('function');
  });
  describe('searchFilterReducer', () => {
    const reducer = getSearchFilterReducer(actionTypes);
    it('should have initial state of blank string', () => {
      expect(reducer(undefined, {})).to.equal('');
    });
  });
});

describe('GlipGroups :: getCurrentGroupIdReducer', () => {
  it('getCurrentGroupIdReducer should be a function', () => {
    expect(getCurrentGroupIdReducer).to.be.a('function');
  });
  it('getCurrentGroupIdReducer should return a reducer', () => {
    expect(getCurrentGroupIdReducer()).to.be.a('function');
  });
  describe('currentGroupIdFilterReducer', () => {
    const reducer = getCurrentGroupIdReducer(actionTypes);
    it('should have initial state of null', () => {
      expect(reducer(undefined, {})).to.deep.equal(null);
    });
  });
});

describe('GlipGroups :: getTimestampReducer', () => {
  it('getTimestampReducer should be a function', () => {
    expect(getSearchFilterReducer).to.be.a('function');
  });
  it('getTimestampReducer should return a reducer', () => {
    expect(getTimestampReducer()).to.be.a('function');
  });
  describe('timestampReducer', () => {
    const reducer = getTimestampReducer(actionTypes);
    it('should have initial state of null', () => {
      expect(reducer(undefined, {})).to.deep.equal(null);
    });
  });
});

describe('getReducer', () => {
  it('should be a function', () => {
    expect(getReducer).to.be.a('function');
  });
  it('should return a reducer', () => {
    expect(getReducer(actionTypes)).to.be.a('function');
  });
  it('should return a combined reducer', () => {
    const reducer = getReducer(actionTypes);
    const statusReducer = getModuleStatusReducer(actionTypes);
    const searchFilterReducer = getSearchFilterReducer(actionTypes);
    const pageNumberReducer = getPageNumberReducer(actionTypes);
    expect(reducer(undefined, {})).to.deep.equal({
      status: statusReducer(undefined, {}),
      searchFilter: searchFilterReducer(undefined, {}),
      pageNumber: pageNumberReducer(undefined, {}),
    });
  });
});
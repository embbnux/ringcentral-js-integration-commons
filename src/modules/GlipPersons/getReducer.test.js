import { expect } from 'chai';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';

import getReducer, {
  getGlipPersonsStatusReducer,
  getGlipPersonStoreReducer,
} from './getReducer';

import actionTypes from './actionTypes';
import status from './status';

describe('GlipPersons :: getGlipPersonsStatusReducer', () => {
  it('getGlipPersonsStatusReducer should be a function', () => {
    expect(getGlipPersonsStatusReducer).to.be.a('function');
  });
  it('getGlipPersonsStatusReducer should return a reducer', () => {
    expect(getGlipPersonsStatusReducer()).to.be.a('function');
  });
  describe('glipPersonsStatusReducer', () => {
    const reducer = getGlipPersonsStatusReducer(actionTypes);
    it('should have initial state of status.idle', () => {
      expect(reducer(undefined, {})).to.equal(status.idle);
    });
  });
});

describe('GlipPersons :: getGlipPersonStoreReducer', () => {
  it('getGlipPersonStoreReducer should be a function', () => {
    expect(getGlipPersonStoreReducer).to.be.a('function');
  });
  it('getGlipPersonStoreReducer should return a reducer', () => {
    expect(getGlipPersonStoreReducer()).to.be.a('function');
  });
  describe('glipPersonStoreReducer', () => {
    const reducer = getGlipPersonStoreReducer(actionTypes);
    it('should have initial state of empty object', () => {
      expect(reducer(undefined, {})).to.deep.equal({});
    });
  });
});

describe('GlipPersons :: getReducer', () => {
  it('should be a function', () => {
    expect(getReducer).to.be.a('function');
  });
  it('should return a reducer', () => {
    expect(getReducer(actionTypes)).to.be.a('function');
  });
  it('should return a combined reducer', () => {
    const reducer = getReducer(actionTypes);
    const statusReducer = getModuleStatusReducer(actionTypes);
    const glipPersonsStatusReducer = getGlipPersonsStatusReducer(actionTypes);
    expect(reducer(undefined, {})).to.deep.equal({
      status: statusReducer(undefined, {}),
      glipPostsStatus: glipPersonsStatusReducer(undefined, {}),
    });
  });
});

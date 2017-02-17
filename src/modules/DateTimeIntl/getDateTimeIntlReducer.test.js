import { expect } from 'chai';
import getDateTimeIntlReducer, {
  getDateTimeIntlStatusReducer,
  getLastErrorReducer,
} from './getDateTimeIntlReducer';

import dateTimeIntlActionTypes from './dateTimeIntlActionTypes';
import dateTimeIntlStatus from './dateTimeIntlStatus';

describe('DateTimeIntl :: getDateTimeIntlReducer', () => {
  it('getDateTimeIntlStatusReducer should be a function', () => {
    expect(getDateTimeIntlStatusReducer).to.be.a('function');
  });
  it('getDateTimeIntlStatusReducer should return a reducer', () => {
    expect(getDateTimeIntlStatusReducer(dateTimeIntlActionTypes)).to.be.a('function');
  });
  describe('statusReducer', () => {
    const reducer = getDateTimeIntlStatusReducer(dateTimeIntlActionTypes);
    it('should have initial state of idle', () => {
      expect(reducer(undefined, {})).to.equal(dateTimeIntlStatus.idle);
    });
    it('should return original state of actionTypes is not recognized', () => {
      const originalState = {};
      expect(reducer(originalState, { type: 'foo' }))
      .to.equal(originalState);
    });
    it('should return ready status on fetchError/fetchSuccess', () => {
      [
        dateTimeIntlActionTypes.fetchError,
        dateTimeIntlActionTypes.fetchSuccess
      ].forEach((type) => {
        expect(reducer('foo', {
          type,
        })).to.equal(dateTimeIntlStatus.idle);
      });
    });
    it('should return fetching status on fetch', () => {
      [
        dateTimeIntlActionTypes.fetch
      ].forEach((type) => {
        expect(reducer('foo', {
          type,
        })).to.equal(dateTimeIntlStatus.fetching);
      });
    });
  });

  it('getLastErrorReducer should be a function', () => {
    expect(getLastErrorReducer).to.be.a('function');
  });
  it('getLastErrorReducer should return a reducer', () => {
    expect(getLastErrorReducer(dateTimeIntlActionTypes)).to.be.a('function');
  });
  describe('lastErrorReducer', () => {
    const reducer = getLastErrorReducer(dateTimeIntlActionTypes);
    it('should have initial state of null', () => {
      expect(reducer(undefined, {})).to.equal(null);
    });
    it('should return original state of actionTypes is not recognized', () => {
      const originalState = {};
      expect(reducer(originalState, { type: 'foo' }))
      .to.equal(originalState);
    });
    it('should return null status on reset', () => {
      [
        dateTimeIntlActionTypes.reset
      ].forEach((type) => {
        expect(reducer('foo', {
          type,
        })).to.equal(null);
      });
    });
    it('should return error status on fetch error', () => {
      [
        dateTimeIntlActionTypes.fetchError,
      ].forEach((type) => {
        const error = 'error';
        expect(reducer('foo', {
          type,
          error
        })).to.equal(error);
      });
    });
    it('should keep the status on init, fetch, fetchSuccess', () => {
      [
        dateTimeIntlActionTypes.init,
        dateTimeIntlActionTypes.fetchSuccess,
        dateTimeIntlActionTypes.fetch,
      ].forEach((type) => {
        expect(reducer('foo', {
          type,
        })).to.equal('foo');
      });
    });
  });

  it('getDateTimeIntlReducer should be a function', () => {
    expect(getDateTimeIntlReducer).to.be.a('function');
  });
  it('getDateTimeIntlReducer should return a reducer', () => {
    expect(getDateTimeIntlReducer(dateTimeIntlActionTypes)).to.be.a('function');
  });
});

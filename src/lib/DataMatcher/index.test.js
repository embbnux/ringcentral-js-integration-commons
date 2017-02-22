import { expect } from 'chai';
import sinon from 'sinon';
import { createStore } from 'redux';
import DataMatcher from './index';
import getMatcherReducer from './getMatcherReducer';
import getCacheReducer from './getCacheReducer';
import actionTypes from './actionTypesBase';

describe('DataMatcher Unit Test', () => {
  let dataMatcher;
  let store;

  beforeEach(() => {
    dataMatcher = sinon.createStubInstance(DataMatcher);
    store = createStore(getMatcherReducer(actionTypes, {
      cache: getCacheReducer(actionTypes),
    }));
    dataMatcher._store = store;
    dataMatcher._actionTypes = actionTypes;
    [
      '_onStateChange',
      '_shouldInit',
      '_shouldReset',
      '_initModuleStatus',
      '_resetModuleStatus',
      '_readyCheck',
      '_getExpiredKeys',
      'addSearchSource',
      'addQuerySource',
      'triggerMatch',
      'match',
      '_matchSource',
    ].forEach((key) => {
      dataMatcher[key].restore();
    });
  });

  describe('_onStateChange', () => {
    it('triggerMatch should be called once when _shouldInit is true', () => {
      sinon.stub(dataMatcher, '_shouldInit').callsFake(() => true);
      sinon.stub(dataMatcher, '_shouldReset').callsFake(() => false);
      sinon.stub(dataMatcher, 'triggerMatch');
      sinon.stub(dataMatcher, '_initModuleStatus');
      sinon.stub(dataMatcher, '_getExpiredKeys');
      sinon.stub(dataMatcher, '_resetModuleStatus');
      dataMatcher._onStateChange();
      sinon.assert.calledOnce(dataMatcher.triggerMatch);
      sinon.assert.calledOnce(dataMatcher._initModuleStatus);
      sinon.assert.notCalled(dataMatcher._resetModuleStatus);
    });

    it('_resetModuleStatus should be called once when _shouldReset is true', () => {
      sinon.stub(dataMatcher, '_shouldInit').callsFake(() => false);
      sinon.stub(dataMatcher, '_shouldReset').callsFake(() => true);
      sinon.stub(dataMatcher, '_resetModuleStatus');
      sinon.stub(dataMatcher, 'triggerMatch');
      sinon.stub(dataMatcher, '_initModuleStatus');
      dataMatcher._onStateChange();
      sinon.assert.notCalled(dataMatcher.triggerMatch);
      sinon.assert.notCalled(dataMatcher._initModuleStatus);
      sinon.assert.calledOnce(dataMatcher._resetModuleStatus);
    });

    it('triggerMatch and _resetModuleStatus should Not be called', () => {
      sinon.stub(dataMatcher, '_shouldInit').callsFake(() => false);
      sinon.stub(dataMatcher, '_shouldReset').callsFake(() => false);
      sinon.stub(dataMatcher, '_resetModuleStatus');
      sinon.stub(dataMatcher, 'triggerMatch');
      sinon.stub(dataMatcher, '_initModuleStatus');
      dataMatcher._onStateChange();
      sinon.assert.notCalled(dataMatcher._resetModuleStatus);
      sinon.assert.notCalled(dataMatcher._initModuleStatus);
      sinon.assert.notCalled(dataMatcher.triggerMatch);
    });
  });

  describe('_shouldInit', () => {
    describe('when dataMatcher is not ready', () => {
      beforeEach(() => {
        sinon.stub(dataMatcher, 'ready', { get: () => false });
      });

      describe('when _auth is loggedIn', () => {
        beforeEach(() => {
          dataMatcher._auth = {
            loggedIn: true,
          };
        });

        it('Should return true when _storage is ready and _readyCheck return true', () => {
          dataMatcher._storage = {
            ready: true
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(true);
        });

        it('Should return false when _storage is ready and _readyCheck return false', () => {
          dataMatcher._storage = {
            ready: true
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is not ready and _readyCheck return true', () => {
          dataMatcher._storage = {
            ready: false
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is not ready and _readyCheck return false', () => {
          dataMatcher._storage = {
            ready: false
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return true when _storage is undefined and _readyCheck return true', () => {
          dataMatcher._storage = undefined;
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(true);
        });

        it('Should return false when _storage is undefined and _readyCheck return false', () => {
          dataMatcher._storage = undefined;
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });
      });

      describe('when _auth is not loggedIn', () => {
        beforeEach(() => {
          dataMatcher._auth = {
            loggedIn: false,
          };
        });

        it('Should return false when _storage is ready and _readyCheck return true', () => {
          dataMatcher._storage = {
            ready: false
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is ready and _readyCheck return false', () => {
          dataMatcher._storage = {
            ready: true
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is not ready and _readyCheck return true', () => {
          dataMatcher._storage = {
            ready: false
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is not ready and _readyCheck return false', () => {
          dataMatcher._storage = {
            ready: false
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is undefined and _readyCheck return true', () => {
          dataMatcher._storage = undefined;
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is undefined and _readyCheck return false', () => {
          dataMatcher._storage = undefined;
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });
      });
    });

    describe('when dataMatcher is ready', () => {
      beforeEach(() => {
        sinon.stub(dataMatcher, 'ready', { get: () => true });
      });

      describe('when _auth is loggedIn', () => {
        beforeEach(() => {
          dataMatcher._auth = {
            loggedIn: true,
          };
        });

        it('Should return false when _storage is ready and _readyCheck return true', () => {
          dataMatcher._storage = {
            ready: true
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is ready and _readyCheck return false', () => {
          dataMatcher._storage = {
            ready: true
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is not ready and _readyCheck return true', () => {
          dataMatcher._storage = {
            ready: false
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is not ready and _readyCheck return false', () => {
          dataMatcher._storage = {
            ready: false
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is undefined and _readyCheck return true', () => {
          dataMatcher._storage = undefined;
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is undefined and _readyCheck return false', () => {
          dataMatcher._storage = undefined;
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });
      });

      describe('when _auth is not loggedIn', () => {
        beforeEach(() => {
          dataMatcher._auth = {
            loggedIn: false,
          };
        });

        it('Should return false when _storage is ready and _readyCheck return true', () => {
          dataMatcher._storage = {
            ready: false
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is ready and _readyCheck return false', () => {
          dataMatcher._storage = {
            ready: true
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is not ready and _readyCheck return true', () => {
          dataMatcher._storage = {
            ready: false
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is not ready and _readyCheck return false', () => {
          dataMatcher._storage = {
            ready: false
          };
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is undefined and _readyCheck return true', () => {
          dataMatcher._storage = undefined;
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => true);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });

        it('Should return false when _storage is undefined and _readyCheck return false', () => {
          dataMatcher._storage = undefined;
          sinon.stub(dataMatcher, '_readyCheck').callsFake(() => false);
          expect(dataMatcher._shouldInit()).to.equal(false);
        });
      });
    });
  });

  describe('_shouldReset', () => {
    describe('when dataMatcher is ready', () => {
      beforeEach(() => {
        sinon.stub(dataMatcher, 'ready', { get: () => true });
      });

      describe('when _auth is loggedIn', () => {
        beforeEach(() => {
          dataMatcher._auth = {
            loggedIn: true,
          };
        });

        it('Should return true when _storage is not ready', () => {
          dataMatcher._storage = {
            ready: false
          };
          expect(dataMatcher._shouldReset()).to.equal(true);
        });

        it('Should return false when _storage is ready', () => {
          dataMatcher._storage = {
            ready: true
          };
          expect(dataMatcher._shouldReset()).to.equal(false);
        });

        it('Should return false when _storage is undefined', () => {
          dataMatcher._storage = undefined;
          expect(dataMatcher._shouldReset()).to.equal(false);
        });
      });

      describe('when _auth is not loggedIn', () => {
        beforeEach(() => {
          dataMatcher._auth = {
            loggedIn: false,
          };
        });

        it('Should return true when _storage is not ready', () => {
          dataMatcher._storage = {
            ready: false
          };
          expect(dataMatcher._shouldReset()).to.equal(true);
        });

        it('Should return true when _storage is ready', () => {
          dataMatcher._storage = {
            ready: true
          };
          expect(dataMatcher._shouldReset()).to.equal(true);
        });

        it('Should return true when _storage is undefined', () => {
          dataMatcher._storage = undefined;
          expect(dataMatcher._shouldReset()).to.equal(true);
        });
      });
    });

    describe('when dataMatcher is not ready', () => {
      beforeEach(() => {
        sinon.stub(dataMatcher, 'ready', { get: () => false });
      });

      describe('when _auth is loggedIn', () => {
        beforeEach(() => {
          dataMatcher._auth = {
            loggedIn: true,
          };
        });

        it('Should return false when _storage is not ready', () => {
          dataMatcher._storage = {
            ready: false
          };
          expect(dataMatcher._shouldReset()).to.equal(false);
        });

        it('Should return false when _storage is ready', () => {
          dataMatcher._storage = {
            ready: true
          };
          expect(dataMatcher._shouldReset()).to.equal(false);
        });

        it('Should return false when _storage is undefined', () => {
          dataMatcher._storage = undefined;
          expect(dataMatcher._shouldReset()).to.equal(false);
        });
      });

      describe('when _auth is not loggedIn', () => {
        beforeEach(() => {
          dataMatcher._auth = {
            loggedIn: false,
          };
        });

        it('Should return false when _storage is not ready', () => {
          dataMatcher._storage = {
            ready: false
          };
          expect(dataMatcher._shouldReset()).to.equal(false);
        });

        it('Should return false when _storage is ready', () => {
          dataMatcher._storage = {
            ready: true
          };
          expect(dataMatcher._shouldReset()).to.equal(false);
        });

        it('Should return false when _storage is undefined', () => {
          dataMatcher._storage = undefined;
          expect(dataMatcher._shouldReset()).to.equal(false);
        });
      });
    });
  });
});

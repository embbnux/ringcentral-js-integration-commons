import { expect } from 'chai';
import getAuthReducer from './get-auth-reducer';
import authActions from './auth-actions';
import authStatus from './auth-status';
import { prefixActions } from '../../lib/redux-helper';

describe('auth-reducer', () => {
  describe('getAuthReducer', () => {
    it('should be a function', () => {
      expect(getAuthReducer).to.be.a('function');
    });
    it('should return a reducer', () => {
      expect(getAuthReducer()).to.exist;
    });
  });
  describe('reducer', () => {
    const reducer = getAuthReducer();
    it('should be a function', () => {
      expect(reducer).to.be.a('function');
    });
    it('should return a initial state', () => {
      expect(reducer()).to.deep.equal({
        status: authStatus.pending,
        error: null,
        token: null,
      });
    });
    it('should handle init', () => {
      for (const key in authStatus) {
        if (authStatus.hasOwnProperty(key)) {
          expect(reducer({
            status: authStatus.pending,
            error: null,
            token: null,
          }, {
            type: authActions.init,
            status: authStatus[key],
            token: 'test',
          })).to.deep.equal({
            status: authStatus[key],
            error: null,
            token: 'test',
          });
        }
      }
    });
    it('should handle login', () => {
      const initialState = reducer();
      expect(reducer(initialState, {
        type: authActions.login,
      })).to.deep.equal({
        status: authStatus.loggingIn,
        error: null,
        token: null,
      });
    });
    it('should handle loginSuccess', () => {
      const initialState = reducer();
      expect(reducer(initialState, {
        type: authActions.loginSuccess,
        token: 'test',
      })).to.deep.equal({
        status: authStatus.loggedIn,
        error: null,
        token: 'test',
      });
    });
    it('should handle loginError', () => {
      const initialState = reducer();
      const error = new Error('test');
      expect(reducer(initialState, {
        type: authActions.loginError,
        error,
      })).to.deep.equal({
        status: authStatus.notLoggedIn,
        error,
        token: null,
      });
    });
    it('should handle logout', () => {
      const initialState = reducer();
      expect(reducer(initialState, {
        type: authActions.logout,
      })).to.deep.equal({
        status: authStatus.loggingOut,
        error: null,
        token: null,
      });
    });
    it('should handle logoutSuccess', () => {
      const initialState = reducer();
      expect(reducer(initialState, {
        type: authActions.logoutSuccess,
      })).to.deep.equal({
        status: authStatus.notLoggedIn,
        error: null,
        token: null,
      });
    });
    it('should handle logoutError', () => {
      const initialState = reducer();
      const error = new Error('logoutError');
      expect(reducer(initialState, {
        type: authActions.logoutError,
        error,
      })).to.deep.equal({
        status: authStatus.loggedIn,
        error,
        token: null,
      });
    });
    it('should return original state if no action was supplied', () => {
      const initialState = reducer();
      expect(reducer(initialState)).to.equal(initialState);
    });
    it('should return original state if action is not recognized', () => {
      const initialState = reducer();
      expect(reducer(initialState, {
        type: 'unknownAction',
      })).to.equal(initialState);
    });
  });
  describe('prefixed reducer', () => {
    const prefix = 'eagle';
    const roguePrefix = 'rogue';
    const reducer = getAuthReducer('eagle');
    const prefixedActions = prefixActions({ actions: authActions, prefix });
    const rogueActions = prefixActions({ actions: authActions, roguePrefix });
    it('should handle an action with the same prefix', () => {
      const initialState = {
        status: authStatus.loggedIn,
        error: null,
      };
      expect(reducer(initialState, {
        type: prefixedActions.logout,
      })).to.deep.equal({
        status: authStatus.loggingOut,
        error: null,
      });
    });
    it('should ignore actions with the wrong prefix', () => {
      const initialState = {
        status: authStatus.loggedIn,
        error: null,
      };
      expect(reducer(initialState, {
        type: rogueActions.logout,
      })).to.equal(initialState);
    });
  });
});

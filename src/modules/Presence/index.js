import RcModule from '../../lib/RcModule';
import getPresenceReducer from './getPresenceReducer';
import presenceActionTypes from './actionTypes';
import loginStatus from '../Auth/loginStatus';
import moduleStatuses from '../../enums/moduleStatuses';
import dndStatus from './dndStatus';
import presenceStatus from './presenceStatus';
import proxify from '../../lib/proxy/proxify';

const presenceEndPoint = /.*\/presence(\?.*)?/;

const UPDATE_DELAY_TIME = 1000;

export default class Presence extends RcModule {
  constructor({
    auth,
    client,
    subscription,
    actionTypes = presenceActionTypes,
    updateDelayTime = UPDATE_DELAY_TIME,
    ...options
  }) {
    super({
      ...options,
      actionTypes,
    });
    this._auth = auth;
    this._client = client;
    this._subscription = subscription;

    this._reducer = getPresenceReducer(this.actionTypes);
    this._lastMessage = null;

    this._updateDelayTime = updateDelayTime;
    this._delayTimeoutId = null;
    this._lastNotDisturbDndStatus = null;
  }

  _subscriptionHandler = (message) => {
    if (message && presenceEndPoint.test(message.event) && message.body) {
      this.store.dispatch({
        type: this.actionTypes.notification,
        ...message.body,
      });
    }
  }

  initialize() {
    this.store.subscribe(async () => {
      if (
        this._auth.loginStatus === loginStatus.loggedIn &&
        this._subscription.ready &&
        this.status === moduleStatuses.pending
      ) {
        this.store.dispatch({
          type: this.actionTypes.init,
        });
        await this.fetch();
        this._subscription.subscribe('/account/~/extension/~/presence');
        this.store.dispatch({
          type: this.actionTypes.initSuccess,
        });
      } else if (
        (this._auth.loginStatus !== loginStatus.loggedIn ||
          !this._subscription.ready) &&
        this.ready
      ) {
        this.store.dispatch({
          type: this.actionTypes.resetSuccess,
        });
      } else if (
        this.ready &&
        this._subscription.ready &&
        this._subscription.message &&
        this._subscription.message !== this._lastMessage
      ) {
        this._lastMessage = this._subscription.message;
        this._subscriptionHandler(this._lastMessage);
      }
    });
  }
  @proxify
  async _fetch() {
    this.store.dispatch({
      type: this.actionTypes.fetch,
    });
    try {
      const ownerId = this._auth.ownerId;
      const data = await this._client.account().extension().presence().get();
      if (ownerId === this._auth.ownerId) {
        this._rememberLastNotDisturbDndStatus(data.dndStatus);
        this.store.dispatch({
          type: this.actionTypes.fetchSuccess,
          ...data,
        });
      }
      this._promise = null;
    } catch (error) {
      this._promise = null;
      this.store.dispatch({
        type: this.actionTypes.fetchError,
        error,
      });
      throw error;
    }
  }
  @proxify
  async fetch() {
    if (!this._promise) {
      this._promise = this._fetch();
    }
    return this._promise;
  }
  @proxify
  async _update(params) {
    try {
      const ownerId = this._auth.ownerId;
      const platform = this._client.service.platform();
      const response = await platform.put(
        '/account/~/extension/~/presence',
        params
      );
      const data = response.json();
      if (ownerId === this._auth.ownerId) {
        this._rememberLastNotDisturbDndStatus(data.dndStatus);
        this.store.dispatch({
          type: this.actionTypes.updateSuccess,
          ...data,
        });
      }
    } catch (error) {
      this.store.dispatch({
        type: this.actionTypes.updateError,
        error,
      });
      throw error;
    }
  }

  _rememberLastNotDisturbDndStatus(newDndStatus) {
    if (
      newDndStatus === dndStatus.doNotAcceptAnyCalls &&
      this.dndStatus !== dndStatus.doNotAcceptAnyCalls
    ) {
      this._lastNotDisturbDndStatus = this.dndStatus;
    }
  }

  _getUpdateStatusParams(userStatusParams) {
    const params = {
      dndStatus: this.dndStatus,
      userStatus: userStatusParams,
    };
    if (
      params.dndStatus !== dndStatus.takeAllCalls &&
      params.dndStatus !== dndStatus.doNotAcceptDepartmentCalls
    ) {
      params.dndStatus = this._lastNotDisturbDndStatus || dndStatus.takeAllCalls;
    }
    return params;
  }
  async setAvailable() {
    if (this.presenceStatus === presenceStatus.available) {
      return;
    }
    const params = this._getUpdateStatusParams(presenceStatus.available);
    await this._update(params);
  }
  async setBusy() {
    if (
      this.presenceStatus === presenceStatus.busy &&
      this.dndStatus !== dndStatus.doNotAcceptAnyCalls
    ) {
      return;
    }
    const params = this._getUpdateStatusParams(presenceStatus.busy);
    await this._update(params);
  }

  async setDoNotDisturb() {
    if (
      this.presenceStatus === presenceStatus.busy &&
      this.dndStatus === dndStatus.doNotAcceptAnyCalls
    ) {
      return;
    }
    const params = {
      dndStatus: dndStatus.doNotAcceptAnyCalls,
      userStatus: presenceStatus.busy,
    };
    await this._update(params);
  }

  async setInvisible() {
    if (this.presenceStatus === presenceStatus.offline) {
      return;
    }
    const params = this._getUpdateStatusParams(presenceStatus.offline);
    await this._update(params);
  }

  async toggleAcceptCallQueueCalls() {
    const params = {
      userStatus: this.userStatus,
    };
    if (this.dndStatus === dndStatus.takeAllCalls) {
      params.dndStatus = dndStatus.doNotAcceptDepartmentCalls;
    } else if (this.dndStatus === dndStatus.doNotAcceptDepartmentCalls) {
      params.dndStatus = dndStatus.takeAllCalls;
    }
    if (params.dndStatus) {
      await this._update(params);
    }
  }

  get status() {
    return this.state.status;
  }

  get ready() {
    return this.state.status === moduleStatuses.ready;
  }

  get dndStatus() {
    return this.state.dndStatus;
  }

  get userStatus() {
    return this.state.userStatus;
  }

  get message() {
    return this.state.message;
  }

  get presenceStatus() {
    return this.state.presenceStatus;
  }
}

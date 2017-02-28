import RcModule from '../../lib/RcModule';
import moduleStatus from '../../enums/moduleStatus';

import * as messageStoreHelper from './messageStoreHelper';
import actionTypes from './actionTypes';
import getMessageStoreReducer from './getMessageStoreReducer';
import getDataReducer from './getDataReducer';

export function processResponseData(data) {
  const records = data.records.slice();
  return {
    records: records.reverse(),
    syncTimestamp: (new Date(data.syncInfo.syncTime)).getTime(),
    syncToken: data.syncInfo.syncToken,
  };
}

export default class MessageStore extends RcModule {
  constructor({
    alert,
    client,
    auth,
    ttl = 30 * 60 * 1000,
    storage,
    subscription,
    ...options
  }) {
    super({
      ...options,
      actionTypes,
    });
    this._alert = alert;
    this._client = client;
    this._storage = storage;
    this._subscription = subscription;
    this._reducer = getMessageStoreReducer(this.actionTypes);
    this._ttl = ttl;
    this._auth = auth;
    this._promise = null;
    this._lastSubscriptionMessage = null;
    this._storageKey = 'messageStore2';

    this._storage.registerReducer({
      key: this._storageKey,
      reducer: getDataReducer(this.actionTypes),
    });
  }

  initialize() {
    this.store.subscribe(() => this._onStateChange());
  }

  _onStateChange() {
    if (this._shouldInit()) {
      this.store.dispatch({
        type: this.actionTypes.init,
      });
      if (this._shouleCleanCache()) {
        this._cleanUpCache();
      }
      this._initMessageStore();
    } else if (this._shouldReset()) {
      this._resetModuleStatus();
    } else if (
      this.ready
    ) {
      this._subscriptionHandler();
    }
  }

  _shouldInit() {
    return (
      this._storage.ready &&
      this._subscription.ready &&
      this.pending
    );
  }

  _shouldReset() {
    return (
      (
        !this._storage.ready ||
        !this._subscription.ready
      ) &&
      this.ready
    );
  }

  _shouleCleanCache() {
    return (
      this._auth.isFreshLogin ||
      (Date.now() - this.updatedTimestamp) > this._ttl
    );
  }

  _resetModuleStatus() {
    this.store.dispatch({
      type: this.actionTypes.resetSuccess,
    });
  }

  _cleanUpCache() {
    this.store.dispatch({
      type: this.actionTypes.cleanUp,
    });
  }

  async _initMessageStore() {
    await this._syncMessages();
    this._subscription.subscribe('/account/~/extension/~/message-store');
    this.store.dispatch({
      type: this.actionTypes.initSuccess,
    });
  }

  _subscriptionHandler() {
    const accountExtesionEndPoint = /\/message-store$/;
    const message = this._subscription.message;
    if (
      message &&
      message !== this._lastSubscriptionMessage &&
      accountExtesionEndPoint.test(message.event) &&
      message.body &&
      message.body.changes
    ) {
      this._lastSubscriptionMessage = this._subscription.message;
      this._syncMessages();
    }
  }

  async _messageSyncApi(params) {
    const response = await this._client.account()
                             .extension()
                             .messageSync()
                             .list(params);
    return response;
  }

  async _updateMessagesFromSync() {
    this.store.dispatch({
      type: this.actionTypes.sync,
    });
    const oldSyncToken = this.syncToken;
    const params = messageStoreHelper.getMessageSyncParams({ syncToken: oldSyncToken });
    const response = await this._messageSyncApi(params);
    const {
      records,
      syncTimestamp,
      syncToken,
    } = processResponseData(response);
    this.store.dispatch({
      type: this.actionTypes.syncSuccess,
      records,
      syncTimestamp,
      syncToken,
    });
  }

  async _updateConversationFromSync(conversationId) {

  }

  async _syncMessages() {
    await this._sync(async () => {
      await this._updateMessagesFromSync();
    });
  }

  async _sync(syncFunction) {
    if (!this._promise) {
      this._promise = (async () => {
        try {
          await syncFunction();
          this._promise = null;
        } catch (error) {
          this._onSyncError();
          this._promise = null;
          throw error;
        }
      })();
    }
    await this._promise;
  }

  _onSyncError() {
    this.store.dispatch({
      type: this.actionTypes.syncError,
    });
  }

  get cache() {
    return this._storage.getItem(this._storageKey);
  }

  get messages() {
    return this.cache.data.messages;
  }

  get conversations() {
    return this.cache.data.conversations;
  }

  get updatedTimestamp() {
    return this.cache.data.updatedTimestamp;
  }

  get syncTimestamp() {
    return this.cache.data.syncTimestamp;
  }

  get syncToken() {
    return this.cache.syncToken;
  }

  get status() {
    return this.state.status;
  }

  get messageStoreStatus() {
    return this.state.messageStoreStatus;
  }

  get ready() {
    return this.status === moduleStatus.ready;
  }

  get pending() {
    return this.status === moduleStatus.pending;
  }
}

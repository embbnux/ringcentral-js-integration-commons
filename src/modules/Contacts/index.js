import RcModule from '../../lib/RcModule';
import sleep from '../../lib/sleep';
import moduleStatuses from '../../enums/moduleStatuses';
import syncTypes from '../../enums/syncTypes';
import actionTypes from './actionTypes';

import getContactsReducer, {
  getSyncTokenReducer,
  getContactListReducer,
  getSyncTimestampReducer,
} from './getContactsReducer';

const CONTACTS_PER_PAGE = 250;
function getSyncParams(syncToken, pageId) {
  const query = {
    perPage: CONTACTS_PER_PAGE,
  };
  if (syncToken) {
    query.syncToken = syncToken;
    query.syncType = syncTypes.iSync;
  } else {
    query.syncType = syncTypes.fSync;
  }
  if (pageId) {
    query.pageId = pageId;
  }
  return query;
}

export default class Contacts extends RcModule {
  constructor({
    client,
    auth,
    storage,
    ttl = 30 * 60 * 1000,
    ...options,
  }) {
    super({
      ...options,
      actionTypes,
    });
    this._client = client;
    this._storage = storage;
    this._ttl = ttl;
    this._auth = auth;
    this._promise = null;
    this._syncTokenStorageKey = 'contactsSyncToken';
    this._syncTimestampStorageKey = 'contactsSyncTimestamp';
    this._addressBookStorageKey = 'addressBookContactsList';
    this._reducer = getContactsReducer(this.actionTypes);
    this._storage.registerReducer({
      key: this._syncTokenStorageKey,
      reducer: getSyncTokenReducer(this.actionTypes),
    });
    this._storage.registerReducer({
      key: this._syncTimestampStorageKey,
      reducer: getSyncTimestampReducer(this.actionTypes),
    });
    this._storage.registerReducer({
      key: this._addressBookStorageKey,
      reducer: getContactListReducer(this.actionTypes),
    });
  }

  initialize() {
    this.store.subscribe(() => this._onStateChange());
  }

  _onStateChange() {
    if (this._shouldInit()) {
      this.store.dispatch({
        type: this.actionTypes.initSuccess,
      });
    } else if (this._shouldReset()) {
      this._resetModuleStatus();
    }
  }

  _shouldInit() {
    return (
      this._storage.ready &&
      this._auth.loggedIn &&
      this.pending
    );
  }

  _shouldReset() {
    return (
      (
        !this._storage.ready ||
        !this._auth.loggedIn
      ) &&
      this.ready
    );
  }

  _shouleCleanCache() {
    return (
      this._auth.isFreshLogin ||
      (Date.now() - this.syncTimestamp) > this._ttl
    );
  }

  async _initContacts() {
    try {
      await this.sync();
    } catch (e) {
      console.error(e);
    }
    this.store.dispatch({
      type: this.actionTypes.initSuccess,
    });
  }

  _resetModuleStatus() {
    this.store.dispatch({
      type: this.actionTypes.resetSuccess,
    });
  }

  async sync() {
    if (!this._promise) {
      this._promise = (async () => {
        try {
          this.store.dispatch({
            type: this.actionTypes.sync,
          });
          const response = await this._sync(this.syncToken);
          this.store.dispatch({
            type: this.actionTypes.syncSuccess,
            records: response.records,
            syncToken: response.syncInfo.syncToken,
            syncTime: response.syncInfo.syncTime,
          });
          this._promise = null;
        } catch (error) {
          this._onSyncError();
          this._promise = null;
          throw error;
        }
      })();
    }
  }

  _onSyncError() {
    this.store.dispatch({
      type: this.actionTypes.syncError,
    });
  }

  async _sync(syncToken, pageId) {
    const params = getSyncParams(syncToken, pageId);
    const response = await this._syncAddressBookApi(params);
    if (!response.nextPageId) {
      return response;
    }
    await sleep(1000);
    const lastResponse = await this._sync(syncToken, response.nextPageId);
    return {
      ...lastResponse,
      records: response.records.concat(lastResponse.records),
    };
  }

  async _syncAddressBookApi(params) {
    const updateRequest = await this._client.account()
                                            .extension()
                                            .addressBookSync()
                                            .list(params);
    return updateRequest;
  }

  _cleanUp() {
    this.store.dispatch({
      type: this.actionTypes.cleanUp,
    });
  }

  get ready() {
    return this.state.status === moduleStatuses.ready;
  }

  get pending() {
    return this.state.status === moduleStatuses.pending;
  }

  get syncToken() {
    return this._storage.getItem(this._syncTokenStorageKey);
  }

  get personContacts() {
    return this._storage.getItem(this._addressBookStorageKey);
  }

  get syncTimestamp() {
    return this._storage.getItem(this._syncTimestampStorageKey);
  }
}

import RcModule from '../../lib/RcModule';
import extensionInfoStatus from './extensionInfoStatus';
import extensionInfoActionTypes from './extensionInfoActionTypes';
import getExtensionInfoReducer from './getExtensionInfoReducer';

export default class ExtensionInfo extends RcModule {
  constructor({
    auth,
    client,
    storage,
    ttl = 30 * 60 * 1000,
    ...options,
  }) {
    super({
      ...options,
      actionTypes: extensionInfoActionTypes,
    });
    this._auth = auth;
    this._storage = storage;
    this._client = client;
    this._ttl = ttl;
    this._storageKey = 'extensionInfo';
    this._reducer = getExtensionInfoReducer(this.prefix);
    this._promise = null;
  }
  initialize() {
    this.store.subscribe(() => {
      if (
        this._storage.status !== this._storage.storageStatus.pending &&
        this.status === extensionInfoStatus.pending
      ) {
        if (
          this._auth.isFreshLogin ||
          !this._storage.hasItem(this._storageKey) ||
          Date.now() - this.data.timestamp > this._ttl
        ) {
          this.loadExtensionInfo();
        } else {
          this.store.dispatch({
            type: this.actionTypes.init,
          });
        }
      } else if (
        this._storage.status === this._storage.storageStatus.pending &&
        this.status !== extensionInfoStatus.pending
      ) {
        this.store.dispatch({
          type: this.actionTypes.reset,
        });
      }
    });
  }

  get data() {
    return this._storage.getItem(this._storageKey);
  }

  get status() {
    return this.state.status;
  }

  get error() {
    return this.state.error;
  }

  get extensionInfoStatus() {
    return extensionInfoStatus;
  }

  async loadExtensionInfo() {
    if (!this._promise) {
      this._promise = (async () => {
        this.store.dispatch({
          type: this.actionTypes.fetch,
        });
        try {
          this._storage.setItem(this._storageKey, {
            extensionInfo: await this._client.account().extension().get(),
            timestamp: Date.now(),
          });
          this.store.dispatch({
            type: this.actionTypes.fetchSuccess,
          });
          this._promise = null;
        } catch (error) {
          this.store.dispatch({
            type: this.actions.fetchError,
            error,
          });
          this._promise = null;
          throw error;
        }
      })();
    }
    await this._promise;
  }
}

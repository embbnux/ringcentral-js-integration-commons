import RcModule from '../../lib/RcModule';
import moduleStatuses from '../../enums/moduleStatuses';
import * as messageHelper from '../../lib/messageHelper';

import actionTypes from './actionTypes';
import getMessagesReducer from './getMessagesReducer';

export default class Messages extends RcModule {
  constructor({
    messageStore,
    perPage = 20,
    contactMatcher,
    ...options
  }) {
    super({
      ...options,
      actionTypes,
    });
    this._contactMatcher = contactMatcher;
    this._messageStore = messageStore;
    this._perPage = perPage;
    this._reducer = getMessagesReducer(this.actionTypes);
    this.loadNextPageMessages = this.loadNextPageMessages.bind(this);
    this.updateSearchingString = this.updateSearchingString.bind(this);
    this.updateSearchResults = this.updateSearchResults.bind(this);

    this.addSelector('uniqueNumbers',
      () => this._messageStore.conversations,
      (messages) => {
        const output = [];
        const numberMap = {};
        function addIfNotExist(number) {
          if (!numberMap[number]) {
            output.push(number);
            numberMap[number] = true;
          }
        }
        messages.forEach((message) => {
          if (message.from && message.from.phoneNumber) {
            addIfNotExist(message.from.phoneNumber);
          } else if (message.from && message.from.extensionNumber) {
            addIfNotExist(message.from.extensionNumber);
          }
          if (message.to && message.to.length > 0) {
            message.to.forEach((toUser) => {
              if (toUser && toUser.phoneNumber) {
                addIfNotExist(toUser.phoneNumber);
              } else if (toUser && toUser.extensionNumber) {
                addIfNotExist(toUser.extensionNumber);
              }
            });
          }
        });
        return output;
      },
    );

    this.addSelector('allMessages',
      () => this._messageStore.conversations,
      messages => messages.filter(message => messageHelper.messageIsTextMessage(message))
    );

    if (this._contactMatcher) {
      this._contactMatcher.addQuerySource({
        getQueriesFn: this._selectors.uniqueNumbers,
        readyCheckFn: () => (
          this._messageStore.ready
        ),
      });
    }

    this._lastProcessedNumbers = null;
  }

  initialize() {
    this.store.subscribe(() => this._onStateChange());
  }

  _onStateChange() {
    if (this._shouldInit()) {
      this.store.dispatch({
        type: this.actionTypes.init,
      });
      this._initMessages();
      this.store.dispatch({
        type: this.actionTypes.initSuccess,
      });
    } else if (this._shouldReset()) {
      this._resetModuleStatus();
    } else if (this._shouldReload()) {
      this._reloadMessages();
      this._triggerMatch();
    }
  }

  _shouldInit() {
    return (
      this._messageStore.ready &&
      this.pending
    );
  }

  _shouldReset() {
    return (
      (!this._messageStore.ready) &&
      this.ready
    );
  }

  _shouldReload() {
    return (
      this.ready &&
      this.messageStoreUpdatedAt !== this._messageStore.updatedTimestamp
    );
  }

  _initMessages() {
    const messages = this._getCurrnetPageMessages(1);
    this.store.dispatch({
      type: this.actionTypes.resetPage,
    });
    this._updateMessages(messages);
  }

  _resetModuleStatus() {
    this.store.dispatch({
      type: this.actionTypes.resetSuccess,
    });
  }

  _reloadMessages() {
    const page = this.currentPage;
    const allMessages = this.allMessages;
    let bottomIndex = allMessages.length - (this._perPage * page);
    if (bottomIndex < 0) {
      bottomIndex = 0;
    }
    const newMessages = allMessages.slice(bottomIndex, allMessages.length).reverse();
    this._updateMessages(newMessages);
  }

  _updateMessages(messages) {
    this.store.dispatch({
      type: this.actionTypes.updateMessages,
      messagesTimestamp: this._messageStore.updatedTimestamp,
      messages,
    });
  }

  _triggerMatch() {
    const uniqueNumbers = this._selectors.uniqueNumbers();
    if (this._lastProcessedNumbers !== uniqueNumbers) {
      this._lastProcessedNumbers = uniqueNumbers;
      if (this._contactMatcher && this._contactMatcher.ready) {
        this._contactMatcher.triggerMatch();
      }
    }
  }

  _getCurrnetPageMessages(page) {
    const allMessages = this.allMessages;
    const maxIndex = allMessages.length - 1;
    if (maxIndex < 0) {
      return [];
    }
    if (page < 1) {
      page = 1;
    }
    const topIndex = maxIndex - (this._perPage * (page - 1));
    if (topIndex < 0) {
      return [];
    }
    let bottomIndex = (topIndex - this._perPage) + 1;
    if (bottomIndex < 0) {
      bottomIndex = 0;
    }
    return allMessages.slice(bottomIndex, topIndex + 1).reverse();
  }

  loadNextPageMessages() {
    const page = this.currentPage + 1;
    const messages = this._getCurrnetPageMessages(page);
    if (messages.length === 0) {
      return;
    }
    this.store.dispatch({
      type: this.actionTypes.pushMessages,
      messagesTimestamp: this._messageStore.updatedTimestamp,
      messages,
    });
    this.store.dispatch({
      type: this.actionTypes.nextPage,
    });
  }

  updateSearchingString(searchingString) {
    this.store.dispatch({
      type: this.actionTypes.updateSearchingString,
      searchingString,
    });
  }

  updateSearchResults(searchResults) {
    this.store.dispatch({
      type: this.actionTypes.updateSearchResults,
      searchResults,
    });
  }

  get status() {
    return this.state.status;
  }

  get ready() {
    return this.status === moduleStatuses.ready;
  }

  get pending() {
    return this.status === moduleStatuses.pending;
  }

  get messages() {
    return this.state.messages;
  }

  get allMessages() {
    return this._selectors.allMessages();
  }

  get currentPage() {
    return this.state.currentPage;
  }

  get loading() {
    return this.messages.length < this.allMessages.length;
  }

  get lastUpdatedAt() {
    return this.state.lastUpdatedAt;
  }

  get messageStoreUpdatedAt() {
    return this.state.messageStoreUpdatedAt;
  }

  get searchingString() {
    return this.state.searchingString;
  }

  get searchingResults() {
    return this.state.searchingResults;
  }
}

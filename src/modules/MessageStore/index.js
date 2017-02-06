import RcModule from '../../lib/RcModule';
import moduleStatus from '../../enums/moduleStatus';

import { batchPutApi } from '../../lib/batchApiHelper';
import * as messageHelper from '../../lib/messageHelper';

import messageStoreActionTypes from './messageStoreActionTypes';
import getMessageStoreReducer from './getMessageStoreReducer';
import getCacheReducer from './getCacheReducer';

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
      actionTypes: messageStoreActionTypes,
    });
    this._alert = alert;
    this._client = client;
    this._storage = storage;
    this._storageKey = 'messageStore';
    this._subscription = subscription;
    this._reducer = getMessageStoreReducer(this.actionTypes);
    this._cacheReducer = getCacheReducer(this.actionTypes);
    this._ttl = ttl;
    this._auth = auth;
    this._promise = null;
    this.syncConversation = this.syncConversation.bind(this);
    storage.registerReducer({ key: this._storageKey, reducer: this._cacheReducer });
  }

  initialize() {
    this.store.subscribe(() => {
      if (
        this._storage.ready &&
        this._subscription.ready &&
        this.status === moduleStatus.pending
      ) {
        this.store.dispatch({
          type: this.actionTypes.init,
        });
        if (
          this._auth.isFreshLogin ||
          !this.cache ||
          (Date.now() - this.conversationsTimestamp) > this._ttl ||
          (Date.now() - this.messagesTimestamp) > this._ttl
        ) {
          this.store.dispatch({
            type: this.actionTypes.cleanUp,
          });
        }
        this._syncMessages().then(() => {
          this.store.dispatch({
            type: this.actionTypes.initSuccess,
          });
          this._subscription.subscribe('/account/~/extension/~/message-store');
        });
      } else if (
        (this._storage.pending ||
         !this._subscription.ready) &&
        this.status === moduleStatus.ready
      ) {
        this.store.dispatch({
          type: this.actionTypes.resetSuccess,
        });
      } else if (
        this._storage.resetting &&
        this.status !== moduleStatus.pending) {
        this.store.dispatch({
          type: this.actionTypes.resetSuccess,
        });
      } else if (
        this.status === moduleStatus.ready
      ) {
        this._subscriptionHandler();
      }
    });
  }

  _subscriptionHandler() {
    const accountExtesionEndPoint = /\/message-store$/;
    const message = this._subscription.message;
    if (
      message !== null &&
      accountExtesionEndPoint.test(message.event) &&
      message.body &&
      message.body.changes
    ) {
      console.debug('receive a message notification:');
      console.debug(message);
      this._syncMessages();
    }
  }

  findConversationById(id) {
    return this.conversations[id.toString()];
  }

  async _updateConversationFromSync(id) {
    const oldConversation = this.findConversationById(id);
    const syncToken = oldConversation && oldConversation.syncToken;
    let params = null;
    if (syncToken) {
      params = {
        syncToken,
        syncType: 'ISync',
      };
    } else {
      const lastSevenDate = new Date();
      lastSevenDate.setDate(lastSevenDate.getDate() - 7);
      params = {
        conversationId: id,
        syncType: 'FSync',
        dateFrom: lastSevenDate.toISOString(),
      };
    }
    const newConversationRequest = await this._client.account()
                                             .extension()
                                             .messageSync()
                                             .list(params);
    const { conversations, messages }
      = this._getConversationsAndMessagesFromSyncResponse(newConversationRequest);
    this._saveConversationsAndMessages(conversations, messages, null);
  }

  async _updateMessagesFromSync() {
    const syncToken = this.syncToken;
    let params = null;
    if (syncToken) {
      params = {
        syncToken,
        syncType: 'ISync',
      };
    } else {
      const lastSevenDate = new Date();
      lastSevenDate.setDate(lastSevenDate.getDate() - 7);
      params = {
        syncType: 'FSync',
        dateFrom: lastSevenDate.toISOString(),
      };
    }
    const newConversationRequest = await this._client.account()
                                             .extension()
                                             .messageSync()
                                             .list(params);
    const { conversations, messages } =
      this._getConversationsAndMessagesFromSyncResponse(newConversationRequest);
    this._saveConversationsAndMessages(
      conversations,
      messages,
      newConversationRequest.syncInfo.syncToken
    );
  }

  _getConversationsAndMessagesFromSyncResponse(conversationResponse) {
    const records = conversationResponse.records.reverse();
    const syncToken = conversationResponse.syncInfo.syncToken;
    return this._getNewConversationsAndMessagesFromRecords(records, syncToken);
  }

  _getNewConversationsAndMessagesFromRecords(records, syncToken) {
    const conversations = this.conversations;
    let messages = this.messages;
    records.forEach((record) => {
      if (!messageHelper.messaageIsTextMessage(record)) {
        return;
      }
      const conversationId = record.conversation.id;
      let conversation = conversations[conversationId];
      if (!conversation) {
        conversation = { messages: [] };
      }
      const oldMessages = conversation.messages;
      conversation.messages = this._pushMessageToConversationMessages({
        messages: oldMessages,
        message: record,
      });
      if (syncToken) {
        conversation.syncToken = syncToken;
      }
      conversation.id = conversationId;
      conversations[conversationId] = conversation;
      messages = this._pushMessageToMesages({
        messages,
        message: record
      });
    });
    return { conversations, messages };
  }

  _pushOrReplaceOrDeleteMessage({
    messages,
    message,
    isFind,
    replaceMessage,
    pushMessage,
    deleteMessage
  }) {
    const messageLength = messages.length;
    let messageExistIndex = null;
    if (messageLength > 0) {
      for (let index = (messageLength - 1); index >= 0; index -= 1) {
        if (isFind({
          oldMessage: messages[index],
          newMessage: message,
        })) {
          messageExistIndex = index;
          break;
        }
      }
    }
    if (messageExistIndex === null) {
      if (messageHelper.messageIsAcceptable(message)) {
        pushMessage(message);
        return;
      }
    }
    if (messageHelper.messageIsDeleted(message)) {
      deleteMessage(messageExistIndex);
      return;
    }
    replaceMessage({ index: messageExistIndex, newMessage: message });
  }

  _pushMessageToConversationMessages({ messages, message }) {
    const isFind = ({ oldMessage, newMessage }) => (
      oldMessage.id === newMessage.id
    );
    const replaceMessage = ({ index, newMessage }) => {
      messages[index] = newMessage;
    };
    const pushMessage = (newMessage) => {
      messages.push(newMessage);
    };
    const deleteMessage = (index) => {
      messages.splice(index, 1);
    };
    this._pushOrReplaceOrDeleteMessage({
      messages,
      message,
      isFind,
      replaceMessage,
      pushMessage,
      deleteMessage
    });
    return messages;
  }

  _pushMessageToMesages({ messages, message }) {
    const isFind = ({ oldMessage, newMessage }) => (
      oldMessage.id === newMessage.id ||
        oldMessage.conversation.id === newMessage.conversation.id
    );
    const replaceMessage = ({ index, newMessage }) => {
      const oldCreated = new Date(messages[index].creationTime);
      const newCreated = new Date(message.creationTime);
      if (newCreated >= oldCreated) {
        messages.splice(index, 1);
        messages.push(newMessage);
      }
    };
    const pushMessage = (newMessage) => {
      messages.push(newMessage);
    };
    const deleteMessage = (index) => {
      messages.splice(index, 1);
    };

    this._pushOrReplaceOrDeleteMessage({
      messages,
      message,
      isFind,
      replaceMessage,
      pushMessage,
      deleteMessage
    });
    return messages;
  }

  async _sync(syncFunction) {
    if (!this._promise) {
      this._promise = (async () => {
        try {
          this.store.dispatch({
            type: this.actionTypes.sync,
          });
          await syncFunction();
          this.store.dispatch({
            type: this.actionTypes.syncOver,
          });
          this._promise = null;
        } catch (error) {
          this.store.dispatch({
            type: this.actionTypes.syncError,
          });
          this._promise = null;
          throw error;
        }
      })();
    }
    await this._promise;
  }

  async _syncMessages() {
    await this._sync(async () => {
      await this._updateMessagesFromSync();
    });
  }

  async syncConversation(id) {
    await this._sync(async () => {
      await this._updateConversationFromSync(id);
    });
  }

  pushMessage(conversationId, message) {
    const oldConversation = this.findConversationById(conversationId);
    let newConversation = { messages: [] };
    if (oldConversation) {
      newConversation = oldConversation;
    }
    newConversation.id = conversationId;
    newConversation.messages = this._pushMessageToConversationMessages({
      messages: newConversation.messages,
      message,
    });
    const messages = this._pushMessageToMesages({
      messages: this.messages,
      message
    });
    this._saveConversationAndMessages(newConversation, messages);
  }

  _updateConversationsMessagesFromRecords(records) {
    const { conversations, messages } =
      this._getNewConversationsAndMessagesFromRecords(records, null);
    this._saveConversationsAndMessages(conversations, messages, null);
  }

  _saveConversationAndMessages(conversation, messages) {
    this._saveConversation(conversation);

    const unReadMessagesRusult = this._updateMessagesUnreadCounts(messages);
    this._saveUnreadCounts(unReadMessagesRusult.unreadCounts);
    this._saveMessages(unReadMessagesRusult.messages);
  }

  _saveConversationsAndMessages(conversations, messages, syncToken) {
    this._saveConversations(conversations);
    const unReadMessagesRusult = this._updateMessagesUnreadCounts(messages);
    this._saveMessages(unReadMessagesRusult.messages);
    this._saveUnreadCounts(unReadMessagesRusult.unreadCounts);
    if (syncToken) {
      this._saveSyncToken(syncToken);
    }
  }

  _saveConversation(conversation) {
    const conversations = this.conversations;
    const id = conversation.id;
    conversations[id] = conversation;
    this._saveConversations(conversations);
  }

  _saveConversations(conversations) {
    this.store.dispatch({
      type: this.actionTypes.saveConversations,
      data: conversations,
    });
  }

  _saveMessages(messages) {
    this.store.dispatch({
      type: this.actionTypes.saveMessages,
      data: messages,
    });
  }

  _saveSyncToken(syncToken) {
    this.store.dispatch({
      type: this.actionTypes.saveSyncToken,
      syncToken,
    });
  }

  _saveUnreadCounts(unreadCounts) {
    this.store.dispatch({
      type: this.actionTypes.updateUnreadCounts,
      unreadCounts,
    });
  }

  _updateMessagesUnreadCounts(messages) {
    let totalUnreadCounts = 0;
    const conversations = this.conversations;
    for (let index = 0; index < messages.length; index += 1) {
      const message = messages[index];
      const conversation = conversations[message.conversation.id];
      const unReadMessages = messageHelper.filterConversationUnreadMessages(conversation);
      totalUnreadCounts += unReadMessages.length;
      message.isRead = (unReadMessages.length === 0);
    }
    return {
      messages,
      unreadCounts: totalUnreadCounts
    };
  }

  async _updateMessageApi(messageId, status) {
    const body = {
      readStatus: status,
    };
    const updateRequest = await this._client.account()
                                            .extension()
                                            .messageStore(messageId)
                                            .put(body);
    return updateRequest;
  }

  async _updateMessagesApi(messageIds, status) {
    if (messageIds.length === 1) {
      const result = await this._updateMessageApi(messageIds[0], status);
      return [result];
    }
    const UPDATE_MESSAGE_ONCE_COUNT = 20;
    const leftIds = messageIds.slice(0, UPDATE_MESSAGE_ONCE_COUNT);
    const rightIds = messageIds.slice(UPDATE_MESSAGE_ONCE_COUNT);
    const body = leftIds.map(() => (
      { body: { readStatus: status } }
    ));
    const ids = decodeURIComponent(leftIds.join(','));
    const platform = this._client.service.platform();
    const responses = await batchPutApi({
      platform,
      url: `/account/~/extension/~/message-store/${ids}`,
      body,
    });
    const results = [];
    responses.forEach((res) => {
      if (res.response().status === 200) {
        results.push(res.json());
      }
    });
    if (rightIds.length > 0) {
      const rightResults = await this._updateMessagesApi(rightIds, status);
      if (rightResults.length > 0) {
        results.concat(rightResults);
      }
    }
    return results;
  }

  async readMessages(conversation) {
    console.debug(`read messages from conversation ${conversation.id}`);
    const unReadMessages = messageHelper.filterConversationUnreadMessages(conversation);
    if (unReadMessages.length === 0) {
      return null;
    }
    const unreadMessageIds = unReadMessages.map(message => message.id);
    try {
      const updatedMessages = await this._updateMessagesApi(unreadMessageIds, 'Read');
      this._updateConversationsMessagesFromRecords(updatedMessages);
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  matchMessageText(message, searchText) {
    if (message.subject.toLowerCase().indexOf(searchText) >= 0) {
      return message;
    }
    const conversation = this.conversations[message.conversation.id];
    if (!conversation) {
      return null;
    }
    for (const subMessage of conversation.messages) {
      if (subMessage.subject.toLowerCase().indexOf(searchText) >= 0) {
        return message;
      }
    }
    return null;
  }

  updateConversationRecipientList(conversationId, recipients) {
    const conversation = this.findConversationById(conversationId);
    if (!conversation) {
      return;
    }
    conversation.recipients = recipients;
    this._saveConversation(conversation);
    const messages = this.messages;
    const messageIndex = messages.findIndex(message =>
      message.conversation && message.conversation.id === conversationId
    );
    if (messageIndex) {
      const message = messages[messageIndex];
      message.recipients = recipients;
      messages[messageIndex] = message;
      this._saveMessages(messages);
    }
  }

  get cache() {
    return this._storage.getItem(this._storageKey);
  }

  get conversations() {
    const conversations = this.cache.conversations.data;
    if (!conversations) {
      return {};
    }
    return conversations;
  }

  get conversationsTimestamp() {
    return this.cache.conversations.timestamp;
  }

  get messages() {
    const messages = this.cache.messages.data;
    if (!messages) {
      return [];
    }
    return messages;
  }

  get messagesTimestamp() {
    return this.cache.messages.timestamp;
  }

  get syncToken() {
    return this.cache.syncToken;
  }

  get unreadCounts() {
    return this.cache.unreadCounts;
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
}

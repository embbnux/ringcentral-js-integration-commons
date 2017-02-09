import { expect } from 'chai';
import sinon from 'sinon';
import { createStore } from 'redux';
import MessageStore from './index';
import getMessageStoreReducer from './getMessageStoreReducer';
import actionTypes from './messageStoreActionTypes';
import moduleStatus from '../../enums/moduleStatus';

describe('MessageStore Unit Test', () => {
  let messageStore;
  let store;

  beforeEach(() => {
    messageStore = sinon.createStubInstance(MessageStore);
    store = createStore(getMessageStoreReducer(actionTypes));
    messageStore._store = store;
    messageStore._actionTypes = actionTypes;
    [
      '_onStateChange',
      '_shouldInit',
      '_shouldReset',
      '_shouleCleanCache',
      '_initMessageStore',
      '_subscriptionHandler',
      '_resetModuleStatus',
      '_cleanUpCache',
      'findConversationById',
      '_messageSyncApi',
      '_updateConversationFromSync',
      '_updateMessagesFromSync',
      '_getConversationsAndMessagesFromSyncResponse',
      '_sync',
      '_syncMessages',
      'syncConversation',
      '_updateMessageApi',
      'readMessages',
      'matchMessageText',
      'updateConversationRecipientList',
      'pushMessage',
      '_updateConversationsMessagesFromRecords',
      '_saveConversationAndMessages',
      '_saveConversationsAndMessages',
      '_saveConversation',
      '_saveConversations',
      '_saveMessages',
      '_saveSyncToken',
      '_saveUnreadCounts',
    ].forEach((key) => {
      messageStore[key].restore();
    });
  });

  describe('_onStateChange', () => {
    it('_initMessageStore should be called once when _shouldInit is true', () => {
      sinon.stub(messageStore, '_shouldInit').callsFake(() => true);
      sinon.stub(messageStore, '_shouldReset').callsFake(() => false);
      sinon.stub(messageStore, '_shouleCleanCache').callsFake(() => false);
      sinon.stub(messageStore, '_initMessageStore');
      sinon.stub(messageStore, '_subscriptionHandler');
      sinon.stub(messageStore, '_resetModuleStatus');
      sinon.stub(messageStore, '_cleanUpCache');
      messageStore._onStateChange();
      sinon.assert.calledOnce(messageStore._initMessageStore);
      sinon.assert.notCalled(messageStore._resetModuleStatus);
      sinon.assert.notCalled(messageStore._subscriptionHandler);
      sinon.assert.notCalled(messageStore._cleanUpCache);
    });

    it('_cleanUpCache should be called once when _shouldInit and _shouleCleanCache is true', () => {
      sinon.stub(messageStore, '_shouldInit').callsFake(() => true);
      sinon.stub(messageStore, '_shouldReset').callsFake(() => false);
      sinon.stub(messageStore, '_shouleCleanCache').callsFake(() => true);
      sinon.stub(messageStore, '_initMessageStore');
      sinon.stub(messageStore, '_subscriptionHandler');
      sinon.stub(messageStore, '_resetModuleStatus');
      sinon.stub(messageStore, '_cleanUpCache');
      messageStore._onStateChange();
      sinon.assert.calledOnce(messageStore._initMessageStore);
      sinon.assert.calledOnce(messageStore._cleanUpCache);
      sinon.assert.notCalled(messageStore._resetModuleStatus);
      sinon.assert.notCalled(messageStore._subscriptionHandler);
    });

    it('_resetModuleStatus should be called once when _shouldReset is true', () => {
      sinon.stub(messageStore, '_shouldInit').callsFake(() => false);
      sinon.stub(messageStore, '_shouldReset').callsFake(() => true);
      sinon.stub(messageStore, '_shouleCleanCache').callsFake(() => false);
      sinon.stub(messageStore, '_initMessageStore');
      sinon.stub(messageStore, '_subscriptionHandler');
      sinon.stub(messageStore, '_resetModuleStatus');
      sinon.stub(messageStore, '_cleanUpCache');
      messageStore._onStateChange();
      sinon.assert.notCalled(messageStore._initMessageStore);
      sinon.assert.calledOnce(messageStore._resetModuleStatus);
      sinon.assert.notCalled(messageStore._subscriptionHandler);
      sinon.assert.notCalled(messageStore._cleanUpCache);
    });

    it('_subscriptionHandler should be called once when messageStore is ready', () => {
      sinon.stub(messageStore, '_shouldInit').callsFake(() => false);
      sinon.stub(messageStore, '_shouldReset').callsFake(() => false);
      sinon.stub(messageStore, '_shouleCleanCache').callsFake(() => false);
      sinon.stub(messageStore, '_initMessageStore');
      sinon.stub(messageStore, '_subscriptionHandler');
      sinon.stub(messageStore, '_resetModuleStatus');
      sinon.stub(messageStore, '_cleanUpCache');
      sinon.stub(messageStore, 'ready', { get: () => true });
      messageStore._onStateChange();
      sinon.assert.notCalled(messageStore._initMessageStore);
      sinon.assert.notCalled(messageStore._resetModuleStatus);
      sinon.assert.notCalled(messageStore._cleanUpCache);
      sinon.assert.calledOnce(messageStore._subscriptionHandler);
    });
  });

  describe('_shouldInit', () => {
    it('Should return true when messageStore is pending with _storage and _subscription all ready', () => {
      messageStore._storage = {
        ready: true
      };
      messageStore._subscription = {
        ready: true
      };
      sinon.stub(messageStore, 'pending', { get: () => true });
      expect(messageStore._shouldInit()).to.equal(true);
    });

    it('Should return false when messageStore is pending with _storage and _subscription all not ready', () => {
      messageStore._storage = {
        ready: false
      };
      messageStore._subscription = {
        ready: false
      };
      sinon.stub(messageStore, 'pending', { get: () => true });
      expect(messageStore._shouldInit()).to.equal(false);
    });

    it('Should return false when messageStore is pending and _storage is not ready', () => {
      messageStore._storage = {
        ready: false
      };
      messageStore._subscription = {
        ready: true
      };
      sinon.stub(messageStore, 'pending', { get: () => true });
      expect(messageStore._shouldInit()).to.equal(false);
    });

    it('Should return false when messageStore is pending and _subscription is not ready', () => {
      messageStore._storage = {
        ready: true
      };
      messageStore._subscription = {
        ready: false
      };
      sinon.stub(messageStore, 'pending', { get: () => true });
      expect(messageStore._shouldInit()).to.equal(false);
    });

    it('Should return false when messageStore is ready with _storage and _subscription all ready', () => {
      messageStore._storage = {
        ready: true
      };
      messageStore._subscription = {
        ready: true
      };
      sinon.stub(messageStore, 'pending', { get: () => false });
      expect(messageStore._shouldInit()).to.equal(false);
    });
  });

  describe('_shouldReset', () => {
    it('should return true when messageStore is ready with _storage and _subscription is all not ready', () => {
      messageStore._storage = {
        ready: false
      };
      messageStore._subscription = {
        ready: false
      };
      sinon.stub(messageStore, 'ready', { get: () => true });
      expect(messageStore._shouldReset()).to.equal(true);
    });

    it('should return true when messageStore and _storage is ready with _subscription is all not ready', () => {
      messageStore._storage = {
        ready: true
      };
      messageStore._subscription = {
        ready: false
      };
      sinon.stub(messageStore, 'ready', { get: () => true });
      expect(messageStore._shouldReset()).to.equal(true);
    });

    it('should return true when messageStore and _subscription is ready with _storage is all not ready', () => {
      messageStore._storage = {
        ready: false
      };
      messageStore._subscription = {
        ready: true
      };
      sinon.stub(messageStore, 'ready', { get: () => true });
      expect(messageStore._shouldReset()).to.equal(true);
    });

    it('should return false when messageStore, _subscription and _storage is all ready', () => {
      messageStore._storage = {
        ready: true
      };
      messageStore._subscription = {
        ready: true
      };
      sinon.stub(messageStore, 'ready', { get: () => true });
      expect(messageStore._shouldReset()).to.equal(false);
    });

    it('should return false when messageStore, _subscription and _storage is all not ready', () => {
      messageStore._storage = {
        ready: false
      };
      messageStore._subscription = {
        ready: false
      };
      sinon.stub(messageStore, 'ready', { get: () => false });
      expect(messageStore._shouldReset()).to.equal(false);
    });

    it('should return false when messageStore is not ready with _subscription and _storage all ready', () => {
      messageStore._storage = {
        ready: true
      };
      messageStore._subscription = {
        ready: true
      };
      sinon.stub(messageStore, 'ready', { get: () => false });
      expect(messageStore._shouldReset()).to.equal(false);
    });

    it('should return false when messageStore and _storage is not ready with _subscription ready', () => {
      messageStore._storage = {
        ready: false
      };
      messageStore._subscription = {
        ready: true
      };
      sinon.stub(messageStore, 'ready', { get: () => false });
      expect(messageStore._shouldReset()).to.equal(false);
    });

    it('should return false when messageStore and _subscription is not ready with _storage all ready', () => {
      messageStore._storage = {
        ready: true
      };
      messageStore._subscription = {
        ready: false
      };
      sinon.stub(messageStore, 'ready', { get: () => false });
      expect(messageStore._shouldReset()).to.equal(false);
    });
  });

  describe('_shouleCleanCache', () => {
    it('should return true when auth is freshLogin with conversationsTimestamp and messagesTimestamp Date.now()', () => {
      messageStore._auth = {
        isFreshLogin: true
      };
      sinon.stub(messageStore, 'conversationsTimestamp', { get: () => Date.now() });
      sinon.stub(messageStore, 'messagesTimestamp', { get: () => Date.now() });
      messageStore._ttl = 30 * 60 * 1000;
      expect(messageStore._shouleCleanCache()).to.equal(true);
    });

    it('should return true when auth is freshLogin with conversationsTimestamp and messagesTimestamp is expired', () => {
      messageStore._auth = {
        isFreshLogin: true
      };
      sinon.stub(messageStore, 'conversationsTimestamp', { get: () => 0 });
      sinon.stub(messageStore, 'messagesTimestamp', { get: () => 0 });
      messageStore._ttl = 30 * 60 * 1000;
      expect(messageStore._shouleCleanCache()).to.equal(true);
    });

    it('should return true when auth is not freshLogin with conversationsTimestamp expired and messagesTimestamp not expired', () => {
      messageStore._auth = {
        isFreshLogin: false
      };
      sinon.stub(messageStore, 'conversationsTimestamp', { get: () => 0 });
      sinon.stub(messageStore, 'messagesTimestamp', { get: () => Date.now() });
      messageStore._ttl = 30 * 60 * 1000;
      expect(messageStore._shouleCleanCache()).to.equal(true);
    });

    it('should return true when auth is not freshLogin with messagesTimestamp expired and conversationsTimestamp not expired', () => {
      messageStore._auth = {
        isFreshLogin: false
      };
      sinon.stub(messageStore, 'conversationsTimestamp', { get: () => Date.now() });
      sinon.stub(messageStore, 'messagesTimestamp', { get: () => 0 });
      messageStore._ttl = 30 * 60 * 1000;
      expect(messageStore._shouleCleanCache()).to.equal(true);
    });

    it('should return false when auth is not freshLogin with messagesTimestamp and conversationsTimestamp not expired', () => {
      messageStore._auth = {
        isFreshLogin: false
      };
      sinon.stub(messageStore, 'conversationsTimestamp', { get: () => Date.now() });
      sinon.stub(messageStore, 'messagesTimestamp', { get: () => Date.now() });
      messageStore._ttl = 30 * 60 * 1000;
      expect(messageStore._shouleCleanCache()).to.equal(false);
    });
  });

  describe('_initMessageStore', () => {
    it('should set status to be ready and call _syncMessages after call _initMessageStore', async () => {
      sinon.stub(messageStore, '_syncMessages');
      messageStore._subscription = {
        subscribe: () => null,
      };
      await messageStore._initMessageStore();
      sinon.assert.calledOnce(messageStore._syncMessages);
      expect(store.getState().status).to.equal(moduleStatus.ready);
    });
  });

  describe('_subscriptionHandler', () => {
    it('should call _syncMessages when subscription message is message store event', () => {
      sinon.stub(messageStore, '_syncMessages');
      messageStore._subscription = {
        message: {
          event: '/restapi/v1.0/account/~/extension/~/message-store',
          body: {
            changes: []
          }
        },
      };
      messageStore._subscriptionHandler();
      sinon.assert.calledOnce(messageStore._syncMessages);
    });

    it('should not call _syncMessages when subscription message is null', () => {
      sinon.stub(messageStore, '_syncMessages');
      messageStore._subscription = {
        message: null,
      };
      messageStore._subscriptionHandler();
      sinon.assert.notCalled(messageStore._syncMessages);
    });

    it('should not call _syncMessages when subscription message is not message store event', () => {
      sinon.stub(messageStore, '_syncMessages');
      messageStore._subscription = {
        message: {
          event: '/restapi/v1.0/account/~/presence',
          body: {
            changes: []
          }
        },
      };
      messageStore._subscriptionHandler();
      sinon.assert.notCalled(messageStore._syncMessages);
    });

    it('should not call _syncMessages when subscription message is message store event but empty body', () => {
      sinon.stub(messageStore, '_syncMessages');
      messageStore._subscription = {
        message: {
          event: '/restapi/v1.0/account/~/extension/~/message-store',
          body: null,
        },
      };
      messageStore._subscriptionHandler();
      sinon.assert.notCalled(messageStore._syncMessages);
    });

    it('should not call _syncMessages when subscription message is message store event but empty changes', () => {
      sinon.stub(messageStore, '_syncMessages');
      messageStore._subscription = {
        message: {
          event: '/restapi/v1.0/account/~/extension/~/message-store',
          body: {
            changes: null,
          },
        },
      };
      messageStore._subscriptionHandler();
      sinon.assert.notCalled(messageStore._syncMessages);
    });
  });

  describe('findConversationById', () => {
    it('should return conversation successfully when integer id is exist', () => {
      sinon.stub(messageStore, 'conversations', {
        get: () => ({
          '123456': { id: '123456' }
        }),
      });
      const result = messageStore.findConversationById(123456);
      expect(result).to.deep.equal({ id: '123456' });
    });

    it('should return conversation successfully when string id is exist', () => {
      sinon.stub(messageStore, 'conversations', {
        get: () => ({
          '123456': { id: '123456' }
        }),
      });
      const result = messageStore.findConversationById('123456');
      expect(result).to.deep.equal({ id: '123456' });
    });

    it('should return undefined when string id is not exist', () => {
      sinon.stub(messageStore, 'conversations', {
        get: () => ({
          '123456': { id: '123456' }
        }),
      });
      const result = messageStore.findConversationById('1234567');
      expect(result).to.equal(undefined);
    });
  });

  describe('_updateConversationFromSync', () => {
    it('should return call _saveConversationsAndMessages successfully', async () => {
      sinon.stub(messageStore, 'findConversationById').callsFake(
        id => ({ id, syncToken: 'abcd' })
      );
      sinon.stub(messageStore, '_messageSyncApi').callsFake(
        () => ({ syncInfo: { syncToken: 'abcd' } })
      );
      sinon.stub(messageStore, '_getConversationsAndMessagesFromSyncResponse').callsFake(
        () => ({ conversations: { a: 1 }, messages: [1] })
      );
      sinon.stub(messageStore, '_saveConversationsAndMessages');
      await messageStore._updateConversationFromSync('123456');
      sinon.assert.calledWith(messageStore._saveConversationsAndMessages, { a: 1 }, [1], null);
    });
  });

  describe('_updateMessagesFromSync', () => {
    it('should return call _saveConversationsAndMessages successfully', async () => {
      sinon.stub(messageStore, 'syncToken', {
        get: () => 'aabbccdd',
      });
      sinon.stub(messageStore, '_messageSyncApi').callsFake(
        () => ({ syncInfo: { syncToken: 'abcd' } })
      );
      sinon.stub(messageStore, '_getConversationsAndMessagesFromSyncResponse').callsFake(
        () => ({ conversations: { a: 1 }, messages: [1] })
      );
      sinon.stub(messageStore, '_saveConversationsAndMessages');
      await messageStore._updateMessagesFromSync('123456');
      sinon.assert.calledWith(messageStore._saveConversationsAndMessages, { a: 1 }, [1], 'abcd');
    });
  });

  describe('_getConversationsAndMessagesFromSyncResponse', () => {
    it('should return result correctly', () => {
      const conversationResponse = {
        records: [
          {
            id: '1234568',
            conversation: {
              id: '1234567891'
            },
            type: 'SMS',
            subject: 'test1',
            availability: 'Alive',
            readStatus: 'Unread',
            creationTime: '2017-02-03T09:55:49.000Z',
            to: [{
              phoneNumber: '+1234567890',
            }],
            from: { phoneNumber: '+1234567891' },
          },
        ],
        syncInfo: { syncToken: 'abcd' }
      };
      sinon.stub(messageStore, 'conversations', {
        get: () => ({}),
      });
      sinon.stub(messageStore, 'messages', {
        get: () => [],
      });
      const expectMessage = { ...(conversationResponse.records[0]) };
      const expectMessages = [expectMessage];
      const expectConversations = {};
      expectConversations['1234567891'] = {
        id: '1234567891',
        messages: [
          { ...expectMessage }
        ],
        syncToken: 'abcd'
      };
      const result =
        messageStore._getConversationsAndMessagesFromSyncResponse(conversationResponse);
      expect(result).to.deep.equal({
        conversations: expectConversations,
        messages: expectMessages,
      });
    });
  });
});

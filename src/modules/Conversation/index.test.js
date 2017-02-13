import { expect } from 'chai';
import sinon from 'sinon';
import { createStore } from 'redux';
import Conversation from './index';
import getConversationReducer from './getConversationReducer';
import actionTypes from './conversationActionTypes';

describe('Conversation Unit Test', () => {
  let conversation;
  let store;

  beforeEach(() => {
    conversation = sinon.createStubInstance(Conversation);
    store = createStore(getConversationReducer(actionTypes));
    conversation._store = store;
    conversation._actionTypes = actionTypes;
    [
      '_onStateChange',
      '_shouldInit',
      '_shouldReset',
      '_shouldReloadConversation',
      '_initModuleStatus',
      '_resetModuleStatus',
      'loadConversationById',
      'unloadConversation',
      'changeDefaultRecipient',
      '_loadConversation',
      '_getCurrentSenderNumber',
      '_getRecipients',
      '_getReplyOnMessageId',
      '_getFromNumber',
      '_getToNumbers',
      'replyToReceivers',
    ].forEach((key) => {
      conversation[key].restore();
    });
  });

  describe('_onStateChange', () => {
    it('_initModuleStatus should be called once when _shouldInit is true', () => {
      sinon.stub(conversation, '_shouldInit').callsFake(() => true);
      sinon.stub(conversation, '_shouldReset').callsFake(() => false);
      sinon.stub(conversation, '_shouldReloadConversation').callsFake(() => false);
      sinon.stub(conversation, '_initModuleStatus');
      sinon.stub(conversation, '_resetModuleStatus');
      sinon.stub(conversation, '_loadConversation');
      conversation._onStateChange();
      sinon.assert.calledOnce(conversation._initModuleStatus);
      sinon.assert.notCalled(conversation._resetModuleStatus);
      sinon.assert.notCalled(conversation._loadConversation);
    });

    it('_resetModuleStatus should be called once when _shouldReset is true', () => {
      sinon.stub(conversation, '_shouldInit').callsFake(() => false);
      sinon.stub(conversation, '_shouldReset').callsFake(() => true);
      sinon.stub(conversation, '_shouldReloadConversation').callsFake(() => false);
      sinon.stub(conversation, '_initModuleStatus');
      sinon.stub(conversation, '_resetModuleStatus');
      sinon.stub(conversation, '_loadConversation');
      conversation._onStateChange();
      sinon.assert.notCalled(conversation._initModuleStatus);
      sinon.assert.calledOnce(conversation._resetModuleStatus);
      sinon.assert.notCalled(conversation._loadConversation);
    });

    it('_loadConversation should be called once when _shouldReloadConversation is true', () => {
      sinon.stub(conversation, '_shouldInit').callsFake(() => false);
      sinon.stub(conversation, '_shouldReset').callsFake(() => false);
      sinon.stub(conversation, '_shouldReloadConversation').callsFake(() => true);
      sinon.stub(conversation, '_initModuleStatus');
      sinon.stub(conversation, '_resetModuleStatus');
      sinon.stub(conversation, '_loadConversation');
      sinon.stub(conversation, 'conversation', { get: () => ({ id: '123' }) });
      conversation._messageStore = {
        findConversationById: id => ({ id }),
        readMessages: () => null,
      };
      conversation._onStateChange();
      sinon.assert.notCalled(conversation._initModuleStatus);
      sinon.assert.notCalled(conversation._resetModuleStatus);
      sinon.assert.calledOnce(conversation._loadConversation);
    });

    it('_loadConversation should not be called once when _shouldReloadConversation is true and newConversation is null', () => {
      sinon.stub(conversation, '_shouldInit').callsFake(() => false);
      sinon.stub(conversation, '_shouldReset').callsFake(() => false);
      sinon.stub(conversation, '_shouldReloadConversation').callsFake(() => true);
      sinon.stub(conversation, '_initModuleStatus');
      sinon.stub(conversation, '_resetModuleStatus');
      sinon.stub(conversation, '_loadConversation');
      sinon.stub(conversation, 'conversation', { get: () => ({ id: '123' }) });
      conversation._messageStore = {
        findConversationById: id => null,
        readMessages: () => null,
      };
      conversation._onStateChange();
      sinon.assert.notCalled(conversation._initModuleStatus);
      sinon.assert.notCalled(conversation._resetModuleStatus);
      sinon.assert.notCalled(conversation._loadConversation);
    });
  });

  describe('_shouldInit', () => {
    it('Should return true when conversation is not ready with _messageStore, _extensionInfo and _messageSender all ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldInit()).to.equal(true);
    });

    it('Should return false when conversation and _messageSender is not ready with _messageStore and _extensionInfo all ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when conversation and _extensionInfo is not ready with _messageStore and _messageSender all ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when conversation and _messageStore is not ready with _extensionInfo and _messageSender all ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when conversation, _extensionInfo and _messageStore is not ready with _messageSender ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when conversation, _messageSender and _messageStore is not ready with _extensionInfo ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when conversation, _messageSender and _extensionInfo is not ready with _messageStore ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when conversation, _messageSender, _messageStore and _extensionInfo is all not ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when conversation is ready with _messageStore, _extensionInfo and _messageSender all not ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when _messageSender is not ready with conversation, _messageStore and _extensionInfo all ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when _extensionInfo is not ready with conversation, _messageStore and _messageSender all ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when _messageStore is not ready with conversation, _extensionInfo and _messageSender all ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when _extensionInfo and _messageStore is not ready with conversation and _messageSender ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when _messageSender and _messageStore is not ready with conversation and _extensionInfo ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when _messageSender and _extensionInfo is not ready with conversation and _messageStore ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldInit()).to.equal(false);
    });

    it('Should return false when conversation, _messageSender, _messageStore and _extensionInfo is ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldInit()).to.equal(false);
    });
  });

  describe('_shouldReset', () => {
    it('Should return false when conversation is not ready with _messageStore, _extensionInfo and _messageSender all ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldReset()).to.equal(false);
    });

    it('Should return false when conversation and _messageSender is not ready with _messageStore and _extensionInfo all ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldReset()).to.equal(false);
    });

    it('Should return false when conversation and _extensionInfo is not ready with _messageStore and _messageSender all ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldReset()).to.equal(false);
    });

    it('Should return false when conversation and _messageStore is not ready with _extensionInfo and _messageSender all ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldReset()).to.equal(false);
    });

    it('Should return false when conversation, _extensionInfo and _messageStore is not ready with _messageSender ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldReset()).to.equal(false);
    });

    it('Should return false when conversation, _messageSender and _messageStore is not ready with _extensionInfo ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldReset()).to.equal(false);
    });

    it('Should return false when conversation, _messageSender and _extensionInfo is not ready with _messageStore ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldReset()).to.equal(false);
    });

    it('Should return false when conversation, _messageSender, _messageStore and _extensionInfo is all not ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      expect(conversation._shouldReset()).to.equal(false);
    });

    it('Should return true when conversation is ready with _messageStore, _extensionInfo and _messageSender all not ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldReset()).to.equal(true);
    });

    it('Should return true when _messageSender is not ready with conversation, _messageStore and _extensionInfo all ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldReset()).to.equal(true);
    });

    it('Should return true when _extensionInfo is not ready with conversation, _messageStore and _messageSender all ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldReset()).to.equal(true);
    });

    it('Should return true when _messageStore is not ready with conversation, _extensionInfo and _messageSender all ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldReset()).to.equal(true);
    });

    it('Should return true when _extensionInfo and _messageStore is not ready with conversation and _messageSender ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldReset()).to.equal(true);
    });

    it('Should return true when _messageSender and _messageStore is not ready with conversation and _extensionInfo ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: false
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldReset()).to.equal(true);
    });

    it('Should return true when _messageSender and _extensionInfo is not ready with conversation and _messageStore ready', () => {
      conversation._messageSender = {
        ready: false
      };
      conversation._extensionInfo = {
        ready: false
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldReset()).to.equal(true);
    });

    it('Should return false when conversation, _messageSender, _messageStore and _extensionInfo is ready', () => {
      conversation._messageSender = {
        ready: true
      };
      conversation._extensionInfo = {
        ready: true
      };
      conversation._messageStore = {
        ready: true
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      expect(conversation._shouldReset()).to.equal(false);
    });
  });

  describe('_shouldReloadConversation', () => {
    it('Should return true when conversation is ready and conversation is not null and messageStoreUpdatedAt not same as messageStore.conversationsTimestamp', () => {
      conversation._messageStore = {
        conversationsTimestamp: 12345678
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      sinon.stub(conversation, 'conversation', { get: () => ({}) });
      sinon.stub(conversation, 'messageStoreUpdatedAt', { get: () => null });
      expect(conversation._shouldReloadConversation()).to.equal(true);
    });

    it('Should return false when conversation is ready and conversation is null and messageStoreUpdatedAt not same as messageStore.conversationsTimestamp', () => {
      conversation._messageStore = {
        conversationsTimestamp: 12345678
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      sinon.stub(conversation, 'conversation', { get: () => null });
      sinon.stub(conversation, 'messageStoreUpdatedAt', { get: () => null });
      expect(conversation._shouldReloadConversation()).to.equal(false);
    });

    it('Should return false when conversation is ready and conversation is null and messageStoreUpdatedAt same as messageStore.conversationsTimestamp', () => {
      conversation._messageStore = {
        conversationsTimestamp: 12345678
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      sinon.stub(conversation, 'conversation', { get: () => null });
      sinon.stub(conversation, 'messageStoreUpdatedAt', { get: () => 12345678 });
      expect(conversation._shouldReloadConversation()).to.equal(false);
    });

    it('Should return false when conversation is ready and conversation is not null and messageStoreUpdatedAt same as messageStore.conversationsTimestamp', () => {
      conversation._messageStore = {
        conversationsTimestamp: 12345678
      };
      sinon.stub(conversation, 'ready', { get: () => true });
      sinon.stub(conversation, 'conversation', { get: () => ({}) });
      sinon.stub(conversation, 'messageStoreUpdatedAt', { get: () => 12345678 });
      expect(conversation._shouldReloadConversation()).to.equal(false);
    });

    it('Should return false when conversation is not ready and conversation is not null and messageStoreUpdatedAt not same as messageStore.conversationsTimestamp', () => {
      conversation._messageStore = {
        conversationsTimestamp: 12345678
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      sinon.stub(conversation, 'conversation', { get: () => ({}) });
      sinon.stub(conversation, 'messageStoreUpdatedAt', { get: () => null });
      expect(conversation._shouldReloadConversation()).to.equal(false);
    });

    it('Should return false when conversation is not ready and conversation is null and messageStoreUpdatedAt not same as messageStore.conversationsTimestamp', () => {
      conversation._messageStore = {
        conversationsTimestamp: 12345678
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      sinon.stub(conversation, 'conversation', { get: () => null });
      sinon.stub(conversation, 'messageStoreUpdatedAt', { get: () => null });
      expect(conversation._shouldReloadConversation()).to.equal(false);
    });

    it('Should return false when conversation is not ready and conversation is null and messageStoreUpdatedAt same as messageStore.conversationsTimestamp', () => {
      conversation._messageStore = {
        conversationsTimestamp: 12345678
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      sinon.stub(conversation, 'conversation', { get: () => null });
      sinon.stub(conversation, 'messageStoreUpdatedAt', { get: () => 12345678 });
      expect(conversation._shouldReloadConversation()).to.equal(false);
    });

    it('Should return true when conversation is not ready and conversation is not null and messageStoreUpdatedAt same as messageStore.conversationsTimestamp', () => {
      conversation._messageStore = {
        conversationsTimestamp: 12345678
      };
      sinon.stub(conversation, 'ready', { get: () => false });
      sinon.stub(conversation, 'conversation', { get: () => ({}) });
      sinon.stub(conversation, 'messageStoreUpdatedAt', { get: () => 12345678 });
      expect(conversation._shouldReloadConversation()).to.equal(false);
    });
  });

  describe('loadConversationById', () => {
    it('should call _loadConversation once when find conversation from _messageStore', () => {
      conversation._messageStore = {
        findConversationById: id => ({ id }),
        readMessages: () => null,
      };
      sinon.stub(conversation, '_loadConversation');
      conversation.loadConversationById(1);
      sinon.assert.calledOnce(conversation._loadConversation);
    });

    it('should not call _loadConversation when cannot find conversation from _messageStore', () => {
      conversation._messageStore = {
        findConversationById: id => null,
        readMessages: () => null,
      };
      sinon.stub(conversation, '_loadConversation');
      conversation.loadConversationById(1);
      sinon.assert.notCalled(conversation._loadConversation);
    });
  });
});

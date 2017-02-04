import RcModule from '../../lib/RcModule';
import moduleStatus from '../../enums/moduleStatus';

import composeTextActionTypes from './composeTextActionTypes';
import getComposeTextReducer from './getComposeTextReducer';
import getCacheReducer from './getCacheReducer';

import messageSenderMessages from '../MessageSender/messageSenderMessages';

export default class ComposeText extends RcModule {
  constructor({
    alert,
    storage,
    messageSender,
    numberValidate,
    ...options
  }) {
    super({
      ...options,
      actionTypes: composeTextActionTypes,
    });

    this._alert = alert;
    this._storage = storage;
    this._storageKey = 'composeText';
    this._reducer = getComposeTextReducer(this.actionTypes);
    this._cacheReducer = getCacheReducer(this.actionTypes);
    this._messageSender = messageSender;
    this._numberValidate = numberValidate;
    this.send = this.send.bind(this);
    this.updateSenderNumber = this.updateSenderNumber.bind(this);
    this.updateTypingToNumber = this.updateTypingToNumber.bind(this);
    this.cleanTypingToNumber = this.cleanTypingToNumber.bind(this);
    this.addToNumber = this.addToNumber.bind(this);
    this.removeToNumber = this.removeToNumber.bind(this);
    this.updateMessageText = this.updateMessageText.bind(this);
    this.clean = this.clean.bind(this);
    storage.registerReducer({ key: this._storageKey, reducer: this._cacheReducer });
  }

  initialize() {
    this.store.subscribe(() => {
      if (
        this._messageSender.ready &&
        this.status === moduleStatus.pending
      ) {
        this.store.dispatch({
          type: this.actionTypes.initSuccess,
        });
        this.initSenderNumber();
      } else if (
        (
          !this._messageSender.ready
        ) &&
        this.status === moduleStatus.ready
      ) {
        this.store.dispatch({
          type: this.actionTypes.resetSuccess,
        });
      }
    });
  }

  initSenderNumber() {
    let defaultPhoneNumber = null;
    const cachedPhoneNumber = this.cache.senderNumber;
    if (cachedPhoneNumber) {
      defaultPhoneNumber = cachedPhoneNumber;
    } else {
      defaultPhoneNumber = this._messageSender.senderNumbersList[0];
    }
    this.updateSenderNumber(defaultPhoneNumber);
  }

  _isBlank(str) {
    if (!str) {
      return true;
    }
    return !/\S/.test(str);
  }

  _validatePhoneNumber(phoneNumber) {
    const validateResult = this._numberValidate.validateFormat([phoneNumber]);
    if (!validateResult.result) {
      const error = validateResult.errors[0];
      if (error && messageSenderMessages[error.type]) {
        this._alert.warning({
          message: messageSenderMessages[error.type],
        });
        return false;
      }
      this._alert.warning({
        message: messageSenderMessages.recipientNumberInvalids,
      });
      return false;
    }
    return true;
  }

  async send() {
    const text = this.messageText;
    const fromNumber = this.senderNumber;
    const toNumbers = this.toNumbers.map(number => number.phoneNumber);
    const typingToNumber = this.typingToNumber;
    if (!this._isBlank(typingToNumber)) {
      if (this._validatePhoneNumber(typingToNumber)) {
        toNumbers.push(typingToNumber);
      } else {
        return null;
      }
    }
    return await this._messageSender.send({ fromNumber, toNumbers, text });
  }

  updateSenderNumber(number) {
    this.store.dispatch({
      type: this.actionTypes.updateSenderNumber,
      number: (number || ''),
    });
  }

  updateTypingToNumber(number) {
    if (number.length > 30) {
      this._alert.warning({
        message: messageSenderMessages.recipientNumberInvalids,
      });
      return;
    }
    this.store.dispatch({
      type: this.actionTypes.updateTypingToNumber,
      number,
    });
  }

  cleanTypingToNumber() {
    this.store.dispatch({
      type: this.actionTypes.cleanTypingToNumber,
    });
  }

  addToNumber(number) {
    if (this._isBlank(number.phoneNumber)) {
      return;
    }
    if (!this._validatePhoneNumber(number.phoneNumber)) {
      return;
    }
    this.store.dispatch({
      type: this.actionTypes.addToNumber,
      number,
    });
  }

  removeToNumber(number) {
    this.store.dispatch({
      type: this.actionTypes.removeToNumber,
      number,
    });
  }

  updateMessageText(text) {
    if (text.length > 1000) {
      this._alert.warning({
        message: messageSenderMessages.textTooLong,
      });
      return;
    }
    this.store.dispatch({
      type: this.actionTypes.updateMessageText,
      text,
    });
  }

  clean() {
    this.store.dispatch({
      type: this.actionTypes.clean,
    });
  }

  get cache() {
    return this._storage.getItem(this._storageKey);
  }

  get status() {
    return this.state.status;
  }

  get ready() {
    return this.status === moduleStatus.ready;
  }

  get senderNumber() {
    return this.state.senderNumber;
  }

  get typingToNumber() {
    return this.state.typingToNumber;
  }

  get toNumbers() {
    return this.state.toNumbers;
  }

  get messageText() {
    return this.state.messageText;
  }
}

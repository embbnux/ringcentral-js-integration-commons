import RcModule from '../../lib/RcModule';
import moduleStatus from '../../enums/moduleStatus';

import messageSenderActionTypes from './messageSenderActionTypes';
import getMessageSenderReducer from './getMessageSenderReducer';

import messageSenderStatus from './messageSenderStatus';
import messageSenderMessages from './messageSenderMessages';

export default class MessageSender extends RcModule {
  constructor({
    alert,
    client,
    extensionInfo,
    extensionPhoneNumber,
    numberValidate,
    ...options
  }) {
    super({
      ...options,
      actionTypes: messageSenderActionTypes,
    });

    this._alert = alert;
    this._client = client;
    this._extensionPhoneNumber = extensionPhoneNumber;
    this._extensionInfo = extensionInfo;
    this._reducer = getMessageSenderReducer(this.actionTypes);
    this._numberValidate = numberValidate;
    this.send = this.send.bind(this);
  }

  initialize() {
    this.store.subscribe(() => {
      if (
        this._extensionPhoneNumber.ready &&
        this._extensionInfo.ready &&
        this.status === moduleStatus.pending
      ) {
        this.store.dispatch({
          type: this.actionTypes.initSuccess,
        });
      } else if (
        (
          !this._extensionPhoneNumber.ready ||
          !this._extensionInfo.ready
        ) &&
        this.status === moduleStatus.ready
      ) {
        this.store.dispatch({
          type: this.actionTypes.resetSuccess,
        });
      }
    });
  }

  _isBlank(str) {
    return !/\S/.test(str);
  }

  _validateText(text) {
    if (!text || this._isBlank(text)) {
      this._alert.warning({
        message: messageSenderMessages.textEmpty,
      });
      return false;
    }

    if (text.length > 1000) {
      this._alert.warning({
        message: messageSenderMessages.textTooLong,
      });
      return false;
    }

    return true;
  }

  _validateToNumbersIsEmpty(toNumbers) {
    if (toNumbers.length === 0) {
      this._alert.warning({
        message: messageSenderMessages.receiversEmpty,
      });
      return true;
    }
    return false;
  }

  _validateSenderNumber(senderNumber) {
    let validateResult = true;
    if (!senderNumber || this._isBlank(senderNumber)) {
      validateResult = false;
    }
    if (validateResult) {
      const isMySenderNumber = this.senderNumbersList.find(number => (
        number === senderNumber
      ));
      if (!isMySenderNumber) {
        validateResult = false;
      }
    }
    if (!validateResult) {
      this._alert.warning({
        message: messageSenderMessages.senderNumberInvalids,
      });
    }
    return validateResult;
  }

  _alertInvalidRecipientNumber(errors) {
    errors.forEach((error) => {
      const message = messageSenderMessages[error.type];
      if (message) {
        this._alert.warning({ message });
        return;
      }
      this._alert.warning({
        message: messageSenderMessages.recipientNumberInvalids,
      });
    });
  }

  async send({ fromNumber, toNumbers, text, replyOnMessageId }) {
    if (!this._validateText(text)) {
      return null;
    }

    if (this._validateToNumbersIsEmpty(toNumbers)) {
      return null;
    }

    let recipientNumbers = toNumbers.filter((item, index, arr) => arr.indexOf(item) === index);

    this.store.dispatch({ type: this.actionTypes.validate });
    const numberValidateResult = await this._numberValidate.validateNumbers(recipientNumbers);
    if (!numberValidateResult.result) {
      this._alertInvalidRecipientNumber(numberValidateResult.errors);
      this.store.dispatch({ type: this.actionTypes.validateError });
      return null;
    }

    recipientNumbers = numberValidateResult.numbers.map((number) => {
      if (!number.subAddress) {
        return number.e164;
      }
      return `${number.e164}*${number.subAddress}`;
    });

    const extensionNumbers = recipientNumbers.filter(number => (number.length <= 5));
    const phoneNumbers = recipientNumbers.filter(number => (number.length > 5));

    if (phoneNumbers.length > 0) {
      if (!this._validateSenderNumber(fromNumber)) {
        return null;
      }
    }

    try {
      this.store.dispatch({
        type: this.actionTypes.send,
      });

      let pagerResponse = null;
      let smsResponse = null;
      if (extensionNumbers.length > 0) {
        pagerResponse = await this._sendPager({
          toNumbers: extensionNumbers,
          text,
          replyOnMessageId,
        });
        console.debug('sendPagerText response: ', pagerResponse);
      }

      if (phoneNumbers.length > 0) {
        for (const phoneNumber of phoneNumbers) {
          smsResponse = await this._sendSms({ fromNumber, toNumber: phoneNumber, text });
        }
        console.debug('sendSmsText response: ', smsResponse);
      }
      this.store.dispatch({
        type: this.actionTypes.sendOver,
      });
      return (pagerResponse || smsResponse);
    } catch (error) {
      this.store.dispatch({
        type: this.actionTypes.sendError,
        error: 'error'
      });
      this._onSendError(error);
      console.debug('sendComposeText e ', error);
      throw error;
    }
  }

  async _sendSms({ fromNumber, toNumber, text }) {
    const toUsers = [{ phoneNumber: toNumber }];
    const response = await this._client.account().extension().sms().post({
      from: { phoneNumber: fromNumber },
      to: toUsers,
      text,
    });
    return response;
  }

  async _sendPager({ toNumbers, text, replyOnMessageId }) {
    const from = { extensionNumber: this._extensionInfo.extensionNumber };
    const toUsers = toNumbers.map(number => ({ extensionNumber: number }));
    const params = { from, to: toUsers, text };
    if (replyOnMessageId) {
      params.replyOn = replyOnMessageId;
    }
    const response = await this._client.account().extension().companyPager().post(params);
    return response;
  }

  _onSendError(error) {
    const errResp = error.apiResponse;
    if (
      errResp && errResp.response &&
      !errResp.response.ok
      && errResp._json.errorCode === 'InvalidParameter'
    ) {
      errResp._json.errors.map((err) => {
        if (
          (err.errorCode === 'CMN-101' || err.errorCode === 'CMN-102') &&
          err.parameterName.startsWith('to')
        ) {
          // 101 : "Parameter [to.extensionNumber] value is invalid"
          // 101 : "Parameter [to.phoneNumber] value is invalid"
          // 102 : "Resource for parameter [to] is not found"
          this._alert.warning({
            message: messageSenderMessages.recipientNumberInvalids,
          });
          return null;
        }
        if (err.errorCode === 'MSG-246') {
          // MSG-246 : "Sending SMS from/to extension numbers is not available"
          this._alert.warning({
            message: messageSenderMessages.notSmsToExtension,
          });
        }
        return null;
      });
      return;
    }
    this._alert.warning({
      message: messageSenderMessages.sendError,
    });
  }

  get status() {
    return this.state.status;
  }

  get sendStatus() {
    return this.state.sendStatus;
  }

  get ready() {
    return this.status === moduleStatus.ready;
  }

  get idle() {
    return this.sendStatus === messageSenderStatus.idle;
  }

  get senderNumbersList() {
    return this._extensionPhoneNumber.smsSenderNumbers.map(
      (number) => number.phoneNumber
    );
  }
}

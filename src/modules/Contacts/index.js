import RcModule from '../../lib/RcModule';
import { Module } from '../../lib/di';
import normalizeNumber from '../../lib/normalizeNumber';
import ensureExist from '../../lib/ensureExist';
import actionTypes from './actionTypes';
import getContactsReducer from './getContactsReducer';
import contactsMessages from './contactsMessages';

/**
 * @class
 * @description Contacts managing module
 */
@Module({
  deps: [
    'Client',
    'Alert',
    'AddressBook',
    'AccountExtension',
    'AccountPhoneNumber',
    'AccountContacts',
    { dep: 'ContactsOptions', optional: true }
  ]
})
export default class Contacts extends RcModule {
  /**
   * @constructor
   * @param {Object} params - params object
   * @param {Client} params.client - client module instance
   * @param {Alert} params.alert - alert module instance
   * @param {AddressBook} params.addressBook - addressBook module instance
   * @param {AccountExtension} params.accountExtension - accountExtension module instance
   * @param {AccountPhoneNumber} params.accountPhoneNumber - accountPhoneNumber module instance
   * @param {Number} params.ttl - timestamp of local cache, default 30 mins
   * @param {Number} params.avatarTtl - timestamp of avatar local cache, default 2 hour
   * @param {Number} params.presenceTtl - timestamp of presence local cache, default 10 mins
   * @param {Number} params.avatarQueryInterval - interval of query avatar, default 2 seconds
   */
  constructor({
    client,
    addressBook,
    accountContacts,
    accountExtension,
    accountPhoneNumber,
    alert,
    readyCheckFn,
    addContactsSources = [],
    ...options,
  }) {
    super({
      ...options,
      actionTypes,
    });
    this._addressBook = this::ensureExist(addressBook, 'addressBook');
    this._accountExtension = this::ensureExist(accountExtension, 'accountExtension');
    this._accountPhoneNumber = this::ensureExist(accountPhoneNumber, 'accountPhoneNumber');
    this._accountContacts = this::ensureExist(accountContacts, 'accountContacts');
    this._client = this::ensureExist(client, 'client');
    this._alert = this::ensureExist(alert, 'alert');
    this._reducer = getContactsReducer(this.actionTypes);
    this._addContactsSources = addContactsSources;
    this._readyCheckFn = readyCheckFn;
    this._handlerContactsSources();
  }

  _handlerContactsSources() {
    this._addContactsSources.forEach(({ addSelector, sourcesName }) => {
      if (!this[sourcesName]) {
        Object.defineProperty(this, sourcesName, {
          get: () => this._selectors[sourcesName]()
        });
        this.addSelector(...addSelector);
      }
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
      this._addressBook.ready &&
      this._accountExtension.ready &&
      this._accountPhoneNumber.ready &&
      (!this._readyCheckFn || this._readyCheckFn()) &&
      this.pending
    );
  }

  _shouldReset() {
    return (
      (
        !this._addressBook.ready ||
        !this._accountExtension.ready ||
        (this._readyCheckFn && !this._readyCheckFn()) ||
        !this._accountPhoneNumber.ready
      ) &&
      this.ready
    );
  }

  _resetModuleStatus() {
    this.store.dispatch({
      type: this.actionTypes.resetSuccess,
    });
  }

  async showAlert() {
    if (this._alert) {
      this._alert.warning({
        message: contactsMessages.inexistence,
      });
    }
  }

  matchPhoneNumber(phone) {
    const result = [];
    const phoneNumber = normalizeNumber({ phoneNumber: phone });
    const matchContact = (contact) => {
      let found = contact.extensionNumber && contact.extensionNumber === phoneNumber;
      if (!found) {
        contact.phoneNumbers.forEach((contactPhoneNumber) => {
          if (!found && contactPhoneNumber.phoneNumber === phoneNumber) {
            found = true;
          }
        });
      }
      if (!found) {
        return;
      }
      const name =
        `${
        contact.firstName ? contact.firstName : ''
        } ${
        contact.lastName ? contact.lastName : ''
        }`;
      const matchedContact = {
        ...contact,
        phoneNumbers: [
          ...contact.phoneNumbers
        ],
        entityType: 'rcContact',
        name,
      };
      if (contact.extensionNumber) {
        matchedContact.phoneNumbers.push({
          phoneType: 'extension',
          phoneNumber: contact.extensionNumber,
        });
      }
      result.push(matchedContact);
    };
    this.companyContacts.forEach(matchContact);
    this.personalContacts.forEach(matchContact);
    return result;
  }

  matchContacts({ phoneNumbers }) {
    const result = {};
    phoneNumbers.forEach((phoneNumber) => {
      result[phoneNumber] = this.matchPhoneNumber(phoneNumber);
    });
    return result;
  }

  findContactItem({ contactType, contactId }) {
    const id = (contactId || '').toString();
    for (const contactsSources of this._addContactsSources) {
      if (contactsSources.contactType === contactType) {
        return this[contactsSources.sourcesName].find(x => x.id.toString() === id);
      }
    }
    switch (contactType) {
      case 'company':
        return this.companyContacts.find(x => x.id.toString() === id);
      case 'personal':
        return this.personalContacts.find(x => x.id.toString() === id);
      default:
        return null;
    }
  }

  getImageProfile(contact, useCache = true) {
    return this._accountContacts.getImageProfile(contact, useCache);
  }

  getPresence(contact) {
    return this._accountContacts.getPresence(contact);
  }

  get status() {
    return this.state.status;
  }

  get companyContacts() {
    return this._accountContacts.contacts;
  }

  get personalContacts() {
    return this._addressBook.contacts;
  }

  get profileImages() {
    return this._accountContacts.profileImages;
  }

  get contactPresences() {
    return this._accountContacts.contactPresences;
  }
}

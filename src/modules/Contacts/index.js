import RcModule from '../../lib/RcModule';
import { Module } from '../../lib/di';
import normalizeNumber from '../../lib/normalizeNumber';
import ensureExist from '../../lib/ensureExist';
import isBlank from '../../lib/isBlank';
import {
  uniqueContactItems,
  sortContactItemsByName,
  groupByFirstLetterOfName,
  filterContacts,
} from '../../lib/contactHelper';
import proxify from '../../lib/proxy/proxify';
import actionTypes from './actionTypes';
import getContactsReducer from './getContactsReducer';

export const AllContactSourceName = 'all';
export const DefaultContactListPageSize = 20;

/**
 * @class
 * @description Contacts managing module
 */
@Module({
  deps: [
    'Auth',
    { dep: 'ContactsOptions', optional: true }
  ]
})
export default class Contacts extends RcModule {
  /**
   * @constructor
   * @param {Object} params - params object
   * @param {Auth} params.auth - auth module instance
   */
  constructor({
    auth,
    listPageSize = DefaultContactListPageSize,
    ...options,
  }) {
    super({
      ...options,
      actionTypes,
    });
    this._auth = this::ensureExist(auth, 'auth');
    this._reducer = getContactsReducer(this.actionTypes);
    this._contactSources = new Map();
    this._contactSourcesCheck = new Map();
    this._contactSourcesGetPresence = new Map();
    this._contactSourcesGetProfileImage = new Map();
    this._sourcesLastStatus = new Map();
    this._sourcesUpdatedAt = Date.now();
    this._listPageSize = listPageSize;

    this.addSelector(
      'contactSourceNames',
      () => this._contactSources.size,
      () => this._checkSourceUpdated(),
      () => {
        const names = [AllContactSourceName];
        for (const sourceName of Array.from(this._contactSources.keys())) {
          const readyCheckFn = this._contactSourcesCheck.get(sourceName);
          if (readyCheckFn()) {
            names.push(sourceName);
          }
        }
        return names;
      }
    );

    this.addSelector(
      'allContacts',
      () => this._checkSourceUpdated(),
      () => {
        let contacts = [];
        for (const sourceName of Array.from(this._contactSources.keys())) {
          const readyCheckFn = this._contactSourcesCheck.get(sourceName);
          if (readyCheckFn()) {
            contacts = contacts.concat(this._contactSources.get(sourceName)());
          }
        }
        return contacts;
      }
    );

    this.addSelector(
      'contactGroups',
      () => this.filteredContacts,
      () => this.pageNumber,
      (filteredContacts, pageNumber) => {
        const pageSize = this._listPageSize;
        const count = pageNumber * pageSize;
        let items = uniqueContactItems(filteredContacts);
        items = sortContactItemsByName(items);
        items = items.slice(0, count);
        const groups = groupByFirstLetterOfName(items);
        return groups;
      }
    );

    this.addSelector(
      'filteredContacts',
      () => this.searchFilter,
      () => this.sourceFilter,
      () => this._checkSourceUpdated(),
      (searchFilter, sourceFilter) => {
        let contacts;
        if (
          isBlank(searchFilter) &&
          (sourceFilter === AllContactSourceName || isBlank(sourceFilter))
        ) {
          return this.allContacts;
        }
        if (sourceFilter !== AllContactSourceName && !isBlank(sourceFilter)) {
          const getSourceData = this._contactSources.get(sourceFilter);
          const readyCheckFn = this._contactSourcesCheck.get(sourceFilter);
          if (getSourceData && readyCheckFn && readyCheckFn()) {
            contacts = getSourceData();
          } else {
            contacts = [];
          }
        } else {
          contacts = this.allContacts;
        }
        if (!isBlank(searchFilter)) {
          contacts = filterContacts(contacts, searchFilter);
        }
        return contacts;
      }
    );
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
      this._auth.loggedIn &&
      this.pending
    );
  }

  _shouldReset() {
    return (
      !this._auth.loggedIn &&
      this.ready
    );
  }

  _resetModuleStatus() {
    this.store.dispatch({
      type: this.actionTypes.resetSuccess,
    });
  }

  updateFilter({ sourceFilter, searchFilter, pageNumber }) {
    this.store.dispatch({
      type: this.actionTypes.updateFilter,
      sourceFilter,
      searchFilter,
      pageNumber,
    });
  }

  addSource({ sourceName, getContactsFn, readyCheckFn, getPresenceFn, getProfileImageFn }) {
    if (!sourceName) {
      throw new Error('Contacts: "sourceName" is required.');
    }
    if (this._contactSources.has(sourceName)) {
      throw new Error(`Contacts: A contact source named "${sourceName}" already exists`);
    }
    if (this._contactSourcesCheck.has(sourceName)) {
      throw new Error(`Contacts: A contact source check named "${sourceName}" already exists`);
    }
    if (typeof getContactsFn !== 'function') {
      throw new Error('Contacts: getContactsFn must be a function');
    }
    if (typeof readyCheckFn !== 'function') {
      throw new Error('Contacts: readyCheckFn must be a function');
    }
    this._contactSources.set(sourceName, getContactsFn);
    this._contactSourcesCheck.set(sourceName, readyCheckFn);
    if (getPresenceFn && typeof getPresenceFn === 'function') {
      this._contactSourcesGetPresence.set(sourceName, getPresenceFn);
    }
    if (getProfileImageFn && typeof getProfileImageFn === 'function') {
      this._contactSourcesGetProfileImage.set(sourceName, getProfileImageFn);
    }
    this._sourcesLastStatus.set(sourceName, {});
    this._sourcesUpdatedAt = Date.now();
  }

  _checkSourceUpdated() {
    let updated = false;
    for (const sourceName of Array.from(this._contactSources.keys())) {
      const lastStatus = this._sourcesLastStatus.get(sourceName);
      if (lastStatus.ready !== this._contactSourcesCheck.get(sourceName)()) {
        updated = true;
      }
      if (lastStatus.data !== this._contactSources.get(sourceName)()) {
        updated = true;
      }
    }
    if (updated) {
      this._sourcesUpdatedAt = Date.now();
    }
    return this._sourcesUpdatedAt;
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

  find({ type, id }) {
    const contactId = (id || '').toString();
    const getSourceData = this._contactSources.get(type);
    if (getSourceData) {
      return getSourceData().find(x => x.id.toString() === contactId);
    }
    return null;
  }

  @proxify
  getProfileImage(contact, useCache = true) {
    const getProfileImageFunc = this._contactSourcesGetProfileImage.get(contact.type);
    if (getProfileImageFunc) {
      return getProfileImageFunc(contact, useCache);
    }
    return null;
  }

  @proxify
  getPresence(contact) {
    const getPresenceFunc = this._contactSourcesGetPresence.get(contact.type);
    if (getPresenceFunc) {
      return getPresenceFunc(contact);
    }
    return null;
  }

  get status() {
    return this.state.status;
  }

  get companyContacts() {
    const getSourceData = this._contactSources.get('company');
    if (getSourceData) {
      return getSourceData();
    }
    return [];
  }

  get personalContacts() {
    const getSourceData = this._contactSources.get('personal');
    if (getSourceData) {
      return getSourceData();
    }
    return [];
  }

  get searchFilter() {
    return this.state.searchFilter;
  }

  get sourceFilter() {
    return this.state.sourceFilter;
  }

  get pageNumber() {
    return this.state.pageNumber;
  }

  get allContacts() {
    return this._selectors.allContacts();
  }

  get filteredContacts() {
    return this._selectors.filteredContacts();
  }

  get sourceNames() {
    return this._selectors.contactSourceNames();
  }

  get contactGroups() {
    return this._selectors.contactGroups();
  }
}

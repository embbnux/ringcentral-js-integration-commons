import DataFetcher from '../../lib/DataFetcher';
import fetchList from '../..//lib/fetchList';

export default class ForwardingNumber extends DataFetcher {
  constructor({
    client,
    ...options,
  }) {
    super({
      name: 'forwardingNumber',
      client,
      fetchFunction: async () => fetchList(params => (
        this._client.account().extension().forwardingNumber().list(params)
      )),
      ...options,
    });

    this.addSelector(
      'flipNumbers',
      () => this.numbers,
      phoneNumbers =>
        phoneNumbers.filter(p => p.features.indexOf('CallFlip') !== -1 && p.phoneNumber)
    );
    this.addSelector(
      'numbers',
      () => this.data,
      data => data || [],
    );
    this.addSelector(
      'forwardingNumbers',
      () => this.numbers,
      phoneNumbers =>
        phoneNumbers.filter(p => p.features.indexOf('CallForwarding') !== -1 && p.phoneNumber)
    );
  }

  get numbers() {
    return this._selectors.numbers();
  }

  get flipNumbers() {
    return this._selectors.flipNumbers();
  }

  get forwardingNumbers() {
    return this._selectors.forwardingNumbers();
  }
}

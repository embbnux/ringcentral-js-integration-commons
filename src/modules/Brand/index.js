import RcModule from '../../lib/RcModule';
import moduleStatuses from '../../enums/moduleStatuses';

/**
 * @class
 * @description Brand managing module
 */
export default class Brand extends RcModule {
  /**
   * @constructor
   * @param {Object} params - params object
   * @param {String} params.id - brand id
   * @param {String} params.name - brand name
   * @param {String} params.fullName - full brand name
   * @param {String} params.application - application name
   */
  constructor({ id, name, fullName, application, ...options }) {
    super(options);
    this._reducer = (state = {
      id,
      name,
      fullName,
      application,
    }) => state;
  }
  get id() {
    return this.state.id;
  }
  get name() {
    return this.state.name;
  }
  get fullName() {
    return this.state.fullName;
  }
  get application() {
    return this.state.application;
  }
  // eslint-disable-next-line class-methods-use-this
  get status() {
    return moduleStatuses.ready;
  }

  // eslint-disable-next-line class-methods-use-this
  get ready() {
    return true;
  }
}

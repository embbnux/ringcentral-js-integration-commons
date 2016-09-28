import KeyValueMap from 'data-types/key-value-map';
import userStatus from './user-status';

export default new KeyValueMap({
  ...userStatus,
  statusChange: 'STATUS_CHANGE',
  error: 'ERROR',
});

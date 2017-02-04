import Enum from '../../lib/Enum';

export default new Enum([
  'sendSuccess',
  'sendError',
  'numberValidateError',
  'textEmpty',
  'textTooLong',
  'noPermission',
  'senderEmpty',
  'noToNumber',
  'receiversEmpty',
  'recipientNumberInvalids',
  'senderNumberInvalids',
  'noAreaCode',
  'specialNumber',
  'internalError',
  'notAnExtension',
  'networkError',
  'notSmsToExtension',
], 'message-sender-msg');

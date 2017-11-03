import isBlank from './isBlank';
import normalizeNumber from './normalizeNumber';

export function addPhoneToContact(contact, phone, type) {
  const phoneNumber = normalizeNumber({ phoneNumber: phone });
  if (isBlank(phoneNumber)) {
    return;
  }
  const existedPhone = contact.phoneNumbers.find(
    number => number && number.phoneNumber === phone
  );
  if (existedPhone) {
    existedPhone.phoneType = type;
  } else {
    contact.phoneNumbers.push({
      phoneNumber: phone,
      phoneType: type,
    });
  }
}

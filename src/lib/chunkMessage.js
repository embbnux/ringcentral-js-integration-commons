/**
 * this module seems better
 * https://www.npmjs.com/package/chunk-text
 * use our own implementation for now.
 */

export default function chunkMessage(text, maxLength) {
  if (!text) {
    return [];
  }

  if (typeof (maxLength) !== 'number') {
    throw new Error('Should be a integer "maxLength"');
  }

  if (maxLength < 1) {
    throw new Error('Should greater than 0 "maxLength"');
  }

  const chunks = [];
  let currentIndex = 0;
  const total = text.length;

  while (currentIndex < total) {
    let newIndex = currentIndex + maxLength;
    let offset = 0;
    for (; offset < maxLength; offset += 1) {
      const char = text.charAt(newIndex - offset);
      if (!char) {
        break;
      }
      const isWhiteSpace = /\s/.test(char);
      if (isWhiteSpace) {
        offset -= 1;
        break;
      }
    }
    if (offset !== maxLength) {
      newIndex -= offset;
    }
    const snippet = text.substring(currentIndex, newIndex);
    currentIndex = newIndex;
    chunks.push(snippet);
  }

  return chunks;
}

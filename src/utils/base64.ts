/**
 * Dependency-free base64 -> UTF-8 string decoding.
 *
 * react-native-ble-plx delivers characteristic values as base64 strings. We keep
 * this tiny and self-contained (spec: "keep dependencies minimal") and decode UTF-8
 * properly so non-ASCII gesture text works too.
 */
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64ToBytes(base64: string): Uint8Array {
  // Strip padding / whitespace / anything not in the base64 alphabet.
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = clean.length;
  const byteLen = Math.floor((len * 3) / 4);
  const bytes = new Uint8Array(byteLen);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    // charAt returns '' past the end; indexOf('') === 0, i.e. treated as padding.
    const n0 = B64.indexOf(clean.charAt(i));
    const n1 = B64.indexOf(clean.charAt(i + 1));
    const n2 = B64.indexOf(clean.charAt(i + 2));
    const n3 = B64.indexOf(clean.charAt(i + 3));
    const triple = (n0 << 18) | (n1 << 12) | (n2 << 6) | n3;
    if (p < byteLen) bytes[p++] = (triple >> 16) & 0xff;
    if (p < byteLen) bytes[p++] = (triple >> 8) & 0xff;
    if (p < byteLen) bytes[p++] = triple & 0xff;
  }
  return bytes;
}

export function utf8BytesToString(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i++];
    if (b0 < 0x80) {
      out += String.fromCharCode(b0);
    } else if (b0 >= 0xc0 && b0 < 0xe0) {
      const b1 = bytes[i++] & 0x3f;
      out += String.fromCharCode(((b0 & 0x1f) << 6) | b1);
    } else if (b0 >= 0xe0 && b0 < 0xf0) {
      const b1 = bytes[i++] & 0x3f;
      const b2 = bytes[i++] & 0x3f;
      out += String.fromCharCode(((b0 & 0x0f) << 12) | (b1 << 6) | b2);
    } else {
      // 4-byte sequence -> UTF-16 surrogate pair.
      const b1 = bytes[i++] & 0x3f;
      const b2 = bytes[i++] & 0x3f;
      const b3 = bytes[i++] & 0x3f;
      let cp = ((b0 & 0x07) << 18) | (b1 << 12) | (b2 << 6) | b3;
      cp -= 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
    }
  }
  return out;
}

/** Convenience: base64 -> decoded UTF-8 string. */
export function base64ToString(base64: string): string {
  return utf8BytesToString(base64ToBytes(base64));
}

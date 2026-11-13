// HMAC helpers. MUST stay byte-identical to worker/src/hmac.ts (see its header comment).
//   X-HDM-Sig: t=<unix s>,v1=<lowercase hex HMAC-SHA256(secret, "<t>.<body>")>   window +-300 s
//   ticket: b64url(JSON payload incl. exp) + "." + b64url(HMAC-SHA256(secret, <b64url payload string>))
// Only Utilities.* is used for crypto/encoding, so tests inject a Node-backed Utilities.
var HMAC_WINDOW_SEC = 300;

function _hexFromBytes(bytes) {
  var s = '';
  for (var i = 0; i < bytes.length; i++) {
    var b = bytes[i] < 0 ? bytes[i] + 256 : bytes[i]; // Apps Script returns signed bytes
    s += (b < 16 ? '0' : '') + b.toString(16);
  }
  return s;
}

function _b64url(dataOrBytes) {
  return Utilities.base64EncodeWebSafe(dataOrBytes).replace(/=+$/, '');
}

function _b64urlDecodeToString(s) {
  var pad = s + '===='.slice(s.length % 4 === 0 ? 4 : s.length % 4);
  return Utilities.newBlob(Utilities.base64DecodeWebSafe(pad)).getDataAsString();
}

function _safeEqual(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function gasSign(secret, t, body) {
  return _hexFromBytes(Utilities.computeHmacSha256Signature(t + '.' + body, secret));
}

function gasSigHeader(secret, t, body) {
  return 't=' + t + ',v1=' + gasSign(secret, t, body);
}

function gasVerifySigHeader(secret, header, body, nowSec) {
  var m = /^t=(\d{1,12}),v1=([0-9a-f]{64})$/.exec(String(header || '').trim());
  if (!m) return false;
  var t = Number(m[1]);
  if (Math.abs(nowSec - t) > HMAC_WINDOW_SEC) return false;
  return _safeEqual(gasSign(secret, t, body), m[2]);
}

function gasSignTicket(secret, payload, nowSec) {
  var copy = {};
  for (var k in payload) if (Object.prototype.hasOwnProperty.call(payload, k)) copy[k] = payload[k];
  copy.exp = nowSec + HMAC_WINDOW_SEC;
  var part = _b64url(JSON.stringify(copy));
  return part + '.' + _b64url(Utilities.computeHmacSha256Signature(part, secret));
}

function gasVerifyTicket(secret, ticket, nowSec) {
  var parts = String(ticket || '').split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  if (!_safeEqual(_b64url(Utilities.computeHmacSha256Signature(parts[0], secret)), parts[1])) return null;
  try {
    var payload = JSON.parse(_b64urlDecodeToString(parts[0]));
    if (typeof payload !== 'object' || payload === null || typeof payload.exp !== 'number') return null;
    if (nowSec > payload.exp) return null;
    if (payload.exp > nowSec + HMAC_WINDOW_SEC) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

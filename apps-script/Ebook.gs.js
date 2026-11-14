// Ebook serving. The browser gets a short-lived HMAC ticket from the Worker and calls this Web App with it:
//   POST text/plain  {action:'ebook.meta', ticket}            -> {ok:true, data:{chunks, bytes, updatedAt}}
//   POST text/plain  {action:'ebook.chunk', ticket, index}    -> {ok:true, data:{b64}}   (4 MB slice of the file)
// The ticket (verified with TICKET_SECRET, no Firebase/DB access here) carries the Drive fileId; a fileId in the
// request body is never read.
var EBOOK_CHUNK_BYTES = 4 * 1024 * 1024;
var EBOOK_EXPIRED_MSG = 'Sesi ebook tamat. Sila buka semula ebook.';

function ebookChunkCount(bytes) {
  return bytes > 0 ? Math.ceil(bytes / EBOOK_CHUNK_BYTES) : 0;
}

/** Pure request handler; `store` = {stat(fileId) -> {bytes, updatedAt}, readChunk(fileId, start, end) -> base64}. */
function ebookRespond_(body, secret, now, store) {
  if (!body || typeof body !== 'object') return { ok: false, message: 'Permintaan tidak sah.' };
  var action = body.action;
  if (action !== 'ebook.meta' && action !== 'ebook.chunk') return { ok: false, message: 'Tindakan tidak dikenali.' };

  var payload = gasVerifyTicket(secret, body.ticket, now);
  if (!payload || typeof payload.fileId !== 'string' || !payload.fileId) return { ok: false, message: EBOOK_EXPIRED_MSG };
  var fileId = payload.fileId;

  try {
    var st = store.stat(fileId);
    var chunks = ebookChunkCount(st.bytes);
    if (action === 'ebook.meta') return { ok: true, data: { chunks: chunks, bytes: st.bytes, updatedAt: st.updatedAt } };

    var idx = body.index;
    if (typeof idx !== 'number' || idx !== Math.floor(idx) || idx < 0 || idx >= chunks) {
      return { ok: false, message: 'Bahagian ebook tidak sah.' };
    }
    var start = idx * EBOOK_CHUNK_BYTES;
    var end = Math.min(st.bytes, start + EBOOK_CHUNK_BYTES);
    return { ok: true, data: { b64: store.readChunk(fileId, start, end) } };
  } catch (err) {
    Logger.log('ebook error: ' + err);
    return { ok: false, message: 'Ebook tidak dapat dimuatkan. Sila cuba lagi.' };
  }
}

/** Real Drive-backed store. The blob is cached per execution so consecutive calls on one file reuse it. */
function driveEbookStore_() {
  var cache = {};
  function load(fileId) {
    if (!cache[fileId]) {
      var file = DriveApp.getFileById(fileId);
      cache[fileId] = { file: file, bytes: null };
    }
    return cache[fileId];
  }
  return {
    stat: function (fileId) {
      var f = load(fileId).file;
      return { bytes: f.getSize(), updatedAt: f.getLastUpdated().toISOString() };
    },
    readChunk: function (fileId, start, end) {
      var c = load(fileId);
      if (!c.bytes) c.bytes = c.file.getBlob().getBytes();
      return Utilities.base64Encode(c.bytes.slice(start, end));
    }
  };
}

/** Router hook (ticket-authenticated app API). */
function handleAppApi(body, e) {
  return jsonOut(ebookRespond_(body, requireProp('TICKET_SECRET'), nowSec(), driveEbookStore_()));
}

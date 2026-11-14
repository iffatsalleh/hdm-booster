// Ebook serving. The browser gets a short-lived HMAC ticket from the Worker and calls this Web App with it:
//   POST text/plain  {action:'ebook.meta', ticket}            -> {ok:true, data:{chunks, bytes, updatedAt}}
//   POST text/plain  {action:'ebook.chunk', ticket, index}    -> {ok:true, data:{b64}}   (4 MB slice of the file)
// The ticket (verified with TICKET_SECRET, no Firebase/DB access here) carries the Drive fileId; a fileId in the
// request body is never read.
// Each chunk is standard PADDED base64 of its own byte range: the frontend must decode every chunk separately
// (atob per chunk, then concatenate bytes) and never concatenate the b64 strings.
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

/** Ranged read of [start, end) via Drive v3 (each chunk is its own execution, so never load the whole file). */
function driveRangeRead_(fileId, start, end) {
  var resp = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?alt=media', {
    method: 'get',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), Range: 'bytes=' + start + '-' + (end - 1) },
    muteHttpExceptions: true
  });
  var code = resp.getResponseCode();
  if (code !== 206 && code !== 200) throw new Error('drive HTTP ' + code);
  var content = resp.getContent();
  if (content.length !== end - start) throw new Error('drive range length ' + content.length + ' != ' + (end - start));
  return Utilities.base64Encode(content);
}

/** Real Drive-backed store: cheap metadata via DriveApp, bytes via ranged reads. */
function driveEbookStore_() {
  return {
    stat: function (fileId) {
      var f = DriveApp.getFileById(fileId);
      return { bytes: f.getSize(), updatedAt: f.getLastUpdated().toISOString() };
    },
    readChunk: driveRangeRead_
  };
}
/** Router hook (ticket-authenticated app API). */
function handleAppApi(body, e) {
  return jsonOut(ebookRespond_(body, requireProp('TICKET_SECRET'), nowSec(), driveEbookStore_()));
}

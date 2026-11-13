// Calls to the Cloudflare Worker's /internal/* endpoints, signed with INTERNAL_SECRET (X-HDM-Sig).
// Responses: {ok:true,data} | {ok:false,reason,message}. GET requests sign the empty string.

/** Returns the parsed JSON response; throws on transport failure. */
function workerCall(method, path, body) {
  var payload = body === undefined || body === null || method === 'GET' ? '' : JSON.stringify(body);
  var t = nowSec();
  var opts = {
    method: method.toLowerCase(),
    headers: { 'X-HDM-Sig': gasSigHeader(requireProp('INTERNAL_SECRET'), t, payload) },
    muteHttpExceptions: true
  };
  if (payload !== '') {
    opts.contentType = 'application/json';
    opts.payload = payload;
  }
  var res = UrlFetchApp.fetch(requireProp('WORKER_URL').replace(/\/+$/, '') + path, opts);
  var text = res.getContentText();
  try {
    return JSON.parse(text);
  } catch (e) {
    return { ok: false, reason: 'bad_response', message: 'HTTP ' + res.getResponseCode() + ': ' + text.slice(0, 200) };
  }
}

function workerData(method, path, body) {
  var r = workerCall(method, path, body);
  if (!r || r.ok !== true) throw new Error('Worker ' + path + ' failed: ' + (r && (r.reason || r.message)));
  return r.data;
}

/** kind: 'ignored' (unmapped form; Worker treats as known), 'skipped' (not paid live yet), 'processed', 'error'. */
function logBcl(orderRef, kind, detail, payload) {
  try {
    workerCall('POST', '/internal/bcl-log', {
      order_ref: orderRef || null,
      kind: kind,
      status: kind,
      detail: detail || null,
      payload: payload === undefined ? null : payload
    });
  } catch (e) {
    console.error('bcl-log failed: ' + e);
  }
}

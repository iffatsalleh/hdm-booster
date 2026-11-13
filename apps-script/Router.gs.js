// Web App entry points.
function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return jsonOut({ ok: true, service: 'hdm-booster-gas' });
}

function doPost(e) {
  // 1) BCL webhook: ?src=bcl&k=<BCL_WEBHOOK_KEY>
  if (e.parameter && e.parameter.src === 'bcl') return handleBclWebhook(e);

  var raw = (e.postData && e.postData.contents) || '';
  var body = null;
  try { body = JSON.parse(raw); } catch (err) { /* fall through */ }

  // 2) Worker -> GAS (signature is carried in the body because Apps Script cannot read request headers)
  //    body: {src:'worker', t:<unix s>, sig:<v1 hex>, ...}; signed text is the body with sig removed is NOT used:
  //    we sign "<t>.<payload JSON string>" where payload = body.payload serialised by the Worker.
  if (body && body.src === 'worker') {
    var ok = typeof body.payload === 'string' && gasVerifySigHeader(requireProp('INTERNAL_SECRET'), 't=' + body.t + ',v1=' + body.sig, body.payload, nowSec());
    if (!ok) return jsonOut({ ok: false, reason: 'forbidden' });
    var inner = {};
    try { inner = JSON.parse(body.payload); } catch (err2) { return jsonOut({ ok: false, reason: 'bad_request' }); }
    if (inner.action === 'reprocess') return reprocessOrder(inner);
    return jsonOut({ ok: false, reason: 'unknown_action' });
  }

  // 3) App API (ticket-authenticated) - implemented in Task 10 (Api.gs.js).
  if (typeof handleAppApi === 'function') return handleAppApi(body, e);
  return jsonOut({ ok: false, reason: 'not_found' });
}

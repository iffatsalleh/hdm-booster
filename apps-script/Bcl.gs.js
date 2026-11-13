// BCL.my integration: webhook handler, order verification (never trust the webhook body), polling.
// Endpoint shapes come from a third-party integration; adjust BCL_FIELD_MAP / fetchBclList parsing after the first live order.

function bclGet(path) {
  var res = UrlFetchApp.fetch(requireProp('BCL_API_BASE').replace(/\/+$/, '') + path, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + requireProp('BCL_API_TOKEN'), Accept: 'application/json' },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) throw new Error('BCL ' + path + ' HTTP ' + res.getResponseCode());
  return JSON.parse(res.getContentText());
}

/** Unwrap {data:{...}} style envelopes. */
function unwrapTxn(j) {
  return j && j.data && typeof j.data === 'object' && !Array.isArray(j.data) ? j.data : j;
}

function fetchBclTransaction(orderRef) {
  return unwrapTxn(bclGet('/transactions/' + encodeURIComponent(orderRef)));
}

function fetchRecentBclTransactions(limit) {
  var j = bclGet('/transactions?per_page=' + limit + '&sort=-id');
  var list = Array.isArray(j) ? j : (j.data && Array.isArray(j.data) ? j.data : (j.data && j.data.data) || []);
  return list;
}

function withScriptLock(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('lock busy');
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/** Verify with BCL, match package, forward to the Worker. Idempotent on the Worker side (order_ref unique). */
function processOrder(orderRef, source) {
  var fm = fieldMap();
  var txn = fetchBclTransaction(orderRef);
  if (!isPaidLive(txn)) {
    logBcl(orderRef, 'skipped', 'not paid live (' + source + ')', { status: txn && txn.status, type: txn && txn.type });
    return { ok: false, reason: 'not_paid_live' };
  }
  var cfg = workerData('GET', '/internal/bcl-config');
  var rows = (cfg && cfg.rows) || cfg || [];
  var m = matchPackage(txn, rows, { tolerance: feeTolerance(), fieldMap: fm });
  if (!m.mapped) {
    logBcl(orderRef, 'ignored', 'form not in bcl_form_map (' + source + ')', txn);
    return { ok: false, reason: 'unmapped' };
  }
  var buyer = buyerFromTxn(txn, fm);
  var amount = parseFloat(_pick(txn, fm.amount));
  var r = workerCall('POST', '/internal/purchase', {
    order_ref: orderRef,
    source: source,
    package_id: m.packageId, // null => Worker stores as perlu_semakan
    name: buyer.name,
    email: buyer.email,
    phone: buyer.phone,
    amount: isNaN(amount) ? null : amount,
    raw: txn
  });
  logBcl(orderRef, r && r.ok ? 'processed' : 'error', (r && (r.reason || '')) + ' (' + source + ')', r && r.ok ? null : txn);
  if (r && r.ok) {
    try { processEmailQueue_(); } catch (e) { console.error('email queue: ' + e); }
  }
  return r;
}

/** Webhook entry. Always answers 200 JSON after validating the key; the order is re-verified against BCL. */
function handleBclWebhook(e) {
  if (!e.parameter || e.parameter.k !== prop('BCL_WEBHOOK_KEY') || !prop('BCL_WEBHOOK_KEY')) {
    return jsonOut({ ok: false, reason: 'forbidden' });
  }
  var raw = (e.postData && e.postData.contents) || '';
  var ref = extractOrderRef(raw, fieldMap());
  if (!ref) {
    logBcl(null, 'error', 'no order ref in webhook', raw.slice(0, 2000));
    return jsonOut({ ok: false, reason: 'no_order_ref' });
  }
  try {
    var r = withScriptLock(function () { return processOrder(ref, 'webhook'); });
    return jsonOut({ ok: true, result: r && r.ok ? 'processed' : (r && r.reason) });
  } catch (err) {
    logBcl(ref, 'error', String(err));
    return jsonOut({ ok: false, reason: 'error' }); // poll will catch it
  }
}

/** Worker-initiated reprocess (admin button). Body already HMAC-verified by the router. */
function reprocessOrder(body) {
  var ref = body && body.order_ref;
  if (!ref) return jsonOut({ ok: false, reason: 'bad_request' });
  var r = withScriptLock(function () { return processOrder(String(ref), 'reprocess'); });
  return jsonOut({ ok: !!(r && r.ok), result: r });
}

/** Time trigger every 10 min: safety net for missed webhooks. */
function pollBcl() {
  withScriptLock(function () {
    var fm = fieldMap();
    var list = fetchRecentBclTransactions(100);
    var paid = [];
    for (var i = 0; i < list.length; i++) {
      if (!isPaidLive(list[i])) continue;
      var ref = extractOrderRef(list[i], fm);
      if (ref) paid.push(ref);
    }
    if (!paid.length) return;
    // CONTRACT: /internal/known-orders returns refs that exist in purchases OR are logged in bcl_webhook_log
    // with kind 'ignored' (unmapped forms, logged by processOrder with order_ref), so polling doesn't re-fetch them.
    var known = workerData('POST', '/internal/known-orders', { refs: paid });
    var knownSet = {};
    var kl = (known && known.refs) || known || [];
    for (var k = 0; k < kl.length; k++) knownSet[kl[k]] = true;
    for (var j = 0; j < paid.length; j++) {
      if (knownSet[paid[j]]) continue;
      try { processOrder(paid[j], 'poll'); } catch (err) { logBcl(paid[j], 'error', 'poll: ' + err); }
    }
  });
}

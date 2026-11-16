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

/** One page of the BCL transaction list, newest first (page 1 = newest). */
function fetchBclTransactionsPage(page, perPage) {
  var j = bclGet('/transactions?per_page=' + perPage + '&sort=-id&page=' + page);
  var list = Array.isArray(j) ? j : (j.data && Array.isArray(j.data) ? j.data : (j.data && j.data.data) || []);
  return list;
}

/** Pages the time trigger may walk back through when many orders arrive between two polls. */
var POLL_MAX_PAGES = 5;

/**
 * Verify with BCL, match package, forward to the Worker. No script lock: the Worker side is idempotent
 * (order_ref unique; upsert_purchase only re-evaluates rows still under review), so concurrent webhooks, polls and
 * admin reprocesses never wait on each other. Returns the Worker response, or {ok:false, reason}.
 */
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
    paid_at: paidAtFromTxn(txn, fm), // null => Worker uses receipt time
    raw: txn
  });
  var d = (r && r.ok && r.data) || {};
  var outcome = r && r.ok
    ? 'status ' + d.status + (d.inserted ? ' (baharu)' : d.reevaluated ? (d.changed ? ' (dinilai semula, berubah)' : ' (dinilai semula, tiada perubahan)') : ' (sedia ada)')
    : (r && (r.reason || '')) || '';
  logBcl(orderRef, r && r.ok ? 'processed' : 'error', outcome + ' (' + source + ')', r && r.ok ? null : txn);
  // a new or newly registrable purchase queued an email: one non-blocking send attempt (the trigger is the backstop)
  if (r && r.ok && (d.inserted || d.changed)) {
    try { tryProcessEmailQueueNow_(); } catch (e) { console.error('email queue: ' + e); }
  }
  return r;
}

/** Webhook entry. Always answers 200 JSON after validating the key; the order is re-verified against BCL. */
function handleBclWebhook(e) {
  var key = prop('BCL_WEBHOOK_KEY');
  var given = e.parameter && typeof e.parameter.k === 'string' ? e.parameter.k : '';
  if (!key || !_safeEqual(given, key)) {
    return jsonOut({ ok: false, reason: 'forbidden' });
  }
  var raw = (e.postData && e.postData.contents) || '';
  var ref = extractOrderRef(raw, fieldMap());
  if (!ref) {
    logBcl(null, 'error', 'no order ref in webhook', raw.slice(0, 2000));
    return jsonOut({ ok: false, reason: 'no_order_ref' });
  }
  try {
    var r = processOrder(ref, 'webhook');
    return jsonOut({ ok: true, result: r && r.ok ? 'processed' : (r && r.reason) });
  } catch (err) {
    logBcl(ref, 'error', String(err));
    return jsonOut({ ok: false, reason: 'error' }); // poll will catch it
  }
}

/**
 * Worker-initiated reprocess (Admin "Proses semula"). Body already HMAC-verified by the router. Always evaluates
 * the order again (force), also a ref the poll treats as known because it was 'ignored' before; the new outcome
 * is logged by processOrder.
 */
function reprocessOrder(body) {
  var ref = body && body.order_ref;
  if (!ref) return jsonOut({ ok: false, reason: 'bad_request' });
  var r;
  try {
    r = processOrder(String(ref), 'reprocess');
  } catch (err) {
    logBcl(String(ref), 'error', 'reprocess: ' + err);
    return jsonOut({ ok: false, reason: 'error', result: null });
  }
  return jsonOut({ ok: !!(r && r.ok), result: r });
}

/**
 * Time trigger every 10 min: safety net for missed webhooks. Walks back up to POLL_MAX_PAGES pages of 100 until a
 * page whose paid refs are all known. CONTRACT: /internal/known-orders returns refs that exist in purchases OR are
 * logged with kind 'ignored' (unmapped forms), so the poll does not re-fetch them (recover those from Admin).
 */
function pollBcl() {
  var fm = fieldMap();
  return pollBclPages(
    fetchBclTransactionsPage,
    function (refs) {
      var known = workerData('POST', '/internal/known-orders', { refs: refs });
      return (known && known.refs) || known || [];
    },
    function (ref) {
      try { processOrder(ref, 'poll'); } catch (err) { logBcl(ref, 'error', 'poll: ' + err); }
    },
    { maxPages: POLL_MAX_PAGES, perPage: 100, fieldMap: fm }
  );
}

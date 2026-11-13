// Pure BCL logic (no Apps Script services) - unit-tested in Node via tests/gas/load.ts.
// BCL field paths come from a third-party integration, not official docs: keep them configurable (BCL_FIELD_MAP).

function defaultFieldMap() {
  return {
    order: ['order_no', 'order_number', 'order_id', 'order', 'reference', 'ref', 'transaction_id', 'id',
            'data.order_no', 'data.order_number', 'data.order_id', 'data.id', 'transaction.order_no', 'transaction.id'],
    name: ['custom_fields_data.name', 'custom_fields_data.nama', 'main_data.name', 'customer.name', 'name'],
    email: ['custom_fields_data.email', 'main_data.email', 'customer.email', 'email'],
    phone: ['custom_fields_data.phone', 'custom_fields_data.telefon', 'main_data.phone', 'customer.phone', 'phone'],
    amount: ['amount', 'total', 'total_amount', 'main_data.amount'],
    formable_id: ['formable_id', 'form_id', 'main_data.formable_id'],
    field_value: []
  };
}

/** Merge a user-supplied map (JSON string or object) over the defaults. */
function resolveFieldMap(custom) {
  var base = defaultFieldMap();
  var c = custom;
  if (typeof c === 'string') { try { c = JSON.parse(c); } catch (e) { c = null; } }
  if (c && typeof c === 'object') {
    for (var k in c) if (Object.prototype.hasOwnProperty.call(c, k) && c[k] && c[k].length) base[k] = [].concat(c[k]);
  }
  return base;
}

function _getPath(obj, path) {
  var cur = obj;
  var segs = String(path).split('.');
  for (var i = 0; i < segs.length; i++) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = cur[segs[i]];
  }
  return cur;
}

/** First non-empty value among candidate paths. */
function _pick(obj, paths) {
  for (var i = 0; i < (paths || []).length; i++) {
    var v = _getPath(obj, paths[i]);
    if (v !== undefined && v !== null && typeof v !== 'object' && String(v).trim() !== '') return v;
  }
  return null;
}

function normalizePhone(raw) {
  if (raw === null || raw === undefined) return null;
  var d = String(raw).replace(/\D/g, '');
  if (!d) return null;
  if (d.indexOf('60') === 0) {
    // keep
  } else if (d.indexOf('0') === 0) {
    d = '60' + d.slice(1);
  } else if (d.indexOf('1') === 0) {
    d = '60' + d;
  } else {
    return null;
  }
  return /^601\d{8,9}$/.test(d) ? d : null;
}

function normalizeEmail(raw) {
  return String(raw === null || raw === undefined ? '' : raw).trim().toLowerCase();
}

function extractOrderRef(body, fieldMap) {
  var obj = body;
  if (typeof obj === 'string') { try { obj = JSON.parse(obj); } catch (e) { return null; } }
  if (!obj || typeof obj !== 'object') return null;
  var v = _pick(obj, (fieldMap || defaultFieldMap()).order);
  return v === null ? null : String(v).trim();
}

function isPaidLive(txn) {
  if (!txn || typeof txn !== 'object') return false;
  var paid = txn.is_paid === true || txn.is_paid === 1 || txn.is_paid === '1' || txn.is_paid === 'true';
  return Number(txn.status) === 3 && paid && String(txn.type || '').trim().toLowerCase() === 'live';
}

function buyerFromTxn(txn, fieldMap) {
  var fm = fieldMap || defaultFieldMap();
  var name = _pick(txn, fm.name);
  return {
    name: name === null ? '' : String(name).trim().replace(/\s+/g, ' '),
    email: normalizeEmail(_pick(txn, fm.email)),
    phone: normalizePhone(_pick(txn, fm.phone))
  };
}

/**
 * rows = active bcl_form_map rows: {package_id, formable_id, amount|null, field_value|null}.
 * Order: formable_id (none -> mapped:false), then amount within tolerance, then field value.
 */
function matchPackage(txn, rows, opts) {
  opts = opts || {};
  var tol = typeof opts.tolerance === 'number' ? opts.tolerance : 3;
  var fm = opts.fieldMap || defaultFieldMap();
  var fid = _pick(txn, fm.formable_id);
  var cand = [];
  for (var i = 0; i < (rows || []).length; i++) {
    if (fid === null || String(rows[i].formable_id) === String(fid)) cand.push(rows[i]);
  }
  if (fid !== null && cand.length === 0) return { packageId: null, mapped: false };
  var amt = parseFloat(_pick(txn, fm.amount));
  var fv = _pick(txn, fm.field_value);
  var j;
  if (!isNaN(amt)) {
    for (j = 0; j < cand.length; j++) {
      if (cand[j].amount !== null && cand[j].amount !== undefined && Math.abs(amt - Number(cand[j].amount)) <= tol) {
        return { packageId: cand[j].package_id, mapped: true };
      }
    }
  }
  if (fv !== null) {
    for (j = 0; j < cand.length; j++) {
      if (cand[j].field_value && String(cand[j].field_value).trim().toLowerCase() === String(fv).trim().toLowerCase()) {
        return { packageId: cand[j].package_id, mapped: true };
      }
    }
  }
  // A lone row with no amount/field constraint is a plain formable_id mapping.
  if (cand.length === 1 && (cand[0].amount === null || cand[0].amount === undefined) && !cand[0].field_value) {
    return { packageId: cand[0].package_id, mapped: true };
  }
  return { packageId: null, mapped: true };
}

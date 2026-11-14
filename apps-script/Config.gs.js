// Script Properties accessors. Set these in Project Settings > Script properties (never commit values):
// WORKER_URL, INTERNAL_SECRET, TICKET_SECRET, BCL_API_BASE (https://bcl.my/api), BCL_API_TOKEN, BCL_WEBHOOK_KEY,
// BCL_FIELD_MAP (JSON of candidate paths per field), BCL_FEE_TOLERANCE (default 3), APP_URL,
// DRIVE_BACKUP_FOLDER_ID. (No HornetHive key: the nightly backup reads through the Worker's /internal/export.)
var SUPPORT_WA = '60134417042';

function prop(name, fallback) {
  var v = PropertiesService.getScriptProperties().getProperty(name);
  return v === null || v === '' ? (fallback === undefined ? null : fallback) : v;
}

function requireProp(name) {
  var v = prop(name);
  if (v === null) throw new Error('Script property missing: ' + name);
  return v;
}

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

function feeTolerance() {
  var n = parseFloat(prop('BCL_FEE_TOLERANCE', '3'));
  return isNaN(n) ? 3 : n;
}

function fieldMap() {
  return resolveFieldMap(prop('BCL_FIELD_MAP'));
}

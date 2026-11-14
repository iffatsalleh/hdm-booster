// Nightly backup (03:00 MYT trigger): every table via the HornetHive REST API with the read key, as JSON files in
// DRIVE_BACKUP_FOLDER_ID/YYYY-MM-DD/<table>.json. Dated folders older than 30 days are deleted.
// Script Properties: HIVE_API_BASE, HIVE_DB_ID, HIVE_READ_KEY, DRIVE_BACKUP_FOLDER_ID.
var BACKUP_PAGE_SIZE = 1000;
var BACKUP_RETENTION_DAYS = 30;
var MYT_OFFSET_MS = 8 * 60 * 60 * 1000;

// Fixed list (never user input) with a deterministic ORDER BY for stable pagination.
var BACKUP_TABLES = [
  { name: 'items', order: 'key' },
  { name: 'packages', order: 'id' },
  { name: 'package_items', order: 'package_id, item_key' },
  { name: 'batches', order: 'id' },
  { name: 'profiles', order: 'id' },
  { name: 'user_roles', order: 'user_id, role' },
  { name: 'audit_logs', order: 'id' },
  { name: 'app_settings', order: 'key' },
  { name: 'manual_grants', order: 'id' },
  { name: 'purchases', order: 'id' },
  { name: 'bcl_form_map', order: 'id' },
  { name: 'bcl_webhook_log', order: 'id' },
  { name: 'email_queue', order: 'id' },
  { name: 'rate_attempts', order: 'id' },
  { name: 'access_codes', order: 'id' },
  { name: 'ebooks', order: 'id' },
  { name: 'reading_progress', order: 'user_id, ebook_id' },
  { name: 'groups', order: 'id' },
  { name: 'schema_migrations', order: 'name' }
];

function _pad2(n) { return (n < 10 ? '0' : '') + n; }

function _ymd(d) {
  return d.getUTCFullYear() + '-' + _pad2(d.getUTCMonth() + 1) + '-' + _pad2(d.getUTCDate());
}

/** YYYY-MM-DD in Malaysia time (UTC+8, no DST). */
function mytDateString(nowMs) {
  return _ymd(new Date(nowMs + MYT_OFFSET_MS));
}

/** Folders with a name strictly before this date are expired. */
function backupCutoffDate(nowMs, days) {
  return _ymd(new Date(nowMs + MYT_OFFSET_MS - days * 24 * 60 * 60 * 1000));
}

function isBackupFolderExpired(name, nowMs, days) {
  return /^\d{4}-\d{2}-\d{2}$/.test(name) && name < backupCutoffDate(nowMs, days);
}

function backupSql(table) {
  return 'select to_jsonb(t) as r from ' + table.name + ' t order by ' + table.order + ' limit $1 offset $2';
}

/** Rows may arrive as objects {r: ...} or arrays aligned to columns; r may be a JSON string. */
function parseBackupRow(row, columns) {
  var v;
  if (Array.isArray(row)) {
    var i = columns && columns.indexOf('r') >= 0 ? columns.indexOf('r') : 0;
    v = row[i];
  } else {
    v = row.r;
  }
  return typeof v === 'string' ? JSON.parse(v) : v;
}

/** query(sql, params) -> {columns, rows}. Returns all rows of the table as parsed objects. */
function backupFetchTable(table, query) {
  var out = [];
  var offset = 0;
  while (true) {
    var res = query(backupSql(table), [BACKUP_PAGE_SIZE, offset]);
    var rows = (res && res.rows) || [];
    for (var i = 0; i < rows.length; i++) out.push(parseBackupRow(rows[i], res.columns));
    if (rows.length < BACKUP_PAGE_SIZE) break;
    offset += BACKUP_PAGE_SIZE;
  }
  return out;
}

/** deps: {nowMs, query, writeJson(date, table, rows), listFolderNames(), deleteFolder(name), log(msg)} */
function runBackup_(deps) {
  var date = mytDateString(deps.nowMs);
  var failed = [];
  for (var i = 0; i < BACKUP_TABLES.length; i++) {
    var t = BACKUP_TABLES[i];
    try {
      var rows = backupFetchTable(t, deps.query);
      deps.writeJson(date, t.name, rows);
      deps.log('backup ' + t.name + ': ' + rows.length + ' rows');
    } catch (err) {
      failed.push({ table: t.name, error: String(err).slice(0, 300) });
      deps.log('backup ' + t.name + ' FAILED: ' + err);
    }
  }
  var deleted = [];
  try {
    var names = deps.listFolderNames();
    for (var j = 0; j < names.length; j++) {
      if (!isBackupFolderExpired(names[j], deps.nowMs, BACKUP_RETENTION_DAYS)) continue;
      try {
        deps.deleteFolder(names[j]);
        deleted.push(names[j]);
      } catch (err2) {
        deps.log('backup retention: could not delete ' + names[j] + ': ' + err2);
      }
    }
  } catch (err3) {
    deps.log('backup retention failed: ' + err3);
  }
  return { date: date, failed: failed, deleted: deleted };
}

function backupFailureBody(date, failed) {
  var lines = ['Sandaran HDM Booster ' + date + ': ' + failed.length + ' jadual gagal.', ''];
  for (var i = 0; i < failed.length; i++) lines.push('- ' + failed[i].table + ': ' + failed[i].error);
  lines.push('', 'Semak Executions di Apps Script untuk butiran.');
  return lines.join('\n');
}

function _hiveQuery_(sql, params) {
  var base = requireProp('HIVE_API_BASE').replace(/\/+$/, '');
  var url = base + '/rest/' + encodeURIComponent(requireProp('HIVE_DB_ID')) + '/query';
  var resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + requireProp('HIVE_READ_KEY') },
    payload: JSON.stringify({ query: sql, params: params }),
    muteHttpExceptions: true
  });
  var code = resp.getResponseCode();
  if (code !== 200) throw new Error('hive HTTP ' + code); // never include the body/key in errors
  return JSON.parse(resp.getContentText());
}

function _childFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

/** Time-driven entry (03:00 MYT). */
function nightlyBackup() {
  var root = DriveApp.getFolderById(requireProp('DRIVE_BACKUP_FOLDER_ID'));
  var res = runBackup_({
    nowMs: Date.now(),
    query: _hiveQuery_,
    writeJson: function (date, table, rows) {
      var folder = _childFolder_(root, date);
      var fname = table + '.json';
      var old = folder.getFilesByName(fname); // re-runs the same day replace the file
      while (old.hasNext()) old.next().setTrashed(true);
      folder.createFile(fname, JSON.stringify(rows), 'application/json');
    },
    listFolderNames: function () {
      var names = [];
      var it = root.getFolders();
      while (it.hasNext()) names.push(it.next().getName());
      return names;
    },
    deleteFolder: function (name) {
      var it = root.getFoldersByName(name);
      while (it.hasNext()) it.next().setTrashed(true);
    },
    log: function (m) { Logger.log(m); }
  });
  if (res.failed.length) {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: 'HDM Booster: sandaran malam gagal (' + res.failed.length + ' jadual)',
      body: backupFailureBody(res.date, res.failed),
      name: 'HDM Booster'
    });
  }
  return res;
}

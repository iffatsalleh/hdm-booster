// Nightly backup (03:00 MYT trigger): every table, paged through the Worker's HMAC-signed POST /internal/export
// (no HornetHive key here), as JSON files in DRIVE_BACKUP_FOLDER_ID/YYYY-MM-DD/<table>.json.
// Dated folders older than 30 days are deleted. Script Properties: WORKER_URL, INTERNAL_SECRET, DRIVE_BACKUP_FOLDER_ID.
var BACKUP_PAGE_SIZE = 1000;
var BACKUP_RETENTION_DAYS = 30;
var BACKUP_BUDGET_MS = 5 * 60 * 1000; // Apps Script kills executions at 6 min
var MYT_OFFSET_MS = 8 * 60 * 60 * 1000;

// Fixed list. The Worker holds the same whitelist with each table's ORDER BY key (worker/src/routes/internal.ts).
var BACKUP_TABLES = [
  'items', 'packages', 'package_items', 'batches', 'profiles', 'user_roles', 'audit_logs', 'app_settings',
  'manual_grants', 'purchases', 'bcl_form_map', 'bcl_webhook_log', 'email_queue', 'rate_attempts', 'access_codes',
  'ebooks', 'reading_progress', 'groups', 'schema_migrations'
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

/** workerCall(method, path, body) -> {ok, data:{rows, next}} | {ok:false, reason}. Returns every row of the table.
 *  Errors carry the reason only, never response bodies (row data must not reach the failure email). */
function backupFetchTable(table, workerCall) {
  var out = [];
  var offset = 0;
  while (true) {
    var res = workerCall('POST', '/internal/export', { table: table, offset: offset, limit: BACKUP_PAGE_SIZE });
    if (!res || res.ok !== true) throw new Error('export ' + table + ' failed: ' + String((res && res.reason) || 'no_response'));
    var data = res.data || {};
    var rows = data.rows;
    if (!Array.isArray(rows)) throw new Error('export ' + table + ' failed: bad_response');
    for (var i = 0; i < rows.length; i++) out.push(rows[i]);
    if (data.next === null || data.next === undefined) break;
    if (typeof data.next !== 'number' || data.next <= offset) throw new Error('export ' + table + ' failed: bad_response');
    offset = data.next;
  }
  return out;
}

/** deps: {nowMs, workerCall, writeJson(date, table, rows), listFolderNames(), deleteFolder(name), log(msg), now() clock (default Date.now), budgetMs (default 5 min)}
 *  Retention runs only when every table succeeded, so a long outage never purges the last good backups. */
function runBackup_(deps) {
  var date = mytDateString(deps.nowMs);
  var failed = [];
  var clock = deps.now || Date.now;
  var budget = deps.budgetMs || BACKUP_BUDGET_MS;
  var started = clock();
  for (var i = 0; i < BACKUP_TABLES.length; i++) {
    var t = BACKUP_TABLES[i];
    if (clock() - started > budget) {
      failed.push({ table: t, error: 'timeout' });
      deps.log('backup ' + t + ' skipped: time budget exceeded');
      continue;
    }
    try {
      var rows = backupFetchTable(t, deps.workerCall);
      deps.writeJson(date, t, rows);
      deps.log('backup ' + t + ': ' + rows.length + ' rows');
    } catch (err) {
      failed.push({ table: t, error: String(err).slice(0, 300) });
      deps.log('backup ' + t + ' FAILED: ' + err);
    }
  }
  var deleted = [];
  if (failed.length) {
    deps.log('backup retention skipped: ' + failed.length + ' table(s) failed');
    return { date: date, failed: failed, deleted: deleted };
  }
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

function _childFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

/** Time-driven entry (03:00 MYT). */
function nightlyBackup() {
  var root = DriveApp.getFolderById(requireProp('DRIVE_BACKUP_FOLDER_ID'));
  var res = runBackup_({
    nowMs: Date.now(),
    workerCall: workerCall,
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

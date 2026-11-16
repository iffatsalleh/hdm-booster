// Purchase email queue. The Worker owns email_queue; we only render by kind, send and report status.
//   purchase_welcome  registrable purchase: register with the same email + phone
//   purchase_added    purchase auto-claimed for an existing account: access added, log in

function appBase_() {
  return requireProp('APP_URL').replace(/#.*$/, '');
}

function welcomeEmail(item) {
  var p = item.payload || {};
  var name = p.name || item.name || 'Pelanggan';
  var pkg = p.package_name || p.package || item.package_name || 'HDM Booster';
  var link = appBase_() + '#/daftar';
  var body = [
    'Salam ' + name + ',',
    '',
    'Terima kasih kerana menyertai ' + pkg + '. Pembelian anda telah kami terima.',
    '',
    'Langkah seterusnya: daftar akaun anda di pautan ini:',
    link,
    '',
    'Penting: daftar menggunakan emel dan nombor telefon yang SAMA seperti yang anda gunakan semasa membeli di BCL, supaya akses anda diaktifkan secara automatik.',
    '',
    'Jika perlukan bantuan, hubungi kami di WhatsApp: https://wa.me/' + SUPPORT_WA,
    '',
    'Terima kasih,',
    'Pasukan HDM Booster'
  ].join('\n');
  return { subject: 'Selamat datang ke ' + pkg + ' - daftar akaun anda', body: body };
}

/** Repeat buyer: the purchase was added to the account that already uses this email + phone. */
function addedEmail(item) {
  var p = item.payload || {};
  var name = p.name || item.name || 'Pelanggan';
  var pkg = p.package_name || p.package || item.package_name || 'HDM Booster';
  var body = [
    'Salam ' + name + ',',
    '',
    'Akses baharu telah ditambah ke akaun anda: ' + pkg + (p.order_ref ? ' (order ' + p.order_ref + ')' : '') + '.',
    '',
    'Anda tidak perlu mendaftar semula. Log masuk dengan akaun sedia ada di pautan ini:',
    appBase_() + '#/masuk',
    '',
    'Kandungan baharu akan dipaparkan dalam aplikasi selepas anda log masuk.',
    '',
    'Jika perlukan bantuan, hubungi kami di WhatsApp: https://wa.me/' + SUPPORT_WA,
    '',
    'Terima kasih,',
    'Pasukan HDM Booster'
  ].join('\n');
  return { subject: 'Akses baharu telah ditambah ke akaun anda - HDM Booster', body: body };
}

/** Text for a queued item by kind (unknown kinds fall back to the welcome text). */
function renderEmail(item) {
  return item && item.kind === 'purchase_added' ? addedEmail(item) : welcomeEmail(item);
}

/** Trigger entry (every 30 min): waits up to 30 s for the script lock, then runs the queue. */
function processEmailQueueTrigger() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return;
  try {
    processEmailQueue_();
  } finally {
    lock.releaseLock();
  }
}

/**
 * One NON-blocking attempt right after a new purchase (webhook / poll / reprocess): if another run holds the
 * lock, skip; the trigger sends the email within 30 minutes. Never delays the webhook answer on a busy lock.
 */
function tryProcessEmailQueueNow_() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(0)) return false;
  try {
    processEmailQueue_();
  } finally {
    lock.releaseLock();
  }
  return true;
}

/** Unlocked inner worker: callers must hold the script lock (the two functions above). */
function processEmailQueue_() {
  var items = workerData('GET', '/internal/email-queue?limit=20');
  var list = (items && items.items) || items || [];
  for (var i = 0; i < list.length; i++) {
    if (MailApp.getRemainingDailyQuota() <= 5) break;
    var it = list[i];
    var sent = false;
    var failMsg = null;
    try {
      var m = renderEmail(it);
      MailApp.sendEmail({ to: it.to_email || it.email, subject: m.subject, body: m.body, name: 'HDM Booster' });
      sent = true;
    } catch (err) {
      failMsg = String(err).slice(0, 500);
    }
    setQueueStatus(it.id, sent ? 'sent' : 'failed', failMsg);
  }
}

/** Never throws; a failed status write is logged (a sent-but-unmarked row may be re-sent, so make it visible). */
function setQueueStatus(id, status, error) {
  try {
    var r = workerCall('POST', '/internal/email-queue/' + encodeURIComponent(id), { status: status, error: error });
    if (!r || r.ok !== true) logBcl(null, 'error', 'email-queue ' + id + ' status ' + status + ' not saved: ' + (r && (r.reason || r.message)));
  } catch (e) {
    try { logBcl(null, 'error', 'email-queue ' + id + ' status ' + status + ' threw: ' + e); } catch (e2) { /* ignore */ }
  }
}

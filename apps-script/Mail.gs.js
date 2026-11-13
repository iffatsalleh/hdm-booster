// Welcome-email queue. The Worker owns email_queue; we only send and report status.

function welcomeEmail(item) {
  var p = item.payload || {};
  var name = p.name || item.name || 'Pelanggan';
  var pkg = p.package_name || p.package || item.package_name || 'HDM Booster';
  var link = requireProp('APP_URL').replace(/#.*$/, '') + '#/daftar';
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

/** Time trigger every 30 min (also called after a purchase). */
function processEmailQueue() {
  var items = workerData('GET', '/internal/email-queue?limit=20');
  var list = (items && items.items) || items || [];
  for (var i = 0; i < list.length; i++) {
    if (MailApp.getRemainingDailyQuota() <= 5) break;
    var it = list[i];
    try {
      var m = welcomeEmail(it);
      MailApp.sendEmail({ to: it.to_email || it.email, subject: m.subject, body: m.body, name: 'HDM Booster' });
      workerCall('POST', '/internal/email-queue/' + encodeURIComponent(it.id), { status: 'sent', error: null });
    } catch (err) {
      workerCall('POST', '/internal/email-queue/' + encodeURIComponent(it.id), { status: 'failed', error: String(err).slice(0, 500) });
    }
  }
}

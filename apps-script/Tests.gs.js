// In-editor self-test for ebook ticket handling. Run runEbookTests() from the Apps Script editor.
// Needs Script Property TICKET_SECRET (and a readable Drive file id in TEST_FILE_ID for the meta check, optional).
// Expected log: "PASS 4/4".
function runEbookTests() {
  var secret = requireProp('TICKET_SECRET');
  var now = nowSec();
  var fileId = prop('TEST_FILE_ID', 'test-file');
  var store = {
    stat: function () { return { bytes: 10, updatedAt: '2026-01-01T00:00:00.000Z' }; },
    readChunk: function () { return ''; }
  };
  var good = gasSignTicket(secret, { ebookId: 'test', fileId: fileId, uid: 'test' }, now);
  var flipped = good.slice(0, -1) + (good.slice(-1) === 'A' ? 'B' : 'A');
  var expired = gasSignTicket(secret, { ebookId: 'test', fileId: fileId, uid: 'test' }, now - 1000);

  var results = [
    ['valid ticket -> meta ok', ebookRespond_({ action: 'ebook.meta', ticket: good }, secret, now, store).ok === true],
    ['1 char changed -> refused', ebookRespond_({ action: 'ebook.meta', ticket: flipped }, secret, now, store).message === EBOOK_EXPIRED_MSG],
    ['expired ticket -> refused', ebookRespond_({ action: 'ebook.meta', ticket: expired }, secret, now, store).message === EBOOK_EXPIRED_MSG],
    ['no ticket -> refused', ebookRespond_({ action: 'ebook.meta' }, secret, now, store).message === EBOOK_EXPIRED_MSG]
  ];
  var pass = 0;
  for (var i = 0; i < results.length; i++) {
    if (results[i][1]) pass++;
    else Logger.log('FAIL: ' + results[i][0]);
  }
  Logger.log((pass === results.length ? 'PASS ' : 'FAIL ') + pass + '/' + results.length);
  return pass === results.length;
}

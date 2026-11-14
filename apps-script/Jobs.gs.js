// Time-driven triggers. Run installTriggers() once manually from the editor (idempotent).
function installTriggers() {
  var wanted = { pollBcl: 10, processEmailQueueTrigger: 30, nightlyBackup: 1 };
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (wanted[existing[i].getHandlerFunction()] !== undefined) ScriptApp.deleteTrigger(existing[i]);
  }
  ScriptApp.newTrigger('pollBcl').timeBased().everyMinutes(10).create();
  ScriptApp.newTrigger('processEmailQueueTrigger').timeBased().everyMinutes(30).create();
  // 03:00-04:00 in the script time zone (appsscript.json timeZone = Asia/Kuala_Lumpur).
  ScriptApp.newTrigger('nightlyBackup').timeBased().atHour(3).everyDays(1).create();
}

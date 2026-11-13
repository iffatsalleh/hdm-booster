// Time-driven triggers. Run installTriggers() once manually from the editor (idempotent).
function installTriggers() {
  var wanted = { pollBcl: 10, processEmailQueueTrigger: 30 };
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (wanted[existing[i].getHandlerFunction()] !== undefined) ScriptApp.deleteTrigger(existing[i]);
  }
  ScriptApp.newTrigger('pollBcl').timeBased().everyMinutes(10).create();
  ScriptApp.newTrigger('processEmailQueueTrigger').timeBased().everyMinutes(30).create();
}

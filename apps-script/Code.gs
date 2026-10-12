// Bound to the "Research Pulse" Sheet. Deploy as Web app: Execute as Me, Access: Anyone.
var TOKEN = 'PUT_SHEET_TOKEN_HERE';
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doPost(e) {
  var b = JSON.parse(e.postData.contents);
  if (b.token !== TOKEN) return out({ error: 'unauthorized' });
  var sh = SpreadsheetApp.getActive().getSheetByName(b.sheet);
  if (!sh) return out({ error: 'no sheet ' + b.sheet });
  if (b.action === 'read') return out({ rows: sh.getDataRange().getDisplayValues() });
  if (b.action === 'append') { b.rows.forEach(function (r) { sh.appendRow(r); }); return out({ ok: true }); }
  return out({ error: 'bad action' });
}

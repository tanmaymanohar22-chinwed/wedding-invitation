function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.getDataAsString());
    const row = [
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.attendance || '',
      data.message || '',
      data.submittedAt || ''
    ];
    sheet.appendRow(row);

    return ContentService.createTextOutput('Success');
  } catch (error) {
    return ContentService.createTextOutput(error.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

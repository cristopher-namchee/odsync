function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    console.log(payload);

    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('It works!')
}

function onMainSheetUpdated() {
  const glairSheet = 'https://docs.google.com/spreadsheets/d/1yKOIFZ7R67XCjiMc6DwwJicHeLx5iv91lVKAYuYrWuU';
}

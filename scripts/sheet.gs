const glairSheet = '1yKOIFZ7R67XCjiMc6DwwJicHeLx5iv91lVKAYuYrWuU';
const bandungSheet = '1XObyMQdM9aFkbyAyg8vMDyYcz9d_WtmlZq3sMihfFQM';

function doPost(e) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  if (!apiKey) {
    return ContentService
      .createTextOutput(
        JSON.stringify({ status: 'error', message: 'App Script is not initalized properly!' })
      ).setMimeType(ContentService.MimeType.JSON);
  }

  const { key, days } = JSON.parse(e.postData.contents);
  if (!key || key !== apiKey) {
    return ContentService
      .createTextOutput(
        JSON.stringify({ status: 'error', message: 'Invalid API Key' })
      ).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(
      JSON.stringify({ status: 'success', message: 'Yay' })
    ).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput('It works!')
}

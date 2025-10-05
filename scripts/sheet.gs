const glairSheet = '1yKOIFZ7R67XCjiMc6DwwJicHeLx5iv91lVKAYuYrWuU';
const bandungSheet = '1XObyMQdM9aFkbyAyg8vMDyYcz9d_WtmlZq3sMihfFQM';

function parseParams(params) {
  const user = (params?.user ?? [])[0] ?? '';
  const days = params?.days ?? [];
  const today = (params?.today ?? [])[0] ?? '';

  if (!user.trim()) {
    throw new Error('Invalid user ID');
  }

  if (!Array.isArray(days) || days.some(day => day > 4)) {
    throw new Error('Invalid WFO day');
  }

  if (!today.trim()) {
    throw new Error('Invalid reference date');
  }

  const todayDate = new Date(today);

  if (isNaN(todayDate.getTime())) {
    throw new Error('Invalid reference date');
  }

  return {
    days,
    user,
    today: todayDate,
  };
}

function writeGlairSheet(params) {
  const ss = SpreadsheetApp.openById(glairSheet);
  const sheet = ss.getSheetByName('WFO NEW');
}

function doGet(e) {
  try {
    const params = parseParams(e.parameters);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + (1 + 7 - nextWeek.getDay()) % 7);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: JSON.stringify(params, null, 2) })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

const glairSheet = '1yKOIFZ7R67XCjiMc6DwwJicHeLx5iv91lVKAYuYrWuU';
const bandungSheet = '1XObyMQdM9aFkbyAyg8vMDyYcz9d_WtmlZq3sMihfFQM';

function parseParams(params) {
  const user = (params?.user ?? [])[0] ?? '';
  const days = params?.days ?? [];

  if (!user.trim()) {
    throw new Error('Invalid user ID');
  }

  if (!Array.isArray(days) || days.some(day => day > 4)) {
    throw new Error('Invalid WFO day');
  }

  return {
    days,
    user,
  };
}

function writeGlairSheet(params, nextMonday) {
  const ss = SpreadsheetApp.openById(glairSheet);
  const sheet = ss.getSheetByName('WFO NEW');

  const cell = sheet.createTextFinder(params.user).findNext();

  if (!cell) {
    throw new Error('User not found');
  }

  const targetRow = cell.getRow();

  for (const day of [...Array(5).keys()]) {
    const targetDate = new Date(nextMonday);
    targetDate.setDate(targetDate.getDate() + day);

    const textValue = `${targetDate.getMonth()}/${targetDate.getDate()}/${targetDate.getFullYear()}`;

    const cell = sheet.createTextFinder(textValue).findNext();

    if (!cell) {
      continue;
    }

    const column = cell.getColumn();

    // clear value first
    sheet.getRange(targetRow, column).setValue(false);
  }

  for (const day of params.day) {
    const targetDate = new Date(nextMonday);
    targetDate.setDate(targetDate.getDate() + day);

    const textValue = `${targetDate.getMonth()}/${targetDate.getDate()}/${targetDate.getFullYear()}`;

    const cell = sheet.createTextFinder(textValue).findNext();

    if (!cell) {
      continue;
    }

    const column = cell.getColumn();

    // then set it!
    sheet.getRange(targetRow, column).setValue(true);
  }
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

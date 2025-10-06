const glairSheet = '1yKOIFZ7R67XCjiMc6DwwJicHeLx5iv91lVKAYuYrWuU';
const bandungSheet = '1XObyMQdM9aFkbyAyg8vMDyYcz9d_WtmlZq3sMihfFQM';

const SLICE_COUNT = 3;
const SAMPLE = '?user=2007226&days=0&days=1&days=2&today=2025-10-03';

function columnToLetter(column) {
  let letter = '';

  while (column > 0) {
    const mod = (column - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    column = Math.floor((column - mod) / 26);
  }

  return letter;
}


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

function writeGlairSheet(user, today, days) {
  const ss = SpreadsheetApp.openById(glairSheet);
  const sheet = ss.getSheetByName('WFO NEW');

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .slice(SLICE_COUNT)
    .map(val => new Date(val))
    .filter(val => !isNaN(val.getTime()))
    .map(date => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`)

  const weekColumns = [...Array(5).keys()].map(day => {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + parseInt(day));

    const stringDate = `${targetDate.getMonth() + 1}/${targetDate.getDate()}/${targetDate.getFullYear()}`;
    const idx = headers.indexOf(stringDate);

    return idx + SLICE_COUNT;
  });

  const wfoColumns = days.map(day => weekColumns[day]);

  // find filled rows
  const cell = sheet.createTextFinder(user).findNext();
  const row = cell.getRow();

  const weekCells = weekColumns.map(col => `${columnToLetter(col)}${row}`); 
  const wfoCells = wfoColumns.map(col => `${columnToLetter(col)}${row}`);

  return {
    weekCells,
    wfoCells,
  };
}

function doGet(e) {
  try {
    const params = parseParams(e.parameters);

    const nextWeek = params.today;
    nextWeek.setDate(nextWeek.getDate() + (1 + 7 - nextWeek.getDay()) % 7);

    const targetCells = writeGlairSheet(params.user, nextWeek, params.days);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: JSON.stringify(targetCells, null, 2) })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

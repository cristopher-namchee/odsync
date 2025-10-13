const glairSheet = "1yKOIFZ7R67XCjiMc6DwwJicHeLx5iv91lVKAYuYrWuU";

const ColumnOffset = 3;

function getColumnFromDate(date, headers) {
  const targetDate = new Date(date);
  const stringDate = `${
    targetDate.getMonth() + 1
  }/${targetDate.getDate()}/${targetDate.getFullYear()}`;
  const idx = headers.indexOf(stringDate);

  return idx + ColumnOffset + 1; // convert to 1-based index
}

function isValidDate(dateString) {
  const probablyDate = new Date(dateString);

  return !isNaN(probablyDate.getTime());
}

function parseParams(params) {
  const user = (params?.user ?? [])[0] ?? "";
  const days = params?.days ?? [];

  if (!user.trim()) {
    throw new Error("Invalid user ID");
  }

  if (!Array.isArray(days) || days.some((day) => !isValidDate(day))) {
    throw new Error("Invalid WFO day(s)");
  }

  return {
    days: days.sort().map((day) => new Date(day)),
    user,
  };
}

function getMondayOfTheWeek(date) {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  return monday;
}

function writeGlairSheet(user, days) {
  const ss = SpreadsheetApp.openById(glairSheet);
  const sheet = ss.getSheets()[0];

  // find filled rows
  const cell = sheet.createTextFinder(user).findNext();
  if (!cell) {
    throw new Error("Cannot find corresponding employee in sheet.");
  }

  const row = cell.getRow();
  const refDate = getMondayOfTheWeek(days[0]);

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .slice(ColumnOffset)
    .map((val) => new Date(val))
    .filter((val) => !isNaN(val.getTime()))
    .map(
      (date) => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    );

  const weekColumns = Array.from({ length: 5 }, (_, day) =>
    getColumnFromDate(
      new Date(refDate).setDate(new Date(refDate).getDate() + day),
      headers
    )
  );

  const wfoColumns = days.map((day) => getColumnFromDate(day, headers));

  for (const column of weekColumns) {
    const range = sheet.getRange(row, column);
    range.setValue(wfoColumns.includes(column) ? true : false);
  }
}

function doGet(e) {
  try {
    const params = parseParams(e.parameters);

    writeGlairSheet(params.user, params.days);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: err.message,
        mail: Session.getEffectiveUser().getEmail(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

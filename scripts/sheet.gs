const employeeId = PropertiesService.getScriptProperties().getProperty('EMPLOYEE_ID');
const bandungSheet = PropertiesService.getScriptProperties().getProperty('BANDUNG_SHEET_ID');

// this should be static
const glairSheet = '1yKOIFZ7R67XCjiMc6DwwJicHeLx5iv91lVKAYuYrWuU';

const Location = {
  Home: 'HOME',
  Office: 'OFFICE'
};

const ColumnOffset = 3;

function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function isValidDate(date) {
  return !isNaN(new Date(date).getTime());
}

function getDateLocation(date) {
  const events = CalendarApp.getEventsForDay(date);
  const workingLocation = events.find(event => event.getEventType() === CalendarApp.EventType.WORKING_LOCATION);

  // assume Home if not filled
  if (!workingLocation) {
    return Location.Home;
  }

  // for some reason, WORKING_LOCATION returns information via title instead of location
  return workingLocation.getTitle() === Location.Home ? Location.Home : Location.Office;
}

function getWorkweekLocations(date) {
  return [...Array(5).keys()].reduce((acc, inc) => {
    const targetDate = new Date(date);
    targetDate.setDate(targetDate.getDate() + inc);

    acc[formatDate(targetDate)] = getDateLocation(targetDate);
  }, {});
}

// stolen from https://stackoverflow.com/questions/33078406/getting-the-date-of-next-monday
function getNextMonday() {
  const today = new Date(); 
  today.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);

  return today;
}

function updateGlairSheet(locations) {
  const ss = SpreadsheetApp.openById(glairSheet);
  const sheet = ss.getSheets()[0];

  // find user's row
  const userCell = sheet.createTextFinder(employeeId).findNext();
  if (!userCell) {
    throw new Error('Cannot find corresponding employee in GLAIR sheet. Please double-check the EMPLOYEE_ID variable.');
  }

  const row = userCell.getRow();

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(val => isValidDate(val) ? formatDate(new Date(val)) : val);

  for (const [date, location] of Object.entries(locations)) {
    const column = headers.findIndex(date);
    if (!column) {
      throw new Error('WFO sheet is outdated. Please sync the WFO sheet manually.');
    }

    // Google Spreadsheet is 1-based, in contrast of 0-based that we use to store arrays
    const range = sheet.getRange(row, column + 1);
    range.setValue(location === Location.Office ? true : false);
  }
}

// Really tricky, might not work
function getName() {
  const emailSubject = GmailApp.getDrafts()[0].getMessage().getHeader("From");
  const rawName = emailSubject.match(/"([^"]*)"/)[1];

  return rawName.replace(/\.+/, '').trim();
}

function updateBandungSheet() {
  const ss = SpreadsheetApp.openById(bandungSheet);
  const sheet = ss.getSheets()[0];

  const userCell = sheet.createTextFinder(getName()).findNext();
  if (!userCell) {
    throw new Error('Cannot find corresponding employee in Bandung Sheet. getName() might not work properly. Please patch your own script with the correct value');
  }

  const row = userCell.getRow();
}

function executeScheduledTask() {
  const self = Session.getActiveUser().getEmail();

  try {
    if (!employeeId) {
      throw new Error('It seems like you haven\'t set up the script properly. Please follow the instruction from the README file carefully.');
    }

    const referenceDate = getNextMonday();
    const workweekLocations = getWorkweekLocations(referenceDate);

    updateGlairSheet(workweekLocations);
    if (bandungSheet) {
      updateBandungSheet(workweekLocations);
    }

    GmailApp.sendEmail(self, '✅ WFO sheet has been successfully synchronized');
  } catch (err) {
    GmailApp.sendEmail(self, '⚠️ Failed to synchronize WFO sheet', 'The script encountered the following issue: ');
  }
}

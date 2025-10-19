const employeeId = PropertiesService.getScriptProperties().getProperty('EMPLOYEE_ID');
const glairSheet = PropertiesService.getScriptProperties().getProperty('GLAIR_SHEET_ID');
const bandungSheet = PropertiesService.getScriptProperties().getProperty('BANDUNG_SHEET_ID');

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
  });
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

  // find filled rows
  const cell = sheet.createTextFinder(employeeId).findNext();
  if (!cell) {
    throw new Error('Cannot find corresponding employee in sheet. Please double-check the EMPLOYEE_ID variable.');
  }

  const row = cell.getRow();

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

function executeScheduledTask() {
  const self = Session.getActiveUser().getEmail();

  try {
    if (!employeeId || !glairSheet) {
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

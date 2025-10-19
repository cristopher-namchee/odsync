const employeeId = PropertiesService.getScriptProperties().getProperty('EMPLOYEE_ID');
const bandungSheet = PropertiesService.getScriptProperties().getProperty('BANDUNG_SHEET_ID');

// this should be static
const glairSheet = '1yKOIFZ7R67XCjiMc6DwwJicHeLx5iv91lVKAYuYrWuU';

const Location = {
  Home: 'Home',
  Office: 'Office'
};

const BandungColumnOffset = 5;

function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function prettyPrintDate(date) {
  return date.toLocaleDateString('en-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
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

    return acc;
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
    const column = headers.findIndex((header) => header === date);
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

function updateBandungSheet(locations) {
  const ss = SpreadsheetApp.openById(bandungSheet);
  const sheet = ss.getSheets()[3];

  const userCell = sheet.createTextFinder(getName()).findNext();
  if (!userCell) {
    throw new Error('Cannot find corresponding employee in Bandung Sheet. getName() might not work properly. Please patch your own script with the correct value');
  }

  const row = userCell.getRow();

  for (const [date, location] of Object.entries(locations)) {
    // Monday starts at 1, so we substract by 1 first, then add the column offset
    const day = new Date(date).getDay() - 1 + BandungColumnOffset;

    const range = sheet.getRange(row, day);
    range.setValue(location === Location.Office ? true : false);
  }
}

function synchronizeWFOSheet() {
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

    GmailApp.sendEmail(self, '✅ [WFO Sheet] Synchronization Successful', '', {
      htmlBody: `
        <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2>✅ Synchronization Successful</h2>

          <p>The <b>WFO Sheet Synchronizer</b> has successfully synchronized your ${bandungSheet ? 'GLAIR and Bandung' : 'GLAIR'} WFO sheet with the following parameters:</p>

          <table style="border-collapse: collapse; width: 100%; max-width: 400px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Date</th>
                <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Location</th>
              </tr>
            </thead>
      
            <tbody>
              ${Object.entries(workweekLocations)
                .map(
                  ([date, place]) => `
                    <tr>
                      <td style="padding: 8px 12px; border: 1px solid #ddd;">${prettyPrintDate(new Date(date))}</td>
                      <td style="padding: 8px 12px; border: 1px solid #ddd;">${place}</td>
                    </tr>
                  `
                )
              .join('')}
            </tbody>
          </table>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

          <p style="font-size: 13px; color: #666;">
            This is an automated message from your <b>WFO Sheet Automation</b> script.
          </p>
        </div>`,
    });
  } catch (err) {
    GmailApp.sendEmail(self, '⚠️ [WFO Sheet] Synchronization Failed', '', {
      htmlBody: `
        <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #d93025;">⚠️ Synchronization Failed</h2>

          <p>The <b>WFO Sheet Synchronizer</b> encountered an error during execution:</p>

          <div style="background-color: #f8d7da; border: 1px solid #f5c2c7; padding: 10px 15px; border-radius: 6px; margin: 10px 0;">
            <pre style="margin: 0; font-family: Consolas, monospace; white-space: pre-wrap;">${err.message}</pre>
          </div>

          <p>
            <b>Recommended Actions:</b>
          </p>
      
          <ol>
            <li>Check the resulting sheet for partial or incorrect data.</li>
            <li>Review the Apps Script logs (<code>Executions</code> tab).</li>
          </ol>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

          <p style="font-size: 13px; color: #666;">
            This is an automated message from your <b>WFO Sheet Automation</b> script.
          </p>
        </div>`,
    });
  }
}

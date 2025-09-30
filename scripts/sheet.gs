const glairSheet = '1yKOIFZ7R67XCjiMc6DwwJicHeLx5iv91lVKAYuYrWuU';
const bandungSheet = '1XObyMQdM9aFkbyAyg8vMDyYcz9d_WtmlZq3sMihfFQM';

function parseParams(params) {
  const user = (params?.user ?? [])[0] ?? '';
  const days = params?.days ?? [];

  if (!user.endsWith('@gdplabs.id')) {
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

function checkGlairSheet() {
  
}

function doGet(e) {
  try {
    const params = parseParams(e.parameters);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: JSON.stringify(params, null, 2) })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

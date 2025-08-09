const { google } = require('googleapis');

const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Items';

function getJwtClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey || !SHEET_ID) {
    throw new Error('Missing required env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, SHEET_ID');
  }
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getSheets() {
  const auth = getJwtClient();
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

const HEADERS = ['id', 'name', 'category', 'purchase_date', 'price', 'status', 'notes', 'image_url'];

function rowToItem(row, rowNumber) {
  // Always use the sheet row number as the API id to ensure CRUD targets the correct row
  const [, name, category, purchase_date, price, status, notes, image_url] = [...row, '', '', '', '', '', '', ''].slice(0, 8);
  return {
    id: rowNumber,
    name: name || '',
    category: category || '',
    purchase_date: purchase_date || '',
    price: price ? Number(price) : 0,
    status: status || '',
    notes: notes || '',
    image_url: image_url || '',
  };
}

function itemToRow(item) {
  return [
    item.id || '',
    item.name || '',
    item.category || '',
    item.purchase_date || '',
    item.price != null ? Number(item.price) : '',
    item.status || '',
    item.notes || '',
    item.image_url || '',
  ];
}

async function ensureHeaderRow(sheets) {
  const range = `${SHEET_NAME}!A1:H1`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
  const values = res.data.values || [];
  if (values.length === 0 || HEADERS.some((h, i) => (values[0][i] || '') !== h)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
  }
}

async function getAllItems() {
  const sheets = await getSheets();
  await ensureHeaderRow(sheets);
  const range = `${SHEET_NAME}!A2:H`; // data rows
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
  const rows = res.data.values || [];
  // Row numbers start at 2 for first data row
  return rows.map((row, idx) => rowToItem(row, idx + 2));
}

async function appendItem(item) {
  const sheets = await getSheets();
  await ensureHeaderRow(sheets);
  // Append values. We'll compute the new row index from the response range
  const toWrite = itemToRow({ ...item, id: '' });
  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:H`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [toWrite] },
    includeValuesInResponse: true,
    responseValueRenderOption: 'UNFORMATTED_VALUE',
  });
  const updatedRange = appendRes.data.updates?.updatedRange || `${SHEET_NAME}!A2:H2`;
  const match = updatedRange.match(/!(?:[A-Z]+)(\d+):/);
  const rowId = match ? Number(match[1]) : 2;
  // Write the row index into column A to keep an id in the sheet too
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowId}:A${rowId}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[rowId]] },
  });

  return { ...item, id: rowId };
}

async function updateItemByRowId(rowId, partial) {
  const sheets = await getSheets();
  await ensureHeaderRow(sheets);
  // Fetch current row
  const getRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowId}:H${rowId}`,
  });
  const existingRow = getRes.data.values?.[0] || [];
  const existing = rowToItem(existingRow, rowId);
  if (!existing.name && existingRow.length === 0) {
    const error = new Error(`Row ${rowId} not found`);
    error.statusCode = 404;
    throw error;
  }
  const merged = { ...existing, ...partial, id: rowId };
  const toWrite = itemToRow(merged);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowId}:H${rowId}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [toWrite] },
  });
  return merged;
}

async function deleteItemByRowId(rowId) {
  const sheets = await getSheets();
  await ensureHeaderRow(sheets);
  if (rowId < 2) {
    const error = new Error('Cannot delete header row');
    error.statusCode = 400;
    throw error;
  }
  // Sheets API uses 0-based indexes and endIndex is exclusive
  const requests = [
    {
      deleteDimension: {
        range: {
          sheetId: await getSheetIdByTitle(sheets, SHEET_NAME),
          dimension: 'ROWS',
          startIndex: rowId - 1,
          endIndex: rowId,
        },
      },
    },
  ];
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests },
  });
}

async function getSheetIdByTitle(sheets, title) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const target = meta.data.sheets.find((s) => s.properties.title === title);
  if (!target) {
    throw new Error(`Sheet with title "${title}" not found`);
  }
  return target.properties.sheetId;
}

module.exports = {
  getAllItems,
  appendItem,
  updateItemByRowId,
  deleteItemByRowId,
};



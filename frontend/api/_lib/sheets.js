import { google } from 'googleapis';

const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'items';
const HEADERS = ['id', 'name', 'category', 'purchase_date', 'price', 'status', 'notes', 'image_url'];

function getJwtClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key || !SHEET_ID) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY / SHEET_ID');
  }
  return new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
}

async function getSheets() {
  const auth = getJwtClient();
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

function rowToItem(row, rowNumber) {
  const [, name, category, purchase_date, price, status, notes, image_url] = [...(row || []), '', '', '', '', '', '', ''].slice(0, 8);
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

export async function getAllItems() {
  const sheets = await getSheets();
  await ensureHeaderRow(sheets);
  const range = `${SHEET_NAME}!A2:H`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
  const rows = res.data.values || [];
  return rows.map((row, idx) => rowToItem(row, idx + 2));
}

export async function appendItem(item) {
  const sheets = await getSheets();
  await ensureHeaderRow(sheets);
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
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowId}:A${rowId}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[rowId]] },
  });
  return { ...item, id: rowId };
}

export async function updateItemByRowId(rowId, partial) {
  const sheets = await getSheets();
  await ensureHeaderRow(sheets);
  const getRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${SHEET_NAME}!A${rowId}:H${rowId}` });
  const existingRow = getRes.data.values?.[0] || [];
  const existing = rowToItem(existingRow, rowId);
  if (!existingRow.length) {
    const err = new Error(`Row ${rowId} not found`);
    err.statusCode = 404;
    throw err;
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

export async function deleteItemByRowId(rowId) {
  const sheets = await getSheets();
  await ensureHeaderRow(sheets);
  if (rowId < 2) {
    const e = new Error('Cannot delete header row');
    e.statusCode = 400;
    throw e;
  }
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const target = meta.data.sheets.find((s) => s.properties.title === SHEET_NAME);
  if (!target) throw new Error(`Sheet ${SHEET_NAME} not found`);
  const sheetId = target.properties.sheetId;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: rowId - 1, endIndex: rowId },
          },
        },
      ],
    },
  });
}



import { getSpreadsheetId } from './google.js'
import { google } from 'googleapis'

// Sheet and column layout
export const INVENTORY_SHEET = 'Inventory'
export const INVENTORY_COLUMNS = [
  'id',
  'name',
  'category',
  'purchase_date',
  'purchase_price',
  'description',
  'status',
  'resale_price',
  'photos',
]

export function normalizeRowToItem(row = []) {
  const obj = {}
  INVENTORY_COLUMNS.forEach((key, idx) => {
    obj[key] = row[idx] ?? ''
  })
  // Coercions
  if (obj.purchase_price !== '') obj.purchase_price = Number(obj.purchase_price)
  if (obj.resale_price !== '') obj.resale_price = Number(obj.resale_price)
  return obj
}

export function itemToRow(item) {
  return INVENTORY_COLUMNS.map((key) => item?.[key] ?? '')
}

function sheetsClient(auth) {
  return google.sheets({ version: 'v4', auth })
}

function valuesRange(rangeA1) {
  const sheetName = INVENTORY_SHEET
  return `${sheetName}!${rangeA1}`
}

export async function listItems(auth, { category, status } = {}) {
  const sheets = sheetsClient(auth)
  const spreadsheetId = getSpreadsheetId()
  const range = valuesRange('A2:I') // skip header row
  const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range })
  const rows = data.values || []
  let items = rows.map(normalizeRowToItem)
  if (category) items = items.filter(i => String(i.category).toLowerCase() === String(category).toLowerCase())
  if (status) items = items.filter(i => String(i.status).toLowerCase() === String(status).toLowerCase())
  return items
}

export async function getItemById(auth, id) {
  const items = await listItems(auth)
  return items.find(i => i.id === id) || null
}

export async function createItem(auth, item) {
  const sheets = sheetsClient(auth)
  const spreadsheetId = getSpreadsheetId()
  const row = itemToRow(item)
  const range = valuesRange('A2:I')
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  })
  return item
}

export async function updateItem(auth, id, updates) {
  // Read current rows to find index for the id
  const sheets = sheetsClient(auth)
  const spreadsheetId = getSpreadsheetId()
  const listRange = valuesRange('A2:I')
  const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range: listRange })
  const rows = data.values || []
  const index = rows.findIndex(r => r[0] === id)
  if (index === -1) return null
  const current = normalizeRowToItem(rows[index])
  const next = { ...current, ...updates, id }
  const row = itemToRow(next)
  const rowNumber = index + 2 // account for header row
  const updateRange = valuesRange(`A${rowNumber}:I${rowNumber}`)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: updateRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  })
  return next
}

export async function deleteItem(auth, id) {
  // Deleting requires batchUpdate with DeleteDimensionRequest
  const sheets = sheetsClient(auth)
  const spreadsheetId = getSpreadsheetId()
  // Find row index
  const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range: valuesRange('A2:A') })
  const ids = data.values?.map(r => r[0]) || []
  const index = ids.findIndex(v => v === id)
  if (index === -1) return false
  const rowIndexZeroBased = index + 1 // zero-based row in the sheet (0 = header, 1 = first data row)
  // Need sheetId
  const { data: meta } = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.sheets.find(s => s.properties.title === INVENTORY_SHEET)
  const sheetId = sheet.properties.sheetId
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: rowIndexZeroBased, endIndex: rowIndexZeroBased + 1 },
          },
        },
      ],
    },
  })
  return true
}

export async function markItemSold(auth, id, resalePrice) {
  return updateItem(auth, id, { status: 'sold', resale_price: resalePrice ?? '' })
}



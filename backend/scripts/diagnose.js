require('dotenv').config();
const { google } = require('googleapis');

async function main() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const spreadsheetId = process.env.SHEET_ID;
  if (!clientEmail || !privateKey || !spreadsheetId) {
    console.error('Missing env vars');
    process.exit(1);
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  await auth.authorize();
  const sheets = google.sheets({ version: 'v4', auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const titles = meta.data.sheets.map(s => ({
    title: s.properties.title,
    sheetId: s.properties.sheetId,
    rows: s.properties.gridProperties?.rowCount,
    cols: s.properties.gridProperties?.columnCount,
  }));
  console.log('Sheets:', titles);

  for (const t of titles) {
    const range = `${t.title}!A1:H10`;
    try {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      console.log(`Range ${range}:`);
      console.log(res.data.values || []);
    } catch (e) {
      console.log(`Failed to read ${range}:`, e.response?.data || e.message);
    }
  }
}

main().catch((e) => {
  console.error('Error:', e.response?.data || e.message);
  process.exit(1);
});



import { google } from 'googleapis'

const defaultSpreadsheetId = '17v0q7U6kVey1s5hmhywN89PRMbev0V4rI6UlHLcSfIY'

function getEnv(name, fallback = '') {
  return process.env[name] ?? fallback
}

export function getSpreadsheetId() {
  return getEnv('GOOGLE_SHEET_ID', defaultSpreadsheetId)
}

export function createOAuthClient(tokens) {
  const clientId = getEnv('GOOGLE_CLIENT_ID')
  const clientSecret = getEnv('GOOGLE_CLIENT_SECRET')
  const redirectUri = getEnv('OAUTH_REDIRECT_URI')
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth environment variables')
  }
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  if (tokens) oauth2Client.setCredentials(tokens)
  return oauth2Client
}

export function getAuthUrl() {
  const oauth2Client = createOAuthClient()
  const scopes = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ]
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  })
}

export async function exchangeCodeForTokens(code) {
  const oauth2Client = createOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export function oauthClientFromRefreshToken(refreshToken) {
  const oauth2Client = createOAuthClient()
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return oauth2Client
}

export async function getUserInfo(oauth2Client) {
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
  const { data } = await oauth2.userinfo.get()
  return data
}

export async function getSheetRows(oauth2Client, range = 'A1:Z1000') {
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client })
  const spreadsheetId = getSpreadsheetId()
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  })
  return data.values || []
}



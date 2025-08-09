// Vercel serverless functions colocated with frontend
import cors from 'cors';
import express from 'express';
import { getAllItems, appendItem, updateItemByRowId, deleteItemByRowId } from './_lib/sheets.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*'}));
app.use(express.json({ limit: '1mb' }));

app.get('/items', async (req, res) => {
  try {
    const items = await getAllItems();
    res.json({ items });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message || 'Failed' });
  }
});

app.post('/items', async (req, res) => {
  try {
    const created = await appendItem(req.body || {});
    res.status(201).json({ item: created });
  } catch (e) {
    res.status(e.statusCode || 400).json({ error: e.message || 'Failed' });
  }
});

app.put('/items/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await updateItemByRowId(id, req.body || {});
    res.json({ item });
  } catch (e) {
    res.status(e.statusCode || 400).json({ error: e.message || 'Failed' });
  }
});

app.delete('/items/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deleteItemByRowId(id);
    res.json({ ok: true });
  } catch (e) {
    res.status(e.statusCode || 400).json({ error: e.message || 'Failed' });
  }
});

export default app;

export const config = { api: { bodyParser: false } };

export function handler(req, res) {
  return app(req, res);
}



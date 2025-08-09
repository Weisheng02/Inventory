const express = require('express');
const cors = require('cors');
const { getAllItems, appendItem, updateItemByRowId, deleteItemByRowId } = require('./sheets');

const app = express();

// CORS
const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));
app.options('*', cors({ origin: allowedOrigin }));

app.use(express.json({ limit: '1mb' }));

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// GET /items - list all items
app.get('/items', async (req, res) => {
  try {
    const items = await getAllItems();
    res.json({ items });
  } catch (err) {
    console.error('GET /items error', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// POST /items - create item
app.post('/items', async (req, res) => {
  try {
    const item = sanitizeItem(req.body || {});
    validateItemForCreate(item);
    const created = await appendItem(item);
    res.status(201).json({ item: created });
  } catch (err) {
    console.error('POST /items error', err);
    const status = err.statusCode || 400;
    res.status(status).json({ error: err.message || 'Failed to create item' });
  }
});

// PUT /items/:id - update item by row id (sheet row number)
app.put('/items/:id', async (req, res) => {
  try {
    const rowId = parseInt(req.params.id, 10);
    if (Number.isNaN(rowId) || rowId < 2) {
      return res.status(400).json({ error: 'Invalid id. Must be a sheet row number >= 2.' });
    }
    const partial = sanitizeItem(req.body || {});
    const updated = await updateItemByRowId(rowId, partial);
    res.json({ item: updated });
  } catch (err) {
    console.error('PUT /items/:id error', err);
    const status = err.statusCode || 400;
    res.status(status).json({ error: err.message || 'Failed to update item' });
  }
});

// DELETE /items/:id - delete item by row id
app.delete('/items/:id', async (req, res) => {
  try {
    const rowId = parseInt(req.params.id, 10);
    if (Number.isNaN(rowId) || rowId < 2) {
      return res.status(400).json({ error: 'Invalid id. Must be a sheet row number >= 2.' });
    }
    await deleteItemByRowId(rowId);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /items/:id error', err);
    const status = err.statusCode || 400;
    res.status(status).json({ error: err.message || 'Failed to delete item' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

function sanitizeItem(input) {
  return {
    name: typeof input.name === 'string' ? input.name.trim() : '',
    category: typeof input.category === 'string' ? input.category.trim() : '',
    purchase_date: typeof input.purchase_date === 'string' ? input.purchase_date.trim() : '',
    price: typeof input.price === 'number' ? input.price : parseFloat(input.price) || 0,
    status: typeof input.status === 'string' ? input.status.trim() : '',
    notes: typeof input.notes === 'string' ? input.notes.trim() : '',
    image_url: typeof input.image_url === 'string' ? input.image_url.trim() : '',
  };
}

function validateItemForCreate(item) {
  if (!item.name) {
    const error = new Error('Field "name" is required');
    error.statusCode = 400;
    throw error;
  }
}

module.exports = app;



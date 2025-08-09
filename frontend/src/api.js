const envBase = import.meta.env.VITE_BACKEND_URL;
const BASE_URL = envBase && envBase.trim().length > 0
  ? envBase
  : (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:4000');

export async function fetchItems() {
  const res = await fetch(`${BASE_URL}/items`);
  if (!res.ok) throw new Error('Failed to fetch items');
  const data = await res.json();
  return data.items || [];
}

export async function createItem(item) {
  const res = await fetch(`${BASE_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create');
  return data.item;
}

export async function updateItem(id, partial) {
  const res = await fetch(`${BASE_URL}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update');
  return data.item;
}

export async function deleteItem(id) {
  const res = await fetch(`${BASE_URL}/items/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete');
  return data;
}



import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ItemDetailPage from './pages/ItemDetailPage.jsx'
import AddItemPage from './pages/AddItemPage.jsx'
import EditItemPage from './pages/EditItemPage.jsx'
import './styles/tailwind.css'
import { Toaster } from 'react-hot-toast'
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'items/new', element: <AddItemPage /> },
      { path: 'items/:id', element: <ItemDetailPage /> },
      { path: 'items/:id/edit', element: <EditItemPage /> },
    ],
  },
])

const rootElement = document.getElementById('root')
createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" />
  </React.StrictMode>
)



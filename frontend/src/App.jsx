import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import EditPage from './pages/EditPage.jsx';
import { ToastProvider } from './components/Toast.jsx';

export default function App() {
  const location = useLocation();
  return (
    <ToastProvider>
      <div className="min-h-screen pb-20 liquid">
        <header className="p-4 sticky top-0 z-10 header-glass border-b border-white/40">
          <div className="max-w-md mx-auto flex items-center justify-center">
            <h1 className="text-xl font-semibold">Inventory</h1>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4 fade-in">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<EditPage mode="add" />} />
            <Route path="/edit/:id" element={<EditPage mode="edit" />} />
          </Routes>
        </main>
        <AddBar />
      </div>
    </ToastProvider>
  );
}

function AddBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const triggerSubmit = () => {
    const form = document.getElementById('edit-form');
    if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
  };

  let content = null;
  if (path === '/') {
    content = (
      <>
        <button className="btn-primary flex-1" onClick={() => navigate('/add')}>Add New</button>
      </>
    );
  } else if (path.startsWith('/add')) {
    content = (
      <>
        <button className="btn-secondary flex-1" onClick={() => history.back()}>Cancel</button>
        <button className="btn-primary flex-1" onClick={triggerSubmit}>Add</button>
      </>
    );
  } else if (path.startsWith('/edit/')) {
    content = (
      <>
        <button className="btn-secondary flex-1" onClick={() => history.back()}>Cancel</button>
        <button className="btn-primary flex-1" onClick={triggerSubmit}>Save</button>
      </>
    );
  } else {
    content = (
      <>
        <button className="btn-secondary w-full" onClick={() => navigate('/')}>Home</button>
      </>
    );
  }

  const isHome = path === '/';
  const wrapperExtra = isHome ? 'hidden lg:block' : '';
  return (
    <div className={`fixed bottom-0 left-0 right-0 p-3 bar-glass border-t border-white/40 ${wrapperExtra}`}>
      <div className="max-w-md mx-auto flex gap-3">
        {content}
      </div>
    </div>
  );
}



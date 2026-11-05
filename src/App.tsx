import { useEffect, useState } from 'react';
import HomePage from '@/pages/HomePage';
import AdminPage from '@/pages/AdminPage';

const ADMIN_PATH = '/admin';

function normalisePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

export default function App() {
  const [path, setPath] = useState(() => normalisePath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setPath(normalisePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (path === ADMIN_PATH) {
    return <AdminPage />;
  }

  return <HomePage />;
}

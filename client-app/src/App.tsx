import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// ... שאר הייבואים שלך ...
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { AdminPage } from './pages/AdminPage';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';

// 👇 השינוי כאן: ספרייה חדשה, בלי CSS!
import { Toaster } from 'react-hot-toast';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>טוען...</div>; // (קיצרתי לצורך הדוגמה)
  }

  return (
    <BrowserRouter>
      {/* 👇 הרכיב החדש. שים אותו כאן למעלה */}
      <Toaster position="top-center" />

      {user && <Navbar />}
      <div className="app-container">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/cart" element={user ? <CartPage /> : <Navigate to="/login" />} />
          <Route path="/orders" element={user ? <OrderHistoryPage /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
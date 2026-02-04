import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  console.log("User Info:", user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          🛍️ חנות קנייה
        </a>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user && (
              <>
                <li className="nav-item">
                  <a className="nav-link" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    🏠 בית
                  </a>
                </li>

                {/* 👇 כפתור הניהול - מופיע רק לאדמין! */}
                {user.role === 'ADMIN' && (
                  <li className="nav-item">
                    <a 
                      className="nav-link text-warning fw-bold" 
                      onClick={() => navigate('/admin')} 
                      style={{ cursor: 'pointer' }}
                    >
                      ⚙️ ניהול
                    </a>
                  </li>
                )}

                <li className="nav-item">
                  <a className="nav-link" onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>
                    🛒 עגלה
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
                    📦 הזמנות
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    👤 {user.username || 'משתמש'}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><a className="dropdown-item">{user.email}</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <a 
                        className="dropdown-item text-danger" 
                        onClick={handleLogout}
                        style={{ cursor: 'pointer' }}
                      >
                        התנתק
                      </a>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
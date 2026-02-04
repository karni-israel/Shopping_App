import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import api from '../services/api'; // וודא שיש לך את זה

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ האם אתה בטוח שברצונך למחוק את החשבון?\nפעולה זו אינה הפיכה!")) {
      return;
    }

    try {
      // 1. קריאה לשרת למחיקת המשתמש
      // await api.delete('/users/me'); // <-- בטל הערה זו כשהשרת מוכן
      
      console.log("User deleted successfully");

      // 2. ניקוי אגרסיבי של אחסון מקומי כדי למנוע זיהוי משתמש
      localStorage.removeItem('token'); 
      localStorage.removeItem('user');
      
      // 3. קריאה לפונקציית היציאה של הקונטקסט
      if (logout) await logout();

      // 4. שימוש ב-window.location במקום navigate
      // זה גורם לטעינה מחדש של הדף (Hard Refresh)
      // זה מבטיח שהזיכרון מתנקה לחלוטין ושאי אפשר ללחוץ "אחורה"
      window.location.href = '/login'; 

    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("אירעה שגיאה במחיקת החשבון");
    }
  };

  const handleLogout = () => {
    logout();
    // שימוש ב-replace מונע חזרה אחורה לדף המוגן
    navigate('/login', { replace: true });
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
            {user ? (
              <>
                <li className="nav-item">
                  <a className="nav-link" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    🏠 בית
                  </a>
                </li>

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
                    <li><span className="dropdown-item-text text-muted">{user.email}</span></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <a 
                        className="dropdown-item" 
                        onClick={handleLogout}
                        style={{ cursor: 'pointer' }}
                      >
                        🚪 התנתק
                      </a>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <a 
                        className="dropdown-item text-danger fw-bold" 
                        onClick={handleDeleteAccount}
                        style={{ cursor: 'pointer' }}
                      >
                        🗑️ מחק חשבון
                      </a>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              // אופציונלי: מה להציג אם אין משתמש (למשל כפתור התחברות)
              <li className="nav-item">
                <a className="nav-link" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
                  התחבר
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
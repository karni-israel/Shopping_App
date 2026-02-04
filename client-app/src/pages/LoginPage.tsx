import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  // מצב הטופס: true = התחברות, false = הרשמה
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // שדות הטופס
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // הצגת סיסמה
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // בדיקות תקינות סיסמה בזמן אמת
  const passwordValidations = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLoginMode) {
        // --- לוגיקת התחברות ---
        await login({ username, password });
        toast.success(`ברוך הבא, ${username}! 👋`);
        navigate('/');
      } else {
        // --- לוגיקת הרשמה ---
        
        // 1. בדיקת תקינות סיסמה
        if (!isPasswordValid) {
          toast.error('הסיסמה אינה עומדת בדרישות האבטחה');
          setLoading(false);
          return;
        }

        // 2. בדיקת אימות סיסמה
        if (password !== confirmPassword) {
          toast.error('הסיסמאות אינן תואמות');
          setLoading(false);
          return;
        }

        // 3. שליחה לשרת
        // אנחנו שולחים את האימייל בדיוק כמו שהמשתמש הקליד (גם אם זה 1234@1234)
        // אם לא הוקלד כלום, נייצר אחד אוטומטי
        await register({ 
          username, 
          password, 
          email: email || `${username}@test.com` 
        });
        
        toast.success('נרשמת בהצלחה! התחברנו אוטומטית 🎉');
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'שגיאה בביצוע הפעולה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#e9ecef' }}>
      <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '420px', borderRadius: '15px' }}>
        <div className="card-body p-5">
          
          {/* כותרת דינמית */}
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">{isLoginMode ? 'כניסה לחשבון' : 'יצירת חשבון חדש'}</h2>
            <p className="text-muted small">
              {isLoginMode ? 'הזן את פרטיך כדי להתחבר' : 'הזן את פרטיך כדי להירשם לאתר'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* שם משתמש */}
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="floatingUsername"
                placeholder="שם משתמש"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label htmlFor="floatingUsername">👤 שם משתמש</label>
            </div>

            {/* אימייל (רק בהרשמה) - שונה ל-TYPE TEXT כדי לקבל הכל */}
            {!isLoginMode && (
              <div className="form-floating mb-3">
                <input
                  type="text" 
                  className="form-control"
                  id="floatingEmail"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // הסרתי את ה-required כדי לאפשר שימוש במנגנון האוטומטי אם רוצים
                />
                <label htmlFor="floatingEmail">📧 אימייל (חופשי)</label>
              </div>
            )}

            {/* סיסמה */}
            <div className="input-group mb-3">
              <div className="form-floating flex-grow-1">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="floatingPassword"
                  placeholder="סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="floatingPassword">🔒 סיסמה</label>
              </div>
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderLeft: 'none', zIndex: 0 }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* ולידציה ויזואלית לסיסמה (רק בהרשמה) */}
            {!isLoginMode && (
              <div className="mb-3 small bg-light p-2 rounded border">
                <div className={passwordValidations.length ? 'text-success' : 'text-danger'}>
                  {passwordValidations.length ? '✓' : '✗'} לפחות 8 תווים
                </div>
                <div className={passwordValidations.hasUpper ? 'text-success' : 'text-danger'}>
                  {passwordValidations.hasUpper ? '✓' : '✗'} לפחות אות גדולה אחת (A-Z)
                </div>
                <div className={passwordValidations.hasSpecial ? 'text-success' : 'text-danger'}>
                  {passwordValidations.hasSpecial ? '✓' : '✗'} לפחות תו מיוחד (!@#$...)
                </div>
              </div>
            )}

            {/* אימות סיסמה (רק בהרשמה) */}
            {!isLoginMode && (
              <div className="form-floating mb-4">
                <input
                  type="password"
                  className={`form-control ${confirmPassword && confirmPassword !== password ? 'is-invalid' : ''}`}
                  id="floatingConfirm"
                  placeholder="אימות סיסמה"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <label htmlFor="floatingConfirm">🔐 אימות סיסמה</label>
                {confirmPassword && confirmPassword !== password && (
                  <div className="invalid-feedback">הסיסמאות אינן תואמות</div>
                )}
              </div>
            )}

            {/* כפתור שליחה ראשי */}
            <button 
              type="submit" 
              className={`btn w-100 py-2 fw-bold shadow-sm ${isLoginMode ? 'btn-primary' : 'btn-success'}`}
              disabled={loading || (!isLoginMode && (!isPasswordValid || password !== confirmPassword))}
            >
              {loading ? (
                <div className="spinner-border spinner-border-sm" role="status"></div>
              ) : (
                isLoginMode ? 'התחברות' : 'הרשמה'
              )}
            </button>
          </form>

          {/* כפתור גוגל */}
          <div className="text-center my-3 text-muted position-relative">
            <span className="bg-white px-2 position-relative" style={{ zIndex: 1 }}>או המשך עם</span>
            <hr className="position-absolute top-50 start-0 end-0 m-0" style={{ zIndex: 0 }} />
          </div>

          <a 
            href="http://localhost:3000/auth/google"
            className="btn btn-outline-danger w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S14.86 2 12.2 2 5 6.5 5 12s5.2 9 9 9c5.28 0 9.6-3.79 9.6-9 0-.9-.1-1.8-.35-2.9z"/>
            </svg>
            Google
          </a>

          {/* מעבר בין מצבים */}
          <div className="text-center mt-4 pt-3 border-top">
            <span className="text-muted">
              {isLoginMode ? 'עדיין אין לך חשבון? ' : 'כבר יש לך חשבון? '}
            </span>
            <button 
              onClick={toggleMode}
              className="btn btn-link p-0 text-decoration-none fw-bold"
              style={{ verticalAlign: 'baseline' }}
            >
              {isLoginMode ? 'הירשם עכשיו' : 'התחבר'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};
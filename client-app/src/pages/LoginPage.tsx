import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {Eye, EyeSlash} from 'react-bootstrap-icons';
export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ username, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'שם משתמש או סיסמה שגויים');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register({ username, password, email: `${username}@test.com` });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'שגיאה בהרשמה (אולי הסיסמה קצרה מדי?)');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-5">
          <h2 className="card-title text-center mb-4">🛍️ חנות קניות</h2>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">שם משתמש</label>
              <input
                type="text"
                className="form-control"
                placeholder="הכנס שם משתמש"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">סיסמה🗝️</label>
              <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="הכנס סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={toggleShowPasswordVisibility}
                style={{ borderLeft: 'none' }}
              >
                {showPassword ? <EyeSlash /> : <Eye />}
              </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 mb-2" disabled={loading}>
              {loading ? 'טוען...' : 'התחבר'}
            </button>
          </form>

          <button onClick={handleRegister} className="btn btn-outline-secondary w-100" disabled={loading}>
            {loading ? 'טוען...' : 'הרשמה (משתמש חדש)'}
          </button>

          <div className="text-center my-2 text-muted">או</div>

          <a 
            href="http://localhost:3000/auth/google"
            className="btn btn-danger w-100 text-decoration-none"
          >
            לחץ כאן להתחברות עם google

          </a>
        </div>
      </div>
    </div>
  );
};

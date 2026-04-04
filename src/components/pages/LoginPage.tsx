import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import mathMeme from '../../assets/math-meme.png';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register, logout, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    }
  };

  return (
    <div className="login-page">
      <div className="login-split">
        <div className="login-left animate-fade-in">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">💰</div>
              <h1 className="login-title">
                {isLogin ? 'З поверненням' : 'Створити акаунт'}
              </h1>
              <p className="login-subtitle">
                {isLogin ? 'Увійдіть, щоб керувати сімейним бюджетом' : 'Приєднуйтесь до розумного планування витрат'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Електронна пошта</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="name@example.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Пароль</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button type="submit" className="btn-login">
                {isLogin ? 'Увійти' : 'Зареєструватися'}
              </button>
            </form>

            <div className="login-footer">
              <button 
                className="btn-toggle"
                onClick={() => setIsLogin(!isLogin)} 
              >
                {isLogin ? 'Ще немає акаунта? Створити' : 'Вже є акаунт? Увійти'}
              </button>
            </div>
            
            {user && (
              <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button onClick={logout} className="btn-logout">
                  Вийти з системи
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="login-right" style={{ backgroundImage: `url(${mathMeme})` }}>
          <div className="overlay-gradient"></div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .login-split {
          display: flex;
          min-height: 100vh;
        }
        .login-left {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          z-index: 2;
        }
        .login-right {
          flex: 1.2;
          background-size: cover;
          background-position: center;
          position: relative;
          display: none;
        }
        @media (min-width: 1024px) {
          .login-right {
            display: block;
          }
        }
        .overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(118, 75, 162, 0.4), transparent);
        }
        .login-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-logo {
          font-size: 3rem;
          margin-bottom: 16px;
        }
        .login-title {
          font-size: 1.875rem;
          font-weight: 800;
          color: #1a202c;
          margin: 0 0 8px 0;
          letter-spacing: -0.025em;
        }
        .login-subtitle {
          color: #718096;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #4a5568;
        }
        .form-input {
          padding: 12px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
          background: #f8fafc;
        }
        .form-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }
        .btn-login {
          margin-top: 10px;
          background: #667eea;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s, background 0.2s;
        }
        .btn-login:hover {
          background: #5a67d8;
        }
        .btn-login:active {
          transform: scale(0.98);
        }
        .login-footer {
          margin-top: 24px;
          text-align: center;
        }
        .btn-toggle {
          background: none;
          border: none;
          color: #667eea;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .btn-toggle:hover {
          color: #5a67d8;
          text-decoration: underline;
        }
        .error-message {
          background: #fff5f5;
          color: #c53030;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid #fed7d7;
        }
        .btn-logout {
          width: 100%;
          background: none;
          border: 1px solid #e2e8f0;
          color: #718096;
          padding: 10px;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-logout:hover {
          background: #f7fafc;
          color: #4a5568;
          border-color: #cbd5e0;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

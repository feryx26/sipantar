import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ role, onLogin, onBack }) => {
  const [username, setUsername] = useState('admin01');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const roleLabels = {
    enumerator: '📝 Enumerator',
    dinas: '🏛️ Dinas',
    admin: '⚙️ Administrator'
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/login', {
        username,
        password
      });
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div id="screenLogin" className="modal-overlay show">
      <div className="login-box">
        <div className="login-top">
          <div className="login-role-chip">{roleLabels[role]}</div>
          <div className="login-title">Masuk sebagai {role.charAt(0).toUpperCase() + role.slice(1)}</div>
          <div className="login-sub">Masukkan kredensial akun Anda</div>
          <div className="login-divider"></div>
        </div>
        <div className="login-body">
          {error && <div style={{ color: 'var(--danger)', marginBottom: '10px', fontSize: '12px' }}>{error}</div>}
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Username..." 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button className="btn btn-primary btn-full" style={{ marginTop: '6px' }} onClick={handleLogin}>
            🔑 Masuk ke Sistem
          </button>
          <button className="btn btn-ghost btn-full" style={{ marginTop: '8px', fontSize: '12px' }} onClick={onBack}>
            ← Kembali ke Pilih Peran
          </button>
          <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text3)', marginTop: '14px' }}>
            Demo: gunakan admin01 / demo123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React from 'react';

const Landing = ({ onSelectRole }) => {
  const roles = [
    { id: 'publik', icon: '🌐', title: 'Portal Publik', desc: 'Lihat harga komoditas terkini di semua pasar tanpa login', badge: 'AKSES BEBAS' },
    { id: 'enumerator', icon: '📝', title: 'Enumerator', desc: 'Input harga komoditas per pedagang di lapangan', badge: 'LOGIN' },
    { id: 'dinas', icon: '🏛️', title: 'Dinas Terkait', desc: 'Monitor, analisis inflasi, dan publikasi data harga resmi', badge: 'LOGIN' },
    { id: 'admin', icon: '⚙️', title: 'Administrator', desc: 'Kelola seluruh sistem, pengguna, pasar, dan komoditas', badge: 'LOGIN' },
  ];

  return (
    <div id="screenLanding">
      <div className="landing-inner">
        <div className="landing-logo">
          <div className="landing-icon">🏪</div>
          <div className="landing-name">SIPANTAR</div>
        </div>
        <div className="landing-tagline">SISTEM INFORMASI PASAR & HARGA TERPADU</div>
        <div className="role-grid">
          {roles.map((role) => (
            <div 
              key={role.id} 
              className="role-card" 
              data-role={role.id} 
              onClick={() => onSelectRole(role.id)}
            >
              <span className="role-icon">{role.icon}</span>
              <div className="role-title">{role.title}</div>
              <div className="role-desc">{role.desc}</div>
              <div className="role-badge">{role.badge}</div>
            </div>
          ))}
        </div>
        <div className="landing-note">Demo: semua login dapat diakses • Klik peran untuk masuk</div>
      </div>
    </div>
  );
};

export default Landing;

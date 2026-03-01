import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Login from './components/Login';
import PublicPortal from './components/PublicPortal';
import InternalApp from './components/InternalApp';
import './index.css';

function App() {
  const [screen, setScreen] = useState('public'); // landing, login, public, internal
  const [selectedRole, setSelectedRole] = useState(null);
  const [user, setUser] = useState(null);

  const handleSelectRole = (role) => {
    if (role === 'publik') {
      setScreen('public');
    } else {
      setSelectedRole(role);
      setScreen('login');
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen('internal');
  };

  const handleLogout = () => {
    setUser(null);
    setScreen('landing');
  };

  const goBack = () => {
    setScreen('landing');
  };

  return (
    <div className="App">
      {screen === 'landing' && <Landing onSelectRole={handleSelectRole} />}
      {screen === 'login' && (
        <Login 
          role={selectedRole} 
          onLogin={handleLogin} 
          onBack={goBack} 
        />
      )}
      {screen === 'public' && <PublicPortal onBack={goBack} />}
      {screen === 'internal' && <InternalApp user={user} onLogout={handleLogout} />}
    </div>
  );
}

export default App;

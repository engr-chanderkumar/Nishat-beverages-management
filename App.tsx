import React, { useState, useEffect } from 'react';
import RoleSelection from './components/auth/RoleSelection';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import ForgotPasswordModal from './components/auth/ForgotPasswordModal';
import CounterLogin from './components/auth/CounterLogin';
import CounterView from './components/counter/CounterView';
import { User } from './types';

type AuthState = 'roleSelection' | 'adminLogin' | 'adminSignup' | 'loggedIn' | 'counterLogin' | 'counterView';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('roleSelection');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('ro_plant_logged_in_user');
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            setCurrentUser(user);
            setAuthState('loggedIn');
        } catch (e) {
            localStorage.removeItem('ro_plant_logged_in_user');
        }
    } else {
        // Check counter session with expiration
        const counterSession = localStorage.getItem('ro_plant_counter_session_active');
        if (counterSession) {
            try {
                const sessionData = JSON.parse(counterSession);
                if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
                    setAuthState('counterView');
                } else {
                    // Session expired
                    localStorage.removeItem('ro_plant_counter_session_active');
                    setAuthState('roleSelection');
                }
            } catch (e) {
                // Legacy format or invalid data
                localStorage.removeItem('ro_plant_counter_session_active');
                setAuthState('roleSelection');
            }
        } else {
            setAuthState('roleSelection');
        }
    }
  }, []);

  const handleLogin = (identifier: string, name: string) => {
    const user: User = { name, role: 'Administrator' };
    localStorage.setItem('ro_plant_logged_in_user', JSON.stringify(user));
    setCurrentUser(user);
    setAuthState('loggedIn');
  };

  const handleCounterLogin = () => {
    localStorage.setItem('ro_plant_counter_session_active', 'true');
    setAuthState('counterView');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('ro_plant_logged_in_user');
    localStorage.removeItem('ro_plant_counter_session_active');
    setCurrentUser(null);
    setAuthState('roleSelection');
  };

  const handleSelectRole = (role: 'admin' | 'counter') => {
    if (role === 'admin') {
      setAuthState('adminLogin');
    } else {
      setAuthState('counterLogin');
    }
  };
  
  const showLogin = () => setAuthState('adminLogin');
  const showSignup = () => setAuthState('adminSignup');

  const renderContent = () => {
    switch (authState) {
        case 'roleSelection':
            return <RoleSelection onSelectRole={handleSelectRole} />;
        case 'adminLogin':
            return <Login onLogin={handleLogin} showSignup={showSignup} onForgotPassword={() => setForgotPasswordOpen(true)} />;
        case 'adminSignup':
            return <Signup onSignup={showLogin} showLogin={showLogin} />;
        case 'counterLogin':
            return <CounterLogin onLogin={handleCounterLogin} />;
        case 'loggedIn':
            return <Dashboard user={currentUser} onLogout={handleLogout} />;
        case 'counterView':
            return <CounterView onLogout={handleLogout} />;
        default:
            return <RoleSelection onSelectRole={handleSelectRole} />;
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-primary">
      {renderContent()}
       <ForgotPasswordModal 
        isOpen={isForgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default App;
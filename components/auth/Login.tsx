import React, { useState } from 'react';
import { WaterDropIcon } from '../icons/WaterDropIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeOffIcon } from '../icons/EyeOffIcon';

interface LoginProps {
  onLogin: (identifier: string, name: string) => void;
  showSignup: () => void;
  onForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, showSignup, onForgotPassword }) => {
  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const registeredUserJson = localStorage.getItem('ro_plant_registered_user');
      let registeredUser = null;
      if (registeredUserJson) {
        registeredUser = JSON.parse(registeredUserJson);
      }

      const isDefaultAdmin = identifier === 'admin@roplant.com' && password === 'password';
      const isRegisteredUser = registeredUser && 
        (identifier === registeredUser.email || identifier === registeredUser.phone) && 
        password === registeredUser.password;

      if (isDefaultAdmin) {
        onLogin(identifier, 'Admin User');
      } else if (isRegisteredUser) {
        onLogin(identifier, registeredUser.name);
      } else {
        setError('Invalid credentials. Please try again.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-lightblue">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-xl transform transition-all hover:scale-105">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-brand-accent rounded-full mb-4">
            <WaterDropIcon className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-center text-brand-text-primary">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-md text-brand-text-secondary">
            Sign in to the Nishat Beverages portal
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-accent focus:border-brand-accent focus:z-10 sm:text-sm"
                placeholder="Email or Phone Number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-accent focus:border-brand-accent focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <button 
                type="button"
                onClick={onForgotPassword}
                className="font-medium text-brand-blue hover:text-brand-accent"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-lightblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-400 transition-colors duration-300"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
         <p className="mt-4 text-center text-sm text-brand-text-secondary">
          Don't have an account?{' '}
          <button onClick={showSignup} className="font-medium text-brand-blue hover:text-brand-accent">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
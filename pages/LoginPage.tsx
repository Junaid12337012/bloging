import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GoogleIcon } from '../components/icons';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const LoginPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Simulate Google Sign-In with a mock user
            await login('google.user@example.com');
            navigate('/');
        } catch (err) {
            setError('Failed to sign in with Google. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center py-12"
    >
      <div className="w-full max-w-md px-8 py-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
        <div className="text-center">
            <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">
                Welcome to Inkwell
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Continue with Google to read, write, and connect.
            </p>
        </div>
        
        <div className="mt-8">
            {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center py-3 px-4 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
                <GoogleIcon className="h-5 w-5 mr-3" />
                {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
        </div>

        <p className="mt-8 text-xs text-center text-slate-500 dark:text-slate-400">
            By continuing, you agree to our <Link to="/terms" className="underline hover:text-primary-500">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-primary-500">Privacy Policy</Link>.
        </p>
      </div>
    </motion.div>
  );
};

export default LoginPage;
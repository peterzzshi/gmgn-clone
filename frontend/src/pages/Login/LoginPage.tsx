import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';


import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { toast } from '@/components/ui/Toast/toastStore';
import { useAuthStore } from '@/store/authStore';

import styles from './LoginPage.module.scss';

interface LocationState {
  from?: { pathname: string };
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loadingState, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch {
      // Error is handled by store
    }
  };

  const isLoading = loadingState === 'loading';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <span className={styles.logoText}>GMGN</span>
          <span className={styles.logoDot}>.AI</span>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={e => { void handleSubmit(e); }}>
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

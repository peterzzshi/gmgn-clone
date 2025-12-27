import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { useAuthStore } from '@/store/authStore';

import styles from './RegisterPage.module.scss';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loadingState, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (password !== confirmPassword) {
      // Handle validation error locally
      return;
    }

    try {
      await register({ email, password, confirmPassword });
      navigate('/');
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

        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Start trading today</p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            {...(confirmPassword && password !== confirmPassword
              ? { error: 'Passwords do not match' }
              : {})}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={password !== confirmPassword}
          >
            Create Account
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

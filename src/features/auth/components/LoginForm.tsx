import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordField } from './PasswordField';
import { useAuthStore } from '../store/authStore';
import { loginSchema, type LoginFormData } from '../utils/validation';
import styles from './Forms.module.css';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();
  
  // Destination to redirect back to after successful login
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled and displayed via the store state
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Enter your details to access your account.</p>
      </div>

      {error && (
        <div className={styles.errorAlert} role="alert" aria-live="assertive">
          {error.message}
        </div>
      )}

      <div className={styles.fieldGroup}>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="student@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <div className={styles.passwordWrapper}>
          <PasswordField
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Link to="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className={styles.submitBtn}
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className={styles.footerText}>
        Don't have an account?{' '}
        <Link to="/signup" className={styles.link}>
          Sign up
        </Link>
      </p>
    </form>
  );
};

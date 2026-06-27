import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordField } from './PasswordField';
import { useAuthStore } from '../store/authStore';
import { signupSchema, type SignupFormData } from '../utils/validation';
import styles from './Forms.module.css';

export const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Handled by store
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <div className={styles.header}>
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>Join Vidyut to automate your scholarship journey.</p>
      </div>

      {error && (
        <div className={styles.errorAlert} role="alert" aria-live="assertive">
          {error.message}
        </div>
      )}

      <div className={styles.fieldGroup}>
        <Input
          label="Full Name"
          type="text"
          autoComplete="name"
          placeholder="Student Name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="student@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <PasswordField
          label="Password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordField
          label="Confirm Password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className={styles.submitBtn}
        disabled={isLoading}
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>

      <p className={styles.footerText}>
        Already have an account?{' '}
        <Link to="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </form>
  );
};

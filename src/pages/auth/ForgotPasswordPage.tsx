import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/utils/validation';
import styles from '@/features/auth/components/Forms.module.css';

const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (_data: ForgotPasswordFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className={styles.form} style={{ textAlign: 'center' }}>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.subtitle} style={{ marginBottom: 'var(--space-2xl)' }}>
          We've sent password reset instructions to your email address.
        </p>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Button variant="primary" style={{ width: '100%' }}>Back to Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <div className={styles.header}>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      <div className={styles.fieldGroup}>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="student@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className={styles.submitBtn}
        disabled={isLoading}
      >
        {isLoading ? 'Sending instructions...' : 'Send reset instructions'}
      </Button>

      <p className={styles.footerText}>
        Remember your password?{' '}
        <Link to="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default ForgotPasswordPage;

import React from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthDivider } from '@/features/auth/components/AuthDivider';
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons';

const LoginPage: React.FC = () => {
  return (
    <>
      <LoginForm />
      <AuthDivider />
      <SocialLoginButtons />
    </>
  );
};

export default LoginPage;

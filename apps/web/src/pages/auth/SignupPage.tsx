import React from 'react';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { AuthDivider } from '@/features/auth/components/AuthDivider';
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons';

const SignupPage: React.FC = () => {
  return (
    <>
      <SignupForm />
      <AuthDivider />
      <SocialLoginButtons />
    </>
  );
};

export default SignupPage;

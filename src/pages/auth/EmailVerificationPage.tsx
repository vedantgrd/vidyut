import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from '@/features/auth/components/Forms.module.css';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Simulate verification API call
    if (!token) {
      setStatus('error');
      return;
    }
    
    const verifyToken = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (token === 'expired') {
        setStatus('error');
      } else {
        setStatus('success');
      }
    };
    
    verifyToken();
  }, [token]);

  return (
    <div className={styles.form} style={{ textAlign: 'center' }}>
      {status === 'loading' && (
        <>
          <h1 className={styles.title}>Verifying Email...</h1>
          <p className={styles.subtitle}>Please wait while we verify your email address.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle size={64} style={{ color: '#4ade80', margin: '0 auto var(--space-xl) auto' }} />
          <h1 className={styles.title}>Email Verified</h1>
          <p className={styles.subtitle} style={{ marginBottom: 'var(--space-2xl)' }}>
            Your email has been successfully verified. You now have full access to Vidyut.
          </p>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '100%' }}>Go to Dashboard</Button>
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle size={64} style={{ color: '#ef4444', margin: '0 auto var(--space-xl) auto' }} />
          <h1 className={styles.title}>Verification Failed</h1>
          <p className={styles.subtitle} style={{ marginBottom: 'var(--space-2xl)' }}>
            The verification link is invalid or has expired. Please request a new link.
          </p>
          <Button variant="primary" style={{ width: '100%' }}>Resend Link</Button>
        </>
      )}
    </div>
  );
};

export default EmailVerificationPage;

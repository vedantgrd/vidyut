import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const UnauthorizedPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--space-4xl) var(--space-xl)' }}>
      <ShieldAlert size={64} style={{ color: '#ef4444', marginBottom: 'var(--space-xl)', opacity: 0.8 }} />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-md)' }}>
        Access Denied
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2xl)', maxWidth: 500, margin: '0 auto var(--space-2xl) auto' }}>
        You do not have the required permissions to view this page. If you believe this is an error, please contact support.
      </p>
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
};

export default UnauthorizedPage;

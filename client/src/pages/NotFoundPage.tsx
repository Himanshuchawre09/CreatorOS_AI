import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <main
      role="main"
      aria-labelledby="not-found-title"
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 text-center"
    >
      <span className="text-7xl font-black text-brand-600 dark:text-brand-400 font-mono" aria-hidden="true">
        404
      </span>
      <h1 id="not-found-title" className="text-2xl font-bold mt-4">
        Page Not Found
      </h1>
      <p className="text-sm text-surface-600 dark:text-surface-400 max-w-md mt-2">
        The workspace path or resource you requested could not be found. Check the URL or return
        to your dashboard.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" aria-label="Navigate to Home Page">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" aria-hidden="true" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/dashboard" aria-label="Navigate to Dashboard">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" aria-hidden="true" />}>
            Dashboard
          </Button>
        </Link>
      </div>
    </main>
  );
};

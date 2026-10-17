import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 text-center">
      <span className="text-7xl font-black text-brand-600 dark:text-brand-400 font-mono">
        404
      </span>
      <h1 className="text-2xl font-bold mt-4">Page Not Found</h1>
      <p className="text-sm text-surface-500 dark:text-surface-400 max-w-md mt-2">
        The workspace path or resource you requested could not be found. Check the URL or return
        to the home showcase.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

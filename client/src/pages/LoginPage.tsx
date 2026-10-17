import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Mail, Lock, ArrowRight, Info } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.info('Phase 0 Mode: Authentication will be implemented in Phase 1. Redirecting to Dashboard demo.');
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-surface-900 dark:text-surface-50">
              Creator<span className="text-brand-600 dark:text-brand-400">OS</span>
            </span>
          </Link>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-2">
            Sign in to manage creator briefs, milestone escrow, and deliverables.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Welcome back</CardTitle>
              <Badge variant="neutral" size="sm">Phase 0 Demo</Badge>
            </div>
            <CardDescription>
              Enter your credentials or click continue to preview the dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleDemoLogin} className="space-y-4">
              <Input
                label="Work Email"
                type="email"
                placeholder="name@agency.com or you@creator.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-surface-600 dark:text-surface-400">
                  <input type="checkbox" className="rounded border-surface-300 text-brand-600 focus:ring-brand-500" defaultChecked />
                  <span>Remember session</span>
                </label>
                <span className="text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>

              <div className="p-3 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 flex items-start gap-2.5 text-xs text-brand-800 dark:text-brand-300">
                <Info className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                <span>JWT Authentication and database persistence are slated for Phase 1. Submitting will launch the demo dashboard.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                size="md"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Workspace
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-xs text-surface-500">
            <span>Don&apos;t have an account yet?</span>
            <Link to="/register" className="ml-1.5 font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Create an account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

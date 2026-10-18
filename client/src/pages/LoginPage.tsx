import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layers, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { useToast } from '../context/ToastContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginErrors = Partial<Record<keyof z.infer<typeof loginSchema>, string>>;

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const result = loginSchema.safeParse({ email: email.trim(), password });
    if (!result.success) {
      const fieldErrors: LoginErrors = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as keyof LoginErrors;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      await login({
        email: email.trim(),
        password,
      });

      toast.success('Welcome back to your workspace!');
      const destination = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      const message = err.message || 'Invalid email or password';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md my-6">
        {/* Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-surface-900 dark:text-surface-50">
              Creator<span className="text-brand-600 dark:text-brand-400">OS</span>
            </span>
          </Link>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-2">
            Sign in to manage campaign briefs, content reviews, and invoice tracking.
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your collaboration workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {serverError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{serverError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Work Email"
                type="email"
                placeholder="name@agency.com or you@creator.io"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  if (serverError) setServerError(null);
                }}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  if (serverError) setServerError(null);
                }}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-surface-600 dark:text-surface-400">
                  <input
                    type="checkbox"
                    className="rounded border-surface-300 dark:border-surface-700 text-brand-600 focus:ring-brand-500"
                    defaultChecked
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">
                  Forgot password?
                </span>
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

          <CardFooter className="justify-center text-xs text-surface-500 py-4 px-6 border-t border-surface-100 dark:border-surface-800">
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

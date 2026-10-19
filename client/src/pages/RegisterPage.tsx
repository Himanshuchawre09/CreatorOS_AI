import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  Layers,
  Mail,
  Lock,
  User,
  Building,
  Eye,
  EyeOff,
  Video,
  Briefcase,
  Scissors,
  Users2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { z } from 'zod';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { useToast } from '../context/ToastContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

type AllowedRole = 'creator' | 'brand' | 'freelancer' | 'talentManager';

const registerSchema = z
  .object({
    role: z.enum(['creator', 'brand', 'freelancer', 'talentManager']),
    name: z.string().min(1, 'Name is required'),
    company: z.string().optional(),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the Terms of Service and Privacy Policy' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormErrors = Partial<Record<keyof z.infer<typeof registerSchema>, string>>;

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<AllowedRole>('creator');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const roleCards: { id: AllowedRole; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'creator',
      title: 'Creator',
      desc: 'YouTuber, streamer, podcaster',
      icon: <Video className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    {
      id: 'brand',
      title: 'Brand',
      desc: 'In-house team, marketer',
      icon: <Briefcase className="w-5 h-5 text-accent-500" />,
    },
    {
      id: 'freelancer',
      title: 'Freelancer',
      desc: 'Editor, producer, thumbnail artist',
      icon: <Scissors className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    },
    {
      id: 'talentManager',
      title: 'Talent Manager',
      desc: 'Agency, talent representation',
      icon: <Users2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const result = registerSchema.safeParse({
      role,
      name: name.trim(),
      company: company.trim() || undefined,
      email: email.trim(),
      password,
      confirmPassword,
      agreeTerms,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as keyof FormErrors;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        orgName: company.trim() || undefined,
      });

      toast.success('Account created successfully! Welcome to your workspace.');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const message = err.message || 'Registration failed. Please try again.';
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

      <div className="w-full max-w-xl my-6">
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
            The workspace for creator-brand collaboration, briefs, and invoices.
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Create your workspace</CardTitle>
            <CardDescription>
              Select your primary collaboration role to get started.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {serverError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{serverError}</span>
              </div>
            )}

            {/* Card-Style Role Picker */}
            <div className="space-y-2 text-left">
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                Choose your role <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roleCards.map((r) => {
                  const isSelected = role === r.id;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => {
                        setRole(r.id);
                        if (serverError) setServerError(null);
                      }}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150',
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 dark:border-brand-500 ring-1 ring-brand-500/30'
                          : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-surface-300 dark:hover:border-surface-700'
                      )}
                    >
                      <div className="p-2 rounded-lg bg-white dark:bg-surface-800 shadow-subtle border border-surface-100 dark:border-surface-700/60 flex-shrink-0">
                        {r.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-surface-900 dark:text-surface-100">
                          {r.title}
                        </p>
                        <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-0.5 leading-snug">
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.role && <p className="text-xs text-rose-500 font-medium">{errors.role}</p>}
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  placeholder="e.g. Jordan Lee"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    if (serverError) setServerError(null);
                  }}
                  error={errors.name}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Channel / Organization"
                  placeholder="e.g. Studio Apex"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    if (serverError) setServerError(null);
                  }}
                  leftIcon={<Building className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Work Email"
                type="email"
                placeholder="jordan@creator.com"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
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

                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    if (serverError) setServerError(null);
                  }}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 focus:outline-none"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  required
                />
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-1 text-left">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-surface-600 dark:text-surface-400">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: undefined }));
                    }}
                    className="mt-0.5 rounded border-surface-300 dark:border-surface-700 text-brand-600 focus:ring-brand-500"
                  />
                  <span>
                    I agree to the{' '}
                    <span className="text-brand-600 dark:text-brand-400 underline">Terms of Service</span> and{' '}
                    <span className="text-brand-600 dark:text-brand-400 underline">Privacy Policy</span>.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-rose-500 font-medium pl-6">{errors.agreeTerms}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-3"
                size="md"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Workspace
              </Button>
            </form>
          </CardContent>

          {/* Proper padding & clean border in CardFooter */}
          <CardFooter className="justify-center text-xs text-surface-500 py-4 px-6 border-t border-surface-100 dark:border-surface-800">
            <span>Already have an account?</span>
            <Link to="/login" className="ml-1.5 font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

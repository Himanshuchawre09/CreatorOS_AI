import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Mail, Lock, User, ArrowRight, Building, Sparkles } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState('creator');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDemoRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success(`Account workspace initialized for ${name || 'User'} (${role.toUpperCase()})!`);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg my-8">
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
            Join the creator-brand operating system for transparent collaboration.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create your workspace</CardTitle>
              <Badge variant="brand" size="sm">Phase 0 Demo</Badge>
            </div>
            <CardDescription>
              Select your role and setup your collaboration profile.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleDemoRegister} className="space-y-4">
              <Select
                label="Primary Account Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                options={[
                  { value: 'creator', label: 'Creator (YouTuber, Podcaster, Streamer)' },
                  { value: 'brand', label: 'Brand Marketer / In-House Team' },
                  { value: 'freelancer', label: 'Freelancer (Editor, Producer, Thumbnail Artist)' },
                  { value: 'agency', label: 'Agency / Talent Management' },
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  placeholder="e.g. Jordan Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Channel / Organization"
                  placeholder="e.g. Studio Apex"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  leftIcon={<Building className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Work Email"
                type="email"
                placeholder="jordan@creator.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <div className="p-3 rounded-xl bg-surface-100/70 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/60 text-xs text-surface-600 dark:text-surface-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span>Phase 0: Workspace preview ready. Auth backend endpoints will be wired in Phase 1.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                size="md"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Workspace
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-xs text-surface-500">
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

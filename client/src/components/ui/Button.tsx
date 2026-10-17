import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

    const variants = {
      primary:
        'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow focus:ring-brand-500 dark:bg-brand-600 dark:hover:bg-brand-500',
      secondary:
        'bg-surface-100 text-surface-900 hover:bg-surface-200 focus:ring-surface-400 dark:bg-surface-800 dark:text-surface-100 dark:hover:bg-surface-700',
      outline:
        'border border-surface-300 bg-transparent text-surface-700 hover:bg-surface-100/70 focus:ring-brand-500 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800/60',
      ghost:
        'bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900 focus:ring-brand-500 dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-surface-100',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm hover:shadow',
      accent:
        'bg-accent-500 text-white hover:bg-accent-600 shadow-sm hover:shadow focus:ring-accent-400',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-sm px-4 py-2 rounded-xl gap-2',
      lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

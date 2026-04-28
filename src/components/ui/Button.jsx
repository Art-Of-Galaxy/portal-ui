import React from 'react';
import { cn } from '../../utils/cn';
import { getGradientClasses } from '../../utils/colors';

export function Button({ 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  className,
  children,
  ...props 
}) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-all duration-200',
        // Size variations
        size === 'small' && 'px-3 py-1.5 text-sm',
        size === 'medium' && 'px-4 py-2',
        size === 'large' && 'px-6 py-3',
        // Variant styles
        variant === 'primary' && getGradientClasses(size === 'large' ? 'full' : 'mid'),
        variant === 'secondary' && 'text-gray-300 hover:text-white',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
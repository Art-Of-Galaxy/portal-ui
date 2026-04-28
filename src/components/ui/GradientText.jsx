import React from 'react';
import { cn } from '../../utils/cn';
import { getTextGradientClasses } from '../../utils/colors';

export function GradientText({ children, size = 'large', className }) {
  return (
    <span className={cn(
      getTextGradientClasses(size === 'large' ? 'full' : 'mid'),
      className
    )}>
      {children}
    </span>
  );
}
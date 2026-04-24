import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  iconOnly?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children,
  text, 
  icon, 
  variant = 'primary', 
  size = 'md', 
  full, 
  iconOnly, 
  loading = false,
  className = '',
  ...props
}) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    full ? 'btn--full' : '',
    iconOnly ? 'btn--icon' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {icon && <span>{icon}</span>}
      {text || children}
    </button>
  );
};

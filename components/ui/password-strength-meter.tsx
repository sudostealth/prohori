'use client';

import { Check, X } from 'lucide-react';

interface PasswordRequirements {
  minLength: boolean;
  hasSpecialChar: boolean;
  hasNumber: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
}

export function checkPasswordStrength(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasNumber: /\d/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
  };
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const requirements = checkPasswordStrength(password);

  const items = [
    { label: 'At least 8 characters', met: requirements.minLength },
    { label: 'One special character', met: requirements.hasSpecialChar },
    { label: 'One number', met: requirements.hasNumber },
    { label: 'One uppercase character', met: requirements.hasUpperCase },
    { label: 'One lowercase character', met: requirements.hasLowerCase },
  ];

  return (
    <div className="space-y-3 p-4 rounded-lg bg-surface-2/50 border border-border">
      <p className="font-medium text-sm text-text">Password Requirements</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-xs transition-colors duration-200">
            {item.met ? (
              <div className="rounded-full p-0.5 bg-primary/20">
                <Check className="h-3 w-3 text-primary" />
              </div>
            ) : (
              <div className="rounded-full p-0.5 bg-text-muted/20">
                <X className="h-3 w-3 text-text-muted" />
              </div>
            )}
            <span className={item.met ? 'text-text font-medium' : 'text-text-muted'}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

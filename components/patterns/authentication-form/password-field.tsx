'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Field } from '@/components/ui';

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
  description,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  error?: string;
  description?: string;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid gap-2">
      <div className="relative">
        <Field
          autoComplete={autoComplete}
          description={description}
          disabled={disabled}
          error={error}
          id={id}
          label={label}
          onChange={onChange}
          required
          type={visible ? 'text' : 'password'}
          value={value}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((c) => !c)}
          className="absolute right-2 top-[34px] h-11 w-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

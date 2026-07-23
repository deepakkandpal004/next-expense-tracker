'use client';

import type { ChangeEvent, FormEvent, ReactNode, RefObject } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Alert, Button, Field, StatusRegion } from '@/components/ui';

export type AuthFieldErrors = Record<string, string | undefined>;

export function focusFirstAuthError(form: HTMLFormElement | null) {
  form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
}

export function PasswordField({ id, label, value, onChange, autoComplete, error, description, disabled = false }: { id: string; label: string; value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void; autoComplete: string; error?: string; description?: string; disabled?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <div className='grid gap-2'><Field autoComplete={autoComplete} description={description} disabled={disabled} error={error} id={id} label={label} onChange={onChange} required type={visible ? 'text' : 'password'} value={value} /><Button aria-pressed={visible} disabled={disabled} icon={visible ? <EyeOff /> : <Eye />} intent='ghost' label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible((current) => !current)} type='button' /></div>;
}

export function AuthenticationForm({ title, description, formRef, onSubmit, children, error, errorAction, success, submitLabel, pendingLabel, pending, footer }: { title: string; description: string; formRef: RefObject<HTMLFormElement | null>; onSubmit: (event: FormEvent<HTMLFormElement>) => void; children: ReactNode; error?: string | null; errorAction?: ReactNode; success?: string | null; submitLabel: string; pendingLabel: string; pending: boolean; footer?: ReactNode }) {
  return (
    <article className="w-full">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-foreground-secondary">{description}</p>
      </header>
      <form className="mt-8 grid gap-5" noValidate onSubmit={onSubmit} ref={formRef}>
        {error ? <Alert action={errorAction} actionRequired title="We could not complete that request" tone="danger" description={error} /> : null}
        {success ? <Alert title="Request received" tone="success" description={success} /> : null}
        {children}
        <Button 
          label={submitLabel} 
          loading={pending} 
          type="submit" 
          width="full"
          className="mt-2"
        />
      </form>
      {footer ? <footer className="mt-6 border-t border-border/50 pt-4 text-center text-sm text-foreground-secondary">{footer}</footer> : null}
      <StatusRegion busy={pending} message={pending ? pendingLabel : undefined} />
    </article>
  );
}


export function AuthTaskLinks() {
  return (
    <nav aria-label="Account tasks" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      <Link className="text-primary hover:text-primary/80 transition-colors font-medium" href="/sign-in">
        Sign in
      </Link>
      <Link className="text-primary hover:text-primary/80 transition-colors font-medium" href="/sign-up">
        Create account
      </Link>
      <Link className="text-primary hover:text-primary/80 transition-colors font-medium" href="/forgot-password">
        Reset password
      </Link>
    </nav>
  );
}


export function getEmailError(value: string) {
  if (!value.trim()) return 'Enter your email address.';
  return /^\S+@\S+\.\S+$/.test(value) ? undefined : 'Enter a valid email address.';
}

'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Field } from '@/components/ui';
import {
  AuthTaskLinks,
  AuthenticationForm,
  focusFirstAuthError,
  getEmailError,
  type AuthFieldErrors,
} from '@/components/patterns/authentication-form';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: AuthFieldErrors = {};
    const emailError = getEmailError(email);
    if (emailError) next.email = emailError;
    setErrors(next);
    setFormError(null);

    if (Object.keys(next).length) {
      requestAnimationFrame(() => focusFirstAuthError(formRef.current));
      return;
    }

    setPending(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setFormError('Something went wrong. Please try again.');
        return;
      }

      setSent(true);
    } catch {
      setFormError('Could not send recovery instructions. Check your connection and retry.');
    } finally {
      setPending(false);
    }
  };

  const changeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setErrors({});
    setFormError(null);
  };

  return (
    <AuthenticationForm
      description="Request password recovery instructions for your account."
      error={formError}
      footer={<AuthTaskLinks />}
      formRef={formRef}
      onSubmit={submit}
      pending={pending}
      pendingLabel="Sending recovery instructions"
      submitLabel={sent ? 'Send recovery instructions again' : 'Send recovery instructions'}
      success={
        sent
          ? 'If an account can be recovered with this email address, recovery instructions will be sent.'
          : null
      }
      title="Reset password"
    >
      <Field
        autoComplete="email"
        disabled={pending}
        error={errors.email}
        id="email"
        label="Email address"
        onChange={changeEmail}
        required
        type="email"
        value={email}
      />
    </AuthenticationForm>
  );
}

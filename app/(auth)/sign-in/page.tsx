'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, useToast } from '@/components/ui';
import {
  AuthTaskLinks,
  AuthenticationForm,
  AuthPageLayout,
  focusFirstAuthError,
  getEmailError,
  PasswordField,
  type AuthFieldErrors,
} from '@/components/patterns/authentication-form';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: AuthFieldErrors = {};
    const emailError = getEmailError(email);
    if (emailError) next.email = emailError;
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    setFormError(null);

    if (Object.keys(next).length) {
      requestAnimationFrame(() => focusFirstAuthError(formRef.current));
      return;
    }

    setPending(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        setFormError('We could not sign you in with those details. Check them and try again.');
        return;
      }
      setFormError(null);
      toast({ description: 'Welcome back!', tone: 'success' });
      router.replace('/dashboard');
    } catch {
      setFormError('We could not complete sign in. Check your connection and retry.');
    } finally {
      setPending(false);
    }
  };

  const retry = (
    <Button
      intent="secondary"
      label="Retry sign in"
      onClick={() => formRef.current?.requestSubmit()}
      type="button"
    />
  );

  return (
    <AuthPageLayout>
      <AuthenticationForm
        description="Sign in to continue to your recorded financial information."
        error={formError}
        errorAction={retry}
        footer={<AuthTaskLinks />}
        formRef={formRef}
        onSubmit={submit}
        pending={pending}
        pendingLabel="Signing in"
        submitLabel="Sign in"
        title="Welcome back"
      >
        <Field
          autoComplete="username"
          disabled={pending}
          error={errors.email}
          id="email"
          label="Email address"
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((current) => ({ ...current, email: undefined }));
            setFormError(null);
          }}
          required
          type="email"
          value={email}
        />
        <PasswordField
          autoComplete="current-password"
          disabled={pending}
          error={errors.password}
          id="password"
          label="Password"
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined }));
            setFormError(null);
          }}
          value={password}
        />
      </AuthenticationForm>
    </AuthPageLayout>
  );
}

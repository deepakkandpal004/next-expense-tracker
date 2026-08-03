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

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: AuthFieldErrors = {};
    if (!name.trim()) next.name = 'Enter your name.';
    const emailError = getEmailError(email);
    if (emailError) next.email = emailError;
    if (!password) next.password = 'Enter a password.';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (!confirmation) next.confirmation = 'Confirm your password.';
    else if (password !== confirmation) next.confirmation = 'Passwords must match.';
    setErrors(next);
    setFormError(null);

    if (Object.keys(next).length) {
      requestAnimationFrame(() => focusFirstAuthError(formRef.current));
      return;
    }

    setPending(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) {
        setFormError('We could not create your account. Check the details and try again.');
        return;
      }
      setFormError(null);
      toast({ description: 'Account created. Welcome!', tone: 'success' });
      router.replace('/dashboard');
    } catch {
      setFormError('We could not complete account creation. Check your connection and retry.');
    } finally {
      setPending(false);
    }
  };

  const retry = (
    <Button
      intent="secondary"
      label="Retry account creation"
      onClick={() => formRef.current?.requestSubmit()}
      type="button"
    />
  );

  const change =
    (key: string, setValue: (value: string) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
      setErrors((current) => ({ ...current, [key]: undefined }));
      setFormError(null);
    };

  return (
    <AuthPageLayout>
      <AuthenticationForm
        description="Create an account to start recording your financial information."
        error={formError}
        errorAction={retry}
        footer={<AuthTaskLinks />}
        formRef={formRef}
        onSubmit={submit}
        pending={pending}
        pendingLabel="Creating account"
        submitLabel="Create account"
        title="Get started"
      >
        <Field
          autoComplete="name"
          disabled={pending}
          error={errors.name}
          id="name"
          label="Full name"
          onChange={change('name', setName)}
          required
          value={name}
        />
        <Field
          autoComplete="email"
          disabled={pending}
          error={errors.email}
          id="email"
          label="Email address"
          onChange={change('email', setEmail)}
          required
          type="email"
          value={email}
        />
        <PasswordField
          autoComplete="new-password"
          description="Required. The server requires a password before it can create an account."
          disabled={pending}
          error={errors.password}
          id="password"
          label="Password"
          onChange={change('password', setPassword)}
          value={password}
        />
        <PasswordField
          autoComplete="new-password"
          disabled={pending}
          error={errors.confirmation}
          id="confirmation"
          label="Confirm password"
          onChange={change('confirmation', setConfirmation)}
          value={confirmation}
        />
      </AuthenticationForm>
    </AuthPageLayout>
  );
}

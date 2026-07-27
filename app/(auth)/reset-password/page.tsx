'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import {
  AuthenticationForm,
  focusFirstAuthError,
  PasswordField,
  type AuthFieldErrors,
} from '@/components/patterns/authentication-form';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!token) {
    return (
      <AuthenticationForm
        description="Invalid or missing reset token."
        footer={null}
        formRef={formRef}
        onSubmit={(e) => e.preventDefault()}
        pending={false}
        pendingLabel=""
        submitLabel="Back to sign in"
        title="Reset password"
      >
        <Button
          intent="secondary"
          label="Back to sign in"
          onClick={() => router.replace('/sign-in')}
          type="button"
        />
      </AuthenticationForm>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: AuthFieldErrors = {};
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setFormError(data.error || 'Could not reset password. The link may have expired.');
        return;
      }

      setSuccess(true);
    } catch {
      setFormError('Could not reset password. Check your connection and retry.');
    } finally {
      setPending(false);
    }
  };

  const retry = (
    <Button
      intent="secondary"
      label="Retry password reset"
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

  if (success) {
    return (
      <AuthenticationForm
        description="Your password has been reset successfully."
        footer={null}
        formRef={formRef}
        onSubmit={(e) => e.preventDefault()}
        pending={false}
        pendingLabel=""
        submitLabel="Sign in"
        success="Password reset complete. You can now sign in with your new password."
        title="Reset password"
      >
        <Button
          label="Sign in"
          onClick={() => router.replace('/sign-in')}
          type="button"
        />
      </AuthenticationForm>
    );
  }

  return (
    <AuthenticationForm
      description="Enter your new password below."
      error={formError}
      errorAction={retry}
      footer={null}
      formRef={formRef}
      onSubmit={submit}
      pending={pending}
      pendingLabel="Resetting password"
      submitLabel="Reset password"
      title="Reset password"
    >
      <PasswordField
        autoComplete="new-password"
        disabled={pending}
        error={errors.password}
        id="password"
        label="New password"
        onChange={change('password', setPassword)}
        value={password}
      />
      <PasswordField
        autoComplete="new-password"
        disabled={pending}
        error={errors.confirmation}
        id="confirmation"
        label="Confirm new password"
        onChange={change('confirmation', setConfirmation)}
        value={confirmation}
      />
    </AuthenticationForm>
  );
}

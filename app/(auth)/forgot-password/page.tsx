'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Field } from '@/components/ui';
import { AuthTaskLinks, AuthenticationForm, focusFirstAuthError, getEmailError, type AuthFieldErrors } from '@/components/patterns/authentication-form';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [errors, setErrors] = useState<AuthFieldErrors>({}); const [pending, setPending] = useState(false); const [sent, setSent] = useState(false); const formRef = useRef<HTMLFormElement>(null);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const next: AuthFieldErrors = {}; const emailError = getEmailError(email); if (emailError) next.email = emailError; setErrors(next); if (Object.keys(next).length) { requestAnimationFrame(() => focusFirstAuthError(formRef.current)); return; } setPending(true); window.setTimeout(() => { setSent(true); setPending(false); }, 250); };
  return <AuthenticationForm description='Request password recovery instructions for your account.' footer={<AuthTaskLinks />} formRef={formRef} onSubmit={submit} pending={pending} pendingLabel='Sending recovery instructions' submitLabel={sent ? 'Send recovery instructions again' : 'Send recovery instructions'} success={sent ? 'If an account can be recovered with this email address, recovery instructions will be sent.' : null} title='Reset password'><Field autoComplete='email' disabled={pending} error={errors.email} id='email' label='Email address' onChange={(event) => { setEmail(event.target.value); setErrors({}); }} required type='email' value={email} /></AuthenticationForm>;
}

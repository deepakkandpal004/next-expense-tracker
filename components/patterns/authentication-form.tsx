'use client';

import type { ChangeEvent, FormEvent, ReactNode, RefObject } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Field, StatusRegion } from '@/components/ui';

export type AuthFieldErrors = Record<string, string | undefined>;

export function focusFirstAuthError(form: HTMLFormElement | null) {
  form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
}

/* ────────────────────────────────────────────────────────────
   PASSWORD FIELD
   ──────────────────────────────────────────────────────────── */

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
          className="absolute right-2 top-[34px] h-11 w-11 flex items-center justify-center rounded-lg text-[#9AA3AF] hover:text-white hover:bg-white/5 transition-all"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   AUTH FORM
   ──────────────────────────────────────────────────────────── */

export function AuthenticationForm({
  title,
  description,
  formRef,
  onSubmit,
  children,
  error,
  errorAction,
  success,
  submitLabel,
  pendingLabel,
  pending,
  footer,
}: {
  title: string;
  description: string;
  formRef: RefObject<HTMLFormElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  error?: string | null;
  errorAction?: ReactNode;
  success?: string | null;
  submitLabel: string;
  pendingLabel: string;
  pending: boolean;
  footer?: ReactNode;
}) {
  return (
    <div className="w-full">
      {/* Logo */}
      <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-xl bg-[#00DCE5]/10 ring-1 ring-[#00DCE5]/20">
          <img src="/favicon.png" alt="" className="h-full w-full object-cover" />
        </span>
        <span className="text-xl font-bold text-white">Expense AI</span>
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-3 text-sm text-[#9AA3AF]">{description}</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 grid gap-5"
        noValidate
        onSubmit={onSubmit}
        ref={formRef}
      >
        {error ? (
          <div className="rounded-xl border border-[#F04438]/20 bg-[#F04438]/[0.08] p-4">
            <p className="text-sm text-[#F04438]">{error}</p>
            {errorAction ? <div className="mt-3">{errorAction}</div> : null}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/[0.08] p-4">
            <p className="text-sm text-[#22C55E]">{success}</p>
          </div>
        ) : null}

        {children}

        <button
          type="submit"
          disabled={pending}
          className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00DCE5] px-6 py-3.5 text-sm font-semibold text-[#0B0F14] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,220,229,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {pending ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-[#0B0F14]/30 border-t-[#0B0F14]" />
              {pendingLabel}
            </>
          ) : (
            <>
              {submitLabel}
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </motion.form>

      {/* Footer */}
      {footer ? (
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-center text-sm text-[#9AA3AF]"
        >
          {footer}
        </motion.footer>
      ) : null}

      <StatusRegion busy={pending} message={pending ? pendingLabel : undefined} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   AUTH TASK LINKS
   ──────────────────────────────────────────────────────────── */

export function AuthTaskLinks() {
  return (
    <nav aria-label="Account tasks" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      <Link className="text-[#00DCE5] hover:text-[#00DCE5]/80 transition-colors font-medium" href="/sign-in">
        Sign in
      </Link>
      <span className="text-white/10">|</span>
      <Link className="text-[#00DCE5] hover:text-[#00DCE5]/80 transition-colors font-medium" href="/sign-up">
        Create account
      </Link>
    </nav>
  );
}

/* ────────────────────────────────────────────────────────────
   EMAIL VALIDATION
   ──────────────────────────────────────────────────────────── */

export function getEmailError(value: string) {
  if (!value.trim()) return 'Enter your email address.';
  return /^\S+@\S+\.\S+$/.test(value) ? undefined : 'Enter a valid email address.';
}

/* ────────────────────────────────────────────────────────────
   AUTH PAGE LAYOUT
   ──────────────────────────────────────────────────────────── */

export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A1322] via-[#0B0F14] to-[#0A0B0D]">
        <div className="absolute left-1/2 top-[-25%] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#00DCE5]/[0.06] blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-8%] h-[480px] w-[480px] rounded-full bg-[#A855F7]/[0.05] blur-[120px]" />
      </div>

      {/* Form card */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0B0F14]/70 p-8 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}

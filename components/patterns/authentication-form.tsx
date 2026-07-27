'use client';

import type { ChangeEvent, FormEvent, ReactNode, RefObject } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
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
          <img src="/icon.svg" alt="" className="h-full w-full object-cover" />
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
      <span className="text-white/10">|</span>
      <Link className="text-[#00DCE5] hover:text-[#00DCE5]/80 transition-colors font-medium" href="/forgot-password">
        Reset password
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
    <div className="relative flex min-h-screen">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 bg-[#0B0F14]">
        <div className="absolute left-1/4 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00DCE5]/[0.04] blur-[120px]" />
        <div className="absolute right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#A855F7]/[0.03] blur-[100px]" />
      </div>

      {/* Form Side */}
      <div className="relative z-10 flex w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>

      {/* Branding Side */}
      <div className="relative z-10 hidden w-1/2 items-center justify-center border-l border-white/[0.06] lg:flex">
        <div className="w-full max-w-md px-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Features */}
            <div className="space-y-8">
              {[
                {
                  icon: Sparkles,
                  title: 'AI-Powered Insights',
                  desc: 'Smart categorization and spending forecasts.',
                  color: '#00DCE5',
                },
                {
                  icon: ArrowRight,
                  title: 'Track Smarter',
                  desc: 'Record transactions and understand your patterns.',
                  color: '#A855F7',
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon size={20} style={{ color: feature.color }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#9AA3AF]">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-8">
              {[
                { value: '10K+', label: 'Transactions' },
                { value: '99.9%', label: 'Uptime' },
                { value: '100%', label: 'Free' },
              ].map((stat) => (
                <div key={stat.label} className="min-w-0">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-[#9AA3AF]">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

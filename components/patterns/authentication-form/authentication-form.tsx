'use client';

import type { FormEvent, ReactNode, RefObject } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { StatusRegion } from '@/components/ui';

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
      <Link href="/" className="group mb-8 inline-flex items-center gap-1">
        <span className="grid size-20 place-items-center rounded-3xl overflow-hidden -mr-1 transition-transform duration-300 group-hover:scale-110">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo1.png" alt="" className="h-full w-full object-cover" />
        </span>
        <span className="text-2xl font-extrabold">
          <span className="text-white">Expense </span>
          <span className="text-primary">AI</span>
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </motion.div>

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
          <div className="rounded-xl border border-danger/20 bg-danger/[0.08] p-4">
            <p className="text-sm text-danger">{error}</p>
            {errorAction ? <div className="mt-3">{errorAction}</div> : null}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-xl border border-success/20 bg-success/[0.08] p-4">
            <p className="text-sm text-success">{success}</p>
          </div>
        ) : null}

        {children}

        <button
          type="submit"
          disabled={pending}
          className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-foreground-inverse transition-all duration-300 hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {pending ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-foreground-inverse/30 border-t-foreground-inverse" />
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

      {footer ? (
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          {footer}
        </motion.footer>
      ) : null}

      <StatusRegion busy={pending} message={pending ? pendingLabel : undefined} />
    </div>
  );
}

'use client';

import type { FormEvent, ReactNode, RefObject } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { StatusRegion } from '@/src/common/ui';

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo1.png" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="text-xl font-extrabold">
            <span className="text-white">Expense Tracker </span>
            <span className="text-primary">AI</span>
          </span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 grid gap-4"
        noValidate
        onSubmit={onSubmit}
        ref={formRef}
      >
        {error ? (
          <div className="rounded-lg border border-danger/20 bg-danger/[0.08] p-3">
            <p className="text-xs font-medium text-danger">{error}</p>
            {errorAction ? <div className="mt-2">{errorAction}</div> : null}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-lg border border-success/20 bg-success/[0.08] p-3">
            <p className="text-xs font-medium text-success">{success}</p>
          </div>
        ) : null}

        {children}

        <button
          type="submit"
          disabled={pending}
          className="group mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-color-text-inverse transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <>
              <span className="size-3.5 animate-spin rounded-full border-2 border-foreground-inverse/30 border-t-foreground-inverse" />
              {pendingLabel}
            </>
          ) : (
            <>
              {submitLabel}
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
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

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";
import { enforceSentenceCase } from "@/lib/ui/primitive-registry";

const controlClasses =
  "min-h-11 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-interface-sm text-foreground shadow-flat transition-colors placeholder:text-foreground-secondary hover:border-border-strong focus-visible:border-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-foreground-secondary aria-[busy=true]:cursor-wait aria-[invalid=true]:border-danger-border aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-danger-border data-[state=success]:border-success-border data-[state=success]:ring-1 data-[state=success]:ring-success-border";

interface FieldFrameProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  successMessage?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldFrame({
  id,
  label,
  description,
  error,
  successMessage,
  required,
  children,
}: FieldFrameProps) {
  enforceSentenceCase(label, "Field label");
  return (
    <div className="grid gap-1.5">
      <label className="text-interface-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      {description ? <p className="text-interface-xs text-foreground-secondary" id={`${id}-description`}>{description}</p> : null}
      {children}
      {error ? <p className="text-interface-xs text-danger-foreground" id={`${id}-error`}>{error}</p> : null}
      {!error && successMessage ? <p className="text-interface-xs text-success-foreground" id={`${id}-success`}>{successMessage}</p> : null}
    </div>
  );
}

export interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "aria-label"> {
  id: string;
  label: string;
  description?: string;
  error?: string;
  successMessage?: string;
  loading?: boolean;
}

export function Field({ id, label, description, error, successMessage, loading = false, required, disabled, className, ...props }: FieldProps) {
  const describedBy = [description && `${id}-description`, error && `${id}-error`, !error && successMessage && `${id}-success`].filter(Boolean).join(" ") || undefined;
  const state = error ? "invalid" : successMessage ? "success" : loading ? "loading" : "default";
  return (
    <FieldFrame id={id} label={label} description={description} error={error} successMessage={successMessage} required={required}>
      <input
        {...props}
        aria-busy={loading || undefined}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        className={cn(controlClasses, className)}
        data-state={state}
        disabled={disabled || loading}
        id={id}
        required={required}
      />
    </FieldFrame>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "aria-label" | "children"> {
  id: string;
  label: string;
  options: readonly SelectOption[];
  placeholder?: string;
  description?: string;
  error?: string;
  successMessage?: string;
  loading?: boolean;
}

export function Select({ id, label, options, placeholder, description, error, successMessage, loading = false, required, disabled, className, ...props }: SelectProps) {
  enforceSentenceCase(label, "Select label");
  options.forEach((option) => enforceSentenceCase(option.label, "Select option"));
  const describedBy = [description && `${id}-description`, error && `${id}-error`, !error && successMessage && `${id}-success`].filter(Boolean).join(" ") || undefined;
  const state = error ? "invalid" : successMessage ? "success" : loading ? "loading" : "default";
  return (
    <FieldFrame id={id} label={label} description={description} error={error} successMessage={successMessage} required={required}>
      <select
        {...props}
        aria-busy={loading || undefined}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        className={cn(controlClasses, className)}
        data-state={state}
        disabled={disabled || loading}
        id={id}
        required={required}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => <option disabled={option.disabled} key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </FieldFrame>
  );
}

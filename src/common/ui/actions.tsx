import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/common/ui/cn";
import { enforceActionLabel, enforceAccessibleName } from "@/src/common/ui/primitive-registry";

export const buttonVariants = cva(
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control border px-4 py-2 text-interface-sm font-semibold transition-[background-color,color,border-color,filter,transform] duration-150 ease-out will-change-transform active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 aria-[busy=true]:cursor-wait",
  {
    variants: {
      intent: {
        primary: "border-primary bg-primary text-primary-foreground hover:brightness-95 active:brightness-90",
        secondary: "border-border-strong bg-surface text-foreground hover:bg-surface-subtle active:bg-surface-subtle",
        danger: "border-danger-border bg-danger-surface text-danger-foreground hover:brightness-95 active:brightness-90",
        ghost: "border-transparent bg-transparent text-primary hover:bg-surface-subtle active:bg-surface-subtle",
      },
      state: {
        default: "",
        invalid: "border-danger-border ring-1 ring-danger-border",
        success: "border-success-border ring-1 ring-success-border",
      },
      width: { auto: "", full: "w-full" },
    },
    defaultVariants: { intent: "primary", state: "default", width: "auto" },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

function actionState(loading: boolean, state: ButtonVariants["state"]): "default" | "invalid" | "loading" | "success" {
  return loading ? "loading" : state ?? "default";
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">,
    ButtonVariants {
  label: string;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  loading?: boolean;
}

function LoadingMark() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-circular border-2 border-current border-r-transparent motion-reduce:animate-none"
    />
  );
}

export function Button({
  label,
  icon,
  iconPosition = "start",
  loading = false,
  disabled,
  intent,
  state,
  width,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  enforceActionLabel(label, "Button label");
  enforceAccessibleName(label, label);
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      aria-invalid={state === "invalid" || undefined}
      className={cn(buttonVariants({ intent, state, width }), className)}
      data-state={actionState(loading, state)}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <LoadingMark /> : icon && iconPosition === "start" ? <span aria-hidden="true">{icon}</span> : null}
      <span>{label}</span>
      {!loading && icon && iconPosition === "end" ? <span aria-hidden="true">{icon}</span> : null}
    </button>
  );
}

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label" | "title">,
    ButtonVariants {
  label: string;
  icon: ReactNode;
  loading?: boolean;
}

export function IconButton({ label, icon, loading = false, disabled, intent = "ghost", state, className, type = "button", ...props }: IconButtonProps) {
  enforceActionLabel(label, "Icon button label");
  enforceAccessibleName(undefined, label);
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      aria-invalid={state === "invalid" || undefined}
      aria-label={label}
      className={cn(buttonVariants({ intent, state }), "min-w-11 px-2", className)}
      data-state={actionState(loading, state)}
      disabled={disabled || loading}
      title={label}
      type={type}
    >
      <span aria-hidden="true">{loading ? <LoadingMark /> : icon}</span>
    </button>
  );
}

export interface LinkButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "aria-label">,
    ButtonVariants {
  label: string;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  disabled?: boolean;
  loading?: boolean;
}

export function LinkButton({ label, icon, iconPosition = "start", disabled = false, loading = false, intent = "secondary", state, width, className, onClick, ...props }: LinkButtonProps) {
  enforceActionLabel(label, "Link label");
  enforceAccessibleName(label, label);
  const unavailable = disabled || loading;
  return (
    <a
      {...props}
      aria-busy={loading || undefined}
      aria-disabled={unavailable || undefined}
      aria-invalid={state === "invalid" || undefined}
      className={cn(buttonVariants({ intent, state, width }), unavailable && "pointer-events-none opacity-60", className)}
      data-state={actionState(loading, state)}
      onClick={(event) => {
        if (unavailable) event.preventDefault();
        else onClick?.(event);
      }}
      tabIndex={unavailable ? -1 : props.tabIndex}
    >
      {loading ? <LoadingMark /> : icon && iconPosition === "start" ? <span aria-hidden="true">{icon}</span> : null}
      <span>{label}</span>
      {!loading && icon && iconPosition === "end" ? <span aria-hidden="true">{icon}</span> : null}
    </a>
  );
}

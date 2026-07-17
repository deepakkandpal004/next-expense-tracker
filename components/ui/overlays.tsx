"use client";

import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/ui/cn";
import { enforceActionLabel, enforceSentenceCase } from "@/lib/ui/primitive-registry";

interface OverlayRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ModalContentProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  className?: string;
  /** Keeps the title in the accessibility tree but visually hides it. Useful for nav drawers. */
  hideTitle?: boolean;
}

const closeButtonClassName =
  "absolute right-4 top-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-control text-foreground-secondary hover:bg-surface-subtle hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-surface-subtle";

function ModalHeading({
  title,
  description,
  titleId,
  descriptionId,
  headingRef,
  hidden,
}: Pick<ModalContentProps, "title" | "description"> & {
  titleId: string;
  descriptionId: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  hidden?: boolean;
}) {
  enforceSentenceCase(title, "Modal title");
  if (hidden) {
    return (
      <>
        <h2
          id={titleId}
          ref={headingRef}
          tabIndex={-1}
          className="sr-only"
        >
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="sr-only">
            {description}
          </p>
        ) : null}
      </>
    );
  }
  return (
    <header className="min-w-0 pr-11">
      <h2
        id={titleId}
        ref={headingRef}
        tabIndex={-1}
        className="text-display-sm font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {title}
      </h2>
      {description ? (
        <p id={descriptionId} className="mt-2 text-interface-sm text-foreground-secondary">
          {description}
        </p>
      ) : null}
    </header>
  );
}

function CloseButton({ label, onClose }: { label: string; onClose: () => void }) {
  enforceActionLabel(label, "Modal close label");
  return (
    <button aria-label={label} className={closeButtonClassName} onClick={onClose} type="button">
      <X aria-hidden="true" size={20} />
    </button>
  );
}

function useOverlayOpenState(open: boolean | undefined, defaultOpen: boolean | undefined) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  return {
    isOpen,
    handleChange: (next: boolean, onOpenChange?: (open: boolean) => void) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
  };
}

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function TriggerWrapper({ trigger, onOpen }: { trigger: ReactElement; onOpen: () => void }) {
  return <span className="contents" onClick={() => onOpen()}>{trigger}</span>;
}

function useDialog(
  dialogRef: RefObject<HTMLDialogElement | null>,
  isOpen: boolean,
  onOpenChange: ((open: boolean) => void) | undefined,
  handleChange: (next: boolean, onOpenChange?: (open: boolean) => void) => void,
) {
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (isOpen && !el.open) {
      el.showModal();
    } else if (!isOpen && el.open) {
      el.close();
    }
  }, [isOpen, dialogRef]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onClose = () => handleChange(false, onOpenChange);
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, [dialogRef, handleChange, onOpenChange]);
}

function DialogSurface({
  children,
  headingRef,
  isOpen,
}: {
  children: ReactNode;
  headingRef: RefObject<HTMLHeadingElement | null>;
  isOpen: boolean;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [isOpen, headingRef]);

  return <>{children}</>;
}

// ─── Dialog ────────────────────────────────────────────────────────────────

export interface DialogProps extends OverlayRootProps, ModalContentProps {
  trigger?: ReactElement;
}

export function Dialog({
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeLabel = "Close dialog",
  className,
  hideTitle,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isOpen, handleChange } = useOverlayOpenState(open, defaultOpen);
  const close = useCallback(() => handleChange(false, onOpenChange), [handleChange, onOpenChange]);
  const openFn = useCallback(() => handleChange(true, onOpenChange), [handleChange, onOpenChange]);

  useDialog(dialogRef, isOpen, onOpenChange, handleChange);

  return (
    <>
      {trigger ? <TriggerWrapper onOpen={openFn} trigger={trigger} /> : null}
      <Portal>
        <dialog
          ref={dialogRef}
          className="fixed inset-0 z-50 m-0 hidden h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-0 open:flex backdrop:bg-foreground/45 backdrop:backdrop-blur-[2px] motion-reduce:backdrop:backdrop-blur-none"
          onClick={(e) => { if (e.target === dialogRef.current) close(); }}
        >
          <div
            aria-describedby={description ? descriptionId : undefined}
            aria-labelledby={titleId}
            aria-modal="true"
            className={cn(
              "relative mx-auto flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-overlay",
              className,
            )}
            role="dialog"
          >
            <DialogSurface headingRef={headingRef} isOpen={isOpen}>
              <ModalHeading description={description} descriptionId={descriptionId} headingRef={headingRef} hidden={hideTitle} title={title} titleId={titleId} />
              <div className={cn("min-w-0 flex-1", !hideTitle && "mt-6")}>{children}</div>
              {footer ? <footer className="mt-6 flex flex-wrap justify-end gap-3">{footer}</footer> : null}
              {!hideTitle ? <CloseButton label={closeLabel} onClose={close} /> : null}
            </DialogSurface>
          </div>
        </dialog>
      </Portal>
    </>
  );
}

// ─── Sheet ─────────────────────────────────────────────────────────────────

export interface SheetProps extends OverlayRootProps, ModalContentProps {
  trigger?: ReactElement;
  side?: "left" | "right";
}

export function Sheet({
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeLabel = "Close sheet",
  className,
  hideTitle,
  side = "right",
}: SheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isOpen, handleChange } = useOverlayOpenState(open, defaultOpen);
  const close = useCallback(() => handleChange(false, onOpenChange), [handleChange, onOpenChange]);
  const openFn = useCallback(() => handleChange(true, onOpenChange), [handleChange, onOpenChange]);

  useDialog(dialogRef, isOpen, onOpenChange, handleChange);

  const sideClassName = side === "left" ? "left-0" : "right-0";

  return (
    <>
      {trigger ? <TriggerWrapper onOpen={openFn} trigger={trigger} /> : null}
      <Portal>
        <dialog
          ref={dialogRef}
          className="fixed inset-0 z-50 m-0 hidden h-full max-h-none w-full max-w-none bg-transparent p-0 open:flex backdrop:bg-foreground/45 backdrop:backdrop-blur-[2px] motion-reduce:backdrop:backdrop-blur-none"
          onClick={(e) => { if (e.target === dialogRef.current) close(); }}
        >
          <div
            aria-describedby={description ? descriptionId : undefined}
            aria-labelledby={titleId}
            aria-modal="true"
            className={cn(
              "fixed inset-y-0 z-50 flex h-[100dvh] w-full max-w-lg flex-col overflow-y-auto border-border bg-surface p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-overlay",
              sideClassName,
              className,
            )}
            role="dialog"
          >
            <DialogSurface headingRef={headingRef} isOpen={isOpen}>
              <ModalHeading description={description} descriptionId={descriptionId} headingRef={headingRef} hidden={hideTitle} title={title} titleId={titleId} />
              <div className={cn("min-w-0 flex-1", !hideTitle && "mt-6")}>{children}</div>
              {footer ? <footer className="mt-6 flex flex-wrap justify-end gap-3">{footer}</footer> : null}
              {!hideTitle ? <CloseButton label={closeLabel} onClose={close} /> : null}
            </DialogSurface>
          </div>
        </dialog>
      </Portal>
    </>
  );
}

// ─── AlertDialog ────────────────────────────────────────────────────────────

export interface AlertDialogAction {
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface AlertDialogProps extends OverlayRootProps {
  trigger?: ReactElement;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  cancel: AlertDialogAction;
  action: AlertDialogAction;
  className?: string;
}

export function AlertDialog({
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  children,
  cancel,
  action,
  className,
}: AlertDialogProps) {
  enforceSentenceCase(title, "Alert dialog title");
  enforceActionLabel(cancel.label, "Alert dialog cancel label");
  enforceActionLabel(action.label, "Alert dialog action label");
  const titleId = useId();
  const descriptionId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isOpen, handleChange } = useOverlayOpenState(open, defaultOpen);
  const close = useCallback(() => handleChange(false, onOpenChange), [handleChange, onOpenChange]);
  const openFn = useCallback(() => handleChange(true, onOpenChange), [handleChange, onOpenChange]);

  useDialog(dialogRef, isOpen, onOpenChange, handleChange);

  return (
    <>
      {trigger ? <TriggerWrapper onOpen={openFn} trigger={trigger} /> : null}
      <Portal>
        <dialog
          ref={dialogRef}
          className="fixed inset-0 z-50 m-0 hidden h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-0 open:flex backdrop:bg-foreground/45 backdrop:backdrop-blur-[2px] motion-reduce:backdrop:backdrop-blur-none"
          onClick={(e) => { if (e.target === dialogRef.current) close(); }}
        >
          <div
            aria-describedby={description ? descriptionId : undefined}
            aria-labelledby={titleId}
            aria-modal="true"
            className={cn(
              "relative mx-auto flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col overflow-y-auto rounded-container border border-border bg-surface p-6 shadow-overlay",
              className,
            )}
            role="alertdialog"
          >
            <DialogSurface headingRef={headingRef} isOpen={isOpen}>
              <header className="min-w-0">
                <h2 id={titleId} ref={headingRef} tabIndex={-1} className="text-display-sm font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                  {title}
                </h2>
                {description ? (
                  <p id={descriptionId} className="mt-2 text-interface-sm text-foreground-secondary">
                    {description}
                  </p>
                ) : null}
              </header>
              {children ? <div className="mt-6 min-w-0 flex-1">{children}</div> : null}
              <footer className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  className="min-h-11 min-w-11 rounded-control border border-border-strong bg-surface px-4 py-2 text-interface-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-surface-subtle"
                  disabled={cancel.disabled || cancel.loading}
                  onClick={() => { cancel.onSelect?.(); close(); }}
                  type="button"
                >
                  {cancel.label}
                </button>
                <button
                  aria-busy={action.loading || undefined}
                  className="min-h-11 min-w-11 rounded-control border border-danger-border bg-danger-surface px-4 py-2 text-interface-sm font-semibold text-danger-foreground transition-[filter,background-color] hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={action.disabled || action.loading}
                  onClick={() => { action.onSelect?.(); close(); }}
                  type="button"
                >
                  {action.label}
                </button>
              </footer>
            </DialogSurface>
          </div>
        </dialog>
      </Portal>
    </>
  );
}

// ─── ConfirmDestructiveAction ───────────────────────────────────────────────

export interface DestructiveRecordSummary {
  description: ReactNode;
  amount: ReactNode;
  date: ReactNode;
}

export interface ConfirmDestructiveActionProps extends OverlayRootProps {
  trigger: ReactElement;
  title?: string;
  record: DestructiveRecordSummary;
  consequence: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  processing?: boolean;
  onCancel?: () => void;
  onConfirm: () => void;
}

export function ConfirmDestructiveAction({
  trigger,
  title = "Delete transaction",
  record,
  consequence,
  cancelLabel = "Cancel",
  confirmLabel = "Delete transaction",
  processing = false,
  onCancel,
  onConfirm,
  open,
  defaultOpen,
  onOpenChange,
}: ConfirmDestructiveActionProps) {
  return (
    <AlertDialog
      action={{ label: confirmLabel, loading: processing, onSelect: onConfirm }}
      cancel={{ label: cancelLabel, disabled: processing, onSelect: onCancel }}
      defaultOpen={defaultOpen}
      description={consequence}
      onOpenChange={onOpenChange}
      open={open}
      title={title}
      trigger={trigger}
    >
      <dl className="grid gap-3 rounded-container border border-border bg-surface-subtle p-4 text-interface-sm">
        <div className="grid gap-1">
          <dt className="font-medium text-foreground-secondary">Description</dt>
          <dd className="break-words text-foreground">{record.description}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="font-medium text-foreground-secondary">Amount</dt>
          <dd className="financial-value break-words text-foreground">{record.amount}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="font-medium text-foreground-secondary">Date</dt>
          <dd className="break-words text-foreground">{record.date}</dd>
        </div>
      </dl>
    </AlertDialog>
  );
}

// ─── DropdownMenu ───────────────────────────────────────────────────────────

export interface DropdownMenuItem {
  id: string;
  label: string;
  onSelect?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface DropdownMenuProps extends OverlayRootProps {
  trigger: ReactElement;
  label: string;
  items: readonly DropdownMenuItem[];
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

export function DropdownMenu({
  trigger,
  label,
  items,
  open,
  defaultOpen,
  onOpenChange,
}: DropdownMenuProps) {
  enforceSentenceCase(label, "Menu label");
  items.forEach((item) => enforceSentenceCase(item.label, "Menu item label"));
  const { isOpen, handleChange } = useOverlayOpenState(open, defaultOpen);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => handleChange(false, onOpenChange), [handleChange, onOpenChange]);
  const toggle = useCallback(() => handleChange(!isOpen, onOpenChange), [handleChange, isOpen, onOpenChange]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  return (
    <div ref={containerRef} className="relative inline-flex">
      <TriggerWrapper trigger={trigger} onOpen={toggle} />
      {isOpen ? (
        <div
          aria-label={label}
          className="absolute right-0 top-full z-50 mt-2 min-w-56 origin-top-right rounded-container border border-border bg-surface p-1 shadow-overlay"
          role="menu"
        >
          {items.map((item) => (
            <div
              className={cn(
                "flex min-h-11 cursor-default items-center gap-2 rounded-control px-3 py-2 text-interface-sm font-medium text-foreground outline-none transition-colors hover:bg-surface-subtle",
                item.destructive && "text-danger-foreground",
                item.disabled && "cursor-not-allowed opacity-60",
              )}
              key={item.id}
              onClick={() => { if (!item.disabled) { item.onSelect?.(); close(); } }}
              onKeyDown={(e) => {
                if (!item.disabled && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  item.onSelect?.();
                  close();
                }
              }}
              role="menuitem"
              tabIndex={item.disabled ? -1 : 0}
            >
              {item.icon ? <span aria-hidden="true" className="shrink-0">{item.icon}</span> : null}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─── CompactNavigation ──────────────────────────────────────────────────────

export interface CompactNavigationItem {
  id: string;
  label: string;
  href: string;
  current?: boolean;
  icon?: ReactNode;
  onSelect?: () => void;
}

export interface CompactNavigationProps extends OverlayRootProps {
  label?: string;
  title?: string;
  items: readonly CompactNavigationItem[];
  className?: string;
}

export function CompactNavigation({
  label = "Menu",
  title = "Navigation menu",
  items,
  className,
  open,
  defaultOpen = false,
  onOpenChange,
}: CompactNavigationProps) {
  enforceSentenceCase(label, "Compact navigation label");
  enforceSentenceCase(title, "Compact navigation title");
  items.forEach((item) => enforceSentenceCase(item.label, "Navigation item label"));
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  return (
    <Sheet
      closeLabel="Close menu"
      onOpenChange={setOpen}
      open={isOpen}
      title={title}
      className={className}
      trigger={
        <button
          aria-label={label}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-border-strong bg-surface px-4 py-2 text-interface-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-surface-subtle"
          type="button"
        >
          {label}
        </button>
      }
    >
      <nav aria-label={title} className="grid gap-2">
        {items.map((item) => (
          <a
            aria-current={item.current ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-control border border-transparent px-3 py-2 text-interface-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-surface-subtle",
              item.current && "border-primary bg-surface-subtle text-primary",
            )}
            href={item.href}
            key={item.id}
            onClick={() => { item.onSelect?.(); setOpen(false); }}
          >
            {item.icon ? <span aria-hidden="true" className="shrink-0">{item.icon}</span> : null}
            <span>{item.label}</span>
            {item.current ? (
              <span className="ml-auto rounded-circular border border-primary px-2 py-0.5 text-interface-xs" aria-label="Current page">
                Current
              </span>
            ) : null}
          </a>
        ))}
      </nav>
    </Sheet>
  );
}

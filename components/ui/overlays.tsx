"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { X } from "lucide-react";
import { useId, useRef, useState, type ReactElement, type ReactNode, type RefObject } from "react";
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
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
}

const overlayClassName = "fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[1px] motion-reduce:backdrop-blur-none";
const closeButtonClassName = "absolute right-4 top-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-control text-foreground-secondary hover:bg-surface-subtle hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-surface-subtle";

function ModalHeading({ title, description, titleId, descriptionId, headingRef }: Pick<ModalContentProps, "title" | "description"> & { titleId: string; descriptionId: string; headingRef: RefObject<HTMLHeadingElement | null> }) {
  enforceSentenceCase(title, "Modal title");
  return <header className="min-w-0 pr-11"><DialogPrimitive.Title id={titleId} ref={headingRef} tabIndex={-1} className="text-display-sm font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{title}</DialogPrimitive.Title>{description ? <DialogPrimitive.Description id={descriptionId} className="mt-2 text-interface-sm text-foreground-secondary">{description}</DialogPrimitive.Description> : null}</header>;
}

function CloseButton({ label }: { label: string }) {
  enforceActionLabel(label, "Modal close label");
  return <DialogPrimitive.Close asChild><button aria-label={label} className={closeButtonClassName} type="button"><X aria-hidden="true" size={20} /></button></DialogPrimitive.Close>;
}

function focusHeading(event: Event, heading: RefObject<HTMLHeadingElement | null>, callback?: (event: Event) => void) {
  callback?.(event);
  if (!event.defaultPrevented) {
    event.preventDefault();
    heading.current?.focus();
  }
}

export interface DialogProps extends OverlayRootProps, ModalContentProps {
  trigger?: ReactElement;
}

export function Dialog({ trigger, open, defaultOpen, onOpenChange, title, description, children, footer, closeLabel = "Close dialog", className, onOpenAutoFocus, onCloseAutoFocus }: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  return <DialogPrimitive.Root defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
    {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClassName} />
      <DialogPrimitive.Content aria-describedby={description ? descriptionId : undefined} aria-labelledby={titleId} className={cn("fixed inset-0 z-50 flex h-[100dvh] w-full flex-col overflow-y-auto bg-surface p-6 shadow-overlay focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-container sm:border sm:border-border", className)} onCloseAutoFocus={onCloseAutoFocus} onOpenAutoFocus={(event) => focusHeading(event, headingRef, onOpenAutoFocus)}>
        <ModalHeading description={description} descriptionId={descriptionId} headingRef={headingRef} title={title} titleId={titleId} />
        <div className="mt-6 min-w-0 flex-1">{children}</div>
        {footer ? <footer className="mt-6 flex flex-wrap justify-end gap-3">{footer}</footer> : null}
        <CloseButton label={closeLabel} />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}

export interface SheetProps extends OverlayRootProps, ModalContentProps {
  trigger?: ReactElement;
  side?: "left" | "right";
}

export function Sheet({ trigger, open, defaultOpen, onOpenChange, title, description, children, footer, closeLabel = "Close sheet", className, side = "right", onOpenAutoFocus, onCloseAutoFocus }: SheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sideClassName = side === "left" ? "left-0 border-r sm:rounded-r-container" : "right-0 border-l sm:rounded-l-container";
  return <DialogPrimitive.Root defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
    {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClassName} />
      <DialogPrimitive.Content aria-describedby={description ? descriptionId : undefined} aria-labelledby={titleId} className={cn("fixed inset-y-0 z-50 flex h-[100dvh] w-full max-w-lg flex-col overflow-y-auto border-border bg-surface p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-overlay focus:outline-none sm:w-[min(32rem,calc(100%-2rem))]", sideClassName, className)} onCloseAutoFocus={onCloseAutoFocus} onOpenAutoFocus={(event) => focusHeading(event, headingRef, onOpenAutoFocus)}>
        <ModalHeading description={description} descriptionId={descriptionId} headingRef={headingRef} title={title} titleId={titleId} />
        <div className="mt-6 min-w-0 flex-1">{children}</div>
        {footer ? <footer className="mt-6 flex flex-wrap justify-end gap-3">{footer}</footer> : null}
        <CloseButton label={closeLabel} />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}

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
  onCloseAutoFocus?: (event: Event) => void;
}

export function AlertDialog({ trigger, open, defaultOpen, onOpenChange, title, description, children, cancel, action, className, onCloseAutoFocus }: AlertDialogProps) {
  enforceSentenceCase(title, "Alert dialog title");
  enforceActionLabel(cancel.label, "Alert dialog cancel label");
  enforceActionLabel(action.label, "Alert dialog action label");
  const titleId = useId();
  const descriptionId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  return <AlertDialogPrimitive.Root defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
    {trigger ? <AlertDialogPrimitive.Trigger asChild>{trigger}</AlertDialogPrimitive.Trigger> : null}
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className={overlayClassName} />
      <AlertDialogPrimitive.Content aria-describedby={description ? descriptionId : undefined} aria-labelledby={titleId} className={cn("fixed inset-0 z-50 flex h-[100dvh] w-full flex-col overflow-y-auto bg-surface p-6 shadow-overlay focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-container sm:border sm:border-border", className)} onCloseAutoFocus={onCloseAutoFocus} onOpenAutoFocus={(event) => focusHeading(event, headingRef)}>
        <header className="min-w-0"><AlertDialogPrimitive.Title id={titleId} ref={headingRef} tabIndex={-1} className="text-display-sm font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{title}</AlertDialogPrimitive.Title>{description ? <AlertDialogPrimitive.Description id={descriptionId} className="mt-2 text-interface-sm text-foreground-secondary">{description}</AlertDialogPrimitive.Description> : null}</header>
        {children ? <div className="mt-6 min-w-0 flex-1">{children}</div> : null}
        <footer className="mt-6 flex flex-wrap justify-end gap-3">
          <AlertDialogPrimitive.Cancel asChild><button className="min-h-11 min-w-11 rounded-control border border-border-strong bg-surface px-4 py-2 text-interface-sm font-semibold text-foreground hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-surface-subtle" disabled={cancel.disabled || cancel.loading} onClick={cancel.onSelect} type="button">{cancel.label}</button></AlertDialogPrimitive.Cancel>
          <AlertDialogPrimitive.Action asChild><button aria-busy={action.loading || undefined} className="min-h-11 min-w-11 rounded-control border border-danger-border bg-danger-surface px-4 py-2 text-interface-sm font-semibold text-danger-foreground hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:brightness-90 disabled:cursor-not-allowed disabled:opacity-60" disabled={action.disabled || action.loading} onClick={action.onSelect} type="button">{action.label}</button></AlertDialogPrimitive.Action>
        </footer>
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  </AlertDialogPrimitive.Root>;
}

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
  onCloseAutoFocus?: (event: Event) => void;
}

export function ConfirmDestructiveAction({ trigger, title = "Delete transaction", record, consequence, cancelLabel = "Cancel", confirmLabel = "Delete transaction", processing = false, onCancel, onConfirm, open, defaultOpen, onOpenChange, onCloseAutoFocus }: ConfirmDestructiveActionProps) {
  return <AlertDialog action={{ label: confirmLabel, loading: processing, onSelect: onConfirm }} cancel={{ label: cancelLabel, disabled: processing, onSelect: onCancel }} defaultOpen={defaultOpen} description={consequence} onCloseAutoFocus={onCloseAutoFocus} onOpenChange={onOpenChange} open={open} title={title} trigger={trigger}>
    <dl className="grid gap-3 rounded-container border border-border bg-surface-subtle p-4 text-interface-sm"><div className="grid gap-1"><dt className="font-medium text-foreground-secondary">Description</dt><dd className="break-words text-foreground">{record.description}</dd></div><div className="grid gap-1"><dt className="font-medium text-foreground-secondary">Amount</dt><dd className="financial-value break-words text-foreground">{record.amount}</dd></div><div className="grid gap-1"><dt className="font-medium text-foreground-secondary">Date</dt><dd className="break-words text-foreground">{record.date}</dd></div></dl>
  </AlertDialog>;
}

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

export function DropdownMenu({ trigger, label, items, open, defaultOpen, onOpenChange, align = "end", side = "bottom" }: DropdownMenuProps) {
  enforceSentenceCase(label, "Menu label");
  items.forEach((item) => enforceSentenceCase(item.label, "Menu item label"));
  return <DropdownMenuPrimitive.Root defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
    <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content align={align} aria-label={label} aria-labelledby="" className="z-50 min-w-56 rounded-container border border-border bg-surface p-1 shadow-overlay focus:outline-none" side={side} sideOffset={8}>
        {items.map((item) => <DropdownMenuPrimitive.Item className={cn("flex min-h-11 cursor-default items-center gap-2 rounded-control px-3 py-2 text-interface-sm font-medium text-foreground outline-none hover:bg-surface-subtle focus:bg-surface-subtle data-[highlighted]:bg-surface-subtle data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60", item.destructive && "text-danger-foreground")} disabled={item.disabled} key={item.id} onSelect={item.onSelect}>
          {item.icon ? <span aria-hidden="true" className="shrink-0">{item.icon}</span> : null}<span>{item.label}</span>
        </DropdownMenuPrimitive.Item>)}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  </DropdownMenuPrimitive.Root>;
}

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

export function CompactNavigation({ label = "Menu", title = "Navigation menu", items, className, open, defaultOpen = false, onOpenChange }: CompactNavigationProps) {
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
  return <Sheet closeLabel="Close menu" onOpenChange={setOpen} open={isOpen} title={title} className={className} trigger={<button aria-label={label} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-border-strong bg-surface px-4 py-2 text-interface-sm font-semibold text-foreground hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-surface-subtle" type="button">{label}</button>}>
    <nav aria-label={title} className="grid gap-2">
      {items.map((item) => <a aria-current={item.current ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-control border border-transparent px-3 py-2 text-interface-sm font-semibold text-foreground hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-surface-subtle", item.current && "border-primary bg-surface-subtle text-primary")} href={item.href} key={item.id} onClick={() => { item.onSelect?.(); setOpen(false); }}>
        {item.icon ? <span aria-hidden="true" className="shrink-0">{item.icon}</span> : null}<span>{item.label}</span>{item.current ? <span className="ml-auto rounded-circular border border-primary px-2 py-0.5 text-interface-xs" aria-label="Current page">Current</span> : null}
      </a>)}
    </nav>
  </Sheet>;
}

"use client";

import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { Button, EmptyState, ErrorState, Skeleton, StatusRegion, Alert } from "@/components/ui";
import { cn } from "@/lib/ui/cn";

export const BUSY_FEEDBACK_DELAY_MS = 100;

export const FEEDBACK_PATTERN_CONTRACT = {
  loading: ["reserved footprint", "immediate textual busy status", "visible feedback after 100ms"],
  empty: ["collection purpose", "creation action"],
  filteredEmpty: ["active filter scope", "reset action"],
  failure: ["affected section", "section-scoped retry"],
  stale: ["retained successful content", "stale-data label", "retry action"],
  overlay: ["only operations requiring completion or cancellation may block"],
  focus: ["passive statuses preserve focus", "immediate-action statuses focus the required control"],
} as const;

export type AsyncSectionState = "loading" | "ready" | "empty" | "filtered-empty" | "error" | "stale";
export type BlockingOverlayOperation = "section-refresh" | "background-mutation" | "requires-completion-or-cancellation";
export type StatusPriority = "passive" | "action-required";

export function isBlockingOverlayAllowed(operation: BlockingOverlayOperation): boolean {
  return operation === "requires-completion-or-cancellation";
}

export function useDelayedBusy(isPending: boolean, delay = BUSY_FEEDBACK_DELAY_MS): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay, isPending]);

  return visible;
}

export interface SectionEmptyDetails {
  title: string;
  description: ReactNode;
  action: ReactNode;
  scope?: string;
}

export interface SectionFailureDetails {
  description: ReactNode;
  retryLabel: string;
  onRetry: () => void;
}

export interface SectionStatus {
  message: string;
  priority?: StatusPriority;
  requiredActionRef?: RefObject<HTMLElement | null>;
}

export interface AsyncSectionProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  label: string;
  state: AsyncSectionState;
  children?: ReactNode;
  minimumHeight?: string;
  lines?: number;
  pending?: boolean;
  empty?: SectionEmptyDetails;
  filteredEmpty?: SectionEmptyDetails;
  failure?: SectionFailureDetails;
  status?: SectionStatus;
}

function failureTitle(label: string): string {
  return `${label} could not be loaded`;
}

function BusyFeedback({ label, pending, visible }: { label: string; pending: boolean; visible: boolean }) {
  if (!pending) return null;
  return (
    <StatusRegion
      busy
      className="mb-3"
      message={`${label} is refreshing.`}
      visible={visible}
    />
  );
}

function SectionFailure({ label, failure }: { label: string; failure: SectionFailureDetails }) {
  return (
    <ErrorState
      action={<Button intent="secondary" label={failure.retryLabel} onClick={failure.onRetry} />}
      description={failure.description}
      retryLabel={failure.retryLabel}
      title={failureTitle(label)}
    />
  );
}

function RecoveryStatus({ message }: { message?: string }) {
  return message ? <StatusRegion className="mb-3" message={message} visible /> : null;
}

export function AsyncSection({
  label,
  state,
  children,
  minimumHeight = "12rem",
  lines = 3,
  pending = false,
  empty,
  filteredEmpty,
  failure,
  status,
  className,
  style,
  ...props
}: AsyncSectionProps) {
  const pendingOperation = pending || state === "loading";
  const showBusyFeedback = useDelayedBusy(pendingOperation);
  const priorState = useRef<AsyncSectionState>(state);
  const handledActionStatus = useRef<string | undefined>(undefined);
  const [recoveryMessage, setRecoveryMessage] = useState<string | undefined>(undefined);
  const priority = status?.priority ?? "passive";
  const actionStatusMessage = status?.message;

  useEffect(() => {
    if ((priorState.current === "error" || priorState.current === "stale") && state === "ready") {
      setRecoveryMessage(`${label} recovered.`);
    } else if (state !== "ready") {
      setRecoveryMessage(undefined);
    }
    priorState.current = state;
  }, [label, state]);

  useEffect(() => {
    if (priority !== "action-required" || !actionStatusMessage || handledActionStatus.current === actionStatusMessage) return;
    status?.requiredActionRef?.current?.focus();
    handledActionStatus.current = actionStatusMessage;
  }, [actionStatusMessage, priority, status?.requiredActionRef]);

  const resolvedStyle: CSSProperties = state === "loading"
    ? { minHeight: minimumHeight, ...style }
    : style ?? {};
  const announcedStatus = priority === "action-required" && actionStatusMessage
    ? `${actionStatusMessage} Focus moved to the required action.`
    : actionStatusMessage;

  return (
    <section
      {...props}
      aria-busy={pendingOperation || undefined}
      aria-label={label}
      className={cn("min-w-0 w-full", className)}
      data-feedback-state={state}
      style={resolvedStyle}
    >
      <BusyFeedback label={label} pending={pendingOperation} visible={showBusyFeedback} />
      <RecoveryStatus message={recoveryMessage} />
      {announcedStatus ? <StatusRegion message={announcedStatus} politeness={priority === "action-required" ? "assertive" : "polite"} visible /> : null}
      {state === "loading" ? <Skeleton label={`Loading ${label.toLocaleLowerCase()}`} lines={lines} minimumHeight={minimumHeight} /> : null}
      {state === "ready" || state === "stale" ? children : null}
      {state === "empty" && empty ? <EmptyState {...empty} /> : null}
      {state === "filtered-empty" && filteredEmpty ? <EmptyState {...filteredEmpty} /> : null}
      {state === "error" && failure ? <SectionFailure failure={failure} label={label} /> : null}
      {state === "stale" && failure ? (
        <Alert
          action={<Button intent="secondary" label={failure.retryLabel} onClick={failure.onRetry} />}
          description={failure.description}
          title={`${label} may be out of date`}
          tone="warning"
        />
      ) : null}
    </section>
  );
}

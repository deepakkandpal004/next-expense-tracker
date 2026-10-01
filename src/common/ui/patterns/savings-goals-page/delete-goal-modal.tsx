"use client";

import { AlertDialog } from "@/src/common/ui";
import type { SavingsGoal } from "./types";

export function DeleteGoalModal({
  goal,
  deleting,
  onCancel,
  onConfirm,
}: {
  goal: SavingsGoal;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open
      onOpenChange={(next) => { if (!next) onCancel(); }}
      title="Delete goal?"
      description={`"${goal.name}" and its progress will be permanently deleted. This action cannot be undone.`}
      cancel={{ label: "Cancel", onSelect: onCancel, disabled: deleting }}
      action={{ label: "Delete goal", loading: deleting, onSelect: onConfirm }}
    />
  );
}

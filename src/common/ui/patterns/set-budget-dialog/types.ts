export interface SetBudgetDialogProps {
  currency: string;
  label?: string;
  onSaved?: () => void | Promise<void>;
}
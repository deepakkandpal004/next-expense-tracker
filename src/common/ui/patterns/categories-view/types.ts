export interface CategoriesViewProps {
  currency?: string;
}

export interface CategoryFormProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
  placeholder: string;
}

export type { CategoryWithSpending } from "@/app/actions/manageCategories";
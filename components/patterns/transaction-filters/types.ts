export interface TransactionFiltersProps {
  search: string;
  type: string;
  category: string;
  sort: string;
  recordCount: number;
  activeFilters: readonly { kind: string; value: string }[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  onRemoveFilter: (filter: { kind: string; value: string }) => void;
}

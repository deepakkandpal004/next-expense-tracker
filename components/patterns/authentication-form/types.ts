export type AuthFieldErrors = Record<string, string | undefined>;

export function focusFirstAuthError(form: HTMLFormElement | null) {
  form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
}

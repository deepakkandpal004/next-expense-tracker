export function getEmailError(value: string) {
  if (!value.trim()) return 'Enter your email address.';
  return /^\S+@\S+\.\S+$/.test(value) ? undefined : 'Enter a valid email address.';
}

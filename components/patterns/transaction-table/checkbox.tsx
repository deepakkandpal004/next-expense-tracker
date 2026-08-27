import { Check, Minus } from "lucide-react";

export function Checkbox({
  checked,
  indeterminate,
  onToggle,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onToggle: () => void;
  label: string;
}) {
  const showMark = checked || (indeterminate ?? false);
  return (
    <span className="inline-flex items-center justify-center leading-none">
      <span className="relative inline-flex size-4 shrink-0 leading-none">
        <input
          aria-label={label}
          checked={checked}
          className="m-0 block size-4 min-h-0 cursor-pointer appearance-none rounded-[4px] border border-border-strong bg-surface p-0 transition-colors duration-150 hover:border-primary/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus checked:border-primary checked:bg-primary"
          onChange={onToggle}
          ref={(element) => {
            if (element) element.indeterminate = indeterminate ?? false;
          }}
          type="checkbox"
        />
        {showMark ? (
           <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center text-foreground-inverse">
            {indeterminate ? <Minus size={10} strokeWidth={3.5} /> : <Check size={10} strokeWidth={3} />}
          </span>
        ) : null}
      </span>
    </span>
  );
}

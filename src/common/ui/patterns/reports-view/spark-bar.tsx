export function SparkBar({ value, max, color }: { value: number; max: number; color: string }) {
  const height = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-20 w-6 rounded-md bg-muted/30 relative overflow-hidden">
        <div
          className="absolute bottom-0 w-full rounded-t-md transition-all duration-500"
          style={{ height: `${height}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

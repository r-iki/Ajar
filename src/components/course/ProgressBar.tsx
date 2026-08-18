type ProgressBarProps = {
  value: number;
  showLabel?: boolean;
};

export function ProgressBar({ value, showLabel = true }: ProgressBarProps) {
  const boundedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full space-y-2">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/5">
        <div
          className="h-full rounded-full bg-linear-to-r from-primary via-primary/80 to-primary transition-all duration-1000 ease-out"
          style={{ width: `${boundedValue}%` }}
          aria-label="Course progress"
        >
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 animate-pulse" />
        </div>
      </div>
      {showLabel && (
        <div className="flex items-center justify-between px-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          <span>Progress</span>
          <span className="text-primary">{boundedValue}%</span>
        </div>
      )}
    </div>
  );
}

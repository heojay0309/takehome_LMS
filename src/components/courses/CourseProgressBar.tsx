type CourseProgressBarProps = {
  percent: number;
  label?: string;
};

export function CourseProgressBar({ percent, label = "Course progress" }: CourseProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-4 text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full bg-progress transition-[width] duration-[380ms]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

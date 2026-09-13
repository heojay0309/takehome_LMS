'use client';

import type { CompletionStatus, Difficulty } from '@/lib/courses';
import { ChevronDown, ChevronUp } from 'lucide-react';
type FiltersProps = {
  categories: string[];
  difficulties: Difficulty[];
  category: string;
  difficulty: Difficulty | '';
  completionStatus: CompletionStatus;
  onCompletionStatusChange: (value: CompletionStatus) => void;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: Difficulty | '') => void;
};

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="peer h-12 w-full min-w-0 appearance-none truncate rounded-md border border-input bg-card px-4 pr-12 text-base"
        >
          {options.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground peer-open:hidden"
          aria-hidden="true"
        />
        <ChevronUp
          className="pointer-events-none absolute right-4 top-1/2 hidden size-4 -translate-y-1/2 text-muted-foreground peer-open:block"
          aria-hidden="true"
        />
      </div>
    </label>
  );
}

export function Filters({
  categories,
  difficulties,
  category,
  difficulty,
  completionStatus,
  onCompletionStatusChange,
  onCategoryChange,
  onDifficultyChange,
}: FiltersProps) {
  return (
    <div className="catalog-filters">
      <SelectField
        label="Category"
        value={category}
        onChange={onCategoryChange}
        options={[
          { label: 'All categories', value: '' },
          ...categories.map((item) => ({ label: item, value: item })),
        ]}
      />
      <SelectField
        label="Difficulty"
        value={difficulty}
        onChange={(value) => onDifficultyChange(value as Difficulty | '')}
        options={[
          { label: 'All levels', value: '' },
          ...difficulties.map((item) => ({ label: item, value: item })),
        ]}
      />
      <SelectField
        label="Completion status"
        value={completionStatus}
        onChange={(value) =>
          onCompletionStatusChange(value as CompletionStatus)
        }
        options={[
          { label: 'All', value: 'all' },
          { label: 'In Progress', value: 'in-progress' },
          { label: 'Completed', value: 'completed' },
        ]}
      />
    </div>
  );
}

"use client";

import type { Difficulty } from "@/lib/courses";

type FiltersProps = {
  categories: string[];
  difficulties: Difficulty[];
  category: string;
  difficulty: Difficulty | "";
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: Difficulty | "") => void;
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
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full min-w-0 rounded-md border border-input bg-card px-3 text-base"
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Filters({
  categories,
  difficulties,
  category,
  difficulty,
  onCategoryChange,
  onDifficultyChange,
}: FiltersProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField
        label="Category"
        value={category}
        onChange={onCategoryChange}
        options={[
          { label: "All categories", value: "" },
          ...categories.map((item) => ({ label: item, value: item })),
        ]}
      />
      <SelectField
        label="Difficulty"
        value={difficulty}
        onChange={(value) => onDifficultyChange(value as Difficulty | "")}
        options={[
          { label: "All levels", value: "" },
          ...difficulties.map((item) => ({ label: item, value: item })),
        ]}
      />
    </div>
  );
}

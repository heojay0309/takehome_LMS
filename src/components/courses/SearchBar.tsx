"use client";

import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <Input
      type="search"
      placeholder="Search courses, instructors..."
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Search courses"
    />
  );
}

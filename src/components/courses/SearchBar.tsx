"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      Search courses
      <span className="relative">
        <Search className="pointer-events-none absolute top-3.5 left-4 size-4 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          placeholder="What would you like to learn?"
          className="pl-11"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

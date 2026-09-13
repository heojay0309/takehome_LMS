"use client";

import type { Ref } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
};

export function SearchBar({ value, onChange, inputRef }: SearchBarProps) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
      Search courses
      <span className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="What would you like to learn?"
          className="pl-12"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

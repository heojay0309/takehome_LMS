"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type MockVideoPlayerProps = {
  title: string;
  durationMinutes: number;
};

export function MockVideoPlayer({ title, durationMinutes }: MockVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 text-white dark:border-zinc-800">
      <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Mock player</p>
        <h2 className="max-w-xl text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-zinc-400">{durationMinutes} min lesson</p>
        <Button
          variant="outline"
          className="border-zinc-600 bg-transparent text-white hover:bg-zinc-800"
          onClick={() => setIsPlaying((current) => !current)}
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm text-zinc-300">
        <span>{isPlaying ? "Playing preview..." : "Ready to play"}</span>
        <span>0:00 / {durationMinutes}:00</span>
      </div>
    </div>
  );
}

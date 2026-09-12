'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import { Pause, Play } from 'lucide-react';

const videoQuery = '(min-width: 1024px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)';
const videoSource = 'https://cdn.prod.website-files.com/60bec73c3161d258cff8900b%2F667c0477f2d119e2868832ac_Megan%20Broll%20Header%20V2%20%281%29-transcode.mp4';

function subscribe(onChange: () => void) {
  const query = window.matchMedia(videoQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getSnapshot() {
  return window.matchMedia(videoQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export function AuthVideo() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Do not even request media on small/portrait screens or with reduced motion.
  if (!enabled || hasError) return null;

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        src={videoSource}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        className="absolute inset-0 size-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#17152d]/95 via-[#242148]/80 to-[#242148]/65" />
      <button
        type="button"
        onClick={togglePlayback}
        className="absolute right-8 bottom-8 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 bg-[#17152d]/70 px-4 text-sm text-white transition-colors hover:bg-[#17152d] focus-visible:outline-white"
      >
        {isPlaying ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
        {isPlaying ? 'Pause video' : 'Play video'}
      </button>
    </>
  );
}

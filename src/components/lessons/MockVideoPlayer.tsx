'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAutoPlayFailureMessage } from '@/lib/lesson-playback';

// Placeholder footage, not instructional content. Replace when lesson media is available.
const sampleLessonVideo =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

type MockVideoPlayerProps = {
  title: string;
  durationMinutes: number;
  courseTitle: string;
  moduleTitle: string;
  poster?: string;
  onComplete?: () => void;
  endScreen?: ReactNode;
  consumeAutoPlay?: () => boolean;
};

type InlineVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
};

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
}

const controlClass =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40';

export function MockVideoPlayer({
  title,
  durationMinutes,
  courseTitle,
  moduleTitle,
  poster,
  onComplete,
  endScreen,
  consumeAutoPlay,
}: MockVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<InlineVideo>(null);
  const endScreenRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const focusEndScreen = useRef(false);
  const autoPlayAttempted = useRef(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || autoPlayAttempted.current) return;
    autoPlayAttempted.current = true;
    if (!consumeAutoPlay?.()) return;
    // The intent is consumed once, including React Strict Mode's effect replay.
    // A browser may still reject sound after route navigation; do not silently
    // mute the lesson or report it as playing until its play event arrives.
    void video.play().catch((error: unknown) => {
      const message = getAutoPlayFailureMessage(error);
      if (message && videoRef.current === video && video.paused)
        setError(message);
    });
  }, [consumeAutoPlay]);

  useEffect(() => {
    const updateFullscreen = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () =>
      document.removeEventListener('fullscreenchange', updateFullscreen);
  }, []);

  useEffect(() => {
    if (isPlaying) return;
    const timeout = window.setTimeout(() => setShowTitle(true), 1000);
    return () => window.clearTimeout(timeout);
  }, [isPlaying]);

  useEffect(() => {
    // Keep focus in the player when its controls are replaced, but do not
    // interrupt someone using the lesson checklist while the video ends.
    if (!focusEndScreen.current) return;
    if (hasEnded) endScreenRef.current?.focus({ preventScroll: true });
    else playButtonRef.current?.focus({ preventScroll: true });
  }, [hasEnded]);

  function finishPlayback() {
    focusEndScreen.current =
      containerRef.current?.contains(document.activeElement) ?? false;
    setIsPlaying(false);
    setHasEnded(true);
    setError('');
    onComplete?.();
    // iOS's native video-only fullscreen cannot display the HTML end screen.
    try {
      if (videoRef.current?.webkitDisplayingFullscreen)
        videoRef.current.webkitExitFullscreen?.();
    } catch {
      // Native fullscreen can still be dismissed using the browser controls.
    }
  }

  function replay() {
    const video = videoRef.current;
    if (!video) return;
    focusEndScreen.current = true;
    video.currentTime = 0;
    setCurrentTime(0);
    setHasEnded(false);
    setError('');
    void video
      .play()
      .catch(() => setError('The preview could not play. Please try again.'));
  }

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setError('');
      void video
        .play()
        .catch(() => setError('The preview could not play. Please try again.'));
    } else {
      video.pause();
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === containerRef.current) {
        await document.exitFullscreen();
      } else if (
        document.fullscreenEnabled &&
        containerRef.current?.requestFullscreen
      ) {
        await containerRef.current.requestFullscreen();
      } else if (videoRef.current?.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen();
      } else {
        setError(
          'Fullscreen is unavailable in this browser. You can keep watching here.',
        );
      }
    } catch {
      setError('Fullscreen is unavailable. You can keep watching here.');
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'lesson-player-frame group relative isolate overflow-hidden rounded-xl border border-border bg-black text-white shadow-sm fullscreen:rounded-none fullscreen:border-0 fullscreen:min-h-0',
        hasEnded && 'min-h-[30rem] sm:min-h-[32rem]',
      )}
    >
      <video
        ref={videoRef}
        src={sampleLessonVideo}
        poster={poster}
        playsInline
        preload="none"
        aria-label={`${title} — sample preview`}
        className="absolute inset-0 size-full object-contain"
        onPlay={() => {
          setError('');
          setHasEnded(false);
          setShowTitle(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={finishPlayback}
        onError={() => {
          setIsPlaying(false);
          setError(
            'The sample video is unavailable. You can still browse lessons below.',
          );
        }}
        onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          setDuration(Number.isFinite(value) ? value : 0);
        }}
      >
        Your browser does not support HTML5 video.
      </video>
      {!hasEnded && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          onClick={togglePlayback}
          className="absolute inset-0 cursor-pointer"
        />
      )}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 bg-black/70 transition-opacity duration-300 motion-reduce:transition-none',
          isPlaying ? 'opacity-0' : 'opacity-100',
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 pb-32 pt-4 sm:px-8 text-center transition-opacity duration-300 motion-reduce:duration-0',
          !isPlaying && showTitle && !hasEnded && !error ? 'opacity-100' : 'opacity-0',
        )}
      >
        <p className="hidden text-xs font-semibold tracking-widest text-white/70 uppercase sm:block">
          {courseTitle} · {moduleTitle}
        </p>
        <h2 className="max-w-3xl text-lg font-semibold text-balance sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        <p className="text-xs text-white/75 sm:text-sm">
          {durationMinutes} min lesson · Sample preview
        </p>
      </div>
      <p role="status" className="sr-only">
        {hasEnded
          ? 'Preview finished. Your progress and next steps are available in the player.'
          : ''}
      </p>
      {error && (
        <p
          role="alert"
          className="absolute inset-x-4 top-4 rounded-lg bg-black/90 p-4 text-sm"
        >
          {error}
        </p>
      )}
      {hasEnded && (
        <div
          ref={endScreenRef}
          tabIndex={-1}
          role="region"
          aria-label="Lesson finished"
          className="absolute inset-0 flex flex-col overflow-y-auto bg-linear-to-br from-[#242148] via-[#17152d] to-black p-4 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white sm:p-8"
        >
          <div className="my-auto shrink-0 space-y-8">
            {endScreen ?? (
              <h2 className="text-center text-2xl">
                Preview finished. Nice work!
              </h2>
            )}
            <div className="flex flex-wrap items-center justify-center gap-4 border-t border-white/15 pt-4">
              <button
                type="button"
                onClick={replay}
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm text-white/80 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
              >
                <RotateCcw className="size-4" aria-hidden="true" /> Replay
                preview
              </button>
              {isFullscreen && (
                <button
                  type="button"
                  onClick={() => void toggleFullscreen()}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm text-white/80 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <Minimize className="size-4" aria-hidden="true" /> Exit
                  fullscreen
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {!hasEnded && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-2 bg-linear-to-t from-black/95 to-transparent px-4 pt-4 pb-2 transition-opacity duration-150 motion-reduce:transition-none',
            isPlaying
              ? 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100'
              : 'opacity-100',
          )}
        >
          <input
            type="range"
            aria-label="Seek preview"
            aria-valuetext={`${formatClock(currentTime)} of ${formatClock(duration)}`}
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(currentTime, duration)}
            disabled={!duration}
            onChange={(event) => {
              const time = Number(event.target.value);
              if (videoRef.current) videoRef.current.currentTime = time;
              setCurrentTime(time);
            }}
            className="h-11 w-full cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-white"
          />
          <button
            ref={playButtonRef}
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
            className={controlClass}
          >
            {isPlaying ? (
              <Pause className="size-5" aria-hidden="true" />
            ) : (
              <Play className="size-5" aria-hidden="true" />
            )}
          </button>
          <span className="text-xs text-white/80 tabular-nums sm:text-sm">
            {formatClock(currentTime)} /{' '}
            {duration ? formatClock(duration) : '—'}
          </span>
          <div className="flex-1" />
          <button
            type="button"
            aria-label={isMuted ? 'Unmute preview' : 'Mute preview'}
            className={controlClass}
            onClick={() => {
              if (videoRef.current)
                videoRef.current.muted = !videoRef.current.muted;
            }}
          >
            {isMuted ? (
              <VolumeX className="size-5" aria-hidden="true" />
            ) : (
              <Volume2 className="size-5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={() => void toggleFullscreen()}
            className={controlClass}
          >
            {isFullscreen ? (
              <Minimize className="size-5" aria-hidden="true" />
            ) : (
              <Maximize className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

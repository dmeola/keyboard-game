"use client";

import { useEffect, useRef, useCallback } from "react";
import { letterData } from "@/lib/letterData";
import { useFaceFilter } from "./useFaceFilter";
import { drawLetterFilter, drawEmojiFilter } from "./filterRenderer";

interface CameraFilterProps {
  /** Currently active letter (uppercase), or null to show plain camera feed */
  activeLetter?: string | null;
  /**
   * When true the camera starts automatically (used by the play page which
   * controls visibility externally and passes isActive={true}).
   */
  isActive?: boolean;
}

export default function CameraFilter({
  activeLetter = null,
  isActive = false,
}: CameraFilterProps): React.JSX.Element {
  const { videoRef, canvasRef, isReady, isRunning, error, startCamera, stopCamera, latestResult } =
    useFaceFilter();

  const activeLetterRef = useRef(activeLetter);
  activeLetterRef.current = activeLetter;

  const drawLoopRef = useRef<number | null>(null);

  // Auto-start camera when isActive flips to true
  useEffect(() => {
    if (isActive && !isRunning) {
      void startCamera();
    }
    if (!isActive && isRunning) {
      stopCamera();
    }
  }, [isActive, isRunning, startCamera, stopCamera]);

  const paintFrame = useCallback((): void => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const letter = activeLetterRef.current;

    if (!canvas || !video || video.readyState < 2) {
      drawLoopRef.current = requestAnimationFrame(paintFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      drawLoopRef.current = requestAnimationFrame(paintFrame);
      return;
    }

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    ctx.save();
    // Mirror horizontally for selfie view
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();

    if (letter) {
      const result = latestResult.current;
      if (result && result.faceLandmarks.length > 0) {
        const landmarks = result.faceLandmarks[0];
        // Mirror landmark x coords to match the flipped video
        const mirroredLandmarks = landmarks.map((lm) => ({
          ...lm,
          x: 1 - lm.x,
        }));
        try {
          drawLetterFilter(ctx, mirroredLandmarks, letter, w, h);
        } catch {
          drawEmojiFilter(ctx, letter, w, h);
        }
      } else if (result !== null) {
        drawEmojiFilter(ctx, letter, w, h);
      }
    }

    drawLoopRef.current = requestAnimationFrame(paintFrame);
  }, [canvasRef, videoRef, latestResult]);

  // Start/stop paint loop based on running state
  useEffect(() => {
    if (isRunning) {
      drawLoopRef.current = requestAnimationFrame(paintFrame);
    }
    return () => {
      if (drawLoopRef.current !== null) {
        cancelAnimationFrame(drawLoopRef.current);
        drawLoopRef.current = null;
      }
    };
  }, [isRunning, paintFrame]);

  const letterEntry = activeLetter ? letterData[activeLetter] : null;

  // Always render video + canvas in the same DOM position so React never
  // unmounts and remounts them across state transitions. The stream is attached
  // to the video element by ref; remounting it would detach the srcObject and
  // leave the draw loop waiting for readyState >= 2 forever.
  return (
    <div className="relative w-full h-full">
      {/* Hidden video element — stream source for canvas drawing */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="pointer-events-none absolute opacity-0 w-0 h-0"
        aria-hidden="true"
      />

      {/* Pre-running overlay — loading / enable-camera prompt */}
      {!isRunning && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
          {isActive ? (
            <p className="text-center text-sm text-white/50">
              {isReady ? "Starting camera…" : "Loading AI…"}
            </p>
          ) : (
            <>
              <span className="text-5xl">📷</span>
              <p className="text-center text-sm font-medium text-white/80">
                Turn on your camera to see yourself as a fun character!
              </p>
              {error && <p className="text-center text-xs text-red-300">{error}</p>}
              <button
                onClick={() => void startCamera()}
                disabled={!isReady}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-purple-700 shadow-lg transition hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isReady ? "Enable Camera 🎭" : "Loading AI…"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Canvas is always in the DOM — visible only when running */}
      <canvas
        ref={canvasRef}
        className={`block w-full h-full rounded-2xl object-cover ${isRunning ? "opacity-100" : "opacity-0"}`}
      />

      {/* Letter badge overlay */}
      {isRunning && letterEntry && activeLetter && (
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
          <span className="text-lg leading-none">{letterEntry.emoji}</span>
          <span className="text-base font-black leading-none text-white">
            {activeLetter}
          </span>
        </div>
      )}

      {/* Close button — only shown in standalone mode */}
      {isRunning && !isActive && (
        <button
          onClick={stopCamera}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          aria-label="Disable camera"
        >
          ✕
        </button>
      )}
    </div>
  );
}

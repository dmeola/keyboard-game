"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { FaceLandmarker, FaceLandmarkerResult } from "@mediapipe/tasks-vision";

// Pin to the exact installed @mediapipe/tasks-vision version so the WASM
// binary and JS runtime never mismatch (using @latest caused breaks when
// jsdelivr resolved to a newer version than what's installed locally).
const MEDIAPIPE_VERSION = "0.10.35";
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

export interface FaceFilterState {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
  isRunning: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  latestResult: React.RefObject<FaceLandmarkerResult | null>;
}

export function useFaceFilter(): FaceFilterState {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const latestResult = useRef<FaceLandmarkerResult | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load MediaPipe model on mount
  useEffect(() => {
    let cancelled = false;

    async function loadModel(): Promise<void> {
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
        if (!cancelled) {
          landmarkerRef.current = landmarker;
          setIsReady(true);
        }
      } catch {
        if (!cancelled) {
          // Retry with CPU delegate on GPU failure
          try {
            const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
            const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
            const landmarker = await FaceLandmarker.createFromOptions(vision, {
              baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
              runningMode: "VIDEO",
              numFaces: 1,
            });
            if (!cancelled) {
              landmarkerRef.current = landmarker;
              setIsReady(true);
            }
          } catch (err2) {
            if (!cancelled) {
              setError("Camera filter unavailable — could not load AI model.");
              console.error("FaceLandmarker load failed:", err2);
            }
          }
        }
      }
    }

    void loadModel();
    return () => {
      cancelled = true;
    };
  }, []);

  const stopCamera = useCallback((): void => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    latestResult.current = null;
    setIsRunning(false);
  }, []);

  const startCamera = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      video.srcObject = stream;
      await video.play();
      setIsRunning(true);

      let lastTimestamp = -1;

      function tick(): void {
        const vid = videoRef.current;
        const canvas = canvasRef.current;
        const landmarker = landmarkerRef.current;

        if (!vid || !canvas || vid.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        // Sync canvas size to video
        if (canvas.width !== vid.videoWidth) canvas.width = vid.videoWidth;
        if (canvas.height !== vid.videoHeight) canvas.height = vid.videoHeight;

        const now = performance.now();
        if (now !== lastTimestamp && landmarker) {
          try {
            const result = landmarker.detectForVideo(vid, now);
            latestResult.current = result;
          } catch {
            // Detection errors are non-fatal
          }
          lastTimestamp = now;
        }

        rafRef.current = requestAnimationFrame(tick);
      }

      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access and try again."
            : err.message
          : "Failed to access camera.";
      setError(msg);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { videoRef, canvasRef, isReady, isRunning, error, startCamera, stopCamera, latestResult };
}

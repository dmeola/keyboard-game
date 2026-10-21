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
  /**
   * Run face detection on the current video frame. Call from the paint loop;
   * returns the cached result when the video hasn't produced a new frame.
   */
  detect: () => FaceLandmarkerResult | null;
}

export function useFaceFilter(): FaceFilterState {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const latestResult = useRef<FaceLandmarkerResult | null>(null);
  const lastVideoTimeRef = useRef(-1);
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    latestResult.current = null;
    lastVideoTimeRef.current = -1;
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

  const detect = useCallback((): FaceLandmarkerResult | null => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) return latestResult.current;

    // Only detect when the camera has delivered a new frame
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      try {
        latestResult.current = landmarker.detectForVideo(video, performance.now());
      } catch {
        // Detection errors are non-fatal
      }
    }
    return latestResult.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { videoRef, canvasRef, isReady, isRunning, error, startCamera, stopCamera, detect };
}

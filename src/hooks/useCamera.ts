import { useCallback } from "react";
import { CameraInputSource, InputSource } from "../types";
import useResource from "./useResource";

export const isCameraSource = (
  source: InputSource
): source is CameraInputSource =>
  ["frontalCamera", "backCamera"].includes(source);

const loadCamera = (source: CameraInputSource) =>
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: source === "frontalCamera" ? "user" : "environment",
    },
  });

export default function useCamera(inputSource: InputSource) {
  return useResource(
    useCallback(
      async () =>
        isCameraSource(inputSource) ? loadCamera(inputSource) : null,
      [inputSource]
    )
  );
}

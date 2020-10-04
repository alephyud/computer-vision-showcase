import React from "react";
import useResource from "./useResource";

const getCameras = async () =>
  (await navigator.mediaDevices.enumerateDevices()).filter(
    ({ kind }) => kind === "videoinput"
  );

/**
 * Check whether the device supports WebGL - this is the way Tensorflow JS does it.
 * https://github.com/tensorflow/tfjs/blob/62636fff9f01019b94d4aa338c41ce40f60412f8/tfjs-backend-webgl/src/canvas_util.ts#L20
 */
const hasWebGl = !!document.createElement("canvas").getContext("webgl", {
  alpha: false,
  antialias: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
  depth: false,
  stencil: false,
  failIfMajorPerformanceCaveat: true
});

export interface HardwareInfo {
  hasWebGl: boolean;
  cameras: MediaDeviceInfo[];
}

export default function useHardwareCapabilities() {
  return useResource(
    React.useCallback(
      async () => ({ hasWebGl, cameras: await getCameras() }),
      []
    )
  );
}

import React from "react";
import SettingsMenu from "./components/SettingsMenu";
import useCamera, { isCameraSource } from "./hooks/useCamera";
import useHardwareCapabilities, {
  HardwareInfo,
} from "./hooks/useHardwareCapabilities";
import useSizeRef from "./hooks/useSizeRef";
import useFaceApi, { FaceApiParams } from "./hooks/useFaceApi";
import { FaceResult, InputSource } from "./types";
import useResource, { Resource } from "./hooks/useResource";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCircleNotch,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import { createCanvasFromMedia } from "face-api.js";
import FaceDetectionResults from "./components/FaceDetectionResults";

export interface InputLayerProps {
  source: InputSource;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function InputLayer({ source, videoRef }: InputLayerProps) {
  const camera = useCamera(source);
  const [containerRef, { width, height }] = useSizeRef<HTMLDivElement>();
  const [videoAspectRatio, setVideoAspectRatio] = React.useState(1.0);
  const containerAspectRatio = width / height;
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = camera.resource;
  }, [videoRef, camera.resource]);
  const [videoWidth, videoHeight] =
    containerAspectRatio > videoAspectRatio
      ? // container wider than video - same height
        [height * videoAspectRatio, height]
      : // container narrower than video - same width
        [width, width / videoAspectRatio];
  return (
    <div className="absolute inset-0 text-center bg-black" ref={containerRef}>
      {isCameraSource(source) && (
        <video
          ref={videoRef}
          onCanPlay={() => videoRef.current?.play()}
          autoPlay
          playsInline
          muted
          width={videoWidth}
          height={videoHeight}
          className="absolute top-0"
          // Centre the video horizontally
          style={{ left: "50%", marginLeft: -videoWidth / 2 }}
          onLoadedMetadata={({ currentTarget: t }) =>
            setVideoAspectRatio(t.videoWidth / t.videoHeight)
          }
        />
      )}
    </div>
  );
}

export function ResultLayer({
  results: { resource: output, loading, lastStart, lastEnd },
  width,
  height,
}: {
  results: Resource<FaceResult[] | null>;
  width?: number;
  height?: number;
}) {
  return (
    <div
      className="absolute top-0 text-center"
      // Centre horizontally to align with the video
      style={{ left: "50%", marginLeft: -(width || 0) / 2, width, height }}
    >
      <div>
        {!loading && output && (
          <div>Done in {(lastEnd.getTime() - lastStart.getTime()) / 1000}s</div>
        )}
        {output && (
          <FaceDetectionResults
            results={output}
            width={width}
            height={height}
          />
        )}
      </div>
    </div>
  );
}

export function ControlsLayer({
  autoPlay,
  isReady,
  isWorking,
  hardware,
  onShoot,
}: {
  autoPlay: boolean;
  isReady: boolean;
  isWorking: boolean;
  hardware: Resource<HardwareInfo>;
  onShoot: () => void;
}) {
  const hasMultipleCameras = (hardware.resource?.cameras.length || 0) > 1;
  return (
    <>
      {/* Buttons absolutely positioned (near the bottom of the screen),
          with limited max width on wide screens
          https://stackoverflow.com/a/24859531/4534687 */}
      <div className="absolute inline-block bottom-0 inset-x-0 text-center mx-auto my-4 px-4 w-full max-w-sm">
        {!hasMultipleCameras && (
          <button className="bg-indigo-800 rounded px-2 py-1 text-white float-left">
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        )}
        {!autoPlay && isReady && (
          <button
            className={`bg-red-${
              isWorking ? 600 : 800
            } rounded px-2 py-1 text-white`}
            disabled={isWorking}
            onClick={onShoot}
          >
            <FontAwesomeIcon
              icon={isWorking ? faCircleNotch : faCamera}
              spin={isWorking}
            />
          </button>
        )}
      </div>
    </>
  );
}

function createCanvasFromMediaOrNull(
  media: HTMLVideoElement | HTMLImageElement | ImageData
) {
  try {
    return createCanvasFromMedia(media);
  } catch (e) {
    // media not yet initialised
    return null;
  }
}

export default function App() {
  const hardware = useHardwareCapabilities();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [autoPlay, setAutoPlay] = React.useState(!!hardware.resource?.hasWebGl);
  const [faceApiParams, setFaceApiParams] = React.useState<FaceApiParams>({
    tiny: true,
    allFaces: true,
    withAgeAndGender: true,
    withExpressions: true,
  });
  const model = useFaceApi(faceApiParams);
  const [input, setInput] = React.useState<HTMLCanvasElement | null>(null);
  const setInputFromMedia = React.useCallback(() => {
    const media = videoRef.current;
    setInput(media && createCanvasFromMediaOrNull(media));
  }, []);
  React.useEffect(() => {
    if (!autoPlay) setInput(null);
  }, [autoPlay, videoRef, model.resource]);
  const processInput = React.useCallback(async () => {
    if (!input || !model.resource) return null;
    return model.resource.apply(input);
  }, [model.resource, input]);
  const output = useResource(processInput, {
    // NN calculations are done in the main thread. We add a brief debounce period before start
    // to be able to show in the UI that the result is being computed
    debounce: model.resource ? 100 : undefined,
  });
  return (
    <div className="h-full relative">
      <InputLayer videoRef={videoRef} source="frontalCamera" />
      <ResultLayer
        results={output}
        width={videoRef.current?.clientWidth}
        height={videoRef.current?.clientHeight}
      />
      <ControlsLayer
        autoPlay={autoPlay}
        hardware={hardware}
        isWorking={output.loading}
        isReady={!!videoRef.current && !!model.resource}
        onShoot={setInputFromMedia}
      />
      {hardware.resource && (
        <SettingsMenu
          hardwareInfo={hardware.resource}
          {...{ autoPlay, setAutoPlay, faceApiParams, setFaceApiParams }}
        />
      )}
    </div>
  );
}

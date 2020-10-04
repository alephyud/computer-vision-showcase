import React from "react";
import SettingsMenu from "./components/SettingsMenu";
import useCamera, { isCameraSource } from "./hooks/useCamera";
import useHardwareCapabilities, {
  HardwareInfo,
} from "./hooks/useHardwareCapabilities";
import useSizeRef from "./hooks/useSizeRef";
import useFaceApi from "./hooks/useFaceApi";
import { InputSource } from "./types";
import useResource, { Resource } from "./hooks/useResource";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import * as faceApi from "face-api.js";

const rafPromise = () => new Promise((res) => requestAnimationFrame(res));

export interface InputLayerProps {
  source: InputSource;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function InputLayer({ source, videoRef }: InputLayerProps) {
  const camera = useCamera(source);
  const [containerRef, { width }] = useSizeRef<HTMLDivElement>();
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = camera.resource;
  }, [videoRef, camera.resource]);
  return (
    <div
      className="absolute inset-0 bg-blue-500 text-center"
      ref={containerRef}
    >
      {isCameraSource(source) && (
        <video
          ref={videoRef}
          onCanPlay={() => videoRef.current?.play()}
          autoPlay
          playsInline
          muted
          width={width}
          className="absolute top-0 left-0"
        />
      )}
    </div>
  );
}

export function ResultLayer({
  results: { resource: output, loading, lastStart, lastEnd },
}: {
  results: Resource<faceApi.FaceDetection[] | null>;
}) {
  return (
    <div className="absolute inset-0 text-center">
      {loading && "Working..."}
      {!loading && output && (
        <div>Done in {(lastEnd.getTime() - lastStart.getTime()) / 1000}s</div>
      )}
    </div>
  );
}

export function ControlsLayer({
  autoPlay,
  isReady,
  hardware,
  onShoot,
}: {
  autoPlay: boolean;
  isReady: boolean;
  hardware: Resource<HardwareInfo>;
  onShoot: () => void;
}) {
  const hasMultipleCameras = (hardware.resource?.cameras.length || 0) > 1;
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 text-center mb-4 ml-4">
        {hasMultipleCameras && (
          <button className="bg-indigo-800 rounded px-2 py-1 text-white float-left">
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        )}
        {!autoPlay && isReady && (
          <button
            className="bg-red-800 rounded px-2 py-1 text-white"
            onClick={onShoot}
          >
            <FontAwesomeIcon icon={faCamera} />
          </button>
        )}
      </div>
    </>
  );
}

const initialFaceApiSettings = {
  tiny: true,
  allFaces: false,
  withAgeAndGender: false,
  withExpressions: false,
};

function createCanvasFromMediaOrNull(
  media: HTMLVideoElement | HTMLImageElement | ImageData
) {
  try {
    return faceApi.createCanvasFromMedia(media);
  } catch (e) {
    // media not yet initialised
    return null;
  }
}

export default function App() {
  const hardware = useHardwareCapabilities();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [autoPlay] = React.useState(false); // hardware.resource?.hasWebGl
  const model = useFaceApi(initialFaceApiSettings);
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
    await rafPromise();
    await rafPromise();
    return model.resource.apply(input);
  }, [model.resource, input]);
  const output = useResource(processInput);
  return (
    <div className="h-full relative">
      <InputLayer videoRef={videoRef} source="frontalCamera" />
      <ResultLayer results={output} />
      <ControlsLayer
        autoPlay={autoPlay}
        hardware={hardware}
        isReady={!!videoRef.current && !!model.resource}
        onShoot={setInputFromMedia}
      />
      <SettingsMenu hardwareInfo={hardware} />
    </div>
  );
}

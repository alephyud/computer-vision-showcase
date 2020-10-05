import { faCamera } from "@fortawesome/free-solid-svg-icons/faCamera";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons/faCircleNotch";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons/faSyncAlt";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createCanvasFromMedia } from "face-api.js";
import React from "react";
import FaceDetectionResults from "./components/FaceDetectionResults";
import SettingsMenu from "./components/SettingsMenu";
import useCamera, { isCameraSource } from "./hooks/useCamera";
import useFaceApi, { FaceApiParams } from "./hooks/useFaceApi";
import useHardwareCapabilities from "./hooks/useHardwareCapabilities";
import useResource, { Resource } from "./hooks/useResource";
import useSizeRef from "./hooks/useSizeRef";
import { FaceResult, InputSource } from "./types";

export interface InputLayerProps {
  source: InputSource;
  mediaRef: React.RefObject<HTMLVideoElement>;
}

export function InputLayer({ source, mediaRef }: InputLayerProps) {
  const camera = useCamera(source);
  const [containerRef, { width, height }] = useSizeRef<HTMLDivElement>();
  const [mediaAspectRatio, setMediaAspectRatio] = React.useState(1.0);
  const containerAspectRatio = width / height;
  React.useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.srcObject = camera.resource;
  }, [mediaRef, camera.resource]);
  const [mediaWidth, mediaHeight] =
    containerAspectRatio > mediaAspectRatio
      ? // container wider than media - same height
        [height * mediaAspectRatio, height]
      : // container narrower than media - same width
        [width, width / mediaAspectRatio];
  return (
    <div className="absolute inset-0 text-center bg-black" ref={containerRef}>
      {isCameraSource(source) && (
        <video
          ref={mediaRef}
          onCanPlay={() => mediaRef.current?.play()}
          autoPlay
          playsInline
          muted
          width={mediaWidth}
          height={mediaHeight}
          className="absolute top-0"
          // Centre the media horizontally
          style={{ left: "50%", marginLeft: -mediaWidth / 2 }}
          onLoadedMetadata={({ currentTarget: t }) =>
            setMediaAspectRatio(t.videoWidth / t.videoHeight)
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
      // Centre horizontally to align with the input media
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
  toggleCamera,
  onShoot,
}: {
  autoPlay: boolean;
  isReady: boolean;
  isWorking: boolean;
  toggleCamera?: () => void;
  onShoot: () => void;
}) {
  /**
   * Buttons absolutely positioned (near the bottom of the screen), with limited
   * max width on wide screens: https://stackoverflow.com/a/24859531/4534687
   * leading-none (line-height=1) is needed to make the buttons circular not elliptical
   **/
  const containerClass =
    "absolute inline-block bottom-0 inset-x-0 mx-auto my-4 px-4 w-full max-w-sm leading-none";
  return (
    <>
      <div className={containerClass}>
        <div className="w-1/3 inline-block text-left">
          {toggleCamera && (
            <button className="bg-indigo-800 rounded-full p-2 text-white">
              <FontAwesomeIcon icon={faSyncAlt} onClick={toggleCamera} />
            </button>
          )}
        </div>
        <div className="w-1/3 inline-block text-center">
          {!autoPlay && isReady && (
            <button
              className={`bg-red-${
                isWorking ? 600 : 800
              } rounded-full p-2 text-white`}
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
        <div className="w-1/3 inline-block bg-black" />
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
  const hasMultipleCameras = (hardware.resource?.cameras.length || 0) > 1;
  const mediaRef = React.useRef<HTMLVideoElement>(null);
  const [inputSource, setInputSource] = React.useState<InputSource>(
    "frontalCamera"
  );
  const toggleCamera = React.useCallback(() => {
    setInputSource((source) =>
      source === "backCamera" ? "frontalCamera" : "backCamera"
    );
    setInput(null);
  }, []);
  const [faceApiParams, setFaceApiParams] = React.useState<FaceApiParams>({
    tiny: true,
    allFaces: true,
    withAgeAndGender: true,
    withExpressions: true,
  });
  const model = useFaceApi(faceApiParams);
  const [input, setInput] = React.useState<HTMLCanvasElement | null>(null);
  const setInputFromMedia = React.useCallback(() => {
    const media = mediaRef.current;
    setInput(media && createCanvasFromMediaOrNull(media));
  }, []);
  const [autoPlay, setAutoPlay] = React.useState(!!hardware.resource?.hasWebGl);
  React.useEffect(() => {
    if (!autoPlay) setInput(null);
  }, [autoPlay, mediaRef, model.resource]);
  const processInput = React.useCallback(async () => {
    if (!input || !model.resource) return null;
    return model.resource.apply(input);
  }, [model.resource, input]);
  const output = useResource(processInput, {
    // NN calculations are done in the main thread. We add a brief delay period before start
    // to be able to show in the UI that the result is being computed
    delay: model.resource && input ? 100 : undefined,
  });
  return (
    <div className="h-full relative">
      <InputLayer mediaRef={mediaRef} source={inputSource} />
      <ResultLayer
        results={output}
        width={mediaRef.current?.clientWidth}
        height={mediaRef.current?.clientHeight}
      />
      <ControlsLayer
        autoPlay={autoPlay}
        toggleCamera={hasMultipleCameras ? toggleCamera : undefined}
        isWorking={output.loading}
        isReady={!!mediaRef.current && !!model.resource}
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

import React, { useState } from "react";
import ControlsOverlay from "./components/ControlsOverlay";
import InputContainer from "./components/InputContainer";
import ResultLayer from "./components/ResultsOverlay";
import SettingsMenu from "./components/SettingsMenu";
import { isCameraSource } from "./hooks/useCamera";
import useFaceApi, { FaceApiParams } from "./hooks/useFaceApi";
import useHardwareCapabilities, {
  hasWebGl,
} from "./hooks/useHardwareCapabilities";
import useResource from "./hooks/useResource";
import { InputSource } from "./types";
import { createCanvasFromMediaOrNull } from "./utils/media";

export default function App() {
  const hardware = useHardwareCapabilities();
  const hasMultipleCameras = (hardware.resource?.cameras.length || 0) > 1;

  // Input source - we'll add image uploads, but for now we support only camera
  const [inputSource, setInputSource] = React.useState<InputSource>(
    "frontalCamera"
  );

  // The input for the NN is obtained from a media element inside the
  // InputContainer component - so the app needs to have a ref to the element
  const mediaRef = React.useRef<HTMLVideoElement>(null);

  // Model parameters can be changed by the user in Settings
  const [faceApiParams, setFaceApiParams] = React.useState<FaceApiParams>({
    tiny: true,
    allFaces: true,
    withAgeAndGender: true,
    withExpressions: true,
    withDescriptors: false,
    withLandmarks: true,
    scoreThreshold: 0.5,
  });
  const model = useFaceApi(faceApiParams);
  const readyForProcessing = !!mediaRef.current && !!model.resource;

  // We provide the data to face-api.js using an off-screen canvas - input contains
  // the media snapshot which will be passed to the NN
  const [input, setInput] = React.useState<HTMLCanvasElement | null>(null);
  const setInputFromMedia = React.useCallback(() => {
    const media = mediaRef.current;
    setInput(media && createCanvasFromMediaOrNull(media));
  }, []);
  const toggleCamera = React.useCallback(() => {
    setInputSource((source) =>
      source === "backCamera" ? "frontalCamera" : "backCamera"
    );
    setInput(null);
  }, []);

  // The NN run is triggered by React hook machinery when either the input
  // or the model have been changed
  const processInput = React.useCallback(async () => {
    if (!input || !model.resource) return null;
    const startTime = new Date();
    const result = await model.resource.apply(input);
    const endTime = new Date();
    return { startTime, endTime, result };
  }, [model.resource, input]);
  const output = useResource(processInput, {
    // NN runs in the main thread. We add a brief delay period before start
    // to be able to show in the UI that the result is being computed
    delay: model.resource && input ? 100 : undefined,
  });

  // If the user's device is fast enough, we can make the camera / NN cycle
  // loop automatically; otherwise, it's better to let the user click the button
  // to start processing.
  const [autoPlay, setAutoPlay] = React.useState(hasWebGl);
  React.useEffect(() => setInput(null), [autoPlay, mediaRef, model.resource]);
  const [autoplayCounter, setAutoplayCounter] = useState(0);
  React.useEffect(() => {
    const interval = window.setInterval(
      () => setAutoplayCounter((t) => t + 1),
      1000
    );
    return () => clearInterval(interval);
  }, []);
  React.useEffect(() => {
    if (
      autoPlay &&
      readyForProcessing &&
      !output.loading &&
      isCameraSource(inputSource)
    ) {
      setInputFromMedia();
    }
  }, [
    output,
    autoPlay,
    setInputFromMedia,
    readyForProcessing,
    inputSource,
    autoplayCounter,
  ]);

  return (
    <div className="h-full relative">
      <InputContainer mediaRef={mediaRef} source={inputSource} />
      <ResultLayer
        results={output}
        width={mediaRef.current?.clientWidth}
        height={mediaRef.current?.clientHeight}
        transitions={autoPlay}
      />
      <ControlsOverlay
        autoPlay={autoPlay}
        toggleCamera={hasMultipleCameras ? toggleCamera : undefined}
        isWorking={output.loading}
        isReady={readyForProcessing}
        onShoot={setInputFromMedia}
      />
      <SettingsMenu
        autoPlay={autoPlay}
        setAutoPlay={setAutoPlay}
        faceApiParams={faceApiParams}
        setFaceApiParams={setFaceApiParams}
      />
    </div>
  );
}

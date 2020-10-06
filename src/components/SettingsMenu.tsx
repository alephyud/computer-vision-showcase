import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { FaceApiParams } from "../hooks/useFaceApi";
import useHardwareCapabilities, {
  HardwareInfo,
  hasWebGl,
} from "../hooks/useHardwareCapabilities";
import { UseState } from "../types";

interface Props {
  autoPlay: boolean;
  setAutoPlay: React.Dispatch<React.SetStateAction<boolean>>;
  faceApiParams: FaceApiParams;
  setFaceApiParams: React.Dispatch<React.SetStateAction<FaceApiParams>>;
}

const HardwareInfoView: React.FC = () => {
  const { resource: hardwareInfo } = useHardwareCapabilities();
  if (!hardwareInfo) return null;
  const { hasWebGl, cameras } = hardwareInfo;
  return (
    <>
      <h3 className="my-2 text-lg">Your hardware</h3>
      <div className="mt-1">
        WebGL hardware acceleration {hasWebGl ? "supported" : "not supported"}.
      </div>
      <div className="mt-1">
        You have {cameras.length} camera{cameras.length !== 1 && "s"}.
      </div>
    </>
  );
};

const Checkbox: React.FC<{
  state: UseState<boolean>;
}> = ({ state: [value, setValue], children }) => (
  <div>
    <label>
      <input
        type="checkbox"
        checked={value}
        onClick={() => setValue(!value)}
        className="mr-1"
      />
      {children}
    </label>
  </div>
);

const Slider: React.FC<{
  state: UseState<number>;
}> = ({ state: [value, setValue], children }) => (
  <div className="mt-1">
    <input
      type="range"
      value={value}
      min={0}
      max={1}
      step={0.01}
      onChange={(e) => setValue(Number(e.currentTarget.value))}
    />
    {Math.round(value * 100) / 100}
    <label className="block">{children}</label>
  </div>
);

const menuWidth = 250;

export default function SettingsMenu({
  faceApiParams,
  setFaceApiParams,
  autoPlay,
  setAutoPlay,
}: Props) {
  const [shown, setShown] = React.useState(false);
  /*
   We keep the settings in the menu component's state while the menu is open
   and save them to the outer component's state when the menu is closed.
   Not destructuring local state variables is a bit ugly but it makes
   references to individual controls' more compact.
  */
  const localTiny = React.useState(false);
  const localAllFaces = React.useState(false);
  const localWithExpressions = React.useState(false);
  const localWithAgeAndGender = React.useState(false);
  const localScoreThreshold = React.useState(0.5);
  const localAutoPlay = React.useState(false);
  const open = () => {
    // Load local state from outer component's state
    localTiny[1](faceApiParams.tiny);
    localAllFaces[1](faceApiParams.allFaces);
    localWithExpressions[1](faceApiParams.withExpressions);
    localWithAgeAndGender[1](faceApiParams.withAgeAndGender);
    localScoreThreshold[1](faceApiParams.scoreThreshold);
    localAutoPlay[1](autoPlay);
    setAutoPlay(false);
    setShown(true);
  };
  const saveAndClose = () => {
    setFaceApiParams({
      tiny: localTiny[0],
      allFaces: localAllFaces[0],
      withExpressions: localWithExpressions[0],
      withAgeAndGender: localWithAgeAndGender[0],
      scoreThreshold: localScoreThreshold[0],
    });
    setAutoPlay(localAutoPlay[0]);
    setShown(false);
  };
  return (
    <>
      {shown && <div className="fixed inset-0" onClick={saveAndClose} />}
      <div
        className="fixed inset-y-0 bg-gray-200 p-2 transition-all duration-500 ease-in-out overflow-y-scroll"
        style={{ width: menuWidth, left: shown ? 0 : -menuWidth }}
      >
        <h2 className="my-2 text-xl">Settings</h2>
        <Checkbox state={localAutoPlay}>Scan in real time</Checkbox>
        {!hasWebGl && (
          <div className="text-sm">
            Note: real-time detection is not recommended on devices without
            hardware WebGL support; your UI can become unresponsive.
          </div>
        )}
        <h3 className="my-2 text-lg">face-api.js settings</h3>
        <Checkbox state={localTiny}>Use tiny model</Checkbox>
        <Checkbox state={localWithExpressions}>
          Detect face expressions
        </Checkbox>
        <Checkbox state={localWithAgeAndGender}>Detect gender and age</Checkbox>
        <Checkbox state={localAllFaces}>Allow multiple faces</Checkbox>
        <Slider state={localScoreThreshold}>Score threshold</Slider>
        <HardwareInfoView />
        <div className="mt-2">
          <a
            href="https://github.com/alephyud/computer-vision-showcase"
            className="hover:underline"
          >
            <FontAwesomeIcon icon={faGithub} /> Source code
          </a>
        </div>
      </div>
      <button
        className="fixed top-0 bg-gray-200 p-2 leading-none rounded-r-lg transition-all duration-500 ease-in-out"
        style={{ left: shown ? menuWidth : 0 }}
        onClick={shown ? saveAndClose : open}
      >
        <FontAwesomeIcon icon={shown ? faTimes : faCog} />
      </button>
    </>
  );
}

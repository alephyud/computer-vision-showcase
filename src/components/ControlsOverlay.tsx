import { faCamera } from "@fortawesome/free-solid-svg-icons/faCamera";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons/faCircleNotch";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons/faSyncAlt";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface Props {
  autoPlay: boolean;
  isReady: boolean;
  isWorking: boolean;
  toggleCamera?: () => void;
  onShoot: () => void;
}

export default function ControlsOverlay({
  autoPlay,
  isReady,
  isWorking,
  toggleCamera,
  onShoot,
}: Props) {
  /**
   * Buttons to be absolutely positioned near the bottom of the screen, with limited
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

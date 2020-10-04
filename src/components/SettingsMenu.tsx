import { faCog, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { HardwareInfo } from "../hooks/useHardwareCapabilities";
import { Resource } from "../hooks/useResource";

interface Props {
  hardwareInfo: Resource<HardwareInfo>;
}

const CamerasInfoView: React.FC<{ cameras: HardwareInfo["cameras"] }> = ({
  cameras,
}) => (
  <div>
    You have {cameras.length} camera{cameras.length !== 1 && "s"}
  </div>
);

const HardwareInfoView: React.FC<{ hardwareInfo: HardwareInfo }> = ({
  hardwareInfo,
}) => (
  <>
    <div>
      {hardwareInfo.hasWebGl ? "WebGL supported" : "WebGL not supported"}
    </div>
    <CamerasInfoView cameras={hardwareInfo.cameras} />
  </>
);

export default function SettingsMenu({ hardwareInfo }: Props) {
  const [shown, setShown] = React.useState(false);
  const menuWidth = 250;
  return (
    <>
      {shown && (
        <div className="fixed inset-0" onClick={() => setShown(false)} />
      )}
      <div
        className="fixed inset-y-0 bg-gray-500 p-2 transition-all duration-500 ease-in-out"
        style={{ width: menuWidth, left: shown ? 0 : -menuWidth }}
      >
        {hardwareInfo.resource && (
          <HardwareInfoView hardwareInfo={hardwareInfo.resource} />
        )}
      </div>
      <button
        className="fixed top-0 bg-gray-500 px-2 pt-1 rounded-r-lg transition-all duration-500 ease-in-out"
        style={{ left: shown ? menuWidth : 0 }}
        onClick={() => setShown(!shown)}
      >
        <FontAwesomeIcon icon={shown ? faTimes : faCog} />
      </button>
    </>
  );
}

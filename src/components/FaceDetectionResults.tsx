import React from "react";
import * as faceApi from "face-api.js";
import { FaceResult } from "../types";

interface FaceBarProps {
  size: number;
  emoji: string;
  color: string;
}

function FaceBar({ size, emoji, color }: FaceBarProps) {
  return (
    <span style={{ flex: size, backgroundColor: color }}>
      {size > 0.05 && emoji}
    </span>
  );
}

interface FaceExpressionsProps {
  expressions: faceApi.FaceExpressions;
}

export function FaceExpressions({ expressions }: FaceExpressionsProps) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        textAlign: "center",
      }}
    >
      <FaceBar size={expressions.neutral} emoji="😐" color="LightGray" />
      <FaceBar size={expressions.happy} emoji="😃" color="Fuchsia" />
      <FaceBar size={expressions.sad} emoji="😢" color="LightBlue" />
      <FaceBar size={expressions.angry} emoji="😠" color="Red" />
      <FaceBar size={expressions.fearful} emoji="😱" color="Yellow" />
      <FaceBar size={expressions.disgusted} emoji="🤢" color="Green" />
      <FaceBar size={expressions.surprised} emoji="😮" color="Cyan" />
    </div>
  );
}

interface ResultsOverlayProps {
  results: FaceResult[];
  width?: number;
  height?: number;
  transitions: boolean;
}

const FaceOverlay: React.FC<{ result: FaceResult; transitions: string }> = ({
  result: { detection, expressions, gender, age },
  transitions,
}) => (
  <div
    className={`border-4 border-white absolute rounded-lg ${transitions}`}
    style={{
      left: detection.box.x,
      width: detection.box.width,
      top: detection.box.y,
      height: detection.box.height,
    }}
  >
    {age != null && gender && (
      <div className="bg-opacity-50 bg-white px-1 rounded-t">
        {Math.round(age)}, {gender}
      </div>
    )}
    {expressions && <FaceExpressions expressions={expressions} />}
  </div>
);

export default function FaceDetectionResults({
  results,
  width,
  height,
  transitions,
}: ResultsOverlayProps) {
  const resizedResults =
    width && height
      ? faceApi.resizeResults(results, { width, height })
      : results;
  const transitionClass = transitions
    ? "transition-all duration-300 ease-in-out"
    : "";
  return (
    <>
      {resizedResults.map((result, index) => (
        <FaceOverlay
          key={index}
          result={result}
          transitions={transitionClass}
        />
      ))}
    </>
  );
}

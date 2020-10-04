import * as faceapi from "face-api.js";
import * as React from "react";

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
  expressions: faceapi.FaceExpressions;
}

export function FaceExpressions({ expressions }: FaceExpressionsProps) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        textAlign: "center"
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

export type FaceResult = {
  detection: faceapi.FaceDetection;
  age: number;
  gender: faceapi.Gender;
  expressions: faceapi.FaceExpressions;
}[];

interface ResultsOverlayProps {
  data: FaceResult;
  width?: number;
  height?: number;
}

export default function ResultsOverlay({
  data,
  width,
  height
}: ResultsOverlayProps) {
  const resizedData =
    width && height ? faceapi.resizeResults(data, { width, height }) : data;
  return (
    <div className="absolute inlet-0">
      {resizedData.map(({ detection, expressions, gender, age }, i) => (
        <div
          key={i}
          className="border-4 border-white absolute rounded-lg"
          style={{
            left: detection.box.x,
            width: detection.box.width,
            top: detection.box.y,
            height: detection.box.height
          }}
        >
          <div className="bg-opacity-50 bg-white px-1 rounded-t">
            {Math.round(age)}, {gender}
          </div>
          <FaceExpressions expressions={expressions} />
        </div>
      ))}
    </div>
  );
}
